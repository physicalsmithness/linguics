"""Insert split secondary entries into vocabulary_it_frequency.json (ranks 1-200).

Each split has a primary entry already in the file and a new secondary entry
that gets inserted right after it. Same-rank entries with different POS are
the new convention; rank is no longer a unique key.
"""
import json
from pathlib import Path

DATA_FILE = Path('/sessions/sleepy-wizardly-bohr/mnt/Language Learning/data/vocabulary_it_frequency.json')

# Each split is: (primary_rank, primary_lemma, primary_pos, secondary_entry_dict)
SPLITS = [
    (3, 'che', 'conjunction', {
        'rank': 3, 'lemma': 'che', 'pos': 'pronoun',
        'translation_en': 'who, which, that; what',
        'band': 'vocabulary.it.freq_1_100',
        'gender': None, 'plural': None, 'auxiliary': None, 'conjugation_class': None,
        'notes': "relative pronoun (il libro che leggo = the book that I'm reading; la donna che parla = the woman who is speaking) and interrogative (che fai? = what are you doing?); invariable; cannot follow a preposition (use cui or il quale instead)"
    }),
    (14, 'lo', 'article', {
        'rank': 14, 'lemma': 'lo', 'pos': 'pronoun',
        'translation_en': 'him, it (direct object); it (referring to a clause)',
        'band': 'vocabulary.it.freq_1_100',
        'gender': 'm', 'plural': 'li', 'auxiliary': None, 'conjugation_class': None,
        'notes': "third-person masculine singular direct-object clitic; lo so = I know (it); feminine la, plurals li / le; combines with mi/ti/ci/vi (me lo, te lo, ce lo) and with third-person indirect to give glielo"
    }),
    (24, 'come', 'adverb', {
        'rank': 24, 'lemma': 'come', 'pos': 'conjunction',
        'translation_en': 'as, like; since (causal)',
        'band': 'vocabulary.it.freq_1_100',
        'gender': None, 'plural': None, 'auxiliary': None, 'conjugation_class': None,
        'notes': "comparison (forte come un leone = strong as a lion); manner/causal subordinate (come sai = as you know; come hai detto = as you said); come se + subjunctive = as if"
    }),
    (30, 'quello', 'determiner', {
        'rank': 30, 'lemma': 'quello', 'pos': 'pronoun',
        'translation_en': 'that one, the one',
        'band': 'vocabulary.it.freq_1_100',
        'gender': 'm', 'plural': 'quelli', 'auxiliary': None, 'conjugation_class': None,
        'notes': "demonstrative pronoun; full forms quello / quella / quelli / quelle; quello che = the one which / what (quello che dici = what you say); used with di for possession (quello di Marco = Marco's)"
    }),
    (32, 'questo', 'determiner', {
        'rank': 32, 'lemma': 'questo', 'pos': 'pronoun',
        'translation_en': 'this one; this (neuter, this thing)',
        'band': 'vocabulary.it.freq_1_100',
        'gender': 'm', 'plural': 'questi', 'auxiliary': None, 'conjugation_class': None,
        'notes': "demonstrative pronoun; questo / questa / questi / queste; neuter use refers to an idea rather than a noun (questo è importante = this is important)"
    }),
    (33, 'molto', 'adverb', {
        'rank': 33, 'lemma': 'molto', 'pos': 'determiner',
        'translation_en': 'much, many, a lot of',
        'band': 'vocabulary.it.freq_1_100',
        'gender': 'm', 'plural': 'molti', 'auxiliary': None, 'conjugation_class': None,
        'notes': "quantifier before a noun, agrees: molto pane (m sg), molta acqua (f sg), molti libri (m pl), molte case (f pl); also pronoun (molti dicono = many say)"
    }),
    (35, 'perché', 'conjunction', {
        'rank': 35, 'lemma': 'perché', 'pos': 'adverb',
        'translation_en': 'why',
        'band': 'vocabulary.it.freq_1_100',
        'gender': None, 'plural': None, 'auxiliary': None, 'conjugation_class': None,
        'notes': "interrogative; perché? = why?; question and answer use the same word (perché? — perché ho fame = why? — because I'm hungry)"
    }),
    (36, 'quando', 'adverb', {
        'rank': 36, 'lemma': 'quando', 'pos': 'conjunction',
        'translation_en': 'when (introducing a clause)',
        'band': 'vocabulary.it.freq_1_100',
        'gender': None, 'plural': None, 'auxiliary': None, 'conjugation_class': None,
        'notes': "temporal subordinate (quando sono arrivato = when I arrived); takes the indicative; for a future-in-the-future the future tense is used in Italian (quando arriverà = when he arrives)"
    }),
    (37, 'tutto', 'determiner', {
        'rank': 37, 'lemma': 'tutto', 'pos': 'pronoun',
        'translation_en': 'everything; everyone (m pl)',
        'band': 'vocabulary.it.freq_1_100',
        'gender': 'm', 'plural': 'tutti', 'auxiliary': None, 'conjugation_class': None,
        'notes': "standalone pronoun: tutto va bene = everything is fine; tutti sanno = everyone knows; agreement is plural for tutti / tutte"
    }),
    (43, 'cosa', 'noun', {
        'rank': 43, 'lemma': 'cosa', 'pos': 'pronoun',
        'translation_en': 'what',
        'band': 'vocabulary.it.freq_1_100',
        'gender': None, 'plural': None, 'auxiliary': None, 'conjugation_class': None,
        'notes': "interrogative pronoun, often interchangeable with che cosa or che (cosa fai? / che cosa fai? / che fai? = what are you doing?); invariable; takes singular verb agreement"
    }),
    (46, 'ora', 'adverb', {
        'rank': 46, 'lemma': 'ora', 'pos': 'noun',
        'translation_en': 'hour; (clock) time',
        'band': 'vocabulary.it.freq_1_100',
        'gender': 'f', 'plural': 'ore', 'auxiliary': None, 'conjugation_class': None,
        'notes': "che ora è? / che ore sono? = what time is it?; un quarto d'ora = a quarter of an hour; mezz'ora = half an hour"
    }),
    (48, 'solo', 'adverb', {
        'rank': 48, 'lemma': 'solo', 'pos': 'adjective',
        'translation_en': 'alone, lonely; single',
        'band': 'vocabulary.it.freq_1_100',
        'gender': None, 'plural': None, 'auxiliary': None, 'conjugation_class': None,
        'adj_class': 'o',
        'notes': "inflects solo / sola / soli / sole; lui è solo = he is alone; un solo errore = a single mistake (sense 'only one' before a noun)"
    }),
    (49, 'mio', 'determiner', {
        'rank': 49, 'lemma': 'mio', 'pos': 'pronoun',
        'translation_en': 'mine',
        'band': 'vocabulary.it.freq_1_100',
        'gender': 'm', 'plural': 'miei', 'auxiliary': None, 'conjugation_class': None,
        'notes': "standalone pronoun; il mio / la mia / i miei / le mie = mine; agrees with the thing possessed; i miei on its own often means 'my parents'"
    }),
    (50, 'nostro', 'determiner', {
        'rank': 50, 'lemma': 'nostro', 'pos': 'pronoun',
        'translation_en': 'ours',
        'band': 'vocabulary.it.freq_1_100',
        'gender': 'm', 'plural': 'nostri', 'auxiliary': None, 'conjugation_class': None,
        'notes': "standalone pronoun; il nostro / la nostra / i nostri / le nostre = ours; agrees with the thing possessed"
    }),
    (51, 'tuo', 'determiner', {
        'rank': 51, 'lemma': 'tuo', 'pos': 'pronoun',
        'translation_en': 'yours (sg, informal)',
        'band': 'vocabulary.it.freq_1_100',
        'gender': 'm', 'plural': 'tuoi', 'auxiliary': None, 'conjugation_class': None,
        'notes': "standalone pronoun; il tuo / la tua / i tuoi / le tue = yours"
    }),
    (52, 'suo', 'determiner', {
        'rank': 52, 'lemma': 'suo', 'pos': 'pronoun',
        'translation_en': 'his, hers, its',
        'band': 'vocabulary.it.freq_1_100',
        'gender': 'm', 'plural': 'suoi', 'auxiliary': None, 'conjugation_class': None,
        'notes': "standalone pronoun; il suo / la sua / i suoi / le sue; agrees with the thing, not the possessor — il suo libro is his book OR her book equally; capitalised il Suo for formal you"
    }),
    (66, 'dopo', 'adverb', {
        'rank': 66, 'lemma': 'dopo', 'pos': 'preposition',
        'translation_en': 'after',
        'band': 'vocabulary.it.freq_1_100',
        'gender': None, 'plural': None, 'auxiliary': None, 'conjugation_class': None,
        'notes': "prepositional use takes a noun (dopo cena = after dinner) or a perfect infinitive (dopo aver mangiato = after eating, dopo essere arrivato = after arriving); with disjunctive pronouns uses dopo di (dopo di me, dopo di te)"
    }),
    (68, 'bene', 'adverb', {
        'rank': 68, 'lemma': 'bene', 'pos': 'noun',
        'translation_en': 'good; benefit; love (in idioms); asset',
        'band': 'vocabulary.it.freq_1_100',
        'gender': 'm', 'plural': 'beni', 'auxiliary': None, 'conjugation_class': None,
        'notes': "il bene = the good (moral); fare del bene = to do good; voler bene a = to be fond of, to love (non-romantic); i beni = goods, assets"
    }),
    (69, 'proprio', 'adverb', {
        'rank': 69, 'lemma': 'proprio', 'pos': 'determiner',
        'translation_en': "(one's) own",
        'band': 'vocabulary.it.freq_1_100',
        'gender': 'm', 'plural': 'propri', 'auxiliary': None, 'conjugation_class': None,
        'notes': "reflexive possessive used when the possessor is the subject of the clause (Marco ha portato il proprio libro = Marco brought his own book, disambiguating where suo would be ambiguous); inflects proprio / propria / propri / proprie"
    }),
    (78, 'via', 'noun', {
        'rank': 78, 'lemma': 'via', 'pos': 'adverb',
        'translation_en': 'away, off',
        'band': 'vocabulary.it.freq_1_100',
        'gender': None, 'plural': None, 'auxiliary': None, 'conjugation_class': None,
        'notes': "andare via = to go away; portare via = to take away; e così via = and so on; via! = go! / off you go!"
    }),
    (87, 'tanto', 'adverb', {
        'rank': 87, 'lemma': 'tanto', 'pos': 'determiner',
        'translation_en': 'so much, so many, a lot of',
        'band': 'vocabulary.it.freq_1_100',
        'gender': 'm', 'plural': 'tanti', 'auxiliary': None, 'conjugation_class': None,
        'notes': "quantifier; inflects tanto / tanta / tanti / tante; tanto pane (m sg), tanta acqua (f sg), tanti amici (m pl), tante volte (f pl); tanto ... quanto = as much ... as"
    }),
    (101, 'altro', 'determiner', {
        'rank': 101, 'lemma': 'altro', 'pos': 'pronoun',
        'translation_en': 'another one, the other; something else',
        'band': 'vocabulary.it.freq_101_200',
        'gender': 'm', 'plural': 'altri', 'auxiliary': None, 'conjugation_class': None,
        'notes': "standalone pronoun: gli altri = the others; un altro = another one; vuoi altro? = anything else?; senz'altro = certainly; nient'altro = nothing else"
    }),
    (105, 'nessuno', 'pronoun', {
        'rank': 105, 'lemma': 'nessuno', 'pos': 'determiner',
        'translation_en': 'no, not any (before a noun)',
        'band': 'vocabulary.it.freq_101_200',
        'gender': 'm', 'plural': None, 'auxiliary': None, 'conjugation_class': None,
        'notes': "always singular; before a noun inflects like un: nessun libro (m sg before cons), nessuno studente (m sg before s+cons / z / ps etc.), nessuna casa (f sg), nessun'idea (f sg before vowel); negative concord (non c'è nessun problema)"
    }),
    (108, 'stesso', 'determiner', {
        'rank': 108, 'lemma': 'stesso', 'pos': 'adverb',
        'translation_en': 'anyway, all the same, even so',
        'band': 'vocabulary.it.freq_101_200',
        'gender': None, 'plural': None, 'auxiliary': None, 'conjugation_class': None,
        'notes': "fixed expression lo stesso (uguale in casual speech): lo faccio lo stesso = I'll do it anyway; grazie lo stesso = thanks anyway"
    }),
    (115, 'troppo', 'adverb', {
        'rank': 115, 'lemma': 'troppo', 'pos': 'determiner',
        'translation_en': 'too much, too many',
        'band': 'vocabulary.it.freq_101_200',
        'gender': 'm', 'plural': 'troppi', 'auxiliary': None, 'conjugation_class': None,
        'notes': "quantifier; inflects troppo / troppa / troppi / troppe (troppo lavoro, troppa acqua, troppi problemi, troppe volte)"
    }),
    (116, 'poco', 'adverb', {
        'rank': 116, 'lemma': 'poco', 'pos': 'determiner',
        'translation_en': 'little, few, not much',
        'band': 'vocabulary.it.freq_101_200',
        'gender': 'm', 'plural': 'pochi', 'auxiliary': None, 'conjugation_class': None,
        'notes': "quantifier; inflects poco / poca / pochi / poche; masculine plural takes -h- to keep the c hard (pochi); un po' di = a little (apocope of un poco)"
    }),
    (122, 'male', 'adverb', {
        'rank': 122, 'lemma': 'male', 'pos': 'noun',
        'translation_en': 'harm, evil; pain, ache',
        'band': 'vocabulary.it.freq_101_200',
        'gender': 'm', 'plural': 'mali', 'auxiliary': None, 'conjugation_class': None,
        'notes': "il bene e il male = good and evil; fare male a = to hurt; mal di testa / di stomaco / di gola = headache / stomach ache / sore throat; non c'è male = not bad"
    }),
    (180, 'fine', 'noun', {
        'rank': 180, 'lemma': 'fine', 'pos': 'noun',
        'translation_en': 'aim, purpose, end (goal)',
        'band': 'vocabulary.it.freq_101_200',
        'gender': 'm', 'plural': 'fini', 'auxiliary': None, 'conjugation_class': None,
        'notes': "masculine when meaning purpose / aim (un fine nobile = a noble purpose; al fine di + infinitive = with the aim of); contrast with feminine la fine = the temporal/spatial end"
    }),
]


def main():
    with DATA_FILE.open('r', encoding='utf-8') as f:
        data = json.load(f)

    split_index = {(s[0], s[1], s[2]): s[3] for s in SPLITS}
    applied = set()

    new_data = []
    for entry in data:
        new_data.append(entry)
        key = (entry['rank'], entry['lemma'], entry['pos'])
        if key in split_index and key not in applied:
            new_data.append(split_index[key])
            applied.add(key)

    # Sanity: every split should have applied exactly once
    unapplied = set(split_index.keys()) - applied
    if unapplied:
        print(f"WARNING: unapplied splits: {unapplied}")

    with DATA_FILE.open('w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(new_data)} entries to {DATA_FILE.name}")
    print(f"Applied {len(applied)} of {len(split_index)} splits")


if __name__ == '__main__':
    main()
