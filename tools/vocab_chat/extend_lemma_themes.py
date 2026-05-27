"""Extends the LEMMA_THEMES lookup table from apply_themes.py with another
~1000 common Italian content lemmas, covering themes that were under-developed
in the original (health, science, sports, arts, law, money, mental_state,
sensations) plus more depth in existing themes (body, food, home, transport,
people_roles, animals, plants).

Import L from here when running enrichment; this re-exports the original L
with the extensions merged in.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from apply_themes import L, POS_DEFAULTS  # noqa: F401


# ---------- HEALTH / MEDICINE ----------
n_health = [
    'medico', 'dottore', 'dottoressa', 'infermiere', 'infermiera', 'paziente',
    'malato', 'malattia', 'dolore', 'febbre', 'tosse', 'raffreddore', 'influenza',
    'allergia', 'infezione', 'virus', 'batterio', 'tumore', 'cancro', 'diabete',
    'ipertensione', 'pressione', 'iniezione', 'vaccino', 'vaccinazione', 'pillola',
    'pastiglia', 'compressa', 'antibiotico', 'antidolorifico', 'pomata',
    'medicina', 'medicamento', 'rimedio', 'cura', 'guarigione', 'sintomo',
    'diagnosi', 'visita', 'intervento', 'operazione', 'chirurgia', 'biopsia',
    'esame', 'radiografia', 'ecografia', 'analisi', 'sangue', 'urina',
    'ricetta', 'prescrizione', 'dentista', 'oculista', 'cardiologo', 'pediatra',
    'ginecologo', 'psicologo', 'psichiatra', 'psicoterapia', 'depressione',
    'ansia', 'stress', 'salute', 'benessere', 'igiene', 'dieta', 'allenamento',
    'ferita', 'cicatrice', 'frattura', 'distorsione', 'taglio', 'puntura',
    'gravidanza', 'parto', 'nascita', 'morte', 'decesso', 'infarto', 'ictus',
    'ricovero', 'ospedaliero', 'corsia', 'reparto', 'ambulatorio', 'clinica',
    'ospedale', 'ambulanza', 'barella',
]

# ---------- SCIENCE / TECHNOLOGY ----------
n_science_tech = [
    'computer', 'pc', 'laptop', 'portatile', 'tablet', 'smartphone', 'cellulare',
    'telefono', 'schermo', 'monitor', 'tastiera', 'mouse', 'stampante', 'cuffia',
    'altoparlante', 'microfono', 'webcam', 'cavo', 'caricabatterie', 'batteria',
    'pila', 'corrente', 'elettricità', 'energia', 'sito', 'pagina', 'browser',
    'motore', 'server', 'rete', 'connessione', 'router', 'modem', 'wifi',
    'password', 'account', 'utente', 'profilo', 'login', 'email', 'messaggio',
    'allegato', 'cartella', 'documento', 'foglio', 'software', 'programma',
    'applicazione', 'app', 'sistema', 'database', 'codice', 'algoritmo',
    'intelligenza', 'robot', 'macchina', 'automazione', 'digitale', 'analogico',
    'scienza', 'fisica', 'chimica', 'biologia', 'matematica', 'geometria',
    'algebra', 'aritmetica', 'statistica', 'ingegneria', 'meccanica', 'elettronica',
    'informatica', 'astronomia', 'geologia', 'meteorologia', 'ecologia', 'genetica',
    'esperimento', 'ricerca', 'studio', 'teoria', 'ipotesi', 'tesi', 'scoperta',
    'invenzione', 'innovazione', 'progresso', 'sviluppo', 'evoluzione',
    'atomo', 'molecola', 'cellula', 'gene', 'dna', 'rna', 'proteina', 'enzima',
    'elemento', 'composto', 'reazione', 'formula', 'equazione', 'misura',
    'unità', 'metro', 'chilometro', 'centimetro', 'millimetro', 'grammo',
    'chilogrammo', 'litro', 'temperatura', 'grado', 'celsius', 'fahrenheit',
    'velocità', 'accelerazione', 'forza', 'massa', 'peso', 'volume', 'densità',
    'pressione', 'energia', 'potenza', 'frequenza', 'lunghezza', 'larghezza',
    'altezza', 'profondità', 'distanza',
]

# ---------- SPORTS / LEISURE ----------
n_sports = [
    'sport', 'gioco', 'partita', 'squadra', 'giocatore', 'allenatore', 'arbitro',
    'tifoso', 'spettatore', 'campione', 'campionato', 'torneo', 'finale',
    'semifinale', 'qualificazione', 'eliminazione', 'vittoria', 'sconfitta',
    'pareggio', 'gol', 'punto', 'punteggio', 'set', 'tempo', 'minuto',
    'allenamento', 'palestra', 'stadio', 'campo', 'pista', 'piscina',
    'calcio', 'tennis', 'basket', 'pallacanestro', 'pallavolo', 'rugby',
    'baseball', 'golf', 'sci', 'snowboard', 'nuoto', 'ciclismo', 'corsa',
    'atletica', 'pugilato', 'boxe', 'judo', 'karate', 'ginnastica', 'yoga',
    'pilates', 'arrampicata', 'equitazione', 'vela', 'canottaggio', 'surf',
    'pesca', 'caccia', 'escursione', 'trekking', 'jogging', 'maratona',
    'olimpiade', 'medaglia', 'coppa', 'trofeo', 'premio', 'record',
    'vacanza', 'ferie', 'viaggio', 'gita', 'visita', 'turismo', 'turista',
    'hobby', 'passatempo', 'svago', 'divertimento', 'intrattenimento', 'festa',
    'compleanno', 'anniversario', 'matrimonio', 'pic-nic', 'barbecue',
]

# ---------- ARTS / ENTERTAINMENT ----------
n_arts = [
    'arte', 'musica', 'canzone', 'brano', 'pezzo', 'melodia', 'ritmo', 'nota',
    'accordo', 'scala', 'tono', 'voce', 'coro', 'orchestra', 'banda',
    'concerto', 'recital', 'esibizione', 'spettacolo', 'palcoscenico', 'palco',
    'sipario', 'pubblico', 'platea', 'galleria', 'biglietteria', 'cartellone',
    'film', 'pellicola', 'cinema', 'cinematografia', 'lungometraggio',
    'cortometraggio', 'documentario', 'commedia', 'tragedia', 'thriller',
    'giallo', 'horror', 'fantascienza', 'fantasy', 'western', 'animazione',
    'regista', 'sceneggiatore', 'produttore', 'attore', 'attrice', 'protagonista',
    'comparsa', 'doppiatore', 'cantante', 'musicista', 'compositore', 'direttore',
    'ballerino', 'ballerina', 'danzatore', 'coreografo',
    'pittore', 'scultore', 'fotografo', 'artista', 'pittura', 'scultura',
    'fotografia', 'disegno', 'schizzo', 'ritratto', 'paesaggio', 'natura morta',
    'tela', 'quadro', 'cornice', 'cavalletto', 'pennello', 'colore', 'tempera',
    'acquerello', 'olio', 'museo', 'galleria', 'mostra', 'esposizione', 'opera',
    'capolavoro', 'collezione',
    'libro', 'romanzo', 'racconto', 'novella', 'fiaba', 'favola', 'leggenda',
    'mito', 'biografia', 'autobiografia', 'saggio', 'manuale', 'dizionario',
    'enciclopedia', 'rivista', 'giornale', 'quotidiano', 'settimanale', 'mensile',
    'editore', 'redattore', 'scrittore', 'autore', 'poeta', 'poetessa',
    'critico', 'lettore', 'lettrice', 'capitolo', 'paragrafo', 'verso', 'rima',
    'strumento', 'pianoforte', 'chitarra', 'violino', 'violoncello',
    'flauto', 'tromba', 'tamburo', 'batteria', 'sintetizzatore',
    'danza', 'balletto', 'tango', 'valzer', 'salsa',
    'jazz', 'rock', 'pop', 'classica', 'opera', 'blues',
    'serie', 'telenovela', 'sceneggiata', 'puntata', 'episodio', 'stagione',
    'trama', 'colpo di scena', 'finale',
]

# ---------- LAW / JUSTICE ----------
n_law = [
    'legge', 'norma', 'regola', 'regolamento', 'codice', 'articolo', 'comma',
    'paragrafo', 'decreto', 'sentenza', 'ordinanza', 'mandato', 'verdetto',
    'giustizia', 'diritto', 'dovere', 'obbligo', 'contratto', 'accordo',
    'patto', 'trattato', 'convenzione', 'firma', 'clausola', 'commissione',
    'tribunale', 'corte', 'aula', 'udienza', 'processo', 'giudizio',
    'giudice', 'magistrato', 'avvocato', 'difensore', 'procuratore', 'pubblico ministero',
    'imputato', 'accusato', 'colpevole', 'innocente', 'sospetto', 'sospettato',
    'vittima', 'testimone', 'parte', 'querelante',
    'pena', 'condanna', 'sentenza', 'multa', 'sanzione', 'carcere', 'prigione',
    'arresto', 'fermo', 'custodia', 'cauzione', 'amnistia', 'grazia',
    'crimine', 'reato', 'illecito', 'omicidio', 'furto', 'rapina', 'scippo',
    'truffa', 'frode', 'corruzione', 'estorsione', 'rapimento', 'sequestro',
    'aggressione', 'violenza', 'molestia', 'discriminazione', 'razzismo',
    'mafia', 'criminalità', 'banda',
]

# ---------- SHOPPING / MONEY ----------
n_money = [
    'soldi', 'denaro', 'euro', 'centesimo', 'moneta', 'banconota', 'spiccioli',
    'banca', 'sportello', 'cassa', 'cassiere', 'conto', 'libretto', 'assegno',
    'bonifico', 'prelievo', 'versamento', 'deposito', 'bancomat', 'carta',
    'credito', 'prestito', 'mutuo', 'debito', 'interesse', 'rata', 'pagamento',
    'spesa', 'prezzo', 'costo', 'valore', 'tariffa', 'tassa', 'imposta',
    'IVA', 'sconto', 'offerta', 'saldo', 'vendita', 'acquisto', 'compravendita',
    'mercato', 'negozio', 'supermercato', 'ipermercato', 'discount', 'boutique',
    'centro commerciale', 'commerciante', 'venditore', 'commesso', 'commessa',
    'cliente', 'consumatore', 'fattura', 'ricevuta', 'scontrino', 'tagliando',
    'commercio', 'economia', 'finanza', 'investimento', 'risparmio', 'guadagno',
    'profitto', 'perdita', 'fallimento', 'bancarotta', 'ricchezza', 'povertà',
    'reddito', 'salario', 'stipendio', 'paga', 'busta paga', 'pensione',
    'sussidio', 'bonus', 'commissione', 'incentivo', 'rimborso',
]

# ---------- MENTAL STATE ----------
n_mental_state = [
    'pensiero', 'idea', 'opinione', 'convinzione', 'credenza', 'fede',
    'dubbio', 'certezza', 'sospetto', 'illusione', 'fantasia', 'immaginazione',
    'intelligenza', 'intuizione', 'genialità', 'stupidità', 'follia', 'pazzia',
    'demenza', 'lucidità', 'consapevolezza', 'coscienza', 'inconscio',
    'ricordo', 'memoria', 'dimenticanza', 'amnesia', 'reminiscenza',
    'sogno', 'incubo', 'fantasticheria', 'meditazione', 'concentrazione',
    'attenzione', 'distrazione', 'astrazione', 'riflessione', 'introspezione',
    'preoccupazione', 'tensione', 'angoscia', 'panico', 'fobia',
    'fiducia', 'sfiducia', 'autostima', 'insicurezza', 'sicurezza',
    'decisione', 'indecisione', 'scelta', 'dilemma', 'esitazione', 'rimpianto',
    'desiderio', 'voglia', 'curiosità', 'interesse', 'noia',
]

# ---------- EMOTIONS (expansion) ----------
n_emotions = [
    'rabbia', 'ira', 'furore', 'collera', 'irritazione', 'fastidio',
    'felicità', 'gioia', 'allegria', 'contentezza', 'soddisfazione',
    'infelicità', 'tristezza', 'malinconia', 'depressione', 'sconforto', 'dolore',
    'sofferenza', 'angoscia', 'disperazione', 'lutto',
    'paura', 'timore', 'spavento', 'terrore', 'orrore', 'apprensione',
    'gelosia', 'invidia', 'risentimento', 'rancore', 'odio',
    'vergogna', 'imbarazzo', 'pudore', 'colpa', 'rimorso',
    'orgoglio', 'vanità', 'arroganza', 'superbia', 'umiltà', 'modestia',
    'simpatia', 'antipatia', 'affetto', 'tenerezza', 'amore', 'passione',
    'innamoramento', 'attrazione', 'desiderio', 'lussuria',
    'entusiasmo', 'eccitazione', 'euforia', 'estasi', 'rapimento',
    'delusione', 'amarezza', 'sorpresa', 'stupore', 'meraviglia', 'shock',
    'commozione', 'nostalgia', 'rimpianto', 'rimorso', 'solitudine', 'isolamento',
    'amicizia', 'fraternità', 'cameratismo', 'complicità', 'intesa',
    'gratitudine', 'riconoscenza', 'apprezzamento', 'ammirazione',
    'compassione', 'pietà', 'misericordia', 'empatia',
    'speranza', 'fiducia', 'ottimismo', 'pessimismo', 'rassegnazione',
]

# ---------- SENSATIONS PHYSICAL ----------
n_sensations = [
    'fame', 'sete', 'sonno', 'sonnolenza', 'stanchezza', 'spossatezza',
    'freddo', 'caldo', 'calore', 'gelo', 'sudore', 'brividi', 'tremore',
    'dolore', 'male', 'fitta', 'puntura', 'prurito', 'formicolio', 'crampo',
    'vertigine', 'capogiro', 'mal di testa', 'nausea', 'malessere', 'svenimento',
    'piacere', 'godimento', 'orgasmo', 'soddisfazione', 'rilassamento',
    'tensione', 'irrigidimento', 'rigidità',
    'odore', 'profumo', 'puzza', 'aroma', 'gusto', 'sapore', 'retrogusto',
    'tocco', 'tatto', 'contatto', 'carezza', 'pizzicore', 'solletico',
    'rumore', 'suono', 'silenzio', 'eco', 'fruscio', 'fragore',
    'luce', 'buio', 'oscurità', 'penombra', 'bagliore', 'lampo',
]

# ---------- PEOPLE_ROLES (expansion) ----------
n_people_roles = [
    'ingegnere', 'architetto', 'scienziato', 'ricercatore', 'professore',
    'professoressa', 'insegnante', 'maestro', 'maestra', 'preside',
    'studente', 'studentessa', 'allievo', 'alunno', 'tirocinante', 'apprendista',
    'medico', 'dottore', 'chirurgo', 'infermiere', 'farmacista', 'veterinario',
    'dentista', 'psicologo', 'psichiatra', 'cardiologo', 'pediatra', 'oculista',
    'avvocato', 'giudice', 'magistrato', 'procuratore', 'notaio', 'commercialista',
    'meccanico', 'idraulico', 'elettricista', 'falegname', 'muratore', 'imbianchino',
    'sarto', 'sarta', 'parrucchiere', 'parrucchiera', 'barbiere', 'estetista',
    'cuoco', 'chef', 'pasticcere', 'fornaio', 'macellaio', 'fruttivendolo',
    'pescivendolo', 'salumiere', 'cameriere', 'cameriera', 'barista',
    'commerciante', 'venditore', 'commesso', 'cassiere', 'magazziniere',
    'autista', 'tassista', 'pilota', 'capitano', 'marinaio', 'macchinista',
    'ferroviere', 'controllore', 'bigliettaio',
    'agricoltore', 'contadino', 'pastore', 'allevatore', 'pescatore',
    'operaio', 'impiegato', 'manager', 'dirigente', 'direttore', 'amministratore',
    'segretario', 'segretaria', 'assistente', 'consulente', 'esperto',
    'giornalista', 'reporter', 'fotografo', 'scrittore', 'poeta', 'critico',
    'attore', 'attrice', 'cantante', 'musicista', 'ballerino', 'regista',
    'pittore', 'scultore',
    'poliziotto', 'carabiniere', 'vigile', 'pompiere', 'soldato', 'militare',
    'generale', 'colonnello', 'capitano', 'sergente',
    'prete', 'sacerdote', 'monaco', 'frate', 'suora', 'monaca', 'vescovo',
    'cardinale', 'papa',
    'presidente', 'ministro', 'sindaco', 'senatore', 'deputato', 'consigliere',
    'ambasciatore', 'console', 'diplomatico',
    'cliente', 'utente', 'consumatore', 'cittadino', 'abitante', 'residente',
    'turista', 'viaggiatore', 'visitatore', 'ospite', 'invitato',
]

# ---------- PEOPLE_FAMILY (expansion) ----------
n_people_family = [
    'genero', 'nuora', 'suocero', 'suocera', 'cognato', 'cognata',
    'parente', 'parentela', 'antenato', 'discendente', 'bisnonno', 'bisnonna',
    'pronipote', 'gemello', 'gemella', 'fratellastro', 'sorellastra',
    'patrigno', 'matrigna', 'figliastro', 'figliastra', 'orfano', 'orfana',
    'vedovo', 'vedova', 'compagno', 'compagna', 'partner', 'fidanzato',
    'fidanzata', 'sposo', 'sposa', 'coniuge', 'consorte', 'erede',
]

# ---------- FOOD_DRINK (expansion) ----------
n_food_drink = [
    'colazione', 'pranzo', 'cena', 'merenda', 'aperitivo', 'antipasto',
    'primo', 'secondo', 'contorno', 'dolce', 'dessert', 'piatto', 'portata',
    'pasta', 'spaghetti', 'penne', 'rigatoni', 'tagliatelle', 'lasagne',
    'gnocchi', 'risotto', 'minestra', 'zuppa', 'brodo', 'minestrone',
    'pizza', 'focaccia', 'panino', 'tramezzino', 'bruschetta',
    'pane', 'pagnotta', 'ciabatta', 'cornetto', 'brioche',
    'carne', 'manzo', 'vitello', 'maiale', 'agnello', 'pollo', 'tacchino',
    'coniglio', 'salsiccia', 'salame', 'prosciutto', 'mortadella', 'speck',
    'pesce', 'tonno', 'salmone', 'merluzzo', 'sgombro', 'sardina', 'acciuga',
    'gamberetto', 'gambero', 'aragosta', 'polpo', 'calamaro', 'seppia',
    'cozza', 'vongola', 'ostrica',
    'verdura', 'ortaggio', 'insalata', 'lattuga', 'rucola', 'spinaci',
    'pomodoro', 'cetriolo', 'carota', 'sedano', 'finocchio', 'cipolla',
    'aglio', 'peperone', 'zucchina', 'melanzana', 'patata', 'cavolo',
    'cavolfiore', 'broccolo', 'fagiolo', 'pisello', 'lenticchia', 'cece',
    'frutta', 'mela', 'pera', 'banana', 'arancia', 'mandarino', 'limone',
    'pompelmo', 'kiwi', 'ananas', 'mango', 'papaya', 'cocco',
    'uva', 'fragola', 'lampone', 'mirtillo', 'mora', 'ciliegia', 'amarena',
    'pesca', 'albicocca', 'prugna', 'fico', 'melone', 'anguria', 'cocomero',
    'oliva', 'noce', 'mandorla', 'nocciola', 'pistacchio', 'pinolo',
    'castagna', 'arachide',
    'formaggio', 'mozzarella', 'parmigiano', 'pecorino', 'ricotta',
    'gorgonzola', 'burro', 'panna', 'yogurt', 'latte', 'uovo',
    'olio', 'aceto', 'sale', 'pepe', 'zucchero', 'miele', 'farina',
    'basilico', 'prezzemolo', 'rosmarino', 'salvia', 'origano', 'menta',
    'peperoncino', 'noce moscata', 'cannella', 'zafferano',
    'caffè', 'cappuccino', 'caffellatte', 'macchiato', 'espresso', 'tè',
    'tisana', 'camomilla', 'cioccolato', 'cacao', 'acqua', 'minerale',
    'succo', 'spremuta', 'limonata', 'aranciata', 'bevanda', 'bibita',
    'vino', 'rosso', 'bianco', 'spumante', 'prosecco', 'birra', 'liquore',
    'grappa', 'amaro', 'whisky', 'rum', 'vodka', 'gin', 'cocktail',
    'gelato', 'sorbetto', 'granita', 'torta', 'crostata', 'tiramisù',
    'panna cotta', 'cannolo', 'biscotto', 'cioccolatino', 'caramella',
    'marmellata', 'confettura', 'crema', 'panettone', 'pandoro', 'colomba',
    'bicchiere', 'tazza', 'tazzina', 'piatto', 'piattino', 'scodella',
    'forchetta', 'coltello', 'cucchiaio', 'cucchiaino', 'tovagliolo',
    'tovaglia', 'bottiglia', 'caraffa', 'brocca', 'vassoio',
]

# ---------- HOME (expansion) ----------
n_home_extra = [
    'appartamento', 'attico', 'monolocale', 'bilocale', 'trilocale',
    'villa', 'villetta', 'casolare', 'baita', 'capanna',
    'soggiorno', 'salotto', 'salone', 'sala', 'studio', 'biblioteca',
    'cucina', 'sala da pranzo', 'cameretta', 'camera', 'bagno', 'toilette',
    'corridoio', 'ingresso', 'anticamera', 'ripostiglio', 'soffitta', 'cantina',
    'garage', 'box', 'cortile', 'giardino', 'orto', 'serra', 'terrazza',
    'balcone', 'veranda', 'portico', 'pergolato', 'piscina',
    'soffitto', 'pavimento', 'parete', 'muro', 'porta', 'portone', 'cancello',
    'finestra', 'vetro', 'persiana', 'tapparella', 'tenda', 'tendina',
    'mobile', 'arredamento', 'divano', 'poltrona', 'sgabello', 'panca',
    'tavolo', 'sedia', 'letto', 'lettino', 'culla', 'cuna',
    'armadio', 'guardaroba', 'cassettiera', 'cassettone', 'comodino',
    'scrivania', 'libreria', 'scaffale', 'mensola', 'vetrina',
    'specchio', 'quadro', 'orologio', 'lampada', 'lampadario', 'lampadina',
    'candela', 'caminetto', 'stufa', 'radiatore', 'termosifone',
    'frigorifero', 'frigo', 'congelatore', 'freezer', 'forno', 'microonde',
    'fornello', 'piastra', 'cappa', 'lavello', 'lavandino', 'rubinetto',
    'doccia', 'vasca', 'water', 'bidet', 'asciugamano', 'accappatoio',
    'tappeto', 'moquette', 'parquet', 'piastrella', 'mattonella',
    'lenzuolo', 'federa', 'coperta', 'piumone', 'cuscino', 'materasso',
    'lavatrice', 'asciugatrice', 'lavastoviglie', 'aspirapolvere', 'scopa',
    'paletta', 'spazzolone', 'straccio', 'secchio',
]

# ---------- TRANSPORT (expansion) ----------
n_transport_extra = [
    'automobile', 'auto', 'macchina', 'utilitaria', 'berlina', 'SUV',
    'furgone', 'camion', 'camioncino', 'autocarro', 'rimorchio',
    'autobus', 'pullman', 'tram', 'filobus', 'metropolitana', 'metro',
    'treno', 'rapido', 'regionale', 'intercity', 'frecciarossa', 'eurostar',
    'aereo', 'aeroplano', 'elicottero', 'jet', 'aeroporto', 'aerostazione',
    'nave', 'traghetto', 'piroscafo', 'yacht', 'barca', 'gommone', 'canoa',
    'kayak', 'gondola', 'porto', 'molo', 'banchina',
    'bicicletta', 'bici', 'motocicletta', 'moto', 'scooter', 'motorino',
    'monopattino', 'skateboard',
    'taxi', 'navetta', 'limousine',
    'volante', 'sterzo', 'pedale', 'freno', 'frizione', 'cambio', 'marcia',
    'motore', 'ruota', 'pneumatico', 'gomma', 'cerchione', 'targa', 'specchietto',
    'paraurti', 'cofano', 'portiera', 'finestrino', 'sedile', 'cintura',
    'volante', 'cruscotto', 'tergicristallo', 'faro', 'fanale', 'lampeggiante',
    'serbatoio', 'benzina', 'gasolio', 'diesel', 'cherosene', 'olio',
    'parcheggio', 'sosta', 'parcometro',
    'autostrada', 'superstrada', 'tangenziale', 'circonvallazione',
    'strada', 'via', 'viale', 'corso', 'vicolo', 'sentiero', 'mulattiera',
    'incrocio', 'rotonda', 'semaforo', 'segnale', 'cartello',
    'biglietto', 'abbonamento', 'patente', 'libretto', 'bollo', 'assicurazione',
    'multa', 'contravvenzione', 'parcheggio',
    'viaggio', 'tragitto', 'percorso', 'itinerario', 'destinazione',
    'partenza', 'arrivo', 'fermata', 'capolinea', 'stazione', 'binario',
    'banchina', 'biglietteria',
    'passeggero', 'pedone', 'ciclista', 'automobilista', 'motociclista',
]

# ---------- ANIMALS (expansion) ----------
n_animals_extra = [
    'gallo', 'gallina', 'pulcino', 'oca', 'anatra', 'tacchino', 'piccione',
    'colomba', 'tortora', 'passerotto', 'rondine', 'cinciallegra', 'fringuello',
    'merlo', 'corvo', 'gazza', 'falco', 'aquila', 'gufo', 'civetta', 'allocco',
    'pavone', 'fagiano', 'pernice', 'quaglia', 'gabbiano', 'cigno', 'fenicottero',
    'struzzo', 'pinguino', 'pappagallo', 'canarino',
    'mucca', 'vacca', 'toro', 'vitello', 'manzo', 'bue',
    'pecora', 'agnello', 'montone', 'capra', 'capretto', 'caprone',
    'maiale', 'porco', 'cinghiale', 'scrofa', 'porcellino',
    'cavallo', 'puledro', 'cavalla', 'asino', 'mulo', 'zebra',
    'cane', 'cucciolo', 'cagnolino', 'mastino', 'levriero', 'pastore',
    'gatto', 'gattino', 'micio', 'gatta', 'felino',
    'topo', 'ratto', 'criceto', 'scoiattolo', 'ghiro', 'castoro',
    'lepre', 'coniglio', 'volpe', 'lupo', 'orso', 'lince', 'puma',
    'leone', 'tigre', 'leopardo', 'giaguaro', 'gepardo',
    'elefante', 'rinoceronte', 'ippopotamo', 'giraffa', 'cammello', 'dromedario',
    'scimmia', 'gorilla', 'scimpanzé', 'orangutan', 'babbuino',
    'koala', 'panda', 'canguro', 'opossum',
    'foca', 'tricheco', 'balena', 'capodoglio', 'delfino', 'orca',
    'squalo', 'tonno', 'pesce spada', 'merluzzo', 'sgombro', 'salmone',
    'trota', 'carpa', 'persico', 'luccio', 'anguilla', 'sardina', 'acciuga',
    'polpo', 'calamaro', 'seppia', 'aragosta', 'gambero', 'granchio',
    'cozza', 'vongola', 'ostrica', 'lumaca', 'chiocciola',
    'rana', 'rospo', 'salamandra', 'tritone', 'lucertola', 'serpente',
    'biscia', 'vipera', 'cobra', 'pitone', 'coccodrillo', 'alligatore',
    'tartaruga',
    'insetto', 'farfalla', 'falena', 'ape', 'vespa', 'calabrone', 'bombo',
    'mosca', 'moscerino', 'zanzara', 'tafano', 'pulce', 'pidocchio',
    'cimice', 'scarafaggio', 'cavalletta', 'grillo', 'libellula',
    'formica', 'termite', 'ragno', 'scorpione', 'verme', 'lombrico',
]

# ---------- PLANTS ----------
n_plants = [
    'pianta', 'albero', 'arbusto', 'cespuglio', 'siepe',
    'foglia', 'fiore', 'petalo', 'gambo', 'stelo', 'ramo', 'rametto',
    'tronco', 'radice', 'corteccia', 'germoglio', 'gemma',
    'frutto', 'seme', 'pinolo', 'nocciolo',
    'rosa', 'tulipano', 'margherita', 'girasole', 'papavero', 'orchidea',
    'giglio', 'narciso', 'gelsomino', 'viola', 'mughetto', 'ciclamino',
    'garofano', 'gardenia', 'magnolia', 'lillà',
    'quercia', 'pino', 'abete', 'cipresso', 'cedro', 'larice', 'castagno',
    'faggio', 'olmo', 'ontano', 'frassino', 'platano', 'salice', 'pioppo',
    'betulla', 'tiglio', 'acero', 'eucalipto', 'baobab',
    'olivo', 'ulivo', 'vite', 'vigna', 'frutteto', 'pesco', 'melo', 'pero',
    'ciliegio', 'fico', 'limone', 'arancio', 'mandarino', 'mandorlo',
    'erba', 'prato', 'pratino', 'aiuola', 'cespuglio',
    'muschio', 'lichene', 'fungo', 'tartufo',
    'cactus', 'palma', 'bambù', 'felce',
]

# ---------- WEATHER (expansion) ----------
n_weather = [
    'sole', 'luce', 'raggio', 'caldo', 'afa', 'siccità',
    'pioggia', 'acquazzone', 'temporale', 'tempesta', 'uragano', 'tifone',
    'tornado', 'tromba d\'aria', 'fulmine', 'tuono', 'lampo',
    'neve', 'nevicata', 'gelo', 'ghiaccio', 'brina', 'rugiada',
    'grandine', 'grandinata',
    'vento', 'brezza', 'tramontana', 'maestrale', 'scirocco', 'libeccio',
    'nuvola', 'nube', 'cielo', 'nebbia', 'foschia',
    'umidità', 'pressione',
]

# ---------- CITY_PLACES (expansion) ----------
n_city_places = [
    'piazza', 'piazzale', 'rotonda', 'incrocio', 'angolo',
    'strada', 'via', 'viale', 'corso', 'vicolo', 'marciapiede',
    'fontana', 'monumento', 'statua', 'busto', 'targa',
    'edificio', 'palazzo', 'condominio', 'casa', 'grattacielo', 'torre',
    'cattedrale', 'duomo', 'chiesa', 'cappella', 'basilica', 'santuario',
    'moschea', 'sinagoga', 'tempio',
    'castello', 'rocca', 'fortezza', 'cittadella', 'mura', 'cinta',
    'museo', 'pinacoteca', 'galleria', 'biblioteca', 'archivio',
    'università', 'scuola', 'asilo', 'liceo', 'istituto', 'collegio',
    'ospedale', 'clinica', 'ambulatorio', 'farmacia', 'consultorio',
    'tribunale', 'questura', 'commissariato', 'caserma', 'prigione', 'carcere',
    'comune', 'municipio', 'prefettura', 'parlamento', 'senato',
    'ministero', 'ambasciata', 'consolato',
    'banca', 'posta', 'ufficio',
    'negozio', 'bottega', 'boutique', 'panetteria', 'pasticceria',
    'macelleria', 'gastronomia', 'salumeria', 'pescheria', 'fruttivendolo',
    'edicola', 'cartoleria', 'libreria', 'tabaccheria', 'profumeria',
    'mercato', 'fiera', 'supermercato', 'ipermercato', 'centro commerciale',
    'ristorante', 'trattoria', 'osteria', 'pizzeria', 'rosticceria',
    'tavola calda', 'bar', 'caffè', 'enoteca', 'pub', 'discoteca', 'locale',
    'cinema', 'teatro', 'opera', 'auditorium', 'arena', 'stadio',
    'palasport', 'piscina', 'palestra', 'campo sportivo',
    'parco', 'giardino', 'villa', 'orto botanico', 'zoo', 'acquario',
    'spiaggia', 'lungomare', 'porto',
    'stazione', 'fermata', 'capolinea', 'aeroporto',
    'parcheggio', 'autorimessa', 'distributore', 'benzinaio', 'autostazione',
    'mercatino', 'fiera', 'sagra',
    'periferia', 'centro', 'quartiere', 'rione', 'zona', 'sobborgo',
    'paese', 'borgo', 'villaggio', 'frazione', 'capoluogo',
]

# ---------- WORK_BUSINESS (expansion) ----------
n_work_business = [
    'lavoro', 'occupazione', 'mestiere', 'professione', 'incarico', 'impiego',
    'ufficio', 'sede', 'reparto', 'dipartimento', 'sezione', 'settore',
    'azienda', 'ditta', 'società', 'impresa', 'industria', 'fabbrica',
    'stabilimento', 'officina', 'laboratorio', 'studio', 'agenzia', 'compagnia',
    'multinazionale', 'startup',
    'direttore', 'dirigente', 'manager', 'amministratore', 'capo', 'responsabile',
    'capoufficio', 'caporeparto',
    'dipendente', 'impiegato', 'operaio', 'collega', 'collaboratore', 'socio',
    'partner', 'fornitore', 'cliente', 'fornitura',
    'colloquio', 'curriculum', 'cv', 'candidatura', 'assunzione', 'licenziamento',
    'dimissioni', 'pensionamento', 'promozione', 'carriera',
    'mansione', 'compito', 'incarico', 'progetto', 'commessa',
    'riunione', 'meeting', 'conferenza', 'convegno', 'seminario', 'corso',
    'formazione', 'aggiornamento', 'tirocinio', 'stage',
    'contratto', 'accordo', 'busta paga', 'stipendio', 'salario', 'paga',
    'orario', 'turno', 'straordinario', 'ferie', 'permesso', 'congedo',
    'malattia', 'mutua', 'sciopero', 'sindacato',
    'produttività', 'efficienza', 'qualità', 'controllo', 'verifica',
    'risultato', 'obiettivo', 'meta', 'traguardo', 'scadenza', 'consegna',
    'documento', 'pratica', 'fascicolo', 'cartella', 'archivio',
    'fattura', 'preventivo', 'bilancio', 'budget', 'rendiconto',
]

# ---------- POLITICS_SOCIETY (expansion) ----------
n_politics_society = [
    'governo', 'parlamento', 'senato', 'camera', 'consiglio',
    'presidente', 'primo ministro', 'premier', 'ministro', 'viceministro',
    'sottosegretario', 'sindaco', 'consigliere', 'assessore',
    'senatore', 'deputato', 'parlamentare', 'onorevole',
    'partito', 'coalizione', 'maggioranza', 'opposizione', 'destra', 'sinistra',
    'centro', 'liberale', 'conservatore', 'progressista', 'socialista', 'comunista',
    'fascista', 'nazionalista', 'populista', 'verde', 'ecologista',
    'elezione', 'voto', 'votazione', 'referendum', 'sondaggio', 'candidato',
    'candidatura', 'campagna', 'urna', 'scheda', 'seggio', 'circoscrizione',
    'riforma', 'legge', 'decreto', 'disegno', 'emendamento', 'norma',
    'costituzione', 'statuto', 'codice', 'regolamento',
    'democrazia', 'repubblica', 'monarchia', 'dittatura', 'oligarchia',
    'cittadino', 'cittadinanza', 'nazione', 'patria', 'stato', 'paese',
    'regione', 'provincia', 'comune', 'frazione', 'quartiere',
    'guerra', 'conflitto', 'pace', 'tregua', 'cessate il fuoco', 'armistizio',
    'esercito', 'marina', 'aeronautica', 'truppa', 'reparto', 'battaglione',
    'soldato', 'militare', 'caporale', 'sergente', 'capitano', 'generale',
    'arma', 'fucile', 'pistola', 'spada', 'mitra', 'cannone', 'bomba', 'missile',
    'libertà', 'uguaglianza', 'giustizia', 'fraternità', 'diritto', 'dovere',
    'comunità', 'società', 'popolo', 'massa', 'folla', 'gente',
    'razza', 'etnia', 'religione', 'fede', 'credo', 'culto',
    'cultura', 'tradizione', 'usanza', 'costume', 'rito', 'cerimonia',
    'associazione', 'organizzazione', 'fondazione', 'onlus', 'sindacato',
    'corteo', 'manifestazione', 'protesta', 'sciopero', 'rivolta', 'rivoluzione',
    'crisi', 'recessione', 'ripresa', 'sviluppo', 'progresso', 'innovazione',
    'globalizzazione', 'migrazione', 'immigrazione', 'emigrazione',
    'migrante', 'immigrato', 'profugo', 'rifugiato', 'esule',
    'razzismo', 'discriminazione', 'tolleranza', 'integrazione', 'inclusione',
]

# ---------- TIME (expansion) ----------
n_time_general = [
    'attimo', 'istante', 'momento', 'frazione', 'secondo', 'minuto', 'quarto',
    'ora', 'mezz\'ora', 'giornata', 'notte', 'mattina', 'mattinata',
    'pomeriggio', 'sera', 'serata', 'crepuscolo', 'alba', 'tramonto',
    'mezzogiorno', 'mezzanotte',
    'settimana', 'weekend', 'fine settimana', 'mese', 'mensile', 'trimestre',
    'semestre', 'anno', 'annata', 'decennio', 'ventennio', 'secolo', 'millennio',
    'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica',
    'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
    'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
    'primavera', 'estate', 'autunno', 'inverno',
    'oggi', 'ieri', 'domani', 'dopodomani', 'ieri l\'altro',
    'epoca', 'era', 'periodo', 'fase', 'tappa', 'stagione',
    'origine', 'inizio', 'principio', 'partenza', 'avvio',
    'fine', 'termine', 'conclusione', 'finale',
    'durata', 'lasso', 'intervallo', 'pausa', 'sospensione',
    'frequenza', 'ricorrenza', 'cadenza', 'ritmo', 'velocità',
    'passato', 'presente', 'futuro', 'storia', 'tempo',
    'calendario', 'orario', 'agenda', 'data', 'scadenza',
]

# ---------- COLOURS ----------
n_colours = [
    'colore', 'tinta', 'sfumatura', 'tonalità',
    'rosso', 'arancione', 'arancio', 'giallo', 'verde', 'azzurro', 'blu',
    'viola', 'lilla', 'rosa', 'fucsia', 'magenta', 'porpora',
    'nero', 'bianco', 'grigio', 'argento', 'oro', 'dorato', 'argentato',
    'marrone', 'beige', 'crema', 'avorio', 'bronzo', 'rame',
    'turchese', 'celeste', 'indaco', 'cobalto', 'navy',
    'scarlatto', 'cremisi', 'amaranto', 'corallo', 'salmone',
]

# ---------- COMMUNICATION (expansion) ----------
n_communication = [
    'lingua', 'linguaggio', 'idioma', 'dialetto', 'accento', 'pronuncia',
    'parola', 'vocabolo', 'termine', 'espressione', 'frase', 'proposizione',
    'periodo', 'paragrafo', 'capoverso', 'testo', 'discorso',
    'lettera', 'sillaba', 'consonante', 'vocale', 'fonema',
    'sostantivo', 'aggettivo', 'verbo', 'avverbio', 'pronome', 'preposizione',
    'congiunzione', 'articolo', 'interiezione',
    'grammatica', 'sintassi', 'morfologia', 'fonologia', 'fonetica', 'ortografia',
    'punteggiatura', 'virgola', 'punto', 'punto e virgola', 'due punti',
    'apostrofo', 'accento', 'parentesi', 'trattino',
    'conversazione', 'dialogo', 'colloquio', 'chiacchierata', 'discussione',
    'dibattito', 'argomento', 'tema', 'soggetto', 'oggetto', 'tema',
    'racconto', 'narrazione', 'descrizione', 'spiegazione', 'definizione',
    'domanda', 'risposta', 'replica', 'commento', 'osservazione',
    'critica', 'opinione', 'parere', 'giudizio', 'valutazione',
    'annuncio', 'avviso', 'comunicato', 'notizia', 'informazione', 'messaggio',
    'lettera', 'cartolina', 'biglietto', 'invito', 'auguri',
    'email', 'sms', 'chat', 'messaggio', 'whatsapp', 'telegramma',
    'telefonata', 'chiamata', 'videochiamata',
    'firma', 'autografo', 'sigla', 'timbro',
    'silenzio', 'rumore', 'voce', 'sussurro', 'grido', 'urlo',
    'gesto', 'cenno', 'segnale', 'mimica', 'pantomima', 'espressione',
]

# ---------- SCHOOL EDUCATION (expansion) ----------
n_school = [
    'scuola', 'asilo', 'elementare', 'media', 'liceo', 'università', 'master',
    'dottorato', 'istituto', 'collegio', 'accademia', 'corso', 'classe', 'aula',
    'laboratorio', 'palestra', 'mensa', 'biblioteca',
    'studente', 'studentessa', 'alunno', 'allievo', 'compagno', 'amico',
    'professore', 'professoressa', 'insegnante', 'maestro', 'docente', 'preside',
    'rettore', 'ricercatore', 'assistente', 'tutor',
    'lezione', 'ora', 'orario', 'spiegazione', 'ripasso', 'verifica',
    'interrogazione', 'esame', 'prova', 'test', 'compito', 'esercizio',
    'tesi', 'tesina', 'elaborato', 'ricerca', 'progetto',
    'voto', 'valutazione', 'pagella', 'giudizio', 'media', 'promozione',
    'bocciatura', 'rinvio',
    'materia', 'disciplina', 'argomento', 'capitolo', 'unità', 'modulo',
    'italiano', 'matematica', 'storia', 'geografia', 'scienze', 'fisica',
    'chimica', 'biologia', 'arte', 'musica', 'religione', 'educazione',
    'ginnastica', 'filosofia', 'latino', 'greco', 'inglese', 'francese',
    'tedesco', 'spagnolo',
    'libro', 'manuale', 'quaderno', 'astuccio', 'penna', 'matita', 'gomma',
    'temperino', 'righello', 'squadra', 'compasso', 'pennarello', 'evidenziatore',
    'zaino', 'cartella', 'diario', 'agenda', 'lavagna', 'cattedra', 'banco',
    'computer', 'tablet', 'proiettore',
    'diploma', 'laurea', 'specializzazione', 'dottorato', 'borsa di studio',
    'tassa', 'iscrizione', 'matricola', 'libretto',
    'compito', 'esercizio', 'esercitazione', 'studio', 'ripasso', 'preparazione',
    'apprendimento', 'memorizzazione',
]


# Apply each category to L. Use setdefault so we don't clobber pre-existing themes.
def _apply(lemmas, theme):
    for w in lemmas:
        existing = L.get(w, [])
        if theme not in existing:
            L[w] = existing + [theme]


_apply(n_health, 'health_medicine')
_apply(n_science_tech, 'science_technology')
_apply(n_sports, 'sports_leisure')
_apply(n_arts, 'arts_entertainment')
_apply(n_law, 'law_justice')
_apply(n_money, 'shopping_money')
_apply(n_mental_state, 'mental_state')
_apply(n_emotions, 'emotions')
_apply(n_sensations, 'sensations_physical')
_apply(n_people_roles, 'people_roles')
_apply(n_people_family, 'people_family')
_apply(n_food_drink, 'food_drink')
_apply(n_home_extra, 'home')
_apply(n_transport_extra, 'transport')
_apply(n_animals_extra, 'animals')
_apply(n_plants, 'plants')
_apply(n_weather, 'weather')
_apply(n_city_places, 'city_places')
_apply(n_work_business, 'work_business')
_apply(n_politics_society, 'politics_society')
_apply(n_time_general, 'time_general')
_apply(n_colours, 'colours')
_apply(n_communication, 'communication')
_apply(n_school, 'school_education')


if __name__ == '__main__':
    print(f'Extended L now has {len(L)} entries.')
    # Sample a few to verify
    samples = ['ospedale', 'computer', 'pizza', 'tribunale', 'banca', 'rabbia', 'fame',
               'ingegnere', 'gallo', 'rosa', 'pioggia', 'piazza', 'azzurro']
    for s in samples:
        print(f'  {s}: {L.get(s, "(not set)")}')
