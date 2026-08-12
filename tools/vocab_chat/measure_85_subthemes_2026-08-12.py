"""Measure actual membership of the 85 proposed sub-themes per theme_axes v1/v2.

Architecture: "QoderWork's sizes are ESTIMATES not counts. Measure the actual
membership of every proposed sub-theme before minting any of them."

Approach: for each of the 85 sub-themes in theme_subdivision_proposals_2026-08-06.md,
build a keyword pattern from (a) the sub-theme's example lemmas' English glosses
and (b) label semantics; search the parent group's entries for gloss matches;
report count + top-3000 count + top-20 lemmas by rank.

Then a manual verdict pass in the inter_chat reply applies Smith's two tests
(sayability + focus).

Output: data/subtheme_measurement_2026-08-12.json + a printable summary.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from atomic_io import atomic_write_json  # noqa: E402

DATA = PROJECT_ROOT / "data" / "vocabulary_it_frequency.json"
OUT = PROJECT_ROOT / "data" / "subtheme_measurement_2026-08-12.json"


# Each entry: (parent_theme_id, subtheme_id, label, seed_lemmas, keyword_patterns)
# keyword_patterns are word-boundary regex fragments used to match gloss text.
PROPOSALS = [
    # ---------- 1. noun_abstract → 10 ----------
    ("noun_abstract", "abstract_cognition", "Thought, knowledge, ideas",
        ["pensiero","idea","ragione","sapere","conoscenza","dubbio","memoria","opinione"],
        ["thought","idea","reason","knowledge","doubt","memory","opinion","belief","concept","mind","reasoning","perception"]),
    ("noun_abstract", "abstract_emotion", "Feelings and emotional states",
        ["gioia","paura","amore","rabbia","speranza","tristezza","ansia","nostalgia"],
        ["joy","fear","love","anger","hope","sadness","anxiety","nostalgia","emotion","feeling","passion","hate","envy"]),
    ("noun_abstract", "abstract_quality", "Qualities and properties",
        ["qualita","caratteristica","difetto","vantaggio","forza","debolezza","bellezza"],
        ["quality","characteristic","feature","defect","advantage","strength","weakness","beauty","virtue","trait","property"]),
    ("noun_abstract", "abstract_state", "States and conditions",
        ["stato","condizione","salute","liberta","ordine","caos","pace","guerra"],
        ["state","condition","health","freedom","liberty","order","chaos","peace","war","situation","status"]),
    ("noun_abstract", "abstract_relation", "Relations and connections",
        ["rapporto","somiglianza","differenza","parentela","legame","confronto"],
        ["relation","link","bond","similarity","difference","comparison","proportion","balance","correspondence","hierarchy","dependence","connection","tie","association","relationship","ratio","contrast"]),
    ("noun_abstract", "abstract_event", "Events and processes",
        ["sviluppo","cambiamento","crescita","evoluzione","inizio","fine","risultato"],
        ["development","change","growth","evolution","beginning","end","result","event","process","occurrence","happening","action"]),
    ("noun_abstract", "abstract_quantity", "Quantities and measures",
        ["quantita","numero","grado","proporzione","misura","totale"],
        ["quantity","number","degree","proportion","measure","measurement","total","amount","volume","size","extent"]),
    ("noun_abstract", "abstract_time", "Time periods and temporal concepts",
        ["periodo","momento","durata","epoca","secolo","eta","generazione"],
        ["period","moment","duration","era","epoch","age","century","generation","time","instant","era","interval"]),
    ("noun_abstract", "abstract_social", "Social and institutional concepts",
        ["societa","governo","legge","diritto","dovere","giustizia","democrazia"],
        ["society","government","law","right","duty","justice","democracy","institution","state","politics","authority"]),
    ("noun_abstract", "abstract_possession", "Ownership, value, economics",
        ["proprieta","ricchezza","debito","valore","prezzo","costo","guadagno"],
        ["property","wealth","debt","value","price","cost","gain","ownership","possession","asset","earning","income"]),

    # ---------- 2. adjective_quality → 10 ----------
    ("adjective_quality", "adj_evaluation", "Evaluation and opinion",
        ["buono","cattivo","bello","brutto","eccellente","terribile","perfetto"],
        ["good","bad","beautiful","ugly","excellent","terrible","perfect","great","awful","fine","poor","superb","dreadful"]),
    ("adjective_quality", "adj_physical", "Physical properties",
        ["duro","morbido","pesante","leggero","liscio","ruvido","bagnato","asciutto"],
        ["hard","soft","heavy","light","smooth","rough","wet","dry","dense","thick","thin","solid","liquid"]),
    ("adjective_quality", "adj_personality", "Character and personality",
        ["gentile","crudele","generoso","geloso","coraggioso","timido","onesto"],
        ["kind","cruel","generous","jealous","brave","shy","honest","dishonest","proud","humble","selfish"]),
    ("adjective_quality", "adj_emotional_state", "Emotional states",
        ["felice","triste","arrabbiato","spaventato","preoccupato","contento"],
        ["happy","sad","angry","scared","worried","content","glad","upset","furious","calm","nervous","anxious"]),
    ("adjective_quality", "adj_shape", "Shape and form",
        ["rotondo","quadrato","piatto","diritto","curvo","stretto","largo"],
        ["round","square","flat","straight","curved","narrow","wide","triangular","oval","circular","angular"]),
    ("adjective_quality", "adj_speed", "Speed and rate",
        ["veloce","lento","rapido","improvviso","graduale"],
        ["fast","slow","quick","rapid","sudden","gradual","swift","abrupt","hasty","speedy","instant"]),
    ("adjective_quality", "adj_difficulty", "Difficulty and complexity",
        ["facile","difficile","semplice","complicato","complesso","ovvio"],
        ["easy","difficult","hard","simple","complicated","complex","obvious","simple","tricky","tough","challenging"]),
    ("adjective_quality", "adj_material", "Material and composition",
        ["metallico","di legno","di cotone","di vetro","di plastica"],
        ["metallic","metal","wooden","wood","cotton","glass","plastic","stone","leather","silk","iron","steel"]),
    ("adjective_quality", "adj_relational", "Relational (social, national, institutional)",
        ["nazionale","sociale","professionale","culturale","politico","economico"],
        ["national","social","professional","cultural","political","economic","technical","legal","academic","industrial","commercial"]),
    ("adjective_quality", "adj_state", "State and condition",
        ["pieno","vuoto","libero","aperto","chiuso","disponibile","pronto"],
        ["full","empty","free","open","closed","shut","available","ready","occupied","idle","active"]),

    # ---------- 3. verb_action_general → 12 ----------
    ("verb_action_general", "verb_manipulation", "Handling and physical contact",
        ["prendere","mettere","toccare","spingere","tirare","tagliare","lanciare","aprire"],
        ["take","put","touch","push","pull","cut","throw","open","hold","grab","grip","press","lift","carry"]),
    ("verb_action_general", "verb_body", "Bodily actions and self-care",
        ["mangiare","bere","dormire","lavare","vestire","respirare","sedere"],
        ["eat","drink","sleep","wash","dress","breathe","sit","stand","walk","run","chew","swallow"]),
    ("verb_action_general", "verb_exchange", "Giving, taking, buying, selling",
        ["dare","ricevere","comprare","vendere","pagare","prestare","scambiare"],
        ["give","receive","buy","sell","pay","lend","exchange","trade","purchase","borrow","spend"]),
    ("verb_action_general", "verb_social", "Social and institutional acts",
        ["votare","sposare","insegnare","aiutare","governare","punire","invitare"],
        ["vote","marry","teach","help","govern","punish","invite","welcome","greet","serve","assist"]),
    ("verb_action_general", "verb_competition", "Competition and conflict",
        ["giocare","combattere","vincere","perdere","gareggiare","difendere","attaccare"],
        ["play","fight","win","lose","compete","defend","attack","battle","struggle","contest"]),
    ("verb_action_general", "verb_sound", "Making sounds",
        ["gridare","cantare","suonare","ridere","piangere","fischiare"],
        ["shout","sing","play","laugh","cry","whistle","yell","scream","hum","whisper","roar","sound"]),
    ("verb_action_general", "verb_tool_use", "Using tools and technology",
        ["usare","accendere","spegnere","guidare","collegare","stampare","scaricare"],
        ["use","turn on","turn off","drive","connect","print","download","operate","install","program"]),
    ("verb_action_general", "verb_cooking", "Food preparation",
        ["cucinare","friggere","bollire","cuocere","mescolare","impastare","condire"],
        ["cook","fry","boil","bake","mix","knead","season","stir","chop","peel","slice","roast"]),
    ("verb_action_general", "verb_cleaning", "Cleaning and maintenance",
        ["pulire","lavare","spazzare","riparare","ordinare","sistemare"],
        ["clean","wash","sweep","repair","tidy","fix","polish","dust","mop","scrub"]),
    ("verb_action_general", "verb_nature", "Natural processes",
        ["fiorire","germogliare","appassire","maturare","marcire","sbocciare"],
        ["bloom","sprout","wither","ripen","rot","blossom","grow","germinate","decay","hatch"]),
    ("verb_action_general", "verb_position", "Placing and spatial arrangement",
        ["appendere","appoggiare","infilare","avvolgere","spargere","allineare"],
        ["hang","lean","insert","wrap","spread","align","place","position","arrange","stack"]),
    ("verb_action_general", "verb_measure", "Measuring and comparing",
        ["misurare","contare","pesare","calcolare","valutare","confrontare"],
        ["measure","count","weigh","calculate","evaluate","compare","assess","estimate","quantify"]),

    # ---------- 4. people_general → 8 ----------
    ("people_general", "people_life_stage", "Life stages",
        ["neonato","bambino","ragazzo","adulto","anziano","adolescente","giovane"],
        ["newborn","baby","child","boy","girl","adult","elderly","teenager","young","infant","kid","senior"]),
    ("people_general", "people_relationship", "Friends, neighbours, acquaintances",
        ["amico","vicino","collega","fidanzato","conoscente","compagno"],
        ["friend","neighbour","neighbor","colleague","boyfriend","girlfriend","acquaintance","companion","partner","mate","pal"]),
    ("people_general", "people_group", "Groups and communities",
        ["famiglia","popolo","comunita","squadra","folla","pubblico","classe"],
        ["family","people","community","team","crowd","public","class","group","clan","tribe","society"]),
    ("people_general", "people_gender_identity", "Gender and identity terms",
        ["uomo","donna","maschio","femmina","signore","signora"],
        ["man","woman","male","female","sir","madam","gentleman","lady","boy","girl"]),
    ("people_general", "people_context_role", "Contextual roles",
        ["cliente","passeggero","candidato","utente","partecipante","spettatore"],
        ["customer","passenger","candidate","user","participant","spectator","viewer","client","guest","attendee"]),
    ("people_general", "people_moral_legal", "Moral and legal categories",
        ["criminale","vittima","eroe","testimone","colpevole","innocente"],
        ["criminal","victim","hero","witness","guilty","innocent","offender","suspect","defendant","accused"]),
    ("people_general", "people_status", "Social status and belonging",
        ["cittadino","straniero","ospite","residente","immigrato","rifugiato"],
        ["citizen","foreigner","guest","resident","immigrant","refugee","native","alien","expatriate"]),
    ("people_general", "people_abstract", "Abstract person-concepts",
        ["mente","anima","spirito","personalita","carattere"],
        ["mind","soul","spirit","personality","character","nature","being","self","psyche","conscience"]),

    # ---------- 5. communication → 6 ----------
    ("communication", "comm_greeting", "Greetings and courtesies",
        ["ciao","salve","buongiorno","arrivederci","grazie","prego","scusa"],
        ["hello","hi","goodbye","greeting","thanks","thank you","please","sorry","excuse","farewell","welcome"]),
    ("communication", "comm_language", "Language and speech",
        ["parola","lingua","frase","discorso","voce","accento","dialetto"],
        ["word","language","phrase","sentence","speech","voice","accent","dialect","tongue","syllable","utterance"]),
    ("communication", "comm_writing", "Writing and texts",
        ["lettera","libro","articolo","messaggio","testo","pagina","racconto"],
        ["letter","book","article","message","text","page","story","novel","essay","paragraph","chapter"]),
    ("communication", "comm_media", "Media and broadcasting",
        ["giornale","radio","televisione","internet","rete","canale","notizia"],
        ["newspaper","radio","television","tv","internet","network","channel","news","broadcast","media","press"]),
    ("communication", "comm_signalling", "Signals, signs, symbols",
        ["segno","segnale","simbolo","avviso","annuncio","cartello"],
        ["sign","signal","symbol","notice","announcement","poster","warning","alert","icon","emblem"]),
    ("communication", "comm_conversation", "Conversation and discussion",
        ["conversazione","dialogo","discussione","dibattito","riunione","conferenza"],
        ["conversation","dialogue","discussion","debate","meeting","conference","talk","chat","interview","argument"]),

    # ---------- 6. mental_state → 5 ----------
    ("mental_state", "mental_belief", "Belief and opinion",
        ["convinzione","fede","parere","opinione","certezza","dubbio"],
        ["belief","faith","opinion","view","certainty","doubt","conviction","trust","suspicion","confidence"]),
    ("mental_state", "mental_knowledge", "Knowledge and awareness",
        ["conoscenza","sapere","coscienza","consapevolezza","ignoranza"],
        ["knowledge","understanding","awareness","ignorance","learning","insight","comprehension","cognition"]),
    ("mental_state", "mental_intention", "Intention and purpose",
        ["intenzione","scopo","obiettivo","progetto","volonta","decisione"],
        ["intention","purpose","goal","aim","objective","plan","will","decision","target","intent"]),
    ("mental_state", "mental_memory", "Memory and imagination",
        ["memoria","ricordo","fantasia","immaginazione","sogno","illusione"],
        ["memory","recollection","fantasy","imagination","dream","illusion","souvenir","reminiscence","vision"]),
    ("mental_state", "mental_ability", "Ability and skill",
        ["abilita","capacita","talento","intelligenza","competenza"],
        ["ability","capacity","talent","intelligence","competence","skill","aptitude","proficiency","expertise"]),

    # ---------- 7. verb_communication → 5 ----------
    ("verb_communication", "vcomm_speaking", "Speaking and saying",
        ["dire","parlare","raccontare","spiegare","affermare","dichiarare"],
        ["say","speak","talk","tell","narrate","explain","state","declare","assert","utter","voice"]),
    ("verb_communication", "vcomm_asking", "Asking and requesting",
        ["chiedere","domandare","pregare","richiedere","supplicare"],
        ["ask","request","beg","implore","query","inquire","demand","petition","plead"]),
    ("verb_communication", "vcomm_answering", "Answering and responding",
        ["rispondere","ribattere","replicare","obiettare","negare"],
        ["answer","respond","reply","object","deny","retort","counter","refute","rebut"]),
    ("verb_communication", "vcomm_writing", "Writing and recording",
        ["scrivere","pubblicare","stampare","annotare","firmare","redigere"],
        ["write","publish","print","record","sign","draft","note","jot","transcribe","author"]),
    ("verb_communication", "vcomm_signalling", "Calling, warning, informing",
        ["chiamare","avvisare","avvertire","informare","annunciare","segnalare"],
        ["call","warn","inform","announce","signal","alert","notify","advise","summon"]),

    # ---------- 8. adverb_manner → 8 ----------
    ("adverb_manner", "adv_speed", "Speed and tempo",
        ["velocemente","lentamente","rapidamente","gradualmente"],
        ["quickly","slowly","rapidly","gradually","fast","slowly","swiftly","hastily","suddenly","gradually"]),
    ("adverb_manner", "adv_care", "Care and precision",
        ["attentamente","accuratamente"],
        ["carefully","attentively","accurately","precisely","meticulously","cautiously","thoroughly"]),
    ("adverb_manner", "adv_skill", "Skill and competence",
        ["bene","male","abilmente","perfettamente","goffamente"],
        ["well","badly","skilfully","skillfully","perfectly","clumsily","expertly","poorly","competently"]),
    ("adverb_manner", "adv_force", "Force and intensity",
        ["fortemente","debolmente","violentemente","delicatamente"],
        ["strongly","weakly","violently","gently","forcefully","softly","vigorously","harshly","firmly"]),
    ("adverb_manner", "adv_emotion", "Emotional attitude",
        ["felicemente","tristemente","rabbiosamente","volentieri","purtroppo"],
        ["happily","sadly","angrily","willingly","unfortunately","joyfully","reluctantly","gladly"]),
    ("adverb_manner", "adv_style", "Appearance and style",
        ["elegantemente","semplicemente","ordinatamente"],
        ["elegantly","simply","tidily","gracefully","stylishly","neatly","plainly","fashionably"]),
    ("adverb_manner", "adv_degree", "Degree and extent",
        ["completamente","parzialmente","abbastanza","molto","poco","quasi"],
        ["completely","partially","enough","very","little","almost","fully","partly","totally","barely","hardly"]),
    ("adverb_manner", "adv_stance", "Stance and evaluation",
        ["purtroppo","fortunatamente","francamente","ovviamente","sinceramente"],
        ["unfortunately","fortunately","frankly","obviously","sincerely","honestly","apparently","possibly","perhaps","clearly"]),

    # ---------- 9. shopping_money → 4 ----------
    ("shopping_money", "shop_finance", "Banking, finance, economics",
        ["banca","conto","debito","credito","investimento","assicurazione"],
        ["bank","account","debt","credit","investment","insurance","finance","economy","currency","loan","interest"]),
    ("shopping_money", "shop_venue", "Shops and markets",
        ["panetteria","macelleria","farmacia","mercato","supermercato"],
        ["bakery","butcher","pharmacy","market","supermarket","shop","store","boutique","mall","grocery","kiosk"]),
    ("shopping_money", "shop_transaction", "Buying, selling, pricing",
        ["prezzo","sconto","offerta","ricevuta","cambio","resto"],
        ["price","discount","offer","receipt","change","exchange","sale","purchase","payment","fee","tax"]),
    ("shopping_money", "shop_goods", "Products and merchandise",
        ["prodotto","merce","articolo","marca","modello","qualita"],
        ["product","goods","merchandise","article","brand","model","quality","commodity","item","stock"]),

    # ---------- 10. verb_change → 4 ----------
    ("verb_change", "vchange_growth", "Growth and increase",
        ["crescere","aumentare","espandere","allargare","gonfiare"],
        ["grow","increase","expand","enlarge","swell","widen","develop","rise","boost","augment"]),
    ("verb_change", "vchange_reduction", "Reduction and decrease",
        ["diminuire","ridurre","restringere","abbassare","accorciare"],
        ["decrease","reduce","shrink","lower","shorten","diminish","fall","drop","cut","narrow","minimise"]),
    ("verb_change", "vchange_transformation", "Transformation and conversion",
        ["cambiare","trasformare","diventare","convertire","modificare"],
        ["change","transform","become","convert","modify","alter","turn into","evolve","adapt","reshape"]),
    ("verb_change", "vchange_begin_end", "Beginning and ending",
        ["iniziare","cominciare","finire","terminare","smettere","interrompere"],
        ["begin","start","finish","end","stop","interrupt","cease","commence","conclude","terminate"]),

    # ---------- 11. emotions → 4 ----------
    ("emotions", "emotion_positive", "Positive emotions",
        ["gioia","felicita","amore","entusiasmo","gratitudine"],
        ["joy","happiness","love","enthusiasm","gratitude","delight","bliss","pleasure","affection","cheer"]),
    ("emotions", "emotion_negative", "Negative emotions",
        ["paura","rabbia","tristezza","ansia","vergogna"],
        ["fear","anger","sadness","anxiety","shame","dread","fury","grief","worry","guilt"]),
    ("emotions", "emotion_surprise", "Surprise and uncertainty",
        ["sorpresa","stupore","meraviglia","dubbio","incertezza"],
        ["surprise","astonishment","wonder","doubt","uncertainty","amazement","perplexity","hesitation"]),
    ("emotions", "emotion_desire", "Desire and motivation",
        ["desiderio","volonta","passione","ambizione","nostalgia"],
        ["desire","will","passion","ambition","nostalgia","longing","yearning","craving","motivation"]),

    # ---------- 12. time_general → 3 ----------
    ("time_general", "time_clock", "Clock and calendar time",
        ["ora","minuto","secondo","mezzogiorno","mezzanotte"],
        ["hour","minute","second","noon","midnight","o'clock","clock","calendar","date","day"]),
    ("time_general", "time_period", "Periods and durations",
        ["periodo","epoca","secolo","anno","mese","settimana"],
        ["period","epoch","century","year","month","week","era","decade","millennium","interval","duration"]),
    ("time_general", "time_relation", "Temporal relations",
        ["prima","dopo","durante","mentre","subito","finalmente"],
        ["before","after","during","while","immediately","finally","meanwhile","suddenly","previously","subsequently"]),

    # ---------- 13. verb_creation → 3 ----------
    ("verb_creation", "vcreate_making", "Making and building",
        ["fare","creare","costruire","produrre","fabbricare"],
        ["make","create","build","produce","manufacture","construct","fabricate","assemble","forge","erect"]),
    ("verb_creation", "vcreate_artistic", "Artistic creation",
        ["dipingere","disegnare","comporre","scrivere","scolpire"],
        ["paint","draw","compose","write","sculpt","illustrate","sketch","design","carve","engrave"]),
    ("verb_creation", "vcreate_planning", "Planning and designing",
        ["progettare","pianificare","organizzare","preparare","programmare"],
        ["plan","design","organise","organize","prepare","program","programme","schedule","arrange","devise"]),

    # ---------- 14. verb_possession → 3 ----------
    ("verb_possession", "vposs_owning", "Owning and having",
        ["avere","possedere","appartenere","detenere"],
        ["have","own","possess","belong","hold","keep","retain","carry"]),
    ("verb_possession", "vposs_giving", "Giving and transferring",
        ["dare","regalare","donare","consegnare","offrire"],
        ["give","gift","donate","deliver","offer","hand","present","bestow","grant","transfer"]),
    ("verb_possession", "vposs_taking", "Taking and acquiring",
        ["prendere","ottenere","guadagnare","raccogliere","ricevere"],
        ["take","obtain","earn","gather","receive","acquire","get","collect","seize","gain"]),
]


def build_re(patterns):
    """Word-boundary re over the whole pattern list. Case-insensitive."""
    escaped = [re.escape(p) for p in patterns]
    return re.compile(r"\b(" + "|".join(escaped) + r")\w*\b", re.I)


def main():
    with DATA.open() as f:
        entries = json.load(f)

    # Parent-theme groupings
    parent_sets = {}
    for parent, *_ in PROPOSALS:
        if parent not in parent_sets:
            parent_sets[parent] = [e for e in entries if parent in (e.get("themes") or [])]

    print(f"Parent set sizes:")
    for p, s in sorted(parent_sets.items(), key=lambda kv: -len(kv[1])):
        print(f"  {p:<30} {len(s):>5}")
    print()

    audit = {
        "generated": "2026-08-12",
        "source": "theme_subdivision_proposals_2026-08-06.md × vocabulary_it_frequency.json",
        "rule": "sayability + focus + measured membership per theme_axes v1/v2",
        "measurements": [],
    }

    print(f"{'parent':<24}{'subtheme':<32}{'label':<40}{'est':>5}{'total':>6}{'≤3k':>5}")
    print("-" * 120)
    for parent, sid, label, seeds, patterns in PROPOSALS:
        parent_set = parent_sets[parent]
        pat_re = build_re(patterns)
        hits = [e for e in parent_set if pat_re.search(e.get("translation_en") or "")]
        top3k = [e for e in hits if (e.get("rank") or 99999) <= 3000]
        top20_by_rank = sorted(hits, key=lambda x: x.get("rank") or 99999)[:20]

        # Also count seed-lemma hits directly
        seed_hits = [e for e in parent_set if e.get("lemma") in seeds]
        audit["measurements"].append({
            "parent": parent,
            "subtheme_id": sid,
            "label": label,
            "seed_count": len(seed_hits),
            "keyword_hits_total": len(hits),
            "keyword_hits_top3000": len(top3k),
            "top_20_by_rank": [{"rank": e.get("rank"), "lemma": e.get("lemma"), "gloss": e.get("translation_en")} for e in top20_by_rank],
        })
        print(f"{parent:<24}{sid:<32}{label[:37]:<40}{'?':>5}{len(hits):>6}{len(top3k):>5}")

    atomic_write_json(OUT, audit)
    print(f"\nWrote measurement: {OUT}")


if __name__ == "__main__":
    main()
