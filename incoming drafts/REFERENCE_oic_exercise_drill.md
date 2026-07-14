# REFERENCE: OnlineItalianClub exercise-level drill (2026-07-14)

Provenance: produced off-bridge by the architect chat. Twenty agents fetched and dissected every page under the site's alphabetical grammar index (https://onlineitalianclub.com/index-of-free-italian-exercises-and-grammar-lessons/), one topic batch each, then a synthesis agent merged the findings. Coverage: 267 of 267 pages fetched, zero failures, verified from the run journal. The exercises are Hot Potatoes-style JavaScript pages, so agents routed through a rendering proxy with 75-110s pacing; where a page's typed answers were only in JS validation, agents flagged inferences as such in the raw findings.

Companion file: oic_drill_raw_findings.json carries the per-page notes (format, skills tested, traps, steals, lesson rules) for all 267 pages, organised by the twenty batches. Author chats can mine their own topic's entries directly; this document is the cross-topic synthesis.

On commit (next bridged session): this file and the companion JSON go to the repo root alongside the earlier index-level coverage cross-reference, which this supersedes in depth. Follow-ups the architect has queued from it are listed at the end of the chat summary, not here, so this document stays a stable reference.

# LINGUICS IDEA BANK: onlineitalianclub.com full-site audit synthesis

## 1. EXERCISE FORMAT CATALOGUE

| Format | Best-suited topics | Marker notes (substring engine / AI-translation marker) |
|---|---|---|
| **Dropdown gap-fill, per-gap closed set** (site's default; always ~6–12 items) | articles, prepositions, pronoun forms, mood/tense selection, connectives | Trivial for substring matching (one exact token); the win over the source is per-item handcrafted distractors instead of the site's fixed option pool. AI marker: sentence context must uniquely force the answer or translation-based grading drifts. |
| **Typed gap-fill from bracketed infinitive** (production) | all conjugation topics, si constructions, pronominal verbs | Substring engine must normalize accents (parlerò/parlera), apostrophes (va', un', l'ho), and double letters (-emmo vs -emo); accept variant doublets (credei/credetti, potei/poté). AI marker: give person hints "(andare – noi)" only when the sentence underdetermines person. |
| **Binary forced choice** (a/in; c'è/ci sono; essere/avere aux; tu/Lei form; finché/affinché; che/cui) | any two-way rule with a crisp trigger | Cleanest possible marker: two literal strings, zero ambiguity. Steal wholesale: one rule, twelve coin flips, plausible bait each time. |
| **Word-bank cloze with reuse + decoys** ("You may use them more than once. Not all are used.") | simple prepositions, buono/bene system, pronominal-verb selection, indefinites | Bank kills elimination strategies; substring marker per gap unchanged. Duplicate a bank word (their doubled "cattivo") to signal multiple slots. |
| **Connected-narrative cloze** (10–15 gaps, one story: childhood memoir, Croatia trip, cat-wrecks-house, Bologna summer course) | pp/imperfetto/trapassato contrast, condizionale, prepositions, si passivante | Each gap still a single-token marker, but discourse (dialogue turns, possessives, "un giorno" pivots) carries the person/tense cue: must verify each gap remains locally decidable for the marker. |
| **Whole-sentence transformation/rewrite** (present→pp; direct→reported; two-sentence merge→cui; riuscire a→farcela; simple→progressive) | reported speech, relative pronouns, pp, farcela | Full-sentence answers break naive substring matching: mark on 2–3 obligatory substrings (e.g. "quel giorno" + "sarebbe partito") or use AI translation marker; ideal AI-marker territory. |
| **Matching** (antonyms; singular↔plural with article banks; adverb↔Italian paraphrase; position-minimal-pair↔meaning gloss; sentence halves for ipotetico/connectives; situation↔polite utterance) | recognition-stage anything; semantics of adjective position; ipotetico tense compatibility | Not substring territory: implement as MCQ where the co-bank items ARE the distractors (le pesche vs i pesci in one bank). |
| **Binary classification / grammaticality judgment** (che = REL/CON; superlative REL/ASS; vero/falso conditional combos; non pleonastic vs necessary; neo- true/false) | metalinguistic gates before production drills | Two fixed labels = trivial marker; cheap to author; the site uses these as prerequisites (REL-che before cui). |
| **Chunk reorder** (mica placement, question word order, dialogue reconstruction) | anything where the error IS positional: mica, clitic order, negative concord | Marker = exact full-string match of the reassembled sentence; accept both orders where legit (non mangiarla / non la mangiare). |
| **Full-paradigm single-verb drill** (type all six persons) | irregular canon: A1 presente 10 verbs; imperfetto/remoto/congiuntivo exemplar sets | Six substring markers per verb; per-cell accent checking (cantò, finì). |
| **Q&A short-answer transformation** ("Riesci a…?" → "Sì, ce la faccio") | pronominal verbs, pronoun answers, person-switching | Marker on the clitic chunk + verb; bait is copying the question's person: marker must reject "ce la fai". |
| **Listening minimal-pair dictation** (single vs double consonant; in-sentence cloze) | double consonants, spelling-sound mapping | Substring marker per word; requires audio asset; pairs (sasso/palazzo) generate themselves from a minimal-pair list. |
| **Dialogue + comprehension V/F embedding target grammar** (dal medico: Lei imperatives) | register topics: imperativo formale, tu/Lei | Grammar is in the input, not the answer: good as a reading stage; V/F labels trivially markable. |

**Cross-format house patterns to steal:** (1) same lexical surface with opposite answers in one set (Bologna city Ø vs il Bologna team; un amico / un'automobile adjacent; tutta la città vs è tutta strana); (2) one out-of-paradigm trap item per drill ("Voi di dove ___?" needing *siete* inside the AVERE drill); (3) exception density 1–3 per 10 regular items; (4) lesson exception-list → items pipeline (C1 article lesson maps 1:1 onto its drill); (5) same nine verbs drilled in futuro AND condizionale to expose shared stems; (6) numbered parallel sets (Finché o Affinché 1, 2) for volume per micro-skill.

---

## 2. PER-TOPIC ITEM-WRITING IDEAS

### present_indicative
- **Traps:** compound subjects ("Io e i miei amici" → noi; "Tu e Sergio" → voi); zero-subject sentences with person recoverable only from possessives (i miei → io) or subordinate verbs ("quando vai" → tu); vocative vs subject ("Gianna, vai a fare la spesa?!"); chi + 3sg despite plural object ("Chi lava i piatti?"); postverbal subject after fronted adverbial ("La settimana prossima esce il nuovo album dei Coldplay"); *sono* 1sg/3pl ambiguity as distractor; -isc split (capiscono, but never in noi/voi: the site never states this rule, we should); g-insertion limited to io/loro (salgo/salgono, scelgono, propongono); "Scusi professore, ___ ripetere?" → può (register cue forces Lei).
- **Steals:** "Lui ___ Giovanni" (si chiama, not è); "Loro studiano l'italiano da molti anni" (da + presente duration); "Molti turisti salgono sulla Torre di Pisa."
- **Encode:** A1 irregular canon = andare, venire, sapere, uscire, fare, dare, dire, dovere, potere, volere; -go class distribution rule (io + loro only); pro-drop and present-for-future rules as feedback strings.

### imperfect
- **Traps:** hidden Latin stems (facevo, dicevo, bevevo, traducevo: bait *favo/*divo); -isc never appears (finivo, not *finiscevo); stato/psych verbs must stay imperfetto ("ero troppo felice").
- **Steals:** "Da piccolo vivevo in campagna"; "Mentre facevo le fotocopie, Silvia scriveva gli indirizzi."
- **Encode:** four-use list (description, habit, state, simultaneity); irregular set essere/fare/dire/bere/dare/tradurre; verbs tagged regolare/irregolare in drill metadata.

### passato_prossimo
- **Traps:** transitive use of a "known essere verb": "Oggi Claudia comincia una nuova dieta" → HA cominciato; conversely "Il film è già iniziato"; participle regularization (*vinciuto, *facuto); dual-aux class (cominciare/iniziare/ricominciare/finire/smettere/continuare) with participle ending (-e/-i) as the giveaway clue; modal aux inherited from following infinitive with agreement on the modal ("siamo dovuti venire", "non è voluta uscire"); clitic + obligatory agreement incl. elided l' ("l'hai pagata": gender recoverable only from antecedent "una maglia").
- **Steals:** "Marco è voluto partire per gli Stati Uniti, mentre Stefania e Giulia sono volute andare in Inghilterra" (masc sg vs fem pl in one sentence); "Ho finito di scrivere l'email e l'ho spedita"; worked examples that leak gender via subordinate clause ("…perché mi sono svegliato tardi").
- **Encode:** aux-tagged irregular participle lists ("fare – (avere) fatto; venire – (essere) venuto"); site gap we fill: reflexive+modal aux switch (mi sono dovuto alzare vs ho dovuto alzarmi): covered nowhere on the source.

### future
- **Traps:** four-tier stem taxonomy: regular a→e (canterò, bait *cantarò) / no-e syncope (avrò, andrò, vivrò) / double-r (verrò, vorrò, berrò, rimarrò) / memorized (sarò, farò, starò, darò, dirò); -isc suppression (finirò); accent as sole io/lui distinction (parlerò/parlerà): grade accents explicitly.
- **Steals:** epistemic future "Non lo so, forse avrà trovato molto traffico"; concessive "Tu sarai bravo a cucinare, ma…": both A2-taught here, rare elsewhere.

### condizionale
- **Traps:** stems identical to future, only endings differ: -emo/-emmo minimal pair (mangeremo/mangeremmo); *venirebbe for verrebbe; presente vs composto selection cued by time adverbials; composto = aux choice + agreement (sareste sposati).
- **Steals:** Croatia-trip dialogue cloze (12 gaps, 5 negated, person from dialogue turns; vorremmo/verreste/ci piacerebbe); "Non immaginavo che tu e Carla vi sareste sposati" (future-in-the-past + reflexive reciprocal agreement); "Sarei venuto volentieri ma avevo la febbre"; situation→utterance pragmatics matching ("Vorrei un etto di prosciutto" → dal salumiere).
- **Encode:** three functions (politeness, advice with dovresti, wish); composto uses: unrealizable, future-in-the-past, unfulfilled expectation.

### congiuntivo
- **Traps:** consecutio as THE axis: "crede che abbia detto" vs "credeva che fossi" (Veronica minimal pair); same-subject → di + infinitive (Credo di essere, never *Credo che io sia); io/tu/lui share presente form and io/tu share imperfetto form → subject pronouns obligatory; stare/dare take -essi (stessi/dessi) despite -are infinitives; dicessi (bait *dissi); passato participle agreement (siano usciti); trapassato aux in imperfetto subj (avessi fatto vs abbia fatto).
- **Steals:** B2 7-category trigger taxonomy with word lists incl. sleepers non sapere se, si dice che, aspettarsi che, permettere che, dispiacersi che; "Sono molto contento che voi vi siate divertiti" (reflexive passato); "Basta che scaldiate bene il forno"; C2: "Che fosse strano, lo avevo sempre detto" (fronted object clause); "Cerco una segretaria che sappia usare il computer" vs known antecedent + indicative; rhetorical "Chi mi assicura che non faccia di testa sua?"; "Ero partito senza che tu mi avessi dato il via."
- **Encode:** the C1 anti-overgeneralization instruction verbatim: "use the subjunctive where necessary": mixed drills where indicative is sometimes correct. Caution: source's dire table prints "loro dessero" for dicessero: never scrape unchecked.

### trapassato
- **Traps:** trigger phrases (mai prima di allora, pochi minuti prima, già, appena) baiting pp/imperfetto; frame verbs in pp vs discovered-prior events in trapassato (return-home-and-discover schema); reflexive → essere + agreement (si era dimenticata).
- **Steals:** Tomasino-the-cat narrative (first two gaps are pp frame verbs punishing trapassato-everywhere); news-story cloze with "pochi minuti prima (acquistare)" flashbacks.

### passato_remoto
- **Traps:** 1-3-3 pattern (irregular io/lui/loro, regular tu/noi/voi on infinitive stem); -ere doublets (credei/credetti, potei/poté: accept both); 3sg accent (cantò, sentì); suppletive ebbi/fui; -si family (riassunse, prese); reflexive in remoto (si guardò).
- **Steals:** Pinocchio serialized cloze (public-domain, remoto-native register); the B2 lesson's 36-verb irregular inventory groupable into -si/-ssi/-cqui/suppletive families.
- **Encode:** register note: literary/historical + regional spoken use.

### gerundio
- **Traps:** irregular stems (facendo, dicendo, bevendo); semplice vs composto = simultaneity vs anteriority; composto aux choice (avendo/essendo) + agreement with attached clitic (avendoLA aiutatA); English -ing interference: after prepositions Italian wants infinitive; progressive restraint ("Vado, ciao!" not "Sto andando, ciao!").
- **Steals:** four adverbial readings of one form (temporal/causal/modal/conditional) incl. negated conditional "Non studiando abbastanza, non passerai mai quell'esame"; "Avendo studiato matematica, so risolvere le equazioni."

### imperativo
- **Traps:** the tu/Lei ending MIRROR (-are: mangia-tu/mangi-Lei; -ere/-ire: leggi-tu/legga-Lei): every formal/informal item is a two-option same-verb dropdown; apostrophe apocopates (fa', va', di', da', sta') vs indicative lookalikes (fai, vai); negative tu = non + infinitive with dual clitic placement (non farlo / non lo fare: both correct, select-all-that-apply); Lei clitics ALWAYS precede (si accomodi, la mangi: *mangila-Lei is the principled distractor); combined clitics (scrivigliela / non gliela scrivere).
- **Steals:** the "dal medico" dialogue packing the whole Lei paradigm in one doctor turn (si riposi, stia, prenda, non fumi, si copra, cerchi, mi dica, apra, torni); irregular Lei closed list (faccia, vada, dica, dia, stia, sia, abbia) vs tu list (fa', va', di', da', sta', sii, abbi, sappi).

### tense_choice / concordanze
- **Traps:** marker→tense mapping is the whole game: da piccolo/mentre/da qualche tempo → imperfetto; un giorno/la settimana scorsa → pp; mai prima di allora/poco prima → trapassato; futuro-nel-passato = condizionale passato ("Ho saputo che sarebbe partito"): the form English speakers miss.
- **Steals:** the C2 concordanze double table (indicative + subjunctive × present/past main × anteriority/contemporaneity/posteriority, with legit doublets partisse/sarebbe partito); three-way presente/pp/imperfetto dropdown as a pre-skill; vero/falso grammaticality judgment on tense combos.

### periodo ipotetico
- **Traps:** clause-role inversion: conditional in the se-clause (*se non avrei perso) is the canonical error; the source engineers apodosis-gapped items against exactly this ("Se ieri mattina non avessi perso il treno, ___"); real vs unreal discrimination (type 1 vs 2); apodosis time-layer (condizionale presente vs passato) with only a time cue changing.
- **Encode + gap to exploit:** source never covers colloquial doppio imperfetto ("se lo sapevo, venivo") or mixed-type (past condition, present result): own these.

### reported speech
- **Traps:** no-shift when reporting verb is present ("Marco dice che è stanco"); non-shifting tenses after past reporting verbs (imperfetto, trapassato, condizionale stay: bait over-transformation); embedded se-clauses shifting with the main clause; congiuntivo downshift (spero che piaccia → sperava che piacesse).
- **Steals:** "Da oggi in poi non commetterò più sciocchezze" → futuro→condizionale passato PLUS oggi→quel giorno in one short item; the full deictic shift word-list (qui→lì, ora→allora, oggi→quel giorno, ieri→il giorno prima, domani→il giorno dopo) as a standalone drill; imperativo→infinito (stated in the lesson, unexercised on the site: free real estate).

### pronouns (direct/indirect/combined)
- **Traps:** invariable -o participle after avere when direct clitic precedes (*li ho comprato); elided l' hiding gender; fused vs spaced spelling (glielo one word, me lo two: motivated by real-word collisions mela/melo); gli, le, AND formal Le all collapse to glie- (*le lo, *gli la as distractors); article gli vs pronoun li (gli yogurt → li ho presi).
- **Steals:** paired-mini-dialogue stem format ("Ho comprato una maglia…" / "Quanto l'hai pagata?"); full combination tables (me lo…gliene…ve ne) as answer key; "Te ne do un'altra, se vuoi."

### relative pronouns
- **Traps:** chi never follows an expressed antecedent (la persona CHE, even for people); chi always 3sg despite plural meaning; cui only after preposition; preposition selection driven by valency (la ditta PER cui lavoro, la persona DI cui ti parlavo, la casa IN cui abitavo); possessive relative article agrees with the possessed noun, not the possessor (la cui mamma): NOTE the source's own agreement rule is garbled, state it correctly.
- **Steals:** REL/CON binary tagging of che as a gate drill; two-sentence merge format ("Laura è la mia amica. Ho scritto il libro sulla vita di Laura." → "Laura, sulla cui vita ho scritto un libro, è mia amica"); che↔il quale substitution with agreement.

### ci / ne
- **Traps:** function inventory as confusion matrix: ci = noi-reflexive / c'è-ci sono / a+place / con-su+X; ne = quantity / di+X / da+X; cross-particle bait (ci offered for di-phrases); past-participle agreement with partitive ne ("ne ho mangiate tre": the site demonstrates it but never names it: name it).
- **Steals:** "Ho comprato delle mele stamattina e ne ho già mangiate tre!"; quanto/quanta/quanti/quante agreement in "Quanto ne vuole?" deli frames.

### reflexives
- **Traps:** pronoun + ending double agreement as one choice unit (*si alzi, *ti alza); reciprocal si ("si conoscono da molti anni"); body part + definite article not possessive ("Marco si taglia i capelli"); prepositional government (ricordarsi DI, preoccuparsi PER, arrabbiarsi CON); pp of reflexives = essere + agreement (*mi ho lavato is THE error), which the source's lesson never teaches before testing.
- **Steals:** "A che ora ti alzi quando vai al lavoro?" (person from subordinate verb); mettersi a + infinitive.

### prepositions
- **Traps:** a + city vs in + country/region/big island vs Ø small island; da + person/profession (dal dottore); -eria words take in; bare vs articulated place idioms (a teatro/a casa/a scuola vs al cinema/al bar/al pub vs in discoteca/in centro); dalle…alle time ranges; per/tra/fra NEVER contract (pel/tral as auto-wrong distractors), con contracts only optionally as col; su = topic/approximation vs parlare di; stare a vs stare per + infinitive; da of function (macchina da caffè) vs di of material; prima di + infinitive same-subject only vs prima che + subjunctive (contrast set the site is missing: build it).
- **Steals:** the 15-gap Bologna-summer-course narrative, especially the five-leisure-place sentence "andare al pub o al cinema, a teatro, in discoteca o stare a casa" (five gaps, four patterns); the 9-preposition bank rubric "use more than once, not all used"; idiom-frozen articulated forms (d'ora in poi, dalle stelle alle stalle).

### articles
- **Traps:** zero as a first-class answer choice; kin-singular possessive Ø (mia sorella) vs il mio compagno vs loro-override (il loro fratello); habitual il venerdì; tutto three ways + adverbial tutto Ø ("è tutta strana"); geography ladder (la Puglia / Bologna Ø / Malta Ø / le Mauritius / negli Stati Uniti / Israele Ø); same-toponym contrast (Bologna città Ø vs il Bologna squadra); un/un' apostrophe minimal pair run back-to-back (un'automobile / un amico); uno + s-cons/z/ps/gn (uno zaino, uno stadio); fixed expressions (avere l'influenza, il David di Michelangelo); article + cui; celestial exceptions (la Terra, il Sole vs Marte Ø); uno degli studenti.
- **Steals:** "Ieri il Bologna ha battuto la Juventus" vs "Bologna è una bellissima città medievale"; "Il Fellini di Amarcord / Lo Shakespeare di Romeo e Giulietta" (surname forced to take article; Lo before Sh- bonus).

### nouns / plurals
- **Traps:** -cia/-gia split, tested blind by the source, statable by us (vowel keeps i: ciliegie; consonant drops it: arance, facce, piogge); h-insertion (pesche, zucche, amiche) vs the amico→amici exception cluster planted in a "regular" drill; invariables mixed into typing drills (tè, caffè, toast, dessert, re, analisi) forcing an active "no change" decision; truncated feminines (foto, moto, radio, auto) vs la mano→le mani; uovo→uova, braccio→braccia, dito→dita; zio→zii vs studio→studi; gender-pair homographs in meaning-forcing sentences (il manico/la manica, la buca/il buco, la fine/il fine, il tappo/la tappa, il gambo/la gamba, la capitale/il capitale); suppletive feminines (dio→dea, celibe→nubile, toro→vacca, cane→cagna); compound plurals B2 four-rule core (portachiavi invariable vs asciugamani; pescispada first-element; casseforti both) escalating to C2 capo- semantics (capistazione / capicuochi / capoluoghi / le capofamiglia).
- **Steals:** the 10-item irregular taxonomy in one drill (zio, problema, analisi, braccio, dito, faccia, bosco, amica, re, pioggia); "Roma è ___ dell'Italia" (la capitale, not il capitale); tagliatella→tagliatelle (singular of a plural-dominant word). Avoid replicating the site's accent errors (il caffé, i te).

### adjectives / possessives / demonstratives / indefinites
- **Traps:** position changes meaning (un pover'uomo vs un uomo povero): the source only exemplifies povero; supply the full grande/vecchio/certo/unico list ourselves; stacking rule (figurative before + literal after: "una bella donna mediterranea"); possessive agrees with thing possessed; un mio amico (indefinite + possessive); qualche + obligatory singular; chiunque (pronoun) vs qualunque (adjective); subjunctive after chiunque/qualunque/dovunque ("Chiunque sia, digli che non ci sono"); relational adjectives post-nominal with suffix set -ale/-are/-istico/-ico/-ivo…; Latinate mappings (fegato→epatico); C2 register demonstratives (literary singular questi/quegli, pejorative costui/costoro, bureaucratic medesimo/sottoscritto).
- **Steals:** the closed four-option gap-fill bank {qualunque, chiunque, ciascuno, nessuno}; "'Non ne so niente!' rispose quegli risoluto."

### adverbs
- **Traps:** -mente on the feminine stem (*lentomente), -ile/-ale truncation (facilmente), irregular leggermente; false friends buried among genuine near-synonyms Italian-to-Italian (attualmente = al momento, NOT actually; presto = in anticipo; ora/adesso; personalmente = secondo la mia opinione); fixed locuzioni as a closed 18-phrase C1 list with built-in confusables (per tempo vs per ora vs or ora; a poco a poco vs poco alla volta; al dettaglio vs all'ingrosso).
- **Steals:** the item set felice/caldo/triste/freddo/noioso/allegro/leggero/pesante (mixes -o and -e classes + one semi-irregular); "tutto è gettato alla rinfusa e niente è in ordine"; "di vecchi abiti ce ne sono a bizzeffe" (locuzione + ne).

### comparison
- **Traps:** di vs che rulebook, one rule per item: di + name/pronoun, articulated di + article, che + infinitive / repeated preposition / second adjective / paired nouns ("più vivace che intelligente", "più studentesse che studenti"); migliore/meglio, peggiore/peggio adjective-vs-adverb; ottimo (adj) vs malissimo (adv); relative superlative without più on the surface ("la cuoca migliore del mondo"); absolute superlative without -issimo (reduplication "tenero tenero", prefix "arcistufo") including the misleading di-phrase ("arcistufo DI tutte le tue lamentele": still ASS).
- **Steals:** the whole A2 word-bank cloze whose 15-form bank IS the distractor set (buoni/bene/migliore/meglio/ottima/pessimo/malissimo… with "cattivo" duplicated).

### existential
- **Traps:** agreement with the postposed NP, difficulty entirely in the noun phrase: mass nouns (molto traffico, tanta neve → c'è); collective singulars (molta gente, una grande comunità indiana → c'è despite plural meaning); coordinated singulars ("Nel cappuccino ci sono latte e caffè": coordination overrides mass-singularity); plural definite after singular container ("Nella torta ci sono le mele" vs nearest-noun bait); numerals incl. approximation (circa cinquanta studenti → ci sono); negation + qualcuno/nessuno as singular.
- **Steals:** "In Russia c'è tanta neve" vs "In Finlandia ci sono molti laghi" as the quantity-word minimal contrast.

### piacere
- Thin on the source; harvest from adjacent items: "ci piacerebbe" in the Croatia dialogue (impersonal 3sg + dative even with plural humans); "Spero che questo regalo piaccia a tua sorella" (congiuntivo + reported-speech downshift); "mi piaceva stare all'aria aperta" as imperfetto anchor. Build the topic mostly ourselves.

### si constructions
- **Traps:** verb agrees with the noun around si, not implied "people": molta gente → sg; sia il tedesco sia l'inglese → pl; preverbal subject still agrees ("I vini bianchi si bevono"); l'uva → sg mass; compound tenses always essere with participle split (si è mangiato vs si è stati/partiti/interrogati); si è + plural adjective (quando si è stanchi): showcased four times on the source but never stated as a rule: state it; ci si for reflexives (ci si accorge, ci si riposa, ci si sente padroni).
- **Steals:** "A Bologna si mangia molta carne / si mangiano molti gelati"; "Se si è stati in Spagna, si è probabilmente conosciuto uno spagnolo" (two participle rules in one sentence); "In treno si viaggia più comodi" (sg verb + pl adjective).

### passive
- **Steals:** the triple rendering of one sentence: "è presentato / si presenta / va presentato il bilancio": as a transformation-drill template; andare + participle for necessity; modal + passive infinitive (devono essere parcheggiate); da-agent (complemento d'agente vs causa efficiente).
- **Gap to own:** venire-passive is entirely absent from the source (its B2 lesson even claims "the auxiliary is always essere").

### pronominal verbs
- **Traps:** the participle-agreement split: frozen feminine fatta in ce l'ho fatta vs agreeing andato/a/i/e in andarsene; elision (ce l'ho fatta, never *ce la ho fatta); chain-by-person (me ne/te ne/se ne…) vs invariant ce la; -sela vs -sene shell confusion (me la cavo / me la prendo vs me ne frego / me ne vado); metterci vs volerci (personal vs impersonal time); idiom stems with frozen tails (darsela A GAMBE, legarsela AL DITO, mettercela TUTTA, tirarla PER LE LUNGHE, dirne DI TUTTI I COLORI); negative-only idioms (non poterne più, non farcela più); near-synonym MCQ pairs (avercela con vs volerne a; farcela vs cavarsela).
- **Steals:** riuscire a → farcela paraphrase Q&A; same-root three-way contrast mettere/metterci/mettersi (extend to vedere/vederci, provare/provarci, passare/passarci/passarsela); the C1 22-verb glossed inventory; ladder: single-verb drills → 4-verb banks → 10-verb idiom-stem bank → matching → dropdown.

### connectives
- **Traps:** mood government as the master axis: perché-reason (+ind) vs perché-purpose (+subj); anche se (+ind) inside the otherwise-subjunctive contrast group (benché/sebbene/nonostante/malgrado) vs pur + gerund; che-forms + finite vs da-forms + infinitive in result clauses (in modo che vs in modo da); condition group + subj (purché, a patto che, qualora, nel caso in cui, semmai) with solo che (+ind) as the odd one out; clause position: siccome initial-only vs perché post-main vs quindi (consequence): a whole B1 exercise on just those three; inoltre (adverbial) vs oltre a (+infinitive); reverse drill: read the conjugated verb's mood, pick the compatible conjunction.
- **Steals:** the C2 six-group governance table as complete distractor pools; the nine-way contrast bank ma/però/eppure/anzi/invece/tuttavia/piuttosto/al contrario/in realtà; the 5-word discourse set {però, infine, allora, invece, comunque}; "Oltre a saper parlare cinque lingue, sa usare bene il computer" vs "…e inoltre è molto disponibile."

### micro-topics
- **mica:** three position-meaning pairings: post-verbal reinforcing non ("Non ho mica detto…"), pre-verbal replacing non ("Mica sono stupida!"), suppositional question ("Mica hai visto mia madre?"); drill via chunk reorder since the error is positional.
- **non pleonastico:** obligatory-non list (mai; post-verbal niente/nessuno/per niente; a meno che; senza che) vs pleonastic list (non appena; finché); negative-concord order rule (Nessuno è venuto: no non); binary "pleonastic vs necessary" classification on a capitalized NON.
- **finché:** the asymmetry: non is optional under the "until" reading but meaning-REVERSING under "as long as" ("Sono stato bene finché [non] ho abitato a Roma"); plus finché/affinché near-homophone binary.
- **piuttosto che:** preference + infinitive (= pur di non / per non) vs the proscribed disjunctive-'or' chaining: judged-usage MCQ material.
- **cleft (costruzione scissa):** esplicita "è Lucia che suona" vs implicita "è il cane a mangiare"; tense lives on essere in the implicita ("È stata Monica a cantare").
- **diminutives:** suffix set -ino/-etto/-ello/-uccio/-otto + -one; falsi alterati classification (cavalletto = easel); gender-shift alterati (campana→campanello, porta→portone); affect not size (sorellina).
- **word order:** chunk-reorder of interview questions/dialogues, sourced from public conversation-lesson pages, pairable with audio.
- **double consonants:** listening minimal pairs (sasso/palazzo) + in-sentence cloze (arrivato, mezz'ora).
- **tu/Lei:** transformation pairs for first-meeting functions (ti chiami→si chiama, hai→ha, tuo→suo, ciao→arrivederla); register cues (Scusi professore) forcing 3sg elsewhere.

---

## 3. NEWLY SURFACED MICRO-TOPICS (invisible from a topic-index skim)

1. **Person recovery from indirect cues**: possessives (i miei → io), subordinate verbs (quando vai → tu), vocatives, compound subjects (io e X → noi): a cross-cutting item mechanic, not a topic.
2. **Dual-auxiliary verbs by transitivity** (ha cominciato la dieta / il film è iniziato): the source drills this INSTEAD of movement verbs.
3. **Participle agreement on the MODAL** (siamo dovuti venire) and the untaught reflexive+modal aux switch (mi sono dovuto alzare vs ho dovuto alzarmi).
4. **Frozen-feminine vs agreeing participle in pronominal verbs** (ce l'ho fatta vs se ne sono andate).
5. **si è + plural adjective/participle** (quando si è stanchi; si è stati): used everywhere, stated nowhere.
6. **ci si** (impersonal + reflexive) as its own slot type.
7. **Pleonastic non and the finché meaning-flip**: classification, not production.
8. **futuro epistemico/concessivo at A2** (avrà trovato traffico; sarai bravo, ma…).
9. **Accent-as-morpheme grading** (-ò/-à as the only io/lui contrast): an explicit marker-policy item.
10. **-isc suppression outside the presente** (finirò, finirei, finivo, finii): no source drill exists; build it.
11. **Gender-pair homographs** (il manico/la manica class) via meaning-forcing context sentences.
12. **Truncation/loanword gender + lo-selection in one item** (lo sport, il bar, il film).
13. **Article + cui possessive relatives and article + surname-of-work** (la cui mamma; il Fellini di Amarcord).
14. **Reported-speech deictic word-list** (oggi→quel giorno…) and imperativo→infinito, both taught-but-undrilled.
15. **Fronted che-clauses, rhetorical questions, and purpose relatives as subjunctive triggers** (syntactic, not lexical).
16. **Idiom stems with obligatory frozen tails** (legarsela al dito): the tail as the answer.
17. **-cia/-gia i-retention and capo- compound semantics** as statable orthography/morphology rules the source tests blind.
18. **Locuzioni avverbiali as a closed C1 list** with internal near-synonym distractors.
19. **Falsi alterati and gender-shift alterati.**
20. **Coordinated singulars flip existential/si agreement** (ci sono latte e caffè; si parlano sia X sia Y).

---

## 4. TOP 20 CONCRETE STEALS

1. "Ieri **il** Bologna ha battuto la Juventus" vs "Bologna è una bellissima città medievale": same toponym, opposite article answers.
2. "Oggi Claudia **ha cominciato** una nuova dieta" vs "Il film **è** già **iniziato**": dual-auxiliary trap pair on the same verb class.
3. "Marco **è voluto** partire per gli Stati Uniti, mentre Stefania e Giulia **sono volute** andare in Inghilterra": modal aux + double agreement in one sentence.
4. "Ho comprato una maglia.: Quanto **l'hai pagata**?": elided clitic forcing participle-gender lookup from the antecedent.
5. "Veronica non **crede** che io le **abbia detto** la verità" / "non **credeva** che **fossi** il fratello…": the consecutio minimal pair on one trigger verb.
6. "Se ieri mattina non **avessi perso** il treno, ___": se-clause given, apodosis gapped, engineered against *se non avrei perso.
7. "Da oggi in poi non commetterò più sciocchezze" → reported: **quel giorno + avrebbe commesso**: two reported-speech rules in eight words.
8. "La festa era noiosa, infatti **ce ne siamo andati** presto" vs "**ce l'ho fatta**": agreeing vs frozen participle across pronominal verbs.
9. "Nel cappuccino **ci sono** latte e caffè": coordination beats mass-noun singularity in existentials.
10. "A Bologna si **mangia** molta carne / si **mangiano** molti gelati": the si-passivante agreement atom in its cleanest form.
11. "Il bilancio **è presentato** / **si presenta** / **va presentato** ogni anno ai finanziatori": one proposition, three passives, ready-made transformation drill.
12. "Sono stato bene finché **[non]** ho abitato a Roma": optional vs meaning-reversing non as a meaning-selection MCQ.
13. "Scusi professore, **può** ripetere la domanda?": register cue (Scusi) forcing formal Lei over puoi.
14. The dal-medico doctor turn: "Si riposi, stia a casa, prenda questi antibiotici… non fumi, si copra la gola, e cerchi di rimanere al caldo": the entire Lei-imperative paradigm in context.
15. "Gianna, **vai** a fare la spesa?!": vocative that looks like a 3sg subject.
16. "Laura, **sulla cui vita** ho scritto un libro, è mia amica": two-sentence merge into preposition + article + cui.
17. "Il cane di mio zio è più vivace **che** intelligente": the di/che rule learners fail most, isolated.
18. "Ho comprato delle mele e **ne ho già mangiate tre**": partitive ne + participle agreement, unnamed by the source, nameable by us.
19. "Voglio **un'**automobile nuova. / Luigi ha **un** amico peruviano.": adjacent apostrophe minimal pair.
20. "**Gli** faccio leggere il giornale" vs "**lo** faccio dormire": causative fare clitic case flipped by the infinitive's transitivity.