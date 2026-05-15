/* Sample grammar questions for the housing prototype.
   Uses the new rich vocab_help shape (per-lemma, multiple aspects). */

window.LL_GRAMMAR_QUESTIONS = [
  {
    "external_id": "adj_o_fem_sg_01",
    "language_code": "it",
    "topic": "adjective_agreement",
    "subtopic": "o_class.feminine_singular",
    "cefr_level_target": "A1",
    "prompt": "Complete the form of 'rosso': 'La casa è ____.'",
    "type": "short",
    "marks": 1,
    "markpoints": [
      {
        "order_index": 0,
        "credit": 1.0,
        "bucket": "adjective_agreement.o_class.feminine_singular",
        "label": "feminine singular -a",
        "any_phrases": ["rossa"],
        "must_not_include": ["rosso", "rosse", "rossi"]
      }
    ],
    "vocab_help": [
      {
        "lemma": "rosso",
        "language": "it",
        "aspects": {
          "translation": { "reveal": "rosso - red", "bucket": "vocabulary.it.rosso.translation" },
          "adj_class": { "reveal": "Class I (-o/-a/-i/-e)", "bucket": "vocabulary.it.rosso.adj_class" }
        }
      },
      {
        "lemma": "casa",
        "language": "it",
        "aspects": {
          "translation": { "reveal": "casa - house", "bucket": "vocabulary.it.casa.translation" },
          "gender": { "reveal": "feminine (f)", "bucket": "vocabulary.it.casa.gender" }
        }
      }
    ],
    "explanation": "Casa is feminine singular; Class I adjectives take -a.",
    "version": 1
  },
  {
    "external_id": "adj_e_fem_pl_01",
    "language_code": "it",
    "topic": "adjective_agreement",
    "subtopic": "e_class.feminine_plural",
    "cefr_level_target": "B1",
    "prompt": "Complete the form of 'grande': 'Le case sono ____.'",
    "type": "short",
    "marks": 1,
    "markpoints": [
      {
        "order_index": 0,
        "credit": 1.0,
        "bucket": "adjective_agreement.e_class.feminine_plural",
        "label": "Class II feminine plural -i",
        "any_phrases": ["grandi"],
        "must_not_include": ["grande", "grando", "granda", "grandes"]
      }
    ],
    "vocab_help": [
      {
        "lemma": "grande",
        "language": "it",
        "aspects": {
          "translation": { "reveal": "grande - big", "bucket": "vocabulary.it.grande.translation" },
          "adj_class": { "reveal": "Class II (-e/-e/-i/-i, same for both genders in plural)", "bucket": "vocabulary.it.grande.adj_class" }
        }
      },
      {
        "lemma": "case",
        "language": "it",
        "aspects": {
          "translation": { "reveal": "casa - house", "bucket": "vocabulary.it.casa.translation" },
          "gender": { "reveal": "feminine (f)", "bucket": "vocabulary.it.casa.gender" }
        }
      }
    ],
    "explanation": "Grande is Class II. The plural is -i for both genders: grandi.",
    "examiner_note": "Common miss: 'grande' (forgetting number) or applying -e by analogy with Class I fem pl.",
    "version": 1
  },
  {
    "external_id": "passato_essere_fem_01",
    "language_code": "it",
    "topic": "verb_form.passato_prossimo",
    "subtopic": "auxiliary.essere_motion_intransitive",
    "cefr_level_target": "A2",
    "prompt": "Complete the form: 'Maria ____ andata al mercato.'",
    "type": "short",
    "marks": 1,
    "markpoints": [
      {
        "order_index": 0,
        "credit": 1.0,
        "bucket": "verb_form.passato_prossimo.auxiliary.essere_motion_intransitive",
        "label": "essere auxiliary",
        "any_phrases": ["è", "e'"],
        "must_not_include": ["ha", "abbia", "aveva"]
      }
    ],
    "vocab_help": [
      {
        "lemma": "andata",
        "language": "it",
        "aspects": {
          "infinitive": { "reveal": "andare - to go", "bucket": "vocabulary.it.andare.translation" }
        }
      },
      {
        "lemma": "mercato",
        "language": "it",
        "aspects": {
          "translation": { "reveal": "mercato - market", "bucket": "vocabulary.it.mercato.translation" },
          "gender": { "reveal": "masculine (m)", "bucket": "vocabulary.it.mercato.gender" }
        }
      }
    ],
    "explanation": "Andare is a motion-intransitive verb; auxiliary is essere. The blank is 'è' (third-person singular of essere).",
    "version": 1
  }
];
