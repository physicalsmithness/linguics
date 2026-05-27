"""LEMMA_THEMES extended with sub-theme partitioning for the biggest categories.

Builds on extend_lemma_themes.py: for food_drink, animals, science_technology,
arts_entertainment, lemmas are partitioned into sub-themes. Each lemma is
tagged with BOTH the parent theme and the sub-theme, so consumers can query
'show me food vocabulary' by checking for 'food_drink' membership without
walking the hierarchy.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from extend_lemma_themes import L, POS_DEFAULTS  # noqa: F401


def _apply(lemmas, theme):
    """Append theme to L[lemma] unless already present."""
    for w in lemmas:
        existing = L.get(w, [])
        if theme not in existing:
            L[w] = existing + [theme]


def _apply_with_parent(lemmas, parent_theme, sub_theme):
    """Append BOTH the parent theme and the sub-theme to each lemma."""
    for w in lemmas:
        existing = L.get(w, [])
        new = list(existing)
        if parent_theme not in new:
            new.append(parent_theme)
        if sub_theme not in new:
            new.append(sub_theme)
        L[w] = new


# ==================== FOOD_DRINK sub-themes ====================

food_fruit = [
    'frutta', 'mela', 'pera', 'banana', 'arancia', 'mandarino', 'limone',
    'pompelmo', 'kiwi', 'ananas', 'mango', 'papaya', 'cocco', 'uva',
    'fragola', 'lampone', 'mirtillo', 'mora', 'ciliegia', 'amarena',
    'pesca', 'albicocca', 'prugna', 'fico', 'melone', 'anguria', 'cocomero',
    'oliva', 'noce', 'mandorla', 'nocciola', 'pistacchio', 'pinolo',
    'castagna', 'arachide',
]

food_vegetable = [
    'verdura', 'ortaggio', 'insalata', 'lattuga', 'rucola', 'spinaci',
    'pomodoro', 'cetriolo', 'carota', 'sedano', 'finocchio', 'cipolla',
    'aglio', 'peperone', 'zucchina', 'melanzana', 'patata', 'cavolo',
    'cavolfiore', 'broccolo', 'fagiolo', 'pisello', 'lenticchia', 'cece',
    'asparago', 'carciofo', 'rapa', 'porro', 'ravanello', 'barbabietola',
    'zucca',
]

food_meat_fish = [
    'carne', 'manzo', 'vitello', 'maiale', 'agnello', 'pollo', 'tacchino',
    'coniglio', 'salsiccia', 'salame', 'prosciutto', 'mortadella', 'speck',
    'bistecca', 'cotoletta', 'fettina',
    'pesce', 'tonno', 'salmone', 'merluzzo', 'sgombro', 'sardina', 'acciuga',
    'trota', 'pesce spada', 'orata', 'branzino', 'cernia', 'sogliola',
    'gamberetto', 'gambero', 'aragosta', 'polpo', 'calamaro', 'seppia',
    'cozza', 'vongola', 'ostrica',
]

food_dairy = [
    'latte', 'formaggio', 'mozzarella', 'parmigiano', 'pecorino', 'ricotta',
    'gorgonzola', 'stracchino', 'taleggio', 'fontina', 'provolone', 'caciotta',
    'burro', 'panna', 'yogurt', 'uovo',
]

food_grain_pasta = [
    'pasta', 'spaghetti', 'penne', 'rigatoni', 'tagliatelle', 'lasagne',
    'fettuccine', 'tortellini', 'ravioli', 'gnocchi', 'risotto', 'riso',
    'pane', 'pagnotta', 'ciabatta', 'baguette', 'rosetta', 'panino',
    'tramezzino', 'bruschetta', 'pizza', 'focaccia', 'piadina', 'crackers',
    'farina', 'cereali', 'orzo', 'avena', 'mais', 'grano', 'frumento',
    'segale', 'crusca',
]

food_sweet = [
    'dolce', 'dessert', 'gelato', 'sorbetto', 'granita', 'torta', 'crostata',
    'tiramisù', 'tirami', 'panna cotta', 'cannolo', 'biscotto', 'cioccolato',
    'cioccolatino', 'caramella', 'caramellata', 'lecca-lecca', 'gomma',
    'marmellata', 'confettura', 'crema', 'budino', 'mousse', 'panettone',
    'pandoro', 'colomba', 'cornetto', 'brioche', 'krapfen', 'frittella',
    'zeppola', 'sfogliatella', 'pasticcino', 'pasta',  # 'pasta' duplicates with grain; included once via setdefault
    'miele', 'zucchero', 'zucchero a velo', 'cacao',
]

food_herb_spice = [
    'basilico', 'prezzemolo', 'rosmarino', 'salvia', 'origano', 'menta',
    'timo', 'alloro', 'erba cipollina', 'maggiorana',
    'peperoncino', 'pepe', 'sale', 'noce moscata', 'cannella', 'chiodo di garofano',
    'zafferano', 'curcuma', 'curry', 'paprika', 'cumino',
    'olio', 'aceto', 'balsamico', 'mostarda', 'maionese', 'ketchup',
    'salsa', 'sugo', 'condimento', 'pesto',
]

food_meal_type = [
    'colazione', 'pranzo', 'cena', 'merenda', 'spuntino', 'aperitivo',
    'antipasto', 'primo', 'secondo', 'contorno', 'portata', 'piatto',
    'menu', 'pasto', 'buffet',
    'zuppa', 'minestra', 'minestrone', 'brodo', 'crema',
]

drink_alcoholic = [
    'vino', 'rosso', 'bianco', 'rosato', 'spumante', 'prosecco', 'champagne',
    'frizzante', 'birra', 'sidro',
    'liquore', 'grappa', 'amaro', 'whisky', 'rum', 'vodka', 'gin', 'tequila',
    'sambuca', 'limoncello', 'cognac', 'brandy',
    'cocktail', 'aperitivo', 'spritz', 'negroni',
]

drink_nonalcoholic = [
    'acqua', 'minerale', 'gassata', 'naturale',
    'succo', 'spremuta', 'limonata', 'aranciata', 'cedrata', 'gassosa',
    'bibita', 'bevanda', 'soft drink',
    'caffè', 'cappuccino', 'caffellatte', 'macchiato', 'espresso', 'corretto',
    'tè', 'tisana', 'camomilla', 'infuso',
    'cioccolata', 'frullato', 'frappè',
]

food_utensil = [
    'bicchiere', 'calice', 'flute', 'boccale',
    'tazza', 'tazzina', 'mug',
    'piatto', 'piattino', 'scodella', 'ciotola', 'fondina',
    'forchetta', 'coltello', 'cucchiaio', 'cucchiaino', 'paletta',
    'mestolo', 'mestola',
    'tovagliolo', 'tovaglia', 'sottobicchiere',
    'bottiglia', 'caraffa', 'brocca', 'decanter', 'thermos',
    'vassoio', 'sottopiatto',
    'pentola', 'padella', 'casseruola', 'tegame', 'wok', 'griglia',
    'grattugia', 'colino', 'colapasta', 'mattarello', 'tagliere',
    'frullatore', 'sbattitore', 'tritatutto',
]

for lemmas, sub in [
    (food_fruit, 'food_fruit'),
    (food_vegetable, 'food_vegetable'),
    (food_meat_fish, 'food_meat_fish'),
    (food_dairy, 'food_dairy'),
    (food_grain_pasta, 'food_grain_pasta'),
    (food_sweet, 'food_sweet'),
    (food_herb_spice, 'food_herb_spice'),
    (food_meal_type, 'food_meal_type'),
    (drink_alcoholic, 'drink_alcoholic'),
    (drink_nonalcoholic, 'drink_nonalcoholic'),
    (food_utensil, 'food_utensil'),
]:
    _apply_with_parent(lemmas, 'food_drink', sub)


# ==================== ANIMALS sub-themes ====================

animals_pet = [
    'cane', 'cucciolo', 'cagnolino', 'gatto', 'gattino', 'micio', 'gatta',
    'criceto', 'porcellino d\'india', 'cavia',
    'pesce rosso', 'pesciolino',
    'canarino', 'pappagallo', 'parrocchetto', 'cocorito',
    'tartaruga d\'acqua', 'tartaruga di terra',
    'coniglio', 'coniglietto',
    'furetto', 'iguana',
]

animals_farm = [
    'mucca', 'vacca', 'toro', 'vitello', 'manzo', 'bue',
    'pecora', 'agnello', 'montone', 'capra', 'capretto', 'caprone',
    'maiale', 'porco', 'scrofa', 'porcellino', 'cinghiale',
    'cavallo', 'puledro', 'cavalla', 'stallone', 'giumenta', 'asino',
    'mulo', 'somaro',
    'gallo', 'gallina', 'pulcino', 'pollo', 'tacchino',
    'oca', 'anatra', 'paperino', 'paperetta',
    'pavone', 'fagiano',
    'lama', 'alpaca',
]

animals_wild_mammal = [
    'lupo', 'volpe', 'orso', 'lince', 'puma', 'ghepardo',
    'leone', 'tigre', 'leopardo', 'giaguaro', 'gepardo',
    'elefante', 'rinoceronte', 'ippopotamo', 'giraffa',
    'cammello', 'dromedario',
    'scimmia', 'gorilla', 'scimpanzé', 'orangutan', 'babbuino', 'macaco',
    'koala', 'panda', 'canguro', 'opossum', 'wombat',
    'zebra', 'antilope', 'gnu', 'bisonte', 'cervo', 'daino', 'capriolo',
    'alce', 'renna',
    'lepre', 'scoiattolo', 'ghiro', 'castoro', 'lontra',
    'ratto', 'topo', 'riccio', 'talpa', 'pipistrello',
    'donnola', 'puzzola', 'tasso', 'martora', 'ermellino', 'visone',
    'foca', 'tricheco', 'leone marino', 'morsa',
]

animals_bird = [
    'uccello', 'volatile',
    'passerotto', 'passero', 'rondine', 'cinciallegra', 'fringuello',
    'merlo', 'usignolo', 'tordo', 'capinera',
    'corvo', 'cornacchia', 'gazza', 'ghiandaia',
    'falco', 'aquila', 'avvoltoio', 'nibbio', 'poiana',
    'gufo', 'civetta', 'allocco', 'barbagianni',
    'fenicottero', 'airone', 'gru', 'ibis', 'cicogna',
    'gabbiano', 'cigno', 'germano', 'edredone',
    'struzzo', 'emù', 'casuario', 'kiwi',
    'pinguino', 'fregata', 'pellicano',
    'piccione', 'colomba', 'tortora',
    'pernice', 'quaglia', 'beccaccia',
]

animals_sea_creature = [
    'pesce', 'tonno', 'salmone', 'merluzzo', 'sgombro', 'sardina', 'acciuga',
    'trota', 'carpa', 'persico', 'luccio', 'anguilla', 'pesce spada',
    'orata', 'branzino', 'cernia', 'sogliola', 'sgombro', 'sarago',
    'balena', 'capodoglio', 'delfino', 'orca', 'narvalo', 'belluga',
    'squalo', 'manta', 'razza',
    'polpo', 'piovra', 'calamaro', 'seppia',
    'aragosta', 'astice', 'gambero', 'granchio', 'cernia',
    'cozza', 'vongola', 'ostrica', 'capesanta', 'tellina',
    'lumaca', 'chiocciola',
    'stella marina', 'riccio di mare', 'medusa', 'corallo',
    'plancton', 'krill',
]

animals_reptile_amphibian = [
    'rana', 'rospo', 'raganella', 'salamandra', 'tritone', 'girino',
    'lucertola', 'geco', 'iguana', 'camaleonte', 'varano',
    'serpente', 'biscia', 'vipera', 'cobra', 'pitone', 'boa', 'mamba',
    'coccodrillo', 'alligatore', 'caimano',
    'tartaruga', 'testuggine',
]

animals_insect = [
    'insetto', 'farfalla', 'falena', 'bruco',
    'ape', 'vespa', 'calabrone', 'bombo',
    'mosca', 'moscerino', 'zanzara', 'tafano', 'culicide',
    'pulce', 'pidocchio', 'zecca', 'acaro',
    'cimice', 'scarafaggio', 'blatta',
    'cavalletta', 'grillo', 'mantide',
    'libellula', 'effimera',
    'formica', 'termite',
    'ragno', 'tarantola', 'scorpione',
    'verme', 'lombrico', 'sanguisuga',
    'lumaca', 'chiocciola',  # already in sea_creature, but also land snails
    'centopiedi', 'millepiedi',
]

for lemmas, sub in [
    (animals_pet, 'animals_pet'),
    (animals_farm, 'animals_farm'),
    (animals_wild_mammal, 'animals_wild_mammal'),
    (animals_bird, 'animals_bird'),
    (animals_sea_creature, 'animals_sea_creature'),
    (animals_reptile_amphibian, 'animals_reptile_amphibian'),
    (animals_insect, 'animals_insect'),
]:
    _apply_with_parent(lemmas, 'animals', sub)


# ==================== SCIENCE_TECHNOLOGY sub-themes ====================

tech_computing = [
    'computer', 'pc', 'laptop', 'portatile', 'tablet', 'smartphone',
    'cellulare', 'telefono', 'schermo', 'monitor', 'display',
    'tastiera', 'mouse', 'touchpad', 'stampante', 'scanner',
    'cuffia', 'auricolare', 'altoparlante', 'casse', 'microfono', 'webcam',
    'cavo', 'usb', 'caricabatterie', 'batteria', 'pila',
    'sito', 'pagina', 'browser', 'motore di ricerca', 'link',
    'server', 'rete', 'connessione', 'wifi', 'bluetooth', 'router', 'modem',
    'password', 'pin', 'account', 'utente', 'profilo', 'login', 'logout',
    'email', 'messaggio', 'allegato', 'spam', 'newsletter',
    'cartella', 'documento', 'file', 'icona', 'finestra', 'menu',
    'software', 'programma', 'applicazione', 'app', 'plugin', 'estensione',
    'sistema', 'database', 'codice', 'algoritmo', 'cookie',
    'intelligenza artificiale', 'robot', 'automazione', 'digitale',
    'analogico', 'binario', 'bit', 'byte', 'gigabyte', 'megabyte',
    'hardware', 'processore', 'memoria', 'ram', 'disco', 'ssd',
    'virus informatico', 'antivirus', 'hacker', 'cybersecurity',
    'internet', 'web', 'cloud', 'streaming', 'download', 'upload',
]

science_physics = [
    'fisica', 'meccanica', 'termodinamica', 'ottica', 'acustica',
    'elettromagnetismo', 'gravità', 'inerzia',
    'forza', 'velocità', 'accelerazione', 'momento', 'quantità di moto',
    'energia', 'lavoro', 'potenza', 'frequenza', 'lunghezza d\'onda',
    'massa', 'peso', 'densità', 'pressione', 'volume', 'temperatura',
    'calore', 'attrito', 'tensione', 'corrente', 'voltaggio', 'resistenza',
    'particella', 'protone', 'neutrone', 'elettrone', 'fotone', 'quark',
    'nucleo', 'orbita', 'campo', 'onda', 'vibrazione', 'risonanza',
    'magnete', 'magnetismo', 'gravitazione', 'radiazione', 'spettro',
]

science_chemistry = [
    'chimica', 'biochimica', 'farmacologia',
    'atomo', 'molecola', 'elemento', 'composto', 'sostanza', 'soluzione',
    'reazione', 'sintesi', 'ossidazione', 'riduzione', 'catalisi',
    'acido', 'base', 'sale', 'ph', 'solubilità',
    'formula', 'equazione chimica', 'tavola periodica',
    'idrogeno', 'ossigeno', 'azoto', 'carbonio', 'ferro', 'oro', 'argento',
    'rame', 'piombo', 'mercurio', 'sodio', 'cloro',
]

science_biology = [
    'biologia', 'zoologia', 'botanica', 'microbiologia', 'genetica',
    'ecologia', 'fisiologia', 'anatomia',
    'cellula', 'tessuto', 'organo', 'organismo',
    'gene', 'dna', 'rna', 'cromosoma', 'mutazione', 'evoluzione', 'specie',
    'proteina', 'enzima', 'ormone', 'amminoacido', 'lipide', 'carboidrato',
    'batterio', 'virus', 'parassita', 'fungo', 'alga',
    'metabolismo', 'respirazione', 'fotosintesi', 'mitosi', 'meiosi',
    'predatore', 'preda', 'habitat', 'biodiversità', 'estinzione',
]

science_math = [
    'matematica', 'aritmetica', 'algebra', 'geometria', 'trigonometria',
    'analisi', 'calcolo', 'statistica', 'probabilità',
    'numero', 'cifra', 'somma', 'differenza', 'prodotto', 'quoziente',
    'frazione', 'decimale', 'percentuale',
    'addizione', 'sottrazione', 'moltiplicazione', 'divisione',
    'equazione', 'formula', 'funzione', 'derivata', 'integrale',
    'angolo', 'lato', 'triangolo', 'quadrato', 'cerchio', 'rettangolo',
    'cubo', 'sfera', 'cilindro', 'cono', 'piramide',
    'perimetro', 'area', 'superficie', 'volume', 'raggio', 'diametro',
    'circonferenza', 'lunghezza', 'larghezza', 'altezza',
    'media', 'mediana', 'moda', 'varianza',
]

science_astronomy = [
    'astronomia', 'astrofisica', 'cosmologia', 'astrologia',
    'geologia', 'geografia', 'meteorologia', 'oceanografia',
    'universo', 'cosmo', 'galassia', 'via lattea', 'stella', 'sole',
    'pianeta', 'satellite', 'luna', 'asteroide', 'cometa', 'meteora',
    'meteorite', 'costellazione', 'nebulosa', 'buco nero', 'pulsar',
    'orbita', 'rotazione', 'rivoluzione', 'eclissi',
    'mercurio', 'venere', 'terra', 'marte', 'giove', 'saturno', 'urano',
    'nettuno', 'plutone',
    'placca tettonica', 'terremoto', 'eruzione', 'vulcano', 'lava',
    'magma', 'crosta', 'mantello', 'fossile',
]

science_general = [
    'scienza', 'ricerca', 'studio', 'esperimento', 'osservazione',
    'teoria', 'ipotesi', 'tesi', 'legge', 'principio',
    'scoperta', 'invenzione', 'innovazione', 'progresso', 'sviluppo',
    'metodo', 'sperimentazione', 'verifica', 'prova', 'conferma',
    'scienziato', 'ricercatore', 'studioso', 'accademico', 'laboratorio',
    'pubblicazione', 'articolo scientifico', 'rivista scientifica',
]

for lemmas, sub in [
    (tech_computing, 'tech_computing'),
    (science_physics, 'science_physics'),
    (science_chemistry, 'science_chemistry'),
    (science_biology, 'science_biology'),
    (science_math, 'science_math'),
    (science_astronomy, 'science_astronomy'),
    (science_general, 'science_general'),
]:
    _apply_with_parent(lemmas, 'science_technology', sub)


# ==================== ARTS_ENTERTAINMENT sub-themes ====================

arts_music = [
    'musica', 'canzone', 'brano', 'pezzo', 'composizione', 'sinfonia',
    'concerto', 'recital', 'sonata', 'aria', 'duetto', 'corale',
    'melodia', 'armonia', 'ritmo', 'battuta', 'tempo musicale',
    'nota', 'accordo', 'tonalità', 'scala musicale', 'intervallo',
    'partitura', 'spartito',
    'voce', 'coro', 'orchestra', 'banda', 'gruppo', 'ensemble',
    'cantante', 'tenore', 'soprano', 'basso', 'baritono',
    'musicista', 'compositore', 'direttore', 'maestro', 'solista',
    'strumento', 'pianoforte', 'piano', 'chitarra', 'basso elettrico',
    'violino', 'violoncello', 'contrabbasso', 'arpa',
    'flauto', 'tromba', 'trombone', 'sassofono', 'clarinetto', 'oboe',
    'tamburo', 'batteria', 'piatti', 'percussioni',
    'sintetizzatore', 'organo elettrico', 'tastiera',
    'microfono', 'amplificatore',
    'jazz', 'rock', 'pop', 'classica', 'opera lirica', 'blues', 'country',
    'reggae', 'hip hop', 'rap', 'metal', 'punk', 'folk', 'lirica',
    'concerto rock', 'tournée', 'tour',
]

arts_visual = [
    'arte visiva', 'pittura', 'scultura', 'fotografia', 'disegno',
    'schizzo', 'illustrazione', 'incisione', 'litografia', 'serigrafia',
    'ritratto', 'paesaggio', 'natura morta', 'autoritratto',
    'tela', 'quadro', 'cornice', 'cavalletto',
    'pennello', 'tubetto', 'tavolozza', 'colore', 'pigmento',
    'tempera', 'acquerello', 'olio', 'acrilico', 'pastello',
    'gesso', 'argilla', 'marmo', 'bronzo', 'cera',
    'statua', 'busto', 'monumento', 'mosaico', 'affresco',
    'pittore', 'scultore', 'fotografo', 'illustratore', 'incisore',
    'maestro pittore', 'restauro',
    'rinascimento', 'barocco', 'romantico', 'impressionismo',
    'cubismo', 'astrattismo', 'surrealismo',
]

arts_literature = [
    'libro', 'volume', 'tomo', 'opuscolo', 'pubblicazione',
    'romanzo', 'racconto', 'novella', 'fiaba', 'favola', 'leggenda',
    'mito', 'epopea', 'saga', 'cronaca',
    'biografia', 'autobiografia', 'memoria', 'diario',
    'saggio', 'trattato', 'manuale', 'dizionario', 'enciclopedia',
    'antologia', 'raccolta',
    'rivista', 'periodico', 'giornale', 'quotidiano', 'settimanale',
    'mensile', 'bimestrale', 'trimestrale',
    'editore', 'casa editrice', 'redattore', 'redazione',
    'scrittore', 'autore', 'romanziere', 'novellista', 'saggista',
    'poeta', 'poetessa', 'critico letterario', 'lettore', 'lettrice',
    'capitolo', 'paragrafo', 'pagina', 'introduzione', 'prefazione',
    'indice', 'appendice', 'bibliografia', 'glossario',
    'verso', 'rima', 'strofa', 'sonetto', 'ode', 'haiku', 'ballata',
    'poesia', 'lirica', 'prosa',
    'personaggio', 'protagonista', 'antagonista', 'narratore',
    'trama', 'intreccio', 'finale', 'epilogo', 'prologo',
]

arts_performing = [
    'spettacolo', 'rappresentazione', 'esibizione', 'performance',
    'palcoscenico', 'palco', 'scena', 'sipario', 'platea', 'pubblico',
    'biglietteria', 'cartellone', 'locandina',
    'recital', 'monologo', 'dialogo teatrale', 'pièce',
    'ballerino', 'ballerina', 'danzatore', 'danzatrice', 'coreografo',
    'danza', 'balletto', 'tango', 'valzer', 'salsa', 'flamenco',
    'breakdance', 'hip hop', 'jazz dance',
    'teatro', 'compagnia teatrale', 'repertorio',
    'attore teatrale', 'mimo', 'pantomimo',
    'commedia teatrale', 'tragedia', 'farsa', 'musical',
    'circo', 'acrobata', 'trapezista', 'clown', 'giocoliere',
]

arts_film_tv = [
    'film', 'pellicola', 'cinema', 'cinematografia', 'lungometraggio',
    'cortometraggio', 'mediometraggio', 'documentario', 'cinegiornale',
    'commedia', 'dramma', 'tragedia', 'thriller', 'giallo', 'noir',
    'horror', 'fantascienza', 'fantasy', 'western', 'animazione',
    'cartone animato',
    'regista', 'sceneggiatore', 'produttore', 'montatore',
    'attore', 'attrice', 'protagonista', 'comparsa', 'figurante',
    'doppiatore', 'doppiatrice', 'stuntman',
    'sceneggiatura', 'copione', 'scena', 'ciak', 'set',
    'ripresa', 'inquadratura', 'primo piano', 'piano sequenza',
    'montaggio', 'effetti speciali',
    'serie tv', 'telenovela', 'soap opera', 'sitcom', 'fiction',
    'sceneggiata', 'puntata', 'episodio', 'stagione',
    'reality', 'talk show', 'quiz', 'varietà',
    'televisione', 'tv', 'canale', 'rete tv', 'palinsesto',
    'telegiornale', 'tg', 'meteo', 'pubblicità',
    'streaming', 'piattaforma',
    'trama', 'colpo di scena', 'finale di film',
]

arts_general = [
    'arte', 'artista', 'opera d\'arte', 'capolavoro',
    'collezione', 'esposizione', 'mostra', 'biennale',
    'museo', 'pinacoteca', 'galleria d\'arte', 'fondazione',
    'critico d\'arte', 'curatore', 'mercante d\'arte',
    'stile', 'movimento artistico', 'corrente', 'scuola',
    'classico', 'moderno', 'contemporaneo', 'avanguardia',
    'biglietto', 'abbonamento', 'audioguida',
    'premio', 'oscar', 'palma', 'leone', 'orso', 'cesar',
    'festival', 'rassegna',
]

for lemmas, sub in [
    (arts_music, 'arts_music'),
    (arts_visual, 'arts_visual'),
    (arts_literature, 'arts_literature'),
    (arts_performing, 'arts_performing'),
    (arts_film_tv, 'arts_film_tv'),
    (arts_general, 'arts_general'),
]:
    _apply_with_parent(lemmas, 'arts_entertainment', sub)


if __name__ == '__main__':
    print(f'Extended L (v2) now has {len(L)} entries.')
    samples = ['mela', 'cane', 'mucca', 'computer', 'orchestra', 'romanzo',
               'pittura', 'ossigeno', 'farfalla', 'pesce']
    for s in samples:
        print(f'  {s}: {L.get(s, "(not set)")}')
