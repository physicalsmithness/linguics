import {
  MarkerContractError,
  buildMarkerPromptContext,
  compactPromptSchemaText,
  compactPromptSchemaTextV3,
  compactPromptSchemaTextV4,
  normalizeModelResult,
  type MarkerPromptContext,
} from "./marker_contract";

/**
 * Linguics translation marker — Cloudflare Worker.
 *
 * Receives a POST /mark with { item, raw, intent, bucket_context, model? } and
 * proxies to OpenRouter (https://openrouter.ai/api/v1/chat/completions).
 * Returns the structured marker output plus token usage and dollar cost.
 *
 * Defaults to GPT-4o-mini; model can be overridden per request via
 * the `model` field for A/B comparison.
 *
 * Per-call cost cap: $0.03. Calls projected over the cap are refused before
 * being sent upstream.
 *
 * Endpoint is open during prototype. Lightweight per-IP rate-limit is in
 * place (in-memory; Workers isolate per region, so it's per-edge, but enough
 * to deter casual abuse).
 */

interface Env {
  OPENROUTER_API_KEY: string;
}

interface MarkRequest {
  item: TranslationItem;
  raw: string;
  intent?: "literal" | "guess" | "sense";
  /** Subset of bucket id -> { label, description } that the marker should know about. */
  bucket_context?: Record<string, { label: string; description?: string }>;
  /** OpenRouter model identifier; defaults to GPT-4o-mini. */
  model?: string;
  /** Sampling temperature. Defaults to 0 - see DEFAULT_TEMPERATURE. */
  temperature?: number;
  /** Optional seed for reproducibility, where the provider honours it. */
  seed?: number;
  /** Raise the per-call cost ceiling for this call, up to HARD_COST_CEILING_USD.
   *  The bench uses this to reach models the learner-path default excludes. */
  max_cost_usd?: number;
  /** Model-facing response shape. Both hydrate to the same MarkerResult. */
  response_contract?: "compact_v2" | "compact_v3" | "compact_v4" | "legacy_v1";
  /** Bench-only: retain the exact provider text and prompt fingerprint. */
  include_diagnostics?: boolean;
}

interface TranslationItem {
  source_text: string;
  source_language?: "en" | "it";
  target_language?: "en" | "it";
  references?: Array<{ text: string; polarity?: "positive" | "negative"; note?: string } | string>;
  required_buckets?: string[];
  /** What the reference answer HAPPENS to demonstrate. Judged only if the learner
   *  engaged it; absence is never a miss. See translation_crosstopic_marking v24 s1. */
  expected_buckets?: string[];
  optional_buckets?: string[];
  vocab_help?: any[];
  cefr_level_target?: string;
  notes?: string;
  external_id?: string;
}

interface MarkpointOut {
  bucket: string;
  label?: string;
  attempted_credit: number;          // 0..1
  correctness_credit: number | null; // null when not_attempted
  outcome: "hit" | "miss" | "partial" | "not_attempted";
  evidence?: string;
  expected?: string;
  bucket_proposed?: boolean;
  proposed_parent_id?: string;
  proposed_label?: string;
  proposed_rationale?: string;
}

interface MarkerResult {
  overall: {
    marks_awarded: number;
    marks_possible: number;
    summary: string;
    attempted_overall?: number;
    correctness_overall?: number;
    explanation?: string;
  };
  raw_response?: string;
  markpoints: MarkpointOut[];
  unattributable?: Array<{ evidence?: string; what: string; correct: boolean; suggest?: string }>;
  notes?: Array<{ kind: string; text: string; note?: string }>;
}

type ResponseContract = "compact_v2" | "compact_v3" | "compact_v4" | "legacy_v1";

/* ------------------------------------------------------------------------- */
/* Model pricing                                                              */
/* OpenRouter passes through provider prices; these are the per-million-token */
/* rates for input and output (USD).                                          */
/* ------------------------------------------------------------------------- */
const MODEL_PRICING: Record<string, [number, number]> = {
  // --- current generation, added 2026-08-02 from OpenRouter's live model list.
  // The nine ids below the divider are all at least a generation behind; kept
  // so old bench runs stay reproducible. [input, output] USD per 1M tokens.
  "tencent/hy3":                     [0.14, 0.58],
  "google/gemini-3.1-flash-lite":    [0.25, 1.50],
  "minimax/minimax-m3":              [0.30, 1.20],
  "qwen/qwen3.7-plus":               [0.32, 1.28],
  "z-ai/glm-5.2":                    [0.42, 1.32],
  "openai/gpt-5.6-luna":             [1.00, 6.00],
  "~anthropic/claude-haiku-latest":  [1.00, 5.00],
  "x-ai/grok-4.3":                   [1.25, 2.50],
  "anthropic/claude-sonnet-5":       [2.00, 10.00],
  // --- legacy ---
  "deepseek/deepseek-chat":          [0.27, 1.10],
  "deepseek/deepseek-chat-v3":       [0.27, 1.10],
  "anthropic/claude-haiku-4.5":      [0.80, 4.00],
  "anthropic/claude-sonnet-4.5":     [3.00, 15.00],
  "anthropic/claude-3.5-haiku":      [0.80, 4.00],
  "anthropic/claude-3.5-sonnet":     [3.00, 15.00],
  "google/gemini-2.0-flash-001":     [0.10, 0.40],
  "google/gemini-flash-1.5":         [0.075, 0.30],
  "openai/gpt-4o-mini":              [0.15, 0.60],
  "qwen/qwen-2.5-72b-instruct":      [0.30, 0.40],
};

// r171: was "deepseek/deepseek-chat", which the 2026-08-20 sweep measured as the
// WORST of the thirteen models tested - 7 of 18 marked right, and only 10 of the 18
// answered at all. Every other model beat it, and it was the one marking learners.
// Grok 4.3 scored joint-top (15 of 18), answered all 18, costs about a penny a mark
// and takes ~12 seconds. It also quotes the learner's own words back most cleanly of
// the three leaders (7 odd quotations against Haiku's 15), which is what the feedback
// panel underlines with. Haiku 4.5 is two seconds faster at the same price if speed
// beats evidence quality; GPT-4o-mini is a NINTH of the cost for two fewer marks.
// SUPERSEDED WITHIN THE HOUR by Smith, who took the cost side: GPT-4o-mini scored
// 13 of 18 against Grok's 15 and costs a NINTH as much (0.12c a mark against 1.06c).
// A heavy learner is then ~70p a month rather than ~£5, which is the difference
// between a product that can be sold and one that cannot. Grok stays one click away
// for anyone who wants the extra two marks.
const DEFAULT_MODEL = "openai/gpt-4o-mini";

// r171: the GET health response has always named the default model, which means a
// plain fetch of this URL says what is DEPLOYED. Nobody used it, and this estate
// spent days unable to answer "did the deploy land". Now it also carries a build
// string, so a deploy is verifiable in one request instead of being inferred from
// marking behaviour. Bump this whenever the worker is changed.
const WORKER_BUILD = "2026-08-22-r181-compact-v4-legacy-lite";
// R177 safety decision: the paid r176 probe confirmed compact-v2's cost and
// latency win, but it still produced one invalid broad-case evidence map and
// fewer passing judgements than legacy. Keep compact explicitly selectable for
// controlled bench work; normal learner calls omit response_contract and stay
// on the better-validated legacy path until compact reaches quality parity.
const DEFAULT_RESPONSE_CONTRACT: ResponseContract = "legacy_v1";
// The learner-path default. It was set when every call was DeepSeek at about a
// tenth of a cent, and it silently blocked most of the current-generation models
// on anything but the smallest menu - Sonnet 5 on the full menu estimates
// $0.132, four times the cap, so the call never left the worker. That is the cap
// working as designed, but a bench whose whole job is to compare expensive
// models against cheap ones must be able to authorise a bigger spend.
//
// So: the DEFAULT is unchanged and still guards real learners, a caller may
// raise it per call, and the worker clamps that request to a hard ceiling no
// client can exceed. A compromised or careless client cannot authorise
// unlimited spend.
const COST_CAP_PER_CALL_USD = 0.03;
const HARD_COST_CEILING_USD = 0.25;
// r168: was 2000, and that was the single largest cause of "failed" calls in the
// 2026-08-14 fifteen-model suite sweep. A mark now carries ~13 markpoints (the
// expected_buckets mean went from 6.27 to 12.82 over the tier-2 merges), each with
// a bucket id, label, verdict, evidence string and note, plus the overall block.
// 2000 tokens could not hold that, so answers were cut off mid-string and came back
// as "unterminated string" or, where the model had opened a ``` fence, as a stray
// backtick. Both read as model defects. Neither was.
// NOTE ON COST: estimateCostUsd multiplies this by the output rate, so raising it
// raises the pre-call estimate and expensive models are now REFUSED at the $0.03
// default ceiling rather than truncated mid-answer. That is the honest failure of
// the two (no money spent, and the error names the ceiling); raise the ceiling per
// call on the bench to run them.
const MAX_OUTPUT_TOKENS = 6000;
// Temperature was never set, so every mark was generated at the provider
// default of 1.0. Measured consequence (bench, 2026-08-02): three runs of the
// SAME item with the SAME answer and a byte-identical payload returned skill
// counts spanning FIVE - a spread larger than the mean of 4.7. A grader whose
// verdict re-rolls per attempt cannot support coverage analytics, and it made
// the menu-size experiment unreadable because between-mode differences were
// smaller than within-mode noise. This is a grading task, not a creative one.
const DEFAULT_TEMPERATURE = 0;

/* ------------------------------------------------------------------------- */
/* Lightweight rate limit (per-IP, per-edge, in-memory).                      */
/* Not bulletproof; sufficient to deter casual abuse.                         */
/* ------------------------------------------------------------------------- */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const ipBuckets = new Map<string, number[]>();

function rateLimitCheck(ip: string): { allowed: boolean; resetMs?: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const history = (ipBuckets.get(ip) || []).filter(t => t >= windowStart);
  if (history.length >= RATE_LIMIT_MAX) {
    const oldest = history[0];
    return { allowed: false, resetMs: RATE_LIMIT_WINDOW_MS - (now - oldest) };
  }
  history.push(now);
  ipBuckets.set(ip, history);
  return { allowed: true };
}

/* ------------------------------------------------------------------------- */
/* Annotation parsing                                                         */
/* Inline annotations like <g>...</g>, <s>...</s>, <f>...</f> tag stylistic   */
/* segments of the learner's answer. Levels (<g1>, <g2>, <g3>) are optional. */
/* ------------------------------------------------------------------------- */
interface Annotation { kind: "g" | "s" | "f"; level: number; text: string; }

function parseAnnotations(raw: string): { annotations: Annotation[]; cleaned: string } {
  const annotations: Annotation[] = [];
  const re = /<([gsf])([123]?)>([\s\S]*?)<\/\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    annotations.push({
      kind: m[1] as Annotation["kind"],
      level: m[2] ? Number(m[2]) : 1,
      text: m[3],
    });
  }
  const cleaned = raw.replace(/<\/?[gsf][123]?>/g, "");
  return { annotations, cleaned };
}

/* ------------------------------------------------------------------------- */
/* Prompt construction                                                        */
/* The system prompt is large and stable (suitable for prompt caching).       */
/* The user message is small and varies per attempt.                          */
/* ------------------------------------------------------------------------- */

export function buildSystemPrompt(responseContract: ResponseContract): string {
  const legacyPrompt = `You are an Italian-language teacher marking a student's translation attempt. Your job: return a structured JSON response that attributes each part of the student's attempt to specific skill buckets in a granular taxonomy.

DIRECTION AWARENESS (critical)

Every item declares a direction in item.direction ("it_en" or "en_it"). This determines what the learner had to demonstrate and what each bucket means.

- direction "en_it" (source English, target Italian): the learner READS English and PRODUCES Italian. Each bucket asks "did the learner correctly produce this Italian form?". Production buckets (auxiliary choice, agreement, participle form, pronoun position) are fully applicable. A failure to produce the right form fires a miss on that bucket. The learner's answer must be in Italian; an English answer is "didn't attempt" overall.

- direction "it_en" (source Italian, target English): the learner READS Italian and PRODUCES English. Each bucket asks "did the learner correctly RECOGNISE this Italian feature and reflect its meaning in their English?". The Italian production skills (forming agreement, conjugating, positioning clitics) are NOT tested because the learner doesn't produce Italian. The bucket_context will have been filtered already to remove production-only buckets. What remains are recognition-relevant buckets: a pronoun.indirect_object.le bucket means "did the learner recognise 'le' as the recipient (to her / formal you)?"; a vocabulary.it.X.translation bucket means "did the learner translate X correctly?"; an adjective_agreement.position.semantic_shift bucket means "did the learner pick up the semantic shift driven by adjective position?".

If the direction is it_en and the learner's answer is English: that IS the expected behaviour. Don't flag the attempt as "didn't translate into Italian"; assess what was demonstrated in the English.

GENERAL RULES

1. Be precise. Each error should attribute to a single bucket (the most diagnostic one). Don't conflate different errors into one bucket. Don't fabricate misses.

2. Distinguish vocabulary misses (wrong word) from grammatical misses (right word, wrong form/agreement/order). A learner who writes "azzurra" for "blu marino" missed vocabulary, not agreement. A learner who writes "andato" for "andata" got the right verb but missed gender agreement.

3. For false friends (Italian "roba" calqued from French "robe" for "dress"), fire the vocabulary bucket plus a note in the notes array explaining the false friend.

4. Don't penalise stylistic choices that the intent or annotations license. If intent is "sense", don't penalise non-literal mappings that capture meaning. If a segment is wrapped in <f> flair, credit stylistic reach even if a safer choice was available.

5. Don't fire formation buckets when the item's diagnostic is tense choice. If the learner picked the wrong tense but spelled it correctly, that's a tense-choice miss, not a participle-form miss.

6. The marker output is the only data the project author and the learner see. Make evidence strings short and concrete; make explanation prose follow the Linguics house style (everyday lead, name the grammatical term, use it thereafter, finish with the concrete working).

7. Required buckets are mandatory. Every bucket id in item.required_buckets MUST appear as a markpoint in your output, exactly once, citing that exact id. The outcome reflects what the learner demonstrated:
   - hit (correctness=1) if the learner clearly got that skill right
   - miss (correctness=0) if they got it wrong
   - partial (correctness=0.5) if they were half-right
   - not_attempted (attempted=0, correctness=null) if their answer doesn't engage with the skill at all (silent on it)
   Do not silently drop a required bucket. If the item's diagnostic is tense choice and the required_bucket is tense_choice.progressive_vs_simple.present_progressive_vs_present, that bucket MUST appear in your markpoints — even when the learner got it right (fire as hit) — so the learner accumulates signal on it.

ACCENT POLICY (ruled; applies wherever the learner produces Italian, i.e. direction en_it)

8. Score the attempt AS IF all accents were correct. An accent-only error — a missing, added, or wrong-mark accent (perche for perché, e for è, ne for né) — does NOT fire a miss or partial on any bucket by itself. Apostrophe-for-elision slips ("la ho" for "l'ho", "un amica" for "un'amica") count as this same class. If the form is otherwise the right form, the bucket is a hit.

9. Then, if the attempt contains one or more accent-only errors, apply exactly ONE small deduction to the whole answer (never one per error): overall.marks_awarded = the accent-blind score multiplied by 0.9. So an otherwise-perfect answer with accent slips scores exactly 0.9 — it never ties the accent-perfect answer, and accent errors alone can never take an otherwise-correct answer below 0.9. Real errors deduct as normal first; the single accent multiplier applies on top of whatever the accent-blind score is.

10. NAME every accent error explicitly, one note per error, kind "accent": e.g. { "kind": "accent", "text": "perché carries an acute accent; you wrote perche." } The overall.explanation may mention accents in passing; the notes carry the specifics. Never stay silent about an accent error just because the deduction is small.

11. ANTI-HALLUCINATION GUARD: Only report an accent error when the learner's written form VISIBLY DIFFERS from the correct form in its accent marks. If the learner wrote "torneremmo" and the correct form is "torneremmo", there is NO accent error — do not invent one. If the learner's spelling matches the reference exactly, do NOT report an accent slip. When uncertain whether an accent is wrong, stay silent. A false accent accusation damages trust more than a missed one.

VOCABULARY vs GRAMMAR (critical distinction)

12. A learner who writes a completely different word (e.g. "maglia" when the answer is "maglione", or "di legno" when the answer is "di lana") has made a VOCABULARY error — they didn't know the right word. This is NOT a gender error, NOT an agreement error, NOT a conjugation error. Only fire a gender/agreement bucket when the learner uses the RIGHT word but with the wrong grammatical marking (e.g. "il maglione" instead of "la maglione" — right noun, wrong article gender). Wrong word = vocabulary bucket. Right word, wrong form = grammar bucket. Never conflate the two.

13. KNOWN COMMON ERRORS: the item may carry \`common_errors\` — a list of {text, note} known WRONG variants the author has catalogued (deliberate anti-anchors, often only a hair from correct). If the learner's answer matches or closely resembles one, do NOT accept it: fire the relevant skill as a miss and name the error using the note. Never treat a common_error as a correct rendering, however close it looks to a reference.

14. CLITIC PLACEMENT vs FORM are SEPARATE skills — never fail both for one slip. If a clitic pronoun is in the CORRECT position but the wrong FORM (e.g. "me vede" — the clitic is correctly pre-verb, but "me" should be "mi"), fire a HIT on the placement/position bucket and a MISS only on the form bucket. One wrong-form-but-correctly-placed clitic = exactly ONE miss (the form). A correct clitic in the wrong position fails placement, not form. Do not collapse a single error into two misses.



THE JOB, IN ONE PLACE (Smith, 2026-08-12). You read English and Italian. Do this:

1. Check the learner's answer against the vocabulary and grammar listed for this item. Each one is a hit, a miss, or irrelevant - irrelevant meaning they simply did not engage it, which is not a fault.
2. Then tell us about anything ELSE, vocabulary or grammar, that you think is relevant and is not on the list. Put it in "unattributable". Name it in plain English; you do not need one of our ids.
3. And in the same place, LIST EVERY OTHER WORD the learner used that you can judge, correct or incorrect, even when no grammar point hangs on it. A word that is just a word still counts: if they wrote the right Italian for it, they have shown they know it and should be credited, and if they wrote the wrong one, that is a real miss whether or not it is on any list. Give the dictionary form in "suggest" - for a verb the infinitive, for a noun the singular.
4. That is the whole judgement. Everything below is about how to write it down, not about what to look for.

You are not picking from a catalogue and you are not restricted to what we predicted. If the learner did something good we did not anticipate, say so and credit it. If they did something wrong we have no name for, say so and mark it. We would rather read your sentence about it than have you force it into a near-miss label.

CANDIDATE BUCKETS

The bucket_context object lists ALL buckets you may fire as regular hits/misses (with bucket_proposed: false or omitted). The list has already been filtered to the buckets relevant to this item's direction. You MUST NOT fire a bucket that isn't in bucket_context as a regular hit, with EXACTLY ONE sanctioned exception: the \`vocabulary.\` namespace on en_it items, described under VOCABULARY PRODUCTION below. That namespace is dynamic - its buckets aggregate on arrival and are never pre-registered - so vocabulary ids are legitimate even when absent from bucket_context. Every GRAMMAR bucket still has to be in bucket_context. Specifically: on it_en items, do NOT fire grammar production buckets like adverb_placement, auxiliary choice, participle agreement, pronoun position, or adjective agreement — these have been filtered out because the learner isn't producing Italian.

EXPECTED BUCKETS - the item fire-list. item.expected_buckets lists what the reference answer happens to demonstrate. It is INFORMATION, not instruction: it tells you what is likely to be in play so you are not hunting for it in a long menu. Judge each entry ONLY if the learner engaged it. Engaged and right is a hit. Engaged and wrong is a real miss and it costs marks. Not engaged at all is attempted_credit 0, no correctness event, no penalty - a learner who wrote a good answer by another route has failed nothing on this list. required_buckets are different and remain mandatory as described above. The fire-list is a shortlist, never a limit: fire anything else you see that is in bucket_context, exactly as before.

WHEN YOU CANNOT PLACE SOMETHING. You are a fluent reader of both languages and you will sometimes notice something real that no bucket fits. Put it in "unattributable" rather than forcing it into a bucket that nearly fits or dropping it. Each entry is the learner words you are looking at, what you noticed in plain English, and whether it was correct. If their answer was good, still give the marks - noticing something we cannot file is our gap, not their error. If you can name the bucket id you would have used had it existed, put it in "suggest"; leave it out when you cannot, rather than inventing one.

BREADTH (cross-topic marking, task 41): a translation evidences MANY skills at once (article, preposition, agreement, tense, adverb, vocabulary). Beyond the mandatory required_buckets, actively tag EVERY grammar element you detect in the answer that matches a bucket_context entry - fire it hit/miss/partial with a short evidence span - so the learner accumulates cross-topic signal. required_buckets are the FLOOR, not the ceiling. Still never fire a bucket that isn't in bucket_context. This breadth is REQUIRED, not optional: a mostly-correct answer MUST come back mostly HITS. Returning only the failed buckets makes the learner see 0/N with no credit for what they got right — a marking failure, not leniency. Every correct article, preposition, verb form, agreement, adverb and vocabulary word that matches a bucket_context entry gets its OWN hit markpoint, alongside the one or two genuine misses. WORKED EXAMPLE (breadth is mandatory): source "I have no friends here in this city", learner "non ho nadie amiche in questa città". Two words are wrong — "nadie" (should be nessun/amici) and "amiche" (should be amico) — but the learner got the whole FRAME right, so you MUST fire HITS on the negation "non ho", the demonstrative "questa", the noun "città" and the preposition "in", giving ~4 hits + 2 misses, mostly green. Returning ONLY the misses plus the one required hit (1 of 3) is a MARKING FAILURE — it discards everything the learner got right and reads as if they know almost nothing.

VOCABULARY PRODUCTION (en_it)

On en_it items the learner PRODUCES the Italian content words. Their vocabulary buckets are NOT injected into bucket_context (the cross-topic menu deliberately excludes the vocabulary namespace), so before this rule existed the vocab strand earned NOTHING on exactly the direction where the learner is producing Italian. Fire them anyway - this is the sanctioned exception named under CANDIDATE BUCKETS.

- Fire \`vocabulary.it.<lemma>.translation\` as a HIT for every CONTENT word the learner produced correctly: nouns, verbs, adjectives, adverbs, and lexical locatives (dentro, qui, sopra).
- Fire it as a MISS when they reached for the wrong word for the meaning (a wrong lexical CHOICE, not a wrong inflection - a correctly chosen word in the wrong form is a GRAMMAR miss, and its vocabulary bucket is still a HIT: they knew the word, they mis-formed it).
- <lemma> is the DICTIONARY form, never the inflected form on the page: infinitive for verbs (esco -> uscire), masculine singular for nouns and adjectives (amici -> amico, bella -> bello). Lower case, no accents stripped.
- PROPER NOUNS never earn a vocabulary bucket (Architecture ruling 3, 2026-08-02). Names of people, places, brands and titles - Marco, Anna, Roma, Fiat - are excluded from the coverage denominator by policy, so crediting them is free credit against nothing. Skip them entirely.
- The lemma MUST be the ITALIAN dictionary form (Architecture ruling 2). Never key a vocabulary bucket on the ENGLISH word: for "speech" the bucket is vocabulary.it.discorso.translation, NEVER vocabulary.it.speech.translation. An English lemma inside the Italian namespace creates a phantom entry matching no real word. If you cannot name the Italian lemma with confidence, fire no vocabulary bucket at all.
- FUNCTION words stay grammar-only. Articles, prepositions, conjunctions, pronouns and purely grammatical particles get NO vocabulary bucket - their skill is the grammar bucket that already covers them.
- Fire these even when the answer is otherwise wrong. Vocabulary knowledge and grammatical deployment are separate skills and are never collapsed into one verdict.

Worked example. Source "In the evening I go out with friends", learner "La sera, esco con i miei amici": vocabulary.it.sera.translation HIT, vocabulary.it.uscire.translation HIT, vocabulary.it.amico.translation HIT - alongside whatever grammar buckets the answer evidences. Three content words produced correctly, three vocabulary hits; "la", "con", "i" and "miei" get none.

VOCABULARY RECOGNITION (it_en)

On it_en items, vocabulary buckets for the source-text words have been injected into bucket_context. Each is named vocabulary.it.<lemma>.translation. Fire these:
- as hits when the learner correctly conveyed the meaning of that word in their English (exact or paraphrase that captures the sense)
- as misses when the learner skipped, misread, or substituted the wrong word
- as not_attempted when the answer is empty or unrelated

This is how passive vocabulary recognition is recorded on it_en items.

DIRECTION-BOUND SUFFIX (Architecture ruling 4, 2026-08-02). \`.passive\` marks RECOGNITION and is therefore legal on it_en ONLY. On it_en use the id exactly as bucket_context gives it. On en_it - production - always use the BARE \`vocabulary.it.<lemma>.translation\` with NO \`.passive\` suffix. The same skill must never be recorded under two ids or coverage splits across both.

BUCKET PROPOSALS

If you encounter an error that genuinely doesn't fit any of the provided bucket_context entries, you may propose a new bucket by setting bucket_proposed: true and providing proposed_parent_id (one of the existing buckets in bucket_context), proposed_label (the friendly human-readable name), and proposed_rationale (one sentence on why it's worth tracking). Use this sparingly. Prefer an existing bucket when the fit is good. Do NOT propose buckets that were excluded from bucket_context by the direction filter (e.g. don't propose production grammar buckets on it_en).

OUTPUT SCHEMA (strict JSON; no markdown, no commentary)

{
  "overall": {
    "marks_awarded": <number 0..1>,
    "marks_possible": 1,
    "summary": "<one short sentence>",
    "attempted_overall": <number 0..1>,
    "correctness_overall": <number 0..1>,
    "explanation": "<short prose explanation per Linguics house style, ~50-100 words>"
  },
  "raw_response": "<echo of the learner's attempt with annotations stripped>",
  "markpoints": [
    {
      "bucket": "<bucket id, must match one in bucket_context or be a proposal>",
      "label": "<the bucket's friendly label>",
      "attempted_credit": <number 0..1>,
      "correctness_credit": <number 0..1 or null when not_attempted>,
      "outcome": "hit" | "miss" | "partial" | "not_attempted",
      "evidence": "<the segment of the learner's attempt that supports this>",
      "expected": "<what would have been right>",
      "bucket_proposed": false
      // ... or true with proposed_parent_id, proposed_label, proposed_rationale
    }
  ],
  "unattributable": [
    { "evidence": "<the learner's words>", "what": "<what you noticed, plain English>", "correct": true, "suggest": "<the bucket id you would have used if it existed, or omit>" }
  ],
  "notes": [
    { "kind": "false_friend" | "register_drift" | "alternative_correct" | "accent" | "other", "text": "<short observation>" }
  ]
}

ATTRIBUTION GRAIN

- attempted_credit is binary: 1 when the learner produced a recognisable attempt at this skill, 0 when they didn't engage with it at all.
- correctness_credit is the proportion correct of what they attempted: 1 = right, 0 = wrong, 0.5 = partly right. Use null when attempted is 0.
- outcome is "hit" when attempted=1 and correctness=1; "miss" when attempted=1 and correctness=0; "partial" when attempted=1 and correctness is between 0 and 1; "not_attempted" when attempted=0.

Return ONLY the JSON object, no surrounding text.`;

  if (responseContract === "legacy_v1") return legacyPrompt;
  const outputStart = legacyPrompt.indexOf("OUTPUT SCHEMA (strict JSON; no markdown, no commentary)");
  if (outputStart < 0) throw new Error("compact prompt splice point missing");
  // Keep the settled marking policy, but remove the verbose legacy schema and
  // its conflicting field-by-field outcome instructions. Compact v2 speaks in
  // aliases/tuples and the worker deterministically restores those fields.
  const fullIdRows = responseContract === "compact_v4";
  const compactEvidenceInstruction = responseContract === "compact_v3" || responseContract === "compact_v4"
    ? "Copy the shortest exact contiguous learner.attempt substring that proves the point"
    : "Use the shortest exact evidence-token span that proves the point";
  const requiredInstruction = fullIdRows
    ? "7. Required buckets are mandatory. On an attempted answer, every role-r full_id in the buckets legend MUST appear exactly once as an m object. A required but unengaged skill uses evidence null, attempted 0, and correctness null. Only a wholly wrong-language answer may return m:[] as described in the output rules."
    : "7. Required buckets are mandatory. Every role-r alias in the buckets legend MUST appear exactly once in m. Use [alias,0,null,null] only when the learner did not engage it; otherwise score the attempted skill. Do not silently drop a required alias.";
  const dynamicVocabularyReference = fullIdRows
    ? "unlisted en_it content vocabulary, represented as vocabulary.it.<lemma>.translation and described under VOCABULARY PRODUCTION below"
    : "unlisted en_it content vocabulary, represented as v:<lemma> and described under VOCABULARY PRODUCTION below";
  const dynamicVocabularyLegitimacy = fullIdRows
    ? "Those entries aggregate on arrival and are never pre-registered, so the canonical bare vocabulary.it.<lemma>.translation id is legitimate when that vocabulary skill is absent from the buckets legend."
    : "Those entries aggregate on arrival and are never pre-registered, so v:<lemma> is legitimate when that vocabulary skill is absent from the buckets legend.";
  const vocabularyProductionBlock = fullIdRows ? `VOCABULARY PRODUCTION (en_it)

On en_it, judge every Italian CONTENT word the learner produced: nouns, verbs, adjectives, adverbs, and lexical locatives. If its vocabulary skill is supplied in the buckets legend, copy that exact full_id into the m object's bucket field. Only for a genuinely unlisted content word, use vocabulary.it.<Italian dictionary lemma>.translation. Never put a numeric alias or v:<lemma> in an m object.

- Correctly chosen content word: vocabulary HIT. Wrong lexical choice for the intended meaning: vocabulary MISS.
- Right word in the wrong inflected form: vocabulary HIT plus the relevant GRAMMAR miss; lexical knowledge and formation are separate.
- The bucket lemma is the NFC, lower-case Italian dictionary form: infinitive for verbs, masculine singular for nouns and adjectives. Evidence remains the exact surface text the learner wrote; never copy the bucket lemma into evidence unless it is literally present.
- Proper nouns and function words do not receive vocabulary rows.
- Judge vocabulary even when the rest of the answer is wrong.

` : `VOCABULARY PRODUCTION (en_it)

On en_it, judge every Italian CONTENT word the learner produced: nouns, verbs, adjectives, adverbs, and lexical locatives. If its vocabulary skill is supplied in the buckets legend, serialize it with that numeric alias. Only for a genuinely unlisted content word, serialize it as v:<Italian dictionary lemma>. Never put a full bucket id in an m tuple.

- Correctly chosen content word: vocabulary HIT. Wrong lexical choice for the intended meaning: vocabulary MISS.
- Right word in the wrong inflected form: vocabulary HIT plus the relevant GRAMMAR miss; lexical knowledge and formation are separate.
- The lemma is the NFC, lower-case Italian dictionary form: infinitive for verbs, masculine singular for nouns and adjectives. Never use an English lemma.
- Proper nouns and function words do not receive vocabulary rows.
- Judge vocabulary even when the rest of the answer is wrong.

`;
  const vocabularyRecognitionBlock = fullIdRows ? `VOCABULARY RECOGNITION (it_en)

On it_en, source-word vocabulary skills are supplied in the buckets legend. Copy their exact full_ids into m object bucket fields: HIT when the learner conveys the meaning, MISS when they skip, misread, or substitute it. Never invent dynamic vocabulary on it_en. Emit an unengaged object only when its legend role is r.

` : `VOCABULARY RECOGNITION (it_en)

On it_en, source-word vocabulary skills are supplied in the buckets legend. Use their numeric aliases: HIT when the learner conveys the meaning, MISS when they skip, misread, or substitute it. Never use v:<lemma> on it_en. Emit an unengaged row only when its legend role is r.

`;
  const directionSuffixInstruction = fullIdRows
    ? "DIRECTION-BOUND SUFFIX (Architecture ruling 4, 2026-08-02). `.passive` is recognition-only and is already encoded in an it_en legend entry. Copy that exact supplied full_id into bucket. On en_it, a dynamic vocabulary id always uses the bare vocabulary.it.<lemma>.translation shape and never carries `.passive`.\n\n"
    : "DIRECTION-BOUND SUFFIX (Architecture ruling 4, 2026-08-02). `.passive` is recognition-only and is already encoded in an it_en legend entry. Do not construct, copy, or rewrite that full id; use its numeric alias. On en_it, v:<lemma> always means the bare production skill and never carries `.passive`.\n\n";
  const policy = legacyPrompt.slice(0, outputStart)
    .replace(/7\. Required buckets are mandatory\.[\s\S]*?\n\nACCENT POLICY/, [
      requiredInstruction,
      "",
      "ACCENT POLICY",
    ].join("\n"))
    .split("bucket_context object").join("buckets legend")
    .split("bucket_context entries").join("buckets legend entries")
    .split("bucket_context").join("buckets legend")
    .split("item.expected_buckets").join("role-e entries in the buckets legend")
    .split("required_buckets").join("role-r entries")
    .split("(with bucket_proposed: false or omitted)").join("(as ordinary m rows)")
    .split('Give the dictionary form in "suggest" - for a verb the infinitive, for a noun the singular.')
    .join('In a u row, the optional fourth value is a suggested full bucket id; for vocabulary use vocabulary.it.<Italian dictionary lemma>.translation (infinitive for verbs, singular for nouns), or omit it.')
    .split("the `vocabulary.` namespace on en_it items, described under VOCABULARY PRODUCTION below")
    .join(dynamicVocabularyReference)
    .split("That namespace is dynamic - its buckets aggregate on arrival and are never pre-registered - so vocabulary ids are legitimate even when absent from buckets legend.")
    .join(dynamicVocabularyLegitimacy)
    .replace(/If you encounter an error that genuinely doesn't fit any of the provided buckets legend entries, you may propose a new bucket by setting bucket_proposed: true and providing proposed_parent_id \(one of the existing buckets in buckets legend\), proposed_label \(the friendly human-readable name\), and proposed_rationale \(one sentence on why it's worth tracking\)\./,
      "If you encounter an error that genuinely does not fit the supplied legend, you may use a p proposal entry with an existing parent alias, a safe child slug, a friendly label, and one-sentence rationale.")
    .replace("Make evidence strings short and concrete", compactEvidenceInstruction)
    .replace('{ "kind": "accent", "text": "perché carries an acute accent; you wrote perche." }',
      '["accent", "perché carries an acute accent; you wrote perche."]')
    .replace(/VOCABULARY PRODUCTION \(en_it\)[\s\S]*?(?=VOCABULARY RECOGNITION \(it_en\))/, vocabularyProductionBlock)
    .replace(/VOCABULARY RECOGNITION \(it_en\)[\s\S]*?(?=DIRECTION-BOUND SUFFIX)/, vocabularyRecognitionBlock)
    .replace(/DIRECTION-BOUND SUFFIX \(Architecture ruling 4, 2026-08-02\)\.[\s\S]*?\n\n(?=BUCKET PROPOSALS)/,
      directionSuffixInstruction);
  const compactSchema = responseContract === "compact_v4"
    ? compactPromptSchemaTextV4
    : responseContract === "compact_v3" ? compactPromptSchemaTextV3 : compactPromptSchemaText;
  return policy + compactSchema + "\n\nReturn ONLY the JSON object, no surrounding text.";
}

function inferDirection(item: any): "it_en" | "en_it" {
  const src = ((item.source_lang || item.source_language || "") + "").toLowerCase();
  const tgt = ((item.target_lang || item.target_language || "") + "").toLowerCase();
  if (src === "it" && tgt === "en") return "it_en";
  if (src === "en" && tgt === "it") return "en_it";
  // Character-detection fallback: Italian accented vowels in source_text
  if (/[àèéìòù]/i.test(item.source_text || "")) return "it_en";
  return "en_it";
}

function buildUserMessage(
  item: any,
  cleanedRaw: string,
  intent: string,
  annotations: Annotation[],
  bucketContext: Record<string, { label: string; description?: string }>,
  responseContract: ResponseContract,
  promptContext: MarkerPromptContext,
): string {
  const direction = inferDirection(item);
  if (responseContract === "compact_v2" || responseContract === "compact_v3" || responseContract === "compact_v4") {
    return JSON.stringify({
      item: {
        direction,
        source_language: direction === "it_en" ? "it" : "en",
        target_language: direction === "it_en" ? "en" : "it",
        source_text: item.source_text,
        references: item.references || item.reference_translations || [],
        common_errors: item.common_errors || [],
        cefr_level_target: item.cefr_level_target,
        notes: item.notes,
      },
      buckets: promptContext.prompt.buckets,
      learner: {
        // Keep the natural sentence for comprehension. Token indices remain
        // the only legal evidence output, so evidence quotations still stay
        // out of paid generation in v2. V3/V4 instead copy short exact
        // substrings and omit the confusing evidence-token index table.
        attempt: cleanedRaw,
        ...(responseContract === "compact_v2"
          ? { evidence_tokens: promptContext.prompt.evidence_tokens } : {}),
        intent,
        annotations,
      },
    });
  }
  return JSON.stringify({
    item: {
      direction,                                          // "it_en" or "en_it"
      source_language: direction === "it_en" ? "it" : "en",
      target_language: direction === "it_en" ? "en" : "it",
      source_text: item.source_text,
      references: item.references || item.reference_translations || [],
      common_errors: item.common_errors || [],
      required_buckets: item.required_buckets || [],
      expected_buckets: item.expected_buckets || [],
      optional_buckets: item.optional_buckets || [],
      cefr_level_target: item.cefr_level_target,
      notes: item.notes,
    },
    bucket_context: bucketContext,
    learner: {
      attempt: cleanedRaw,
      intent,
      annotations,
    },
  }, null, 2);
}

/* ------------------------------------------------------------------------- */
/* Cost calculation                                                           */
/* ------------------------------------------------------------------------- */

function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 10.0; // pessimistic default for unknown models
  const [inPrice, outPrice] = pricing;
  return (inputTokens * inPrice + outputTokens * outPrice) / 1_000_000;
}

function approxTokens(text: string): number {
  // Crude approximation: ~4 chars per token for Latin text.
  return Math.ceil(text.length / 4);
}

/* ------------------------------------------------------------------------- */
/* Response helpers                                                           */
/* ------------------------------------------------------------------------- */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function jsonResp(status: number, body: any): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function errorResp(status: number, error: string, detail: string, metadata?: Record<string, unknown>): Response {
  return jsonResp(status, { error, detail, ...(metadata || {}) });
}

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

function usageMetadata(
  apiBody: any,
  model: string,
  responseContract: ResponseContract,
  promptSha256: string,
  includeDiagnostics: boolean,
  rawModelOutput?: string,
): Record<string, unknown> {
  const choice = apiBody?.choices?.[0];
  const inputTokens = apiBody?.usage?.prompt_tokens ?? apiBody?.usage?.input_tokens ?? null;
  const outputTokens = apiBody?.usage?.completion_tokens ?? apiBody?.usage?.output_tokens ?? null;
  const costKnown = typeof inputTokens === "number" && Number.isFinite(inputTokens) && inputTokens >= 0 &&
    typeof outputTokens === "number" && Number.isFinite(outputTokens) && outputTokens >= 0;
  const metadata: Record<string, unknown> = {
    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
    cost_usd: costKnown ? estimateCostUsd(model, inputTokens, outputTokens) : null,
    cost_known: costKnown,
    model_used: model,
    worker_build: WORKER_BUILD,
    response_contract_requested: responseContract,
    prompt_sha256: promptSha256,
    max_output_tokens: MAX_OUTPUT_TOKENS,
    finish_reason: choice?.finish_reason ?? null,
    native_finish_reason: choice?.native_finish_reason ?? null,
  };
  if (includeDiagnostics) {
    metadata.diagnostics = {
      raw_model_output: typeof rawModelOutput === "string" ? rawModelOutput : null,
    };
  }
  return metadata;
}

/* ------------------------------------------------------------------------- */
/* Main handler                                                               */
/* ------------------------------------------------------------------------- */

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }
    if (req.method === "GET") {
      // Simple health check
      return jsonResp(200, {
        ok: true,
        service: "linguics-marker",
        build: WORKER_BUILD,
        default_model: DEFAULT_MODEL,
        default_response_contract: DEFAULT_RESPONSE_CONTRACT,
        supported_response_contracts: ["compact_v4", "compact_v3", "compact_v2", "legacy_v1"],
        max_output_tokens: MAX_OUTPUT_TOKENS,
      });
    }
    if (req.method !== "POST") {
      return errorResp(405, "method_not_allowed", "Use POST /mark");
    }

    // Rate limit
    const ip = req.headers.get("CF-Connecting-IP") || req.headers.get("X-Forwarded-For") || "anonymous";
    const rl = rateLimitCheck(ip);
    if (!rl.allowed) {
      return errorResp(429, "rate_limit", `Slow down; try again in ${Math.ceil((rl.resetMs || 0) / 1000)}s`);
    }

    // Parse body
    let body: MarkRequest;
    try {
      body = await req.json() as MarkRequest;
    } catch (e) {
      return errorResp(400, "bad_request", "Invalid JSON body");
    }
    if (!body.item || typeof body.raw !== "string") {
      return errorResp(400, "bad_request", "Missing item or raw field");
    }

    const model = body.model || DEFAULT_MODEL;
    if (!MODEL_PRICING[model]) {
      return errorResp(400, "model_unsupported", `Unknown model: ${model}. Known models: ${Object.keys(MODEL_PRICING).join(", ")}`);
    }
    const responseContract = body.response_contract || DEFAULT_RESPONSE_CONTRACT;
    if (responseContract !== "compact_v2" && responseContract !== "compact_v3" && responseContract !== "compact_v4" && responseContract !== "legacy_v1") {
      return errorResp(400, "response_contract_unsupported",
        `Unknown response_contract: ${String(body.response_contract)}. Use compact_v4, compact_v3, compact_v2, or legacy_v1.`);
    }

    // Parse annotations out of the raw input
    const { annotations, cleaned } = parseAnnotations(body.raw);
    const intent = body.intent || "literal";
    const bucketContext = body.bucket_context || {};

    // Build prompts
    let promptContext: MarkerPromptContext;
    try {
      promptContext = buildMarkerPromptContext({
        item: body.item,
        cleanedRaw: cleaned,
        bucketContext,
        direction: inferDirection(body.item),
      });
    } catch (error: any) {
      const code = error instanceof MarkerContractError ? error.code : "marker_context_invalid";
      return errorResp(400, code, error?.message || String(error), {
        usage: { input_tokens: 0, output_tokens: 0 },
        cost_usd: 0,
        cost_known: true,
        model_used: model,
        worker_build: WORKER_BUILD,
        response_contract_requested: responseContract,
      });
    }
    const systemPrompt = buildSystemPrompt(responseContract);
    const userMessage = buildUserMessage(
      body.item,
      cleaned,
      intent,
      annotations,
      bucketContext,
      responseContract,
      promptContext,
    );
    const promptSha256 = await sha256Hex(systemPrompt + "\u0000" + userMessage);

    // Cost cap pre-check (estimate worst-case output)
    const estInput = approxTokens(systemPrompt + userMessage);
    const estCost = estimateCostUsd(model, estInput, MAX_OUTPUT_TOKENS);
    const requested = (typeof body.max_cost_usd === "number" && body.max_cost_usd > 0)
      ? body.max_cost_usd : COST_CAP_PER_CALL_USD;
    const cap = Math.min(requested, HARD_COST_CEILING_USD);
    if (estCost > cap) {
      // Say what would have been spent, on what, and what the ceiling was -
      // "exceeds the cap" alone leaves the caller guessing which of the model
      // and the payload to change.
      return errorResp(413, "cost_cap_exceeded",
        `Estimated $${estCost.toFixed(4)} for ${model} on ~${estInput} input tokens ` +
        `(+ up to ${MAX_OUTPUT_TOKENS} output) exceeds the $${cap.toFixed(2)} ceiling for this call. ` +
        `Send a smaller bucket_context, pick a cheaper model, or raise max_cost_usd ` +
        `(hard ceiling $${HARD_COST_CEILING_USD.toFixed(2)}).`, {
          usage: { input_tokens: 0, output_tokens: 0 },
          cost_usd: 0,
          cost_known: true,
          model_used: model,
          worker_build: WORKER_BUILD,
          response_contract_requested: responseContract,
          prompt_sha256: promptSha256,
          max_output_tokens: MAX_OUTPUT_TOKENS,
        });
    }

    // Diagnostic: confirm the secret is loaded. Prints to `wrangler tail` only.
    // Trim the key: trailing newlines from `wrangler secret put` paste cause
    // fetch() to silently strip the Authorization header (HTTP rejects header
    // values with control characters), producing "Missing Authentication
    // header" from OpenRouter.
    const apiKey = (env.OPENROUTER_API_KEY || "").trim();
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is missing or empty after trim");
      return errorResp(500, "config_error", "OPENROUTER_API_KEY secret not loaded. Run `wrangler secret put OPENROUTER_API_KEY` from the worker/ directory and redeploy.", {
        cost_usd: 0,
        cost_known: true,
        model_used: model,
        worker_build: WORKER_BUILD,
        response_contract_requested: responseContract,
        prompt_sha256: promptSha256,
      });
    }
    console.log(`OpenRouter marker request; model: ${model}; contract: ${responseContract}`);

    // Call OpenRouter
    let apiRes: Response;
    try {
      apiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://linguics.dev",
          "X-Title": "Linguics translation marker",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: MAX_OUTPUT_TOKENS,
          // r164: Qwen 3.7 Plus came back empty on the bench with
          // finish_reason=length and "model returned reasoning but no
          // content". A reasoning model spends the output budget thinking and
          // then has nothing left to answer with, so the call costs full price
          // and returns zero. We do not want its reasoning - we want the JSON -
          // so ask the provider not to bill us for thinking we discard.
          // OpenRouter ignores this for models that do not reason, so it is
          // safe across the whole list.
          reasoning: { exclude: true },
          temperature: (typeof body.temperature === "number") ? body.temperature : DEFAULT_TEMPERATURE,
          ...(typeof body.seed === "number" ? { seed: body.seed } : {}),
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      });
    } catch (e: any) {
      return errorResp(502, "upstream_error", `Network error to OpenRouter: ${e.message}`, {
        cost_usd: null,
        cost_known: false,
        model_used: model,
        worker_build: WORKER_BUILD,
        response_contract_requested: responseContract,
        prompt_sha256: promptSha256,
      });
    }

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return errorResp(apiRes.status === 429 ? 429 : 502, "upstream_error",
        `OpenRouter ${apiRes.status}: ${errText.slice(0, 300)}`, {
          cost_usd: null,
          cost_known: false,
          model_used: model,
          worker_build: WORKER_BUILD,
          response_contract_requested: responseContract,
          prompt_sha256: promptSha256,
          upstream_http_status: apiRes.status,
        });
    }

    let apiBody: any;
    try {
      apiBody = await apiRes.json();
    } catch (e) {
      return errorResp(502, "malformed_response", "OpenRouter returned non-JSON", {
        cost_usd: null,
        cost_known: false,
        model_used: model,
        worker_build: WORKER_BUILD,
        response_contract_requested: responseContract,
        prompt_sha256: promptSha256,
      });
    }

    const content = apiBody?.choices?.[0]?.message?.content;
    const usage = usageMetadata(
      apiBody,
      model,
      responseContract,
      promptSha256,
      body.include_diagnostics === true,
      typeof content === "string" ? content : undefined,
    );
    if (!content || typeof content !== "string") {
      // "missing content" on its own is undebuggable. Surface whatever the
      // upstream actually said: its error object, the finish_reason (length =
      // truncated at max_tokens; content_filter = refused), and any reasoning-
      // only completion, so the cause is legible from the bench.
      const ch = apiBody?.choices?.[0];
      const bits = [
        apiBody?.error ? "upstream error: " + JSON.stringify(apiBody.error).slice(0, 200) : null,
        ch?.finish_reason ? "finish_reason=" + ch.finish_reason : null,
        ch?.native_finish_reason ? "native_finish_reason=" + ch.native_finish_reason : null,
        (ch?.message?.reasoning || ch?.message?.reasoning_content)
          ? "model returned reasoning but no content (model may need reasoning disabled)" : null,
        !ch ? "no choices[] in response; keys=" + Object.keys(apiBody || {}).join(",") : null,
      ].filter(Boolean);
      return errorResp(502, "malformed_response",
        "OpenRouter response had no content" + (bits.length ? " — " + bits.join("; ") : ""), usage);
    }

    // Parse the model's JSON output. Models (e.g. DeepSeek) often wrap the JSON
    // in a markdown code fence (```json ... ```) or add stray prose; strip the
    // fence and, failing that, extract the outermost { ... } before parsing.
    // r168: the fence regex is anchored at BOTH ends, so a response truncated at
    // max_tokens kept its opening ``` and failed on the backtick. That is why the
    // bench reported a fence fault and a truncation fault as if they were two
    // different problems: they are one, and it is ours. Strip an unclosed fence
    // too, and consult finish_reason before blaming the model's JSON.
    const finishReason = apiBody?.choices?.[0]?.finish_reason;
    let result: any;
    let jsonText = content.trim();
    const fence = jsonText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fence) jsonText = fence[1].trim();
    else if (/^```/.test(jsonText)) jsonText = jsonText.replace(/^```(?:json)?\s*/i, "").trim();
    try {
      result = JSON.parse(jsonText);
    } catch (e: any) {
      const first = jsonText.indexOf("{");
      const last = jsonText.lastIndexOf("}");
      let recovered = false;
      if (first >= 0 && last > first) {
        try { result = JSON.parse(jsonText.slice(first, last + 1)); recovered = true; } catch (e2: any) {}
      }
      if (!recovered) {
        // An answer cut off by OUR cap is not a marking failure, and calling it
        // malformed_json ranked several capable models below weaker ones that
        // happened to write less. Name the real cause.
        if (finishReason === "length") {
          return errorResp(502, "output_truncated",
            `The answer was cut off at max_tokens (${MAX_OUTPUT_TOKENS}), so its JSON is incomplete. ` +
            `This is our output cap, not a marking failure. Received ${content.length} characters.`, usage);
        }
        return errorResp(502, "malformed_json",
          `Model output not valid JSON: ${e.message}. finish_reason=${finishReason ?? "unknown"}. ` +
          `First 200 chars: ${content.slice(0, 200)}`, usage);
      }
    }

    const markerFormatUsed = result && result.v === 4 ? "compact_v4"
      : result && result.v === 3 ? "compact_v3"
      : result && result.v === 2 ? "compact_v2" : "legacy_v1";
    try {
      result = normalizeModelResult(result, promptContext);
    } catch (error: any) {
      return errorResp(502, "schema_invalid",
        `Model output failed schema check: ${error?.message || String(error)}`, {
          ...usage,
          marker_format_used: markerFormatUsed,
          schema_error_code: error instanceof MarkerContractError ? error.code : "schema_invalid",
        });
    }

    return jsonResp(200, {
      result,
      ...usage,
      marker_format_used: markerFormatUsed,
    });
  },
};
