/**
 * Pure input/output contract for the translation marker.
 *
 * The language model may speak either compact tuple format defined here. V2
 * uses token-index evidence spans; experimental v3 uses exact learner
 * substrings. The worker hydrates both into the same browser-facing
 * MarkerResult. This module deliberately has no Worker, fetch, or OpenRouter
 * dependencies so its behaviour can be tested without a network call.
 */

export type MarkerDirection = "it_en" | "en_it";
export type BucketRole = "r" | "e" | "o" | "c";
export type MarkerOutcome = "hit" | "miss" | "partial" | "not_attempted";
export type NoteKind = "false_friend" | "register_drift" | "alternative_correct" | "accent" | "other";

export interface BucketDefinition {
  label: string;
  description?: string;
}

export interface MarkerItemForContract {
  source_text?: string;
  source_lang?: string;
  target_lang?: string;
  source_language?: string;
  target_language?: string;
  required_buckets?: string[];
  expected_buckets?: string[];
  optional_buckets?: string[];
}

export interface EvidenceToken {
  index: number;
  text: string;
  /** UTF-16 offsets, matching String.prototype.slice. */
  start: number;
  end: number;
}

export interface BucketLegendEntry {
  alias: number;
  role: BucketRole;
  id: string;
  label: string;
  description: string;
}

export type PromptBucketTuple = [number, BucketRole, string, string, string];
export type PromptTokenTuple = [number, string];

export interface MarkerPromptContext {
  direction: MarkerDirection;
  /** The annotation-free learner answer. It is authoritative on hydration. */
  cleanedRaw: string;
  legend: BucketLegendEntry[];
  tokens: EvidenceToken[];
  /** Serializable fragments to place in the model's user message. */
  prompt: {
    buckets: PromptBucketTuple[];
    evidence_tokens: PromptTokenTuple[];
  };
}

export interface BuildMarkerPromptContextArgs {
  item: MarkerItemForContract;
  cleanedRaw: string;
  bucketContext?: Record<string, BucketDefinition>;
  direction?: MarkerDirection;
}

export interface MarkpointOut {
  bucket: string;
  label: string;
  attempted_credit: 0 | 1;
  correctness_credit: number | null;
  outcome: MarkerOutcome;
  evidence?: string;
  expected?: string;
  bucket_proposed: boolean;
  proposed_parent_id?: string;
  proposed_label?: string;
  proposed_rationale?: string;
  [key: string]: unknown;
}

export interface UnattributableOut {
  evidence: string;
  what: string;
  correct: boolean;
  suggest?: string;
}

export interface MarkerNoteOut {
  kind: NoteKind;
  /** Canonical schema key. */
  text: string;
  /** Compatibility key used by the current browser renderer. */
  note: string;
  [key: string]: unknown;
}

export interface MarkerResult {
  overall: {
    marks_awarded: number;
    marks_possible: 1;
    summary: string;
    attempted_overall: number;
    correctness_overall: number;
    explanation: string;
    [key: string]: unknown;
  };
  raw_response: string;
  markpoints: MarkpointOut[];
  unattributable?: UnattributableOut[];
  notes: MarkerNoteOut[];
  [key: string]: unknown;
}

export type CompactSpan = [firstToken: number, lastToken: number] | null;
export type CompactBucketRef = number | `v:${string}`;
export type CompactOverall = [
  marksAwarded: number,
  attemptedOverall: number,
  correctnessOverall: number,
  summary: string,
  explanation: string,
];
export type CompactMarkpoint = [
  bucket: CompactBucketRef,
  attempted: 0 | 1,
  correctness: number | null,
  evidence: CompactSpan,
  expected?: string,
];
export type CompactUnattributable = [
  evidence: CompactSpan,
  what: string,
  correct: boolean,
  suggest?: string,
];
export type CompactNote = [kind: NoteKind, text: string];

export interface CompactProposal {
  /** Numeric alias of an existing parent bucket. */
  r: number;
  /** New child slug, or a dot-separated path below the parent. */
  s: string;
  l: string;
  y: string;
  a: 0 | 1;
  c: number | null;
  e: CompactSpan;
  x?: string;
}

export interface CompactMarkerV2 {
  v: 2;
  o: CompactOverall;
  m: CompactMarkpoint[];
  u?: CompactUnattributable[];
  p?: CompactProposal[];
  n?: CompactNote[];
}

export type CompactEvidenceV3 = string | null;
export type CompactMarkpointV3 = [
  bucket: CompactBucketRef,
  attempted: 0 | 1,
  correctness: number | null,
  evidence: CompactEvidenceV3,
  expected?: string,
];
export type CompactUnattributableV3 = [
  evidence: CompactEvidenceV3,
  what: string,
  correct: boolean,
  suggest?: string,
];
export interface CompactProposalV3 extends Omit<CompactProposal, "e"> {
  e: CompactEvidenceV3;
}
export interface CompactMarkerV3 {
  v: 3;
  o: CompactOverall;
  m: CompactMarkpointV3[];
  u?: CompactUnattributableV3[];
  p?: CompactProposalV3[];
  n?: CompactNote[];
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export class MarkerContractError extends Error {
  readonly code: string;
  readonly path?: string;

  constructor(code: string, message: string, path?: string) {
    super(path ? `${path}: ${message}` : message);
    this.name = "MarkerContractError";
    this.code = code;
    this.path = path;
  }
}

/**
 * Insert this text in the system prompt after the marking rules.  The legacy
 * parser remains available in normalizeModelResult, but is intentionally not
 * advertised to the model: advertising it would encourage the verbose output
 * this contract exists to remove.
 */
export const compactPromptSchemaText = `OUTPUT FORMAT — compact v2 JSON only

These serialization rules override any earlier wording about verbose object fields; the marking policy itself is unchanged.
The user message supplies buckets as [alias, role, full_id, label, description].
Roles are r=required, e=expected fire-list, o=optional, c=other permitted context.
It also supplies the learner's exact words as numbered evidence_tokens.

Return exactly this object shape:
{
  "v": 2,
  "o": [marks_awarded_0_to_1, attempted_overall_0_to_1, correctness_overall_0_to_1, "one short summary", "short house-style explanation"],
  "m": [
    [bucket_alias_or_v_colon_lemma, attempted_0_or_1, correctness_0_to_1_or_null, [first_token,last_token]_or_null, "expected correction only when useful"]
  ],
  "u": [ [[first_token,last_token]_or_null, "unattributable observation", true_or_false, "optional suggested bucket id"] ],
  "p": [ {"r": parent_alias, "s": "new_child_slug", "l": "label", "y": "rationale", "a": 1, "c": correctness_0_to_1, "e": [first_token,last_token]_or_null, "x": "expected correction when evidence is null or the result is not a hit"} ],
  "n": [ ["accent_or_other_kind", "short note text"] ]
}

Every r bucket must occur exactly once in m, including [alias,0,null,null] when not attempted.
Emit e/o/c buckets only when engaged. Use a numeric alias for every supplied bucket.
On en_it only, an unlisted produced content word may use "v:<Italian dictionary lemma>".
Never use v:<lemma> on it_en. Evidence is always an inclusive evidence-token span, never a quotation.
Every proposal describes an engaged skill: a is always 1 and c is numeric. Give either e or x.
Omit x when c is 1; otherwise include it when it helps explain the correction.
Omit the fifth m value on hits. Do not write null optional values; omit them.

CRITICAL SERIALIZATION EXAMPLE: if the supplied legend row starts [7,"r",...], write [7,1,1,[2,2]].
The first m value is the JSON NUMBER 7, never the supplied full_id string. Copying a supplied full_id into m is invalid.
For a miss whose form is absent and therefore has no evidence span, write [7,1,0,null,"the expected form"].
When attempted is 0, correctness is null: [7,0,null,null], never [7,0,0,null].
Return only the JSON object.`;

/**
 * V3 keeps the alias/tuple savings but removes token-index indirection. The
 * paid r176 probe showed GPT-4o-mini inventing a cyclic index map on a broad
 * 25-alias case even though it understood the sentence. Exact copied evidence
 * is slightly longer, far easier for the model, and strictly verifiable as an
 * authoritative learner-answer substring.
 */
export const compactPromptSchemaTextV3 = `OUTPUT FORMAT — compact v3 JSON only

These serialization rules override any earlier wording about verbose object fields; the marking policy itself is unchanged.
The user message supplies buckets as [alias, role, full_id, label, description] and learner.attempt as the exact learner answer.
Roles are r=required, e=expected fire-list, o=optional, c=other permitted context.

Return exactly this object shape:
{
  "v": 3,
  "o": [marks_awarded_0_to_1, attempted_overall_0_to_1, correctness_overall_0_to_1, "one short summary", "short house-style explanation"],
  "m": [
    [bucket_alias_or_v_colon_lemma, attempted_0_or_1, correctness_0_to_1_or_null, "short exact substring copied from learner.attempt"_or_null, "expected correction only when useful"]
  ],
  "u": [ ["exact learner substring"_or_null, "unattributable observation", true_or_false, "optional suggested bucket id"] ],
  "p": [ {"r":parent_alias,"s":"new_child_slug","l":"label","y":"rationale","a":1,"c":correctness_0_to_1,"e":"exact learner substring"_or_null,"x":"expected correction when evidence is null or result is not a hit"} ],
  "n": [ ["accent_or_other_kind", "short note text"] ]
}

Every r bucket must occur exactly once in m, including [alias,0,null,null] when not attempted.
Emit e/o/c buckets only when engaged. Use a numeric alias for every supplied bucket.
On en_it only, an unlisted produced content word may use "v:<Italian dictionary lemma>". Never use v:<lemma> on it_en.
Evidence must be a short EXACT CONTIGUOUS SUBSTRING copied from learner.attempt, with identical spelling, accents, apostrophes and case. Never emit token indices or invent evidence.
Evidence is the surface text the learner actually wrote, never a dictionary lemma: if learner.attempt contains "parlato", cite "parlato", never "parlare".
Build m from learner evidence, never by enumerating the legend. Before emitting any e/o/c row, identify the exact learner.attempt substring that proves that specific bucket; the sole exception is an omitted-form miss, which uses null evidence plus the expected correction as specified below.
An engaged present form needs evidence. An engaged omitted form may use null evidence only when the expected correction is supplied.
Every proposal describes an engaged skill: a is always 1 and c is numeric. Give either e or x.
Omit x when c is 1; otherwise include it when it helps explain the correction. Omit the fifth m value on hits.
Do not write null optional values; omit them.

CRITICAL SERIALIZATION EXAMPLE: if the supplied legend row starts [7,"r",...] and learner.attempt contains "parlo", write [7,1,1,"parlo"].
The first m value is the JSON NUMBER 7, never the supplied full_id string.
VOCABULARY EVIDENCE EXAMPLE: if legend row 8 names vocabulary.it.parlare.verb.translation.active and learner.attempt contains "ho parlato", write [8,1,1,"parlato"]. "parlare" is the bucket lemma, not learner evidence, and must not be copied into the evidence slot unless the learner actually wrote "parlare".
For a miss whose form is absent, write [7,1,0,null,"the expected form"].
When attempted is 0, correctness is null: [7,0,null,null], never [7,0,0,null].
If the learner answered wholly in the wrong language, all three numeric o values are 0, every required row is [alias,0,null,null], and u, p and n are empty arrays.
Return only the JSON object.`;

const TOKEN_RE = /[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)*|[^\s]/gu;
const NOTE_KINDS = new Set<NoteKind>([
  "false_friend",
  "register_drift",
  "alternative_correct",
  "accent",
  "other",
]);
const PROPOSAL_SLUG_RE = /^[a-z0-9_]+(?:\.[a-z0-9_]+)*$/;
const DYNAMIC_LEMMA_RE = /^[\p{L}\p{M}][\p{L}\p{M}\p{N}_'’.-]{0,63}$/u;
const DYNAMIC_BUCKET_RE = /^vocabulary\.it\.([\p{L}\p{M}][\p{L}\p{M}\p{N}_'’-]{0,63})\.translation$/u;
const ALLOWED_COMPACT_KEYS = new Set(["v", "o", "m", "u", "p", "n"]);

function fail(code: string, message: string, path?: string): never {
  throw new MarkerContractError(code, message, path);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function finiteUnit(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function requireUnit(value: unknown, path: string): number {
  if (!finiteUnit(value)) fail("invalid_number", "must be a finite number from 0 to 1", path);
  return value;
}

function requireString(value: unknown, path: string, maxLength: number, allowEmpty = false): string {
  if (typeof value !== "string") fail("invalid_string", "must be a string", path);
  if (!allowEmpty && value.trim().length === 0) fail("invalid_string", "must not be empty", path);
  if (value.length > maxLength) fail("invalid_string", `must be at most ${maxLength} characters`, path);
  return value;
}

function requireBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") fail("invalid_boolean", "must be true or false", path);
  return value;
}

function readBucketList(item: MarkerItemForContract, key: "required_buckets" | "expected_buckets" | "optional_buckets"): string[] {
  const value = item[key];
  if (value === undefined) return [];
  if (!Array.isArray(value)) fail("invalid_item", "must be an array", `item.${key}`);
  const out: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < value.length; i++) {
    const id = requireString(value[i], `item.${key}[${i}]`, 300);
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

function inferDirection(item: MarkerItemForContract): MarkerDirection {
  const src = String(item.source_lang || item.source_language || "").toLowerCase();
  const tgt = String(item.target_lang || item.target_language || "").toLowerCase();
  if (src === "it" && tgt === "en") return "it_en";
  if (src === "en" && tgt === "it") return "en_it";
  return /[àèéìòù]/i.test(String(item.source_text || "")) ? "it_en" : "en_it";
}

function tokenizeEvidence(raw: string): EvidenceToken[] {
  const tokens: EvidenceToken[] = [];
  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(raw)) !== null) {
    const start = match.index;
    tokens.push({
      index: tokens.length,
      text: match[0],
      start,
      end: start + match[0].length,
    });
  }
  return tokens;
}

function isBareProductionVocabularyBucket(id: string): boolean {
  const match = DYNAMIC_BUCKET_RE.exec(id);
  if (!match) return false;
  const lemma = match[1];
  return lemma === lemma.normalize("NFC").toLocaleLowerCase("it-IT");
}

/** Build the deterministic bucket legend and exact evidence-token table. */
export function buildMarkerPromptContext(args: BuildMarkerPromptContextArgs): MarkerPromptContext {
  if (!isRecord(args) || !isRecord(args.item)) fail("invalid_context", "item is required", "context");
  if (typeof args.cleanedRaw !== "string") fail("invalid_context", "cleanedRaw must be a string", "context.cleanedRaw");
  const direction = args.direction || inferDirection(args.item);
  if (direction !== "en_it" && direction !== "it_en") {
    fail("invalid_context", "direction must be en_it or it_en", "context.direction");
  }

  const sourceContext = args.bucketContext || {};
  if (!isRecord(sourceContext)) fail("invalid_context", "bucketContext must be an object", "context.bucketContext");
  const definitions = new Map<string, BucketDefinition>();
  for (const id of Object.keys(sourceContext)) {
    requireString(id, "context.bucketContext key", 300);
    const definition = sourceContext[id];
    if (!isRecord(definition)) fail("invalid_context", "bucket definition must be an object", `context.bucketContext.${id}`);
    const label = typeof definition.label === "string" && definition.label.trim() ? definition.label : id;
    const description = typeof definition.description === "string" ? definition.description : "";
    definitions.set(id, { label, description });
  }

  const required = readBucketList(args.item, "required_buckets");
  const expected = readBucketList(args.item, "expected_buckets");
  const optional = readBucketList(args.item, "optional_buckets");
  const ordered: Array<[string, BucketRole]> = [];
  const roles = new Map<string, BucketRole>();

  const add = (ids: string[], role: BucketRole, field: string): void => {
    for (const id of ids) {
      if (roles.has(id)) continue;
      if (!definitions.has(id)) {
        // Production vocabulary is the one sanctioned namespace that can be
        // absent from bucket_context. Listed vocabulary still gets an alias;
        // truly unlisted production vocabulary uses v:<lemma> in the output.
        if (direction === "en_it" && isBareProductionVocabularyBucket(id)) {
          definitions.set(id, { label: id, description: "" });
        } else {
          const listName = field.replace(/_buckets$/, "");
          fail(`${listName}_bucket_not_fireable`, `${id} is listed by ${field} but absent from bucketContext`, `item.${field}`);
        }
      }
      roles.set(id, role);
      ordered.push([id, role]);
    }
  };

  add(required, "r", "required_buckets");
  add(expected, "e", "expected_buckets");
  add(optional, "o", "optional_buckets");
  for (const id of [...definitions.keys()].sort((a, b) => a.localeCompare(b))) {
    if (roles.has(id)) continue;
    roles.set(id, "c");
    ordered.push([id, "c"]);
  }

  const legend: BucketLegendEntry[] = ordered.map(([id, role], alias) => {
    const definition = definitions.get(id) || { label: id, description: "" };
    return {
      alias,
      role,
      id,
      label: definition.label || id,
      description: definition.description || "",
    };
  });
  const tokens = tokenizeEvidence(args.cleanedRaw);
  return {
    direction,
    cleanedRaw: args.cleanedRaw,
    legend,
    tokens,
    prompt: {
      buckets: legend.map((entry) => [entry.alias, entry.role, entry.id, entry.label, entry.description]),
      evidence_tokens: tokens.map((token) => [token.index, token.text]),
    },
  };
}

function contextIndexes(context: MarkerPromptContext): {
  byAlias: Map<number, BucketLegendEntry>;
  byId: Map<string, BucketLegendEntry>;
} {
  const byAlias = new Map<number, BucketLegendEntry>();
  const byId = new Map<string, BucketLegendEntry>();
  for (const entry of context.legend) {
    byAlias.set(entry.alias, entry);
    byId.set(entry.id, entry);
  }
  return { byAlias, byId };
}

function validateCredits(attempted: unknown, correctness: unknown, path: string): { a: 0 | 1; c: number | null } {
  if (attempted !== 0 && attempted !== 1) {
    fail("invalid_credit", "attempted_credit must be binary: 0 or 1", `${path}.attempted`);
  }
  if (attempted === 0) {
    if (correctness !== null) fail("invalid_credit", "correctness must be null when attempted is 0", `${path}.correctness`);
    return { a: 0, c: null };
  }
  return { a: 1, c: requireUnit(correctness, `${path}.correctness`) };
}

function deriveOutcome(attempted: 0 | 1, correctness: number | null): MarkerOutcome {
  if (attempted === 0) return "not_attempted";
  if (correctness === 1) return "hit";
  if (correctness === 0) return "miss";
  return "partial";
}

function parseSpan(value: unknown, context: MarkerPromptContext, path: string): { span: CompactSpan; evidence?: string } {
  if (value === null) return { span: null };
  if (!Array.isArray(value) || value.length !== 2) {
    fail("invalid_span", "must be null or [firstToken,lastToken]", path);
  }
  const first = value[0];
  const last = value[1];
  if (typeof first !== "number" || typeof last !== "number" || !Number.isInteger(first) || !Number.isInteger(last)) {
    fail("invalid_span", "token indices must be integers", path);
  }
  if (first < 0 || last < first || last >= context.tokens.length) {
    fail("invalid_span", "token indices are outside the learner answer or reversed", path);
  }
  const startToken = context.tokens[first];
  const endToken = context.tokens[last];
  return {
    span: [first, last],
    evidence: context.cleanedRaw.slice(startToken.start, endToken.end),
  };
}

function parseCompactEvidence(
  value: unknown,
  context: MarkerPromptContext,
  path: string,
  version: 2 | 3,
): { isNull: boolean; evidence?: string } {
  if (version === 2) {
    const parsed = parseSpan(value, context, path);
    return { isNull: parsed.span === null, ...(parsed.evidence !== undefined ? { evidence: parsed.evidence } : {}) };
  }
  if (value === null) return { isNull: true };
  const evidence = requireString(value, path, 2000);
  if (!context.cleanedRaw.includes(evidence)) {
    fail("invalid_evidence", "must be an exact contiguous substring of the learner answer", path);
  }
  return { isNull: false, evidence };
}

function parseExpected(value: unknown, path: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  return requireString(value, path, 500);
}

function dynamicVocabulary(ref: string, context: MarkerPromptContext, path: string): { id: string; label: string } {
  if (context.direction !== "en_it") fail("invalid_dynamic_vocabulary", "v:<lemma> is legal only on en_it", path);
  const rawLemma = ref.slice(2);
  const lemma = rawLemma.normalize("NFC").toLocaleLowerCase("it-IT");
  if (!DYNAMIC_LEMMA_RE.test(lemma) || lemma.includes("..")) {
    fail("invalid_dynamic_vocabulary", "lemma contains unsupported characters", path);
  }
  const idLemma = lemma.replace(/\./g, "_");
  return { id: `vocabulary.it.${idLemma}.translation`, label: `${lemma} (translation)` };
}

function plausibleBucketId(value: string): boolean {
  if (value.length > 300 || value.startsWith(".") || value.endsWith(".") || value.includes("..") || /[\s/\\\u0000-\u001f]/u.test(value)) {
    return false;
  }
  return value.includes(".");
}

function assertOnlyKeys(value: Record<string, unknown>, allowed: Set<string>, path: string): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail("unknown_field", `unexpected field ${key}`, `${path}.${key}`);
  }
}

function hydrateCompact(parsed: Record<string, unknown>, context: MarkerPromptContext, version: 2 | 3): MarkerResult {
  assertOnlyKeys(parsed, ALLOWED_COMPACT_KEYS, "result");
  if (parsed.v !== version) fail("compact_schema_invalid", `v must be ${version}`, "result.v");
  if (!Array.isArray(parsed.o) || parsed.o.length !== 5) {
    fail("compact_schema_invalid", "o must be [awarded,attempted,correctness,summary,explanation]", "result.o");
  }
  const overall: MarkerResult["overall"] = {
    marks_awarded: requireUnit(parsed.o[0], "result.o[0]"),
    marks_possible: 1,
    attempted_overall: requireUnit(parsed.o[1], "result.o[1]"),
    correctness_overall: requireUnit(parsed.o[2], "result.o[2]"),
    summary: requireString(parsed.o[3], "result.o[3]", 300),
    explanation: requireString(parsed.o[4], "result.o[4]", 2000),
  };
  if (!Array.isArray(parsed.m)) fail("compact_schema_invalid", "m must be an array", "result.m");

  const { byAlias, byId } = contextIndexes(context);
  const aliasCounts = new Map<number, number>();
  const bucketIds = new Set<string>();
  const markpoints: MarkpointOut[] = [];

  for (let i = 0; i < parsed.m.length; i++) {
    const path = `result.m[${i}]`;
    const row = parsed.m[i];
    if (!Array.isArray(row) || (row.length !== 4 && row.length !== 5)) {
      fail("compact_schema_invalid", "markpoint must have 4 values, or 5 when expected is supplied", path);
    }
    let ref = row[0];
    // GPT-4o-mini's first compact-v2 sweep followed the compact tuple shape
    // but copied exact supplied IDs into the alias slot. That is still a
    // deterministic reference, not a semantic ambiguity: accept only an exact
    // legend ID (or the already-sanctioned bare en_it vocabulary shape), while
    // continuing to reject every unknown grammar ID.
    if (typeof ref === "string" && !ref.startsWith("v:")) {
      const supplied = byId.get(ref);
      if (supplied) {
        ref = supplied.alias;
      } else if (context.direction === "en_it" && isBareProductionVocabularyBucket(ref)) {
        const match = DYNAMIC_BUCKET_RE.exec(ref)!;
        ref = `v:${match[1]}`;
      }
    }
    // An unlisted vocabulary row with attempted=0 is the same fire-list blank
    // as a non-required supplied alias: no event. Do not reject a harmless
    // serialized blank merely because dynamic vocabulary has no legend role.
    if (typeof ref === "string" && ref.startsWith("v:") && row[1] === 0) continue;
    const suppliedEntry = typeof ref === "number" && Number.isInteger(ref) ? byAlias.get(ref) : undefined;
    // Fire-list blank means no event. Models sometimes serialize that blank as
    // [alias,0,null,null]; remove it deterministically rather than exposing a
    // not-attempted event for a non-required bucket.
    if (suppliedEntry && suppliedEntry.role !== "r" && row[1] === 0) continue;
    const correctness = row[1] === 0 && row[2] === 0 ? null : row[2];
    const credits = validateCredits(row[1], correctness, path);
    const evidenceResult = parseCompactEvidence(row[3], context, `${path}[3]`, version);
    const expected = parseExpected(row[4], `${path}[4]`);
    const outcome = deriveOutcome(credits.a, credits.c);

    if (credits.a === 0 && !evidenceResult.isNull) {
      fail("invalid_span", "an unattempted markpoint must have null evidence", `${path}[3]`);
    }
    if (credits.a === 1 && evidenceResult.isNull && !expected) {
      fail("invalid_span", "an attempted markpoint needs evidence or an expected omitted form", `${path}[3]`);
    }
    if (outcome === "hit" && expected !== undefined) {
      fail("compact_schema_invalid", "hits must omit the expected-correction value", `${path}[4]`);
    }

    let bucket: string;
    let label: string;
    if (typeof ref === "number") {
      if (!Number.isInteger(ref) || !byAlias.has(ref)) fail("unknown_bucket_alias", "unknown numeric bucket alias", `${path}[0]`);
      const entry = byAlias.get(ref)!;
      if (entry.role !== "r" && credits.a !== 1) {
        fail("unengaged_nonrequired", "expected, optional, and context buckets may be emitted only when engaged", path);
      }
      aliasCounts.set(ref, (aliasCounts.get(ref) || 0) + 1);
      bucket = entry.id;
      label = entry.label;
    } else if (typeof ref === "string" && ref.startsWith("v:")) {
      if (credits.a !== 1) fail("invalid_dynamic_vocabulary", "dynamic vocabulary must be engaged", path);
      if (evidenceResult.isNull) {
        fail("invalid_dynamic_vocabulary", "dynamic produced vocabulary must cite a learner evidence span", `${path}[3]`);
      }
      const dynamic = dynamicVocabulary(ref, context, `${path}[0]`);
      if (byId.has(dynamic.id)) {
        fail("invalid_dynamic_vocabulary", "a supplied vocabulary bucket must use its numeric alias", `${path}[0]`);
      }
      bucket = dynamic.id;
      label = dynamic.label;
    } else {
      fail("unknown_bucket_alias", "bucket must be a numeric alias or v:<lemma>", `${path}[0]`);
    }

    if (bucketIds.has(bucket)) fail("duplicate_bucket", `${bucket} occurs more than once`, path);
    bucketIds.add(bucket);
    markpoints.push({
      bucket,
      label,
      attempted_credit: credits.a,
      correctness_credit: credits.c,
      outcome,
      ...(evidenceResult.evidence !== undefined ? { evidence: evidenceResult.evidence } : {}),
      ...(expected !== undefined ? { expected } : {}),
      bucket_proposed: false,
    });
  }

  for (const entry of context.legend) {
    const count = aliasCounts.get(entry.alias) || 0;
    if (entry.role === "r" && count !== 1) {
      fail("required_bucket_count", `${entry.id} must occur exactly once; found ${count}`, "result.m");
    }
    if (entry.role !== "r" && count > 1) {
      fail("duplicate_bucket", `${entry.id} occurs more than once`, "result.m");
    }
  }

  const unattributable: UnattributableOut[] = [];
  const rawUnattributable = parsed.u === undefined ? [] : parsed.u;
  if (!Array.isArray(rawUnattributable)) fail("compact_schema_invalid", "u must be an array", "result.u");
  for (let i = 0; i < rawUnattributable.length; i++) {
    const path = `result.u[${i}]`;
    const row = rawUnattributable[i];
    if (!Array.isArray(row) || (row.length !== 3 && row.length !== 4)) {
      fail("compact_schema_invalid", "unattributable must have 3 values, or 4 with suggest", path);
    }
    const evidenceResult = parseCompactEvidence(row[0], context, `${path}[0]`, version);
    const what = requireString(row[1], `${path}[1]`, 1000);
    const correct = requireBoolean(row[2], `${path}[2]`);
    const suggest = row[3] === undefined || row[3] === null
      ? undefined : requireString(row[3], `${path}[3]`, 300);
    if (suggest && !plausibleBucketId(suggest)) fail("invalid_bucket_id", "suggest must be a plausible dot-separated bucket id", `${path}[3]`);
    unattributable.push({
      evidence: evidenceResult.evidence || "",
      what,
      correct,
      ...(suggest ? { suggest } : {}),
    });
  }

  const rawProposals = parsed.p === undefined ? [] : parsed.p;
  if (!Array.isArray(rawProposals)) fail("compact_schema_invalid", "p must be an array", "result.p");
  const proposalKeys = new Set(["r", "s", "l", "y", "a", "c", "e", "x"]);
  for (let i = 0; i < rawProposals.length; i++) {
    const path = `result.p[${i}]`;
    const proposal = rawProposals[i];
    if (!isRecord(proposal)) fail("compact_schema_invalid", "proposal must be an object", path);
    assertOnlyKeys(proposal, proposalKeys, path);
    if (typeof proposal.r !== "number" || !Number.isInteger(proposal.r) || !byAlias.has(proposal.r)) {
      fail("unknown_bucket_alias", "proposal parent must be an existing numeric alias", `${path}.r`);
    }
    const parent = byAlias.get(proposal.r)!;
    const slug = requireString(proposal.s, `${path}.s`, 120);
    if (!PROPOSAL_SLUG_RE.test(slug)) fail("invalid_proposal", "s must be a lower-case dot-separated child slug", `${path}.s`);
    const bucket = `${parent.id}.${slug}`;
    if (byId.has(bucket) || bucketIds.has(bucket)) fail("duplicate_bucket", `${bucket} already exists or was already emitted`, path);
    const label = requireString(proposal.l, `${path}.l`, 200);
    const rationale = requireString(proposal.y, `${path}.y`, 1000);
    const credits = validateCredits(proposal.a, proposal.c, path);
    if (credits.a !== 1) fail("invalid_proposal", "a proposal must describe an engaged skill", `${path}.a`);
    const evidenceResult = parseCompactEvidence(proposal.e, context, `${path}.e`, version);
    const expected = parseExpected(proposal.x, `${path}.x`);
    const outcome = deriveOutcome(credits.a, credits.c);
    if (evidenceResult.isNull && !expected) {
      fail("invalid_span", "an attempted proposal needs evidence or an expected omitted form", `${path}.e`);
    }
    if (outcome === "hit" && expected !== undefined) {
      fail("invalid_proposal", "hit proposals must omit x", `${path}.x`);
    }
    bucketIds.add(bucket);
    markpoints.push({
      bucket,
      label,
      attempted_credit: credits.a,
      correctness_credit: credits.c,
      outcome,
      ...(evidenceResult.evidence !== undefined ? { evidence: evidenceResult.evidence } : {}),
      ...(expected !== undefined ? { expected } : {}),
      bucket_proposed: true,
      proposed_parent_id: parent.id,
      proposed_label: label,
      proposed_rationale: rationale,
    });
  }

  const notes: MarkerNoteOut[] = [];
  const rawNotes = parsed.n === undefined ? [] : parsed.n;
  if (!Array.isArray(rawNotes)) fail("compact_schema_invalid", "n must be an array", "result.n");
  for (let i = 0; i < rawNotes.length; i++) {
    const path = `result.n[${i}]`;
    const row = rawNotes[i];
    if (!Array.isArray(row) || row.length !== 2 || typeof row[0] !== "string" || !NOTE_KINDS.has(row[0] as NoteKind)) {
      fail("compact_schema_invalid", "note must be [valid_kind,text]", path);
    }
    const text = requireString(row[1], `${path}[1]`, 1000);
    notes.push({ kind: row[0] as NoteKind, text, note: text });
  }

  // V3 can derive the one unambiguous overall-attempt edge case instead of
  // trusting a contradictory holistic flag. Notes are commentary, not proof
  // that the task was attempted. When no markpoint/proposal or observation is
  // engaged, all three holistic scores must be zero; never silently preserve
  // impossible positive marks/correctness while normalising only attempted.
  // Preserve model judgement in mixed/partial cases where a proportion may
  // carry information, but reject attempted_overall=0 when explicit evidence
  // proves that something was engaged.
  if (version === 3) {
    const hasEngagement = markpoints.some((markpoint) => markpoint.attempted_credit > 0)
      || unattributable.length > 0;
    if (!hasEngagement) {
      if (overall.marks_awarded !== 0 || overall.correctness_overall !== 0) {
        fail("holistic_inconsistent", "an unengaged answer must have zero marks and zero correctness", "result.o");
      }
      overall.attempted_overall = 0;
    } else if (overall.attempted_overall === 0) {
      fail("holistic_inconsistent", "an engaged answer cannot have attempted_overall 0", "result.o[1]");
    }
  }

  return {
    overall,
    raw_response: context.cleanedRaw,
    markpoints,
    ...(unattributable.length ? { unattributable } : {}),
    notes,
  };
}

function knownLabel(bucket: string, context: MarkerPromptContext): string | undefined {
  const entry = context.legend.find((candidate) => candidate.id === bucket);
  if (entry) return entry.label;
  const match = /^vocabulary\.it\.([^.]+)\.translation$/u.exec(bucket);
  return match ? `${match[1].replace(/_/g, ".")} (translation)` : undefined;
}

function normalizeLegacyNote(value: unknown, path: string): MarkerNoteOut {
  if (!isRecord(value)) fail("legacy_schema_invalid", "note must be an object", path);
  const kind = value.kind;
  if (typeof kind !== "string") fail("legacy_schema_invalid", "note kind is invalid", `${path}.kind`);
  const normalizedKind: NoteKind = NOTE_KINDS.has(kind as NoteKind) ? kind as NoteKind : "other";
  const rawText = typeof value.text === "string" ? value.text : value.note;
  const text = requireString(rawText, `${path}.text`, 1000);
  return {
    ...value,
    ...(normalizedKind !== kind ? { source_kind: kind } : {}),
    kind: normalizedKind,
    text,
    note: text,
  };
}

function normalizeLegacyResult(parsed: Record<string, unknown>, context: MarkerPromptContext): MarkerResult {
  if (!isRecord(parsed.overall)) fail("legacy_schema_invalid", "missing overall", "result.overall");
  if (!Array.isArray(parsed.markpoints)) fail("legacy_schema_invalid", "missing markpoints array", "result.markpoints");
  const markpoints: MarkpointOut[] = parsed.markpoints.map((value, index) => {
    const path = `result.markpoints[${index}]`;
    if (!isRecord(value)) fail("legacy_schema_invalid", "markpoint must be an object", path);
    const bucket = requireString(value.bucket, `${path}.bucket`, 300);
    const correctness = value.attempted_credit === 0 && value.correctness_credit === 0
      ? null : value.correctness_credit;
    const credits = validateCredits(value.attempted_credit, correctness, path);
    const proposed = value.bucket_proposed === true;
    const label = knownLabel(bucket, context)
      || (typeof value.label === "string" && value.label.trim() ? value.label : undefined)
      || (proposed && typeof value.proposed_label === "string" ? value.proposed_label : undefined)
      || bucket;
    return {
      ...value,
      bucket,
      label,
      attempted_credit: credits.a,
      correctness_credit: credits.c,
      outcome: deriveOutcome(credits.a, credits.c),
      bucket_proposed: proposed,
    } as MarkpointOut;
  });

  if (parsed.overall.attempted_overall === 0) {
    const present = new Set(markpoints.map((markpoint) => markpoint.bucket));
    for (const entry of context.legend) {
      if (entry.role !== "r" || present.has(entry.id)) continue;
      markpoints.push({
        bucket: entry.id,
        label: entry.label,
        attempted_credit: 0,
        correctness_credit: null,
        outcome: "not_attempted",
        bucket_proposed: false,
      });
    }
  }

  const rawNotes = parsed.notes === undefined ? [] : parsed.notes;
  if (!Array.isArray(rawNotes)) fail("legacy_schema_invalid", "notes must be an array", "result.notes");
  const notes = rawNotes.map((value, index) => normalizeLegacyNote(value, `result.notes[${index}]`));
  return {
    ...parsed,
    overall: { ...parsed.overall } as MarkerResult["overall"],
    raw_response: context.cleanedRaw,
    markpoints,
    notes,
  } as MarkerResult;
}

function assertMarkerResult(result: unknown, context?: MarkerPromptContext): asserts result is MarkerResult {
  if (!isRecord(result)) fail("schema_invalid", "result must be an object", "result");
  if (!isRecord(result.overall)) fail("schema_invalid", "overall must be an object", "result.overall");
  requireUnit(result.overall.marks_awarded, "result.overall.marks_awarded");
  if (result.overall.marks_possible !== 1) fail("schema_invalid", "marks_possible must be 1", "result.overall.marks_possible");
  requireUnit(result.overall.attempted_overall, "result.overall.attempted_overall");
  requireUnit(result.overall.correctness_overall, "result.overall.correctness_overall");
  requireString(result.overall.summary, "result.overall.summary", 300);
  requireString(result.overall.explanation, "result.overall.explanation", 2000);
  if (typeof result.raw_response !== "string") fail("schema_invalid", "raw_response must be a string", "result.raw_response");
  if (!Array.isArray(result.markpoints)) fail("schema_invalid", "markpoints must be an array", "result.markpoints");
  if (!Array.isArray(result.notes)) fail("schema_invalid", "notes must be an array", "result.notes");

  const indexes = context ? contextIndexes(context) : null;
  const requiredCounts = new Map<string, number>();
  const seenBuckets = new Set<string>();
  for (let i = 0; i < result.markpoints.length; i++) {
    const path = `result.markpoints[${i}]`;
    const markpoint = result.markpoints[i];
    if (!isRecord(markpoint)) fail("schema_invalid", "markpoint must be an object", path);
    const bucket = requireString(markpoint.bucket, `${path}.bucket`, 300);
    requireString(markpoint.label, `${path}.label`, 300);
    const credits = validateCredits(markpoint.attempted_credit, markpoint.correctness_credit, path);
    const derived = deriveOutcome(credits.a, credits.c);
    if (markpoint.outcome !== derived) fail("schema_invalid", `outcome must be ${derived}`, `${path}.outcome`);
    if (typeof markpoint.bucket_proposed !== "boolean") fail("schema_invalid", "bucket_proposed must be boolean", `${path}.bucket_proposed`);
    if (seenBuckets.has(bucket)) fail("duplicate_bucket", `${bucket} occurs more than once`, path);
    seenBuckets.add(bucket);

    if (markpoint.evidence !== undefined) {
      requireString(markpoint.evidence, `${path}.evidence`, 2000);
      if (context && !context.cleanedRaw.includes(markpoint.evidence as string)) {
        fail("invalid_evidence", "evidence is not an exact substring of the learner answer", `${path}.evidence`);
      }
    }
    if (markpoint.expected !== undefined) requireString(markpoint.expected, `${path}.expected`, 500);
    if (credits.a === 0 && markpoint.evidence !== undefined) {
      fail("invalid_evidence", "an unattempted markpoint must not carry evidence", `${path}.evidence`);
    }
    if (credits.a === 1 && markpoint.evidence === undefined && markpoint.expected === undefined) {
      fail("invalid_evidence", "an attempted markpoint needs evidence or an expected omitted form", path);
    }

    if (markpoint.bucket_proposed === true) {
      if (credits.a !== 1) fail("invalid_proposal", "a proposal must describe an engaged skill", `${path}.attempted_credit`);
      const parent = requireString(markpoint.proposed_parent_id, `${path}.proposed_parent_id`, 300);
      requireString(markpoint.proposed_label, `${path}.proposed_label`, 200);
      requireString(markpoint.proposed_rationale, `${path}.proposed_rationale`, 1000);
      if (indexes) {
        if (!indexes.byId.has(parent)) fail("invalid_proposal", "proposed parent is not in the supplied legend", `${path}.proposed_parent_id`);
        const prefix = `${parent}.`;
        const slug = bucket.startsWith(prefix) ? bucket.slice(prefix.length) : "";
        if (!slug || !PROPOSAL_SLUG_RE.test(slug)) {
          fail("invalid_proposal", "proposed bucket must be a safe child path beneath proposed_parent_id", `${path}.bucket`);
        }
        if (indexes.byId.has(bucket)) fail("invalid_proposal", "proposed bucket already exists in the supplied legend", `${path}.bucket`);
      }
    } else if (indexes) {
      const entry = indexes.byId.get(bucket);
      if (entry) {
        if (entry.role !== "r" && credits.a !== 1) {
          fail("unengaged_nonrequired", "expected, optional, and context buckets may be emitted only when engaged", path);
        }
        if (entry.role === "r") requiredCounts.set(bucket, (requiredCounts.get(bucket) || 0) + 1);
      } else {
        const legalDynamic = context!.direction === "en_it" && isBareProductionVocabularyBucket(bucket) && credits.a === 1;
        if (!legalDynamic) fail("unknown_bucket", "regular bucket is neither supplied nor legal dynamic vocabulary", `${path}.bucket`);
      }
    }
  }

  if (context) {
    for (const entry of context.legend) {
      if (entry.role !== "r") continue;
      const count = requiredCounts.get(entry.id) || 0;
      if (count !== 1) fail("required_bucket_count", `${entry.id} must occur exactly once; found ${count}`, "result.markpoints");
    }
    if (result.raw_response !== context.cleanedRaw) {
      fail("schema_invalid", "raw_response must equal the authoritative cleaned learner answer", "result.raw_response");
    }
  }

  for (let i = 0; i < result.notes.length; i++) {
    const path = `result.notes[${i}]`;
    const note = result.notes[i];
    if (!isRecord(note) || typeof note.kind !== "string" || !NOTE_KINDS.has(note.kind as NoteKind)) {
      fail("schema_invalid", "note kind is invalid", path);
    }
    const text = requireString(note.text, `${path}.text`, 1000);
    if (note.note !== text) fail("schema_invalid", "note compatibility field must equal text", `${path}.note`);
  }

  if (result.unattributable !== undefined) {
    if (!Array.isArray(result.unattributable)) fail("schema_invalid", "unattributable must be an array", "result.unattributable");
    for (let i = 0; i < result.unattributable.length; i++) {
      const path = `result.unattributable[${i}]`;
      const value = result.unattributable[i];
      if (!isRecord(value)) fail("schema_invalid", "entry must be an object", path);
      const evidence = requireString(value.evidence, `${path}.evidence`, 2000, true);
      if (context && evidence && !context.cleanedRaw.includes(evidence)) {
        fail("invalid_evidence", "evidence is not an exact substring of the learner answer", `${path}.evidence`);
      }
      requireString(value.what, `${path}.what`, 1000);
      requireBoolean(value.correct, `${path}.correct`);
      if (value.suggest !== undefined) {
        const suggest = requireString(value.suggest, `${path}.suggest`, 300);
        if (!plausibleBucketId(suggest)) fail("invalid_bucket_id", "suggest must be a plausible dot-separated bucket id", `${path}.suggest`);
      }
    }
  }
}

/** Strictly validate an already-hydrated public MarkerResult. */
export function validateMarkerResult(result: unknown, context?: MarkerPromptContext): ValidationResult {
  try {
    assertMarkerResult(result, context);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Accept compact v2/v3 or a legacy full MarkerResult and return the strict,
 * browser-facing shape. A payload that declares a compact version never
 * silently falls through to legacy interpretation.
 */
export function normalizeModelResult(parsed: unknown, context: MarkerPromptContext): MarkerResult {
  if (!isRecord(parsed)) fail("schema_invalid", "model result must be an object", "result");
  let result: MarkerResult;
  if (hasOwn(parsed, "v")) {
    if (parsed.v !== 2 && parsed.v !== 3) {
      fail("compact_schema_invalid", "v must be 2 or 3", "result.v");
    }
    result = hydrateCompact(parsed, context, parsed.v);
  } else {
    result = normalizeLegacyResult(parsed, context);
  }
  assertMarkerResult(result, context);
  return result;
}
