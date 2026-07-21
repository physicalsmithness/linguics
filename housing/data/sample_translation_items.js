/* Sample translation items for the housing prototype.
   Uses the new rich vocab_help shape. */

window.LL_TRANSLATION_ITEMS = [
  {
    "external_id": "trans_passato_essere_01",
    "source_lang": "en",
    "target_lang": "it",
    "source_text": "My sister went to the market yesterday.",
    "reference_translations": [
      { "text": "Mia sorella è andata al mercato ieri.", "register": "neutral", "notes": "Standard rendering." },
      { "text": "Ieri mia sorella è andata al mercato.", "register": "neutral", "notes": "Adverb fronted." }
    ],
    "topic": "verb_form.passato_prossimo",
    "register": "neutral",
    "cefr_level_target": "A2",
    "required_buckets": [
      "verb_form.passato_prossimo.auxiliary.essere_motion_intransitive",
      "verb_form.passato_prossimo.participle_agreement.with_essere.feminine_singular",
      "preposition.articulated.al"
    ],
    "optional_buckets": [],
    "explanation": "Andare takes essere; participle agrees with fem sg subject (andata); al = a + il.",

    "vocab_help": [
      {
        "lemma": "sister",
        "language": "en",
        "aspects": {
          "translation": { "reveal": "sister - sorella", "bucket": "vocabulary.it.sorella.translation" },
          "gender": { "reveal": "feminine (f)", "bucket": "vocabulary.it.sorella.gender" }
        }
      },
      {
        "lemma": "went",
        "language": "en",
        "aspects": {
          "translation": { "reveal": "to go - andare", "bucket": "vocabulary.it.andare.translation" },
          "auxiliary": { "reveal": "essere (motion intransitive)", "bucket": "vocabulary.it.andare.auxiliary" }
        }
      },
      {
        "lemma": "market",
        "language": "en",
        "aspects": {
          "translation": { "reveal": "market - mercato", "bucket": "vocabulary.it.mercato.translation" },
          "gender": { "reveal": "masculine (m)", "bucket": "vocabulary.it.mercato.gender" }
        }
      },
      {
        "lemma": "yesterday",
        "language": "en",
        "aspects": {
          "translation": { "reveal": "yesterday - ieri", "bucket": "vocabulary.it.ieri.translation" }
        }
      }
    ],

    "markpoint_tells": {
      "verb_form.passato_prossimo.auxiliary.essere_motion_intransitive": {
        "label": "Essere auxiliary on andare",
        "positive": ["è andat", "e andat"],
        "negative": ["ha andat"],
        "expected": "è andata",
        "explanation_hit": "Correct: andare takes essere as auxiliary.",
        "explanation_miss": "Auxiliary should be essere (è), not avere (ha), because andare is a motion intransitive."
      },
      "verb_form.passato_prossimo.participle_agreement.with_essere.feminine_singular": {
        "label": "Participle agrees with fem sg subject",
        "positive": ["andata"],
        "negative": ["andato", "andate", "andati"],
        "expected": "andata",
        "explanation_hit": "Participle correctly agrees with feminine singular 'mia sorella'.",
        "explanation_miss": "The participle should be 'andata' (fem sg)."
      },
      "preposition.articulated.al": {
        "label": "Articulated 'al'",
        "positive": ["al mercato"],
        "negative": ["a il mercato", "a mercato"],
        "expected": "al mercato",
        "explanation_hit": "Correct articulated preposition.",
        "explanation_miss": "Use 'al' (a + il), not 'a il'."
      }
    },

    "version": 1
  },
  {
    "external_id": "trans_adj_agreement_01",
    "source_lang": "en",
    "target_lang": "it",
    "source_text": "The houses are big and red.",
    "reference_translations": [
      { "text": "Le case sono grandi e rosse.", "register": "neutral", "notes": "Standard." }
    ],
    "topic": "adjective_agreement",
    "register": "neutral",
    "cefr_level_target": "A2",
    "required_buckets": [
      "adjective_agreement.e_class.feminine_plural",
      "adjective_agreement.o_class.feminine_plural"
    ],
    "optional_buckets": [],
    "explanation": "Two adjectives, two classes, both feminine plural.",

    "vocab_help": [
      {
        "lemma": "houses",
        "language": "en",
        "aspects": {
          "translation": { "reveal": "house - casa", "bucket": "vocabulary.it.casa.translation" },
          "gender": { "reveal": "feminine (f)", "bucket": "vocabulary.it.casa.gender" }
        }
      },
      {
        "lemma": "big",
        "language": "en",
        "aspects": {
          "translation": { "reveal": "big - grande", "bucket": "vocabulary.it.grande.translation" },
          "adj_class": { "reveal": "Class II (-e/-e/-i/-i)", "bucket": "vocabulary.it.grande.adj_class" }
        }
      },
      {
        "lemma": "red",
        "language": "en",
        "aspects": {
          "translation": { "reveal": "red - rosso", "bucket": "vocabulary.it.rosso.translation" },
          "adj_class": { "reveal": "Class I (-o/-a/-i/-e)", "bucket": "vocabulary.it.rosso.adj_class" }
        }
      }
    ],

    "markpoint_tells": {
      "adjective_agreement.e_class.feminine_plural": {
        "label": "Class II fem pl (-i)",
        "positive": ["grandi"],
        "negative": ["grande", "grando"],
        "expected": "grandi",
        "explanation_hit": "Correct Class II plural 'grandi'.",
        "explanation_miss": "Class II adjectives take -i in the plural: 'grandi'."
      },
      "adjective_agreement.o_class.feminine_plural": {
        "label": "Class I fem pl (-e)",
        "positive": ["rosse"],
        "negative": ["rossi", "rosso", "rossa"],
        "expected": "rosse",
        "explanation_hit": "Correct Class I feminine plural 'rosse'.",
        "explanation_miss": "Class I feminine plural is -e: 'rosse'."
      }
    },

    "version": 1
  }
];
