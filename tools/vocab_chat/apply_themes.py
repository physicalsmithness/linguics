"""Assign themes to all currently-untagged curated entries.

Strategy: lemma-specific overrides (large lookup dict) → POS-based defaults.
Anything that doesn't match either gets left untagged; the script prints a list.
"""
import json
from pathlib import Path

CURATED = Path('/sessions/sleepy-wizardly-bohr/mnt/Language Learning/data/vocabulary_it_frequency.json')

# Lemma → themes overrides
L = {}

# Function-word pronouns and determiners
for lemma in ['io','tu','lui','lei','noi','voi','loro','mi','ti','ci','vi','si','lo','la','le','li','gli','ne','me','te','se']:
    L[lemma] = ['function_word', 'pronoun_personal']
for lemma in ['questo','quello','codesto','ciò']:
    L[lemma] = ['function_word', 'pronoun_demonstrative', 'determiner_demonstrative']
for lemma in ['mio','tuo','suo','nostro','vostro','proprio']:
    L[lemma] = ['function_word', 'pronoun_possessive', 'determiner_possessive']
for lemma in ['ogni','qualche','alcuno','qualunque','qualsiasi','nessuno','parecchio','certo','tale','altro','tutto','stesso']:
    L[lemma] = ['function_word', 'determiner_indefinite', 'quantifier']
for lemma in ['qualcuno','qualcosa','niente','nulla','ognuno','altrui']:
    L[lemma] = ['function_word', 'pronoun_indefinite']
for lemma in ['chi','quale','quanto']:
    L[lemma] = ['function_word', 'pronoun_interrogative']
for lemma in ['cui','quale']:
    L[lemma] = ['function_word', 'pronoun_relative']
L['che'] = ['function_word', 'pronoun_relative', 'pronoun_interrogative', 'conjunction']

# Auxiliaries / modals
L['essere'] = ['auxiliary_verb', 'verb_state', 'verb_existence']
L['avere'] = ['auxiliary_verb', 'verb_possession']
L['potere'] = ['modal_verb']
L['dovere'] = ['modal_verb']
L['volere'] = ['modal_verb', 'verb_emotion']

# Verb categories
verb_movement = ['andare','venire','tornare','arrivare','partire','uscire','entrare','salire','scendere','correre','camminare','viaggiare','passare','attraversare','raggiungere','avvicinarsi','allontanarsi','muoversi','spostare','spostarsi','girare','tornare','ritornare','volare','nuotare','saltare','cadere']
verb_communication = ['dire','parlare','raccontare','chiedere','rispondere','scrivere','leggere','chiamare','gridare','comunicare','spiegare','dichiarare','confessare','mostrare','presentare','rivelare','esprimere','discutere','litigare','ringraziare','scusare','salutare','rispondere','sussurrare','annunciare']
verb_perception = ['vedere','guardare','sentire','ascoltare','osservare','notare','sentirsi']
verb_cognition = ['sapere','conoscere','pensare','credere','capire','ricordare','dimenticare','considerare','riflettere','immaginare','supporre','riconoscere','sognare','contare','imparare','insegnare','studiare','trovare','cercare','determinare','concentrare']
verb_emotion = ['amare','odiare','sperare','temere','preoccuparsi','piacere','dispiacere','soffrire','perdonare','divertirsi','innamorarsi','arrabbiarsi','annoiarsi','sorprendere','desiderare','provare','rispettare']
verb_state = ['stare','vivere','esistere','rimanere','restare','durare','sembrare','parere','valere','funzionare','riguardare','dipendere','comportarsi','contenere','consistere','servire']
verb_inverted_subject = ['piacere','dispiacere','mancare','importare','sembrare','servire']
verb_action_general = ['fare','dare','prendere','mettere','portare','lasciare','trovare','cercare','aprire','chiudere','scoprire','coprire','nascondere','perdere','tenere','ottenere','conservare','tagliare','eliminare','decidere','accettare','rifiutare','scegliere','togliere','raccogliere','accogliere','includere','escludere','evitare','ignorare','dividere','condividere','aggiungere','usare','aiutare','ricevere','inviare','ordinare','pagare','comprare','vendere','dare','salvare','proteggere','difendere','battere','toccare','baciare','abbracciare','tirare','spingere','buttare','rompere','riempire','riparare','riguardare','arrivare','registrare','fotografare','disegnare','dipingere','cambiare','provare','assaggiare','gustare']
verb_routine = ['lavarsi','vestirsi','svegliarsi','addormentarsi','lavare','pettinarsi','spogliarsi','pulire','stirare','cambiarsi','vestire','asciugare','mangiare','bere','dormire','cucinare','preparare','riposare']
verb_change = ['cambiare','diventare','trasformare','migliorare','peggiorare','aumentare','diminuire','crescere','ridurre','sviluppare','sviluppare']
verb_creation = ['creare','costruire','produrre','comporre','dipingere','disegnare','fondare','ballare','suonare','cantare','cucire','legare','piegare']
verb_destruction = ['distruggere','uccidere','rompere','eliminare','sopprimere']
verb_existence = ['nascere','morire','esistere','vivere','apparire','sparire','scomparire','succedere','accadere']
verb_possession = ['avere','possedere','tenere','ottenere','ricevere','dare','prendere']
verb_speech_act = ['promettere','ammettere','garantire','giurare','ordinare','comandare','vietare','permettere','suggerire','consigliare','proporre','dichiarare','confessare','rifiutare','negare']
verb_weather = ['piovere','nevicare','grandinare','tuonare','lampeggiare']

for v in verb_movement: L.setdefault(v, []).append('verb_movement')
for v in verb_communication: L.setdefault(v, []).append('verb_communication')
for v in verb_perception: L.setdefault(v, []).append('verb_perception')
for v in verb_cognition: L.setdefault(v, []).append('verb_cognition')
for v in verb_emotion: L.setdefault(v, []).append('verb_emotion')
for v in verb_state: L.setdefault(v, []).append('verb_state')
for v in verb_inverted_subject: L.setdefault(v, []).append('verb_inverted_subject')
for v in verb_action_general: L.setdefault(v, []).append('verb_action_general')
for v in verb_routine: L.setdefault(v, []).append('verb_routine')
for v in verb_change: L.setdefault(v, []).append('verb_change')
for v in verb_creation: L.setdefault(v, []).append('verb_creation')
for v in verb_destruction: L.setdefault(v, []).append('verb_destruction')
for v in verb_existence: L.setdefault(v, []).append('verb_existence')
for v in verb_possession: L.setdefault(v, []).append('verb_possession')
for v in verb_speech_act: L.setdefault(v, []).append('verb_speech_act')
for v in verb_weather: L.setdefault(v, []).append('verb_weather')

# Adjective categories
adj_size = ['grande','piccolo','lungo','corto','alto','basso','largo','stretto','profondo','ampio']
adj_evaluation = ['buono','cattivo','bello','brutto','importante','vero','falso','ovvio','evidente','possibile','impossibile','necessario','utile','inutile','raro','comune','speciale','unico','normale','strano','perfetto','assoluto','essenziale','fondamentale','principale','secondario','primo','ultimo','migliore','peggiore','tipico','vario','recente','attuale','presente','futuro','passato','seguente','precedente','successivo','intero','mezzo']
adj_quality = ['forte','debole','duro','morbido','leggero','pesante','semplice','complicato','facile','difficile','ricco','povero','pulito','sporco','pieno','vuoto','aperto','chiuso','comodo','scomodo','elegante','sportivo','magro','grasso','nudo','asciutto','bagnato','secco','umido','dolce','salato','amaro','piccante','crudo','cotto','fresco','maturo','saporito','squisito','chiaro','scuro','sereno','coperto','soleggiato','nuvoloso','ventoso','piovoso','sbagliato','giusto','libero','occupato','veloce','lento','felice','triste','contento','stanco','gentile','simpatico','antipatico','famoso','celebre','probabile','capace','completo','perfetto','attento','pronto','ricco','diretto','preciso','specifico','logico','astratto','concreto','santo']
adj_nationality = ['italiano','inglese','francese','tedesco','spagnolo','americano','russo','cinese','giapponese','arabo','straniero','europeo','africano','asiatico']
adj_temperature = ['caldo','freddo']
adj_distance = ['vicino','lontano']
adj_age = ['nuovo','vecchio','giovane','antico','moderno']

for a in adj_size: L.setdefault(a, []).append('adjective_size')
for a in adj_evaluation: L.setdefault(a, []).append('adjective_evaluation')
for a in adj_quality: L.setdefault(a, []).append('adjective_quality')
for a in adj_nationality: L.setdefault(a, []).append('adjective_nationality')
for a in adj_temperature: L.setdefault(a, []).append('adjective_temperature')
for a in adj_distance: L.setdefault(a, []).append('adjective_distance')
for a in adj_age: L.setdefault(a, []).append('adjective_age')

# Adverb categories
adv_time = ['ora','adesso','oggi','ieri','domani','sempre','mai','già','ancora','presto','tardi','subito','prima','dopo','allora','poi','spesso','raramente','infine','quando','intanto','frattempo','attualmente','recentemente','finalmente','ormai','tuttora']
adv_place = ['qui','qua','lì','là','sopra','sotto','davanti','dietro','dentro','fuori','vicino','lontano','accanto','intorno','altrove','ovunque','dovunque','indietro','avanti','giù']
adv_manner = ['bene','male','così','come','meglio','peggio','piano','forte','insieme','solo','davvero','veramente','certamente','probabilmente','ovviamente','naturalmente','evidentemente','comunque','invece','magari','anzi','infatti','addirittura','praticamente','effettivamente','generalmente','normalmente','soprattutto','specialmente','particolarmente','semplicemente','soltanto','piuttosto','volentieri']
adv_quantity = ['molto','poco','troppo','tanto','abbastanza','più','meno','quasi','circa','almeno','assai','parecchio']
adv_affirmation = ['sì','certo']
adv_negation = ['non','mai','neppure','neanche','nemmeno']

for a in adv_time: L.setdefault(a, []).append('adverb_time')
for a in adv_place: L.setdefault(a, []).append('adverb_place')
for a in adv_manner: L.setdefault(a, []).append('adverb_manner')
for a in adv_quantity: L.setdefault(a, []).append('adverb_quantity')
for a in adv_affirmation: L.setdefault(a, []).append('adverb_affirmation')
for a in adv_negation: L.setdefault(a, []).append('adverb_negation')

# Noun semantic categories (only the obvious ones — leave the rest unthemed)
n_body = ['mano','occhio','testa','cuore','corpo','piede','gamba','braccio','viso','bocca','voce','capelli','capello','faccia','naso','orecchio','dente','labbro','collo','gola','spalla','schiena','petto','pancia','stomaco','polmone','sangue','pelle','osso','muscolo','cervello','dito','unghia','ginocchio','caviglia','gomito','polso','guancia','fronte','ciglio','sopracciglio','mento','tallone']
n_home = ['casa','camera','cucina','bagno','letto','tavolo','sedia','finestra','porta','divano','poltrona','armadio','scrivania','libreria','scaffale','cassetto','cuscino','coperta','lenzuolo','tappeto','tenda','frigorifero','forno','rubinetto','doccia','vasca','pavimento','soffitto','muro','parete','scala','ascensore','corridoio','soggiorno','salotto','sala','balcone','terrazza','giardino','cantina','ingresso','chiave','lampada','lampadina','candela','mobile','specchio','pettine','spazzola']
n_family = ['madre','padre','figlio','figlia','fratello','sorella','famiglia','bambino','mamma','papà','nonno','nonna','zio','zia','cugino','nipote','marito','moglie','genitore']
n_food = ['vino','birra','latte','tè','succo','bevanda','cibo','colazione','pranzo','cena','merenda','antipasto','pasta','pizza','riso','panino','carne','pesce','pollo','maiale','manzo','prosciutto','salame','uovo','formaggio','burro','olio','aceto','sale','pepe','zucchero','frutta','mela','pera','banana','arancia','limone','fragola','uva','ciliegia','verdura','pomodoro','patata','cipolla','aglio','carota','insalata','zucchina','gelato','torta','biscotto','cioccolato','marmellata','zuppa','minestra','bicchiere','bottiglia','piatto','forchetta','coltello','cucchiaio','tovagliolo','tazza']
n_clothing = ['vestito','abito','camicia','maglietta','maglione','felpa','pantaloni','jeans','gonna','giacca','cappotto','giubbotto','impermeabile','cappello','scarpa','stivale','sandalo','calza','calzino','guanto','sciarpa','cravatta','cintura','occhiali','borsa','zaino','valigia','portafoglio','orologio','anello','collana','orecchino','bracciale','gioiello','tasca','bottone','cerniera','moda','tessuto','lana','cotone','seta','cuoio','stile']
n_transport = ['bicicletta','moto','motorino','autobus','metropolitana','tram','taxi','nave','barca','camion','motore','ruota','treno','aereo','viaggio','macchina']
n_nature = ['mare','montagna','collina','fiume','lago','spiaggia','fuoco','luce','ombra','sole','luna','cielo','terra','aria','pioggia','neve','vento','nuvola','nebbia','temporale','fulmine','tuono','grandine','ghiaccio','pianta','fiore','erba','foglia','frutto','seme','bosco','foresta','prato','campo','albero','isola','isola','natura']
n_animals = ['animale','cane','gatto','cavallo','mucca','pecora','uccello','topo','coniglio','ape','mosca','zanzara','serpente','lupo','orso','leone','tigre','elefante']
n_time = ['anno','giorno','mese','settimana','ora','momento','volta','minuto','secondo','tempo','attimo','periodo','fase','data','epoca']
n_emotions = ['amore','paura','speranza','tristezza','gioia','coraggio','rispetto','peccato']
n_communication = ['parola','frase','nome','lettera','discorso','discussione','domanda','risposta','consiglio']
n_school = ['scuola','studente','classe','lezione','libro','esame','voto','compito','esercizio','professore','dottore']
n_work = ['lavoro','ufficio','azienda','denaro','soldi','prezzo','conto']
n_city = ['città','via','strada','piazza','paese','negozio','ristorante','mercato','supermercato','chiesa','ospedale','stazione','museo','teatro','cinema','panetteria','macelleria','aeroporto','porto']
n_politics = ['governo','presidente','legge','stato','popolo','politica','nazione','partito','guerra','pace','polizia','esercito','libertà','comunità','associazione','organizzazione','popolazione','cittadino']

for n in n_body: L.setdefault(n, []).append('body')
for n in n_home: L.setdefault(n, []).append('home')
for n in n_family: L.setdefault(n, []).append('people_family')
for n in n_food: L.setdefault(n, []).append('food_drink')
for n in n_clothing: L.setdefault(n, []).append('clothing')
for n in n_transport: L.setdefault(n, []).append('transport')
for n in n_nature: L.setdefault(n, []).append('nature')
for n in n_animals: L.setdefault(n, []).append('animals')
for n in n_time: L.setdefault(n, []).append('time_general')
for n in n_emotions: L.setdefault(n, []).append('emotions')
for n in n_communication: L.setdefault(n, []).append('communication')
for n in n_school: L.setdefault(n, []).append('school_education')
for n in n_work: L.setdefault(n, []).append('work_business')
for n in n_city: L.setdefault(n, []).append('city_places')
for n in n_politics: L.setdefault(n, []).append('politics_society')

POS_DEFAULTS = {
    'article': ['function_word'],
    'preposition': ['function_word', 'preposition'],
    'conjunction': ['function_word', 'conjunction'],
    'interjection': ['interjection'],
    'numeral': ['numbers_cardinal'],
}


def main():
    with CURATED.open(encoding='utf-8') as f:
        data = json.load(f)

    tagged = 0
    skipped = []
    for e in data:
        if e.get('themes'):
            continue
        lemma = e['lemma']
        pos = e['pos']
        themes = []
        if lemma in L:
            themes = list(dict.fromkeys(L[lemma]))  # dedupe preserving order
        elif pos in POS_DEFAULTS:
            themes = POS_DEFAULTS[pos]
        elif pos == 'verb':
            themes = ['verb_action_general']
        elif pos == 'adjective':
            themes = ['adjective_quality']
        elif pos == 'adverb':
            themes = ['adverb_manner']
        elif pos == 'noun':
            themes = ['noun_abstract']

        if themes:
            e['themes'] = themes
            tagged += 1
        else:
            skipped.append((lemma, pos))

    with CURATED.open('w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'Tagged {tagged} previously-untagged entries')
    if skipped:
        print(f'Could not tag {len(skipped)}:')
        for lemma, pos in skipped:
            print(f'  {lemma} ({pos})')
    # Final coverage
    final_tagged = sum(1 for e in data if e.get('themes'))
    print(f'\nFinal coverage: {final_tagged} / {len(data)} entries have themes')


if __name__ == '__main__':
    main()
