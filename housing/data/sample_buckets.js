/* Sample bucket subset for the housing prototype.
   In production: the housing fetches the full trees from data/buckets/*.json.
   This file is the file:// fallback. */

window.LL_BUCKETS = [
  /* --- adjective_agreement slice --- */
  {
    "id": "adjective_agreement",
    "parent_id": null,
    "language_code": "it",
    "label": "Adjective agreement",
    "description": "Italian adjectives agree with the noun in gender and number.",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "core", "B2": "review", "C1": "review", "C2": "review"},
    "prerequisites": [],
    "attributes": {"is_aggregate": true}
  },
  {
    "id": "adjective_agreement.o_class",
    "parent_id": "adjective_agreement",
    "language_code": "it",
    "label": "Class I (-o)",
    "description": "Four-form pattern: -o, -a, -i, -e.",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
  },
  {
    "id": "adjective_agreement.o_class.feminine_singular",
    "parent_id": "adjective_agreement.o_class",
    "language_code": "it",
    "label": "Class I, fem sg (-a)",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
  },
  {
    "id": "adjective_agreement.o_class.feminine_plural",
    "parent_id": "adjective_agreement.o_class",
    "language_code": "it",
    "label": "Class I, fem pl (-e)",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
  },
  {
    "id": "adjective_agreement.e_class",
    "parent_id": "adjective_agreement",
    "language_code": "it",
    "label": "Class II (-e)",
    "cefr_importance": {"A1": "preview", "A2": "core", "B1": "core", "B2": "review", "C1": "review", "C2": "fluency"}
  },
  {
    "id": "adjective_agreement.e_class.feminine_plural",
    "parent_id": "adjective_agreement.e_class",
    "language_code": "it",
    "label": "Class II, fem pl (-i)",
    "description": "The hardest case: learners often write -e by analogy with Class I fem pl.",
    "cefr_importance": {"A1": "preview", "A2": "core", "B1": "core", "B2": "review", "C1": "fluency", "C2": "fluency"}
  },

  /* --- passato_prossimo slice --- */
  {
    "id": "verb_form",
    "parent_id": null,
    "language_code": "it",
    "label": "Verb form",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "core", "B2": "core", "C1": "review", "C2": "review"}
  },
  {
    "id": "verb_form.passato_prossimo",
    "parent_id": "verb_form",
    "language_code": "it",
    "label": "Passato prossimo",
    "cefr_importance": {"A1": "preview", "A2": "core", "B1": "core", "B2": "review", "C1": "review", "C2": "fluency"}
  },
  {
    "id": "verb_form.passato_prossimo.auxiliary",
    "parent_id": "verb_form.passato_prossimo",
    "language_code": "it",
    "label": "Auxiliary choice",
    "cefr_importance": {"A1": "preview", "A2": "core", "B1": "core", "B2": "review", "C1": "review", "C2": "fluency"}
  },
  {
    "id": "verb_form.passato_prossimo.auxiliary.essere_motion_intransitive",
    "parent_id": "verb_form.passato_prossimo.auxiliary",
    "language_code": "it",
    "label": "Essere with motion intransitives",
    "cefr_importance": {"A1": "preview", "A2": "core", "B1": "core", "B2": "review", "C1": "review", "C2": "fluency"}
  },
  {
    "id": "verb_form.passato_prossimo.auxiliary.avere_default",
    "parent_id": "verb_form.passato_prossimo.auxiliary",
    "language_code": "it",
    "label": "Avere (default)",
    "cefr_importance": {"A1": "preview", "A2": "core", "B1": "core", "B2": "review", "C1": "review", "C2": "fluency"}
  },
  {
    "id": "verb_form.passato_prossimo.participle_agreement",
    "parent_id": "verb_form.passato_prossimo",
    "language_code": "it",
    "label": "Participle agreement",
    "cefr_importance": {"A1": "preview", "A2": "core", "B1": "core", "B2": "core", "C1": "review", "C2": "fluency"}
  },
  {
    "id": "verb_form.passato_prossimo.participle_agreement.with_essere",
    "parent_id": "verb_form.passato_prossimo.participle_agreement",
    "language_code": "it",
    "label": "Agreement with subject (essere)",
    "cefr_importance": {"A1": "preview", "A2": "core", "B1": "core", "B2": "review", "C1": "review", "C2": "fluency"}
  },
  {
    "id": "verb_form.passato_prossimo.participle_agreement.with_essere.feminine_singular",
    "parent_id": "verb_form.passato_prossimo.participle_agreement.with_essere",
    "language_code": "it",
    "label": "Fem sg subject (-a)",
    "cefr_importance": {"A1": "preview", "A2": "core", "B1": "core", "B2": "review", "C1": "fluency", "C2": "fluency"}
  },
  {
    "id": "verb_form.passato_prossimo.participle_form.regular.are_ato",
    "parent_id": "verb_form.passato_prossimo",
    "language_code": "it",
    "label": "-are -> -ato",
    "cefr_importance": {"A1": "preview", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
  },
  {
    "id": "preposition.articulated.al",
    "parent_id": null,
    "language_code": "it",
    "label": "Articulated preposition: al",
    "description": "a + il = al.",
    "cefr_importance": {"A1": "core", "A2": "review", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
  },
  {
    "id": "orthography.accent.italian",
    "parent_id": null,
    "language_code": "it",
    "label": "Italian accent slip",
    "description": "Wrong or missing accent. Logged when the accent-folded fallback rescued the answer.",
    "cefr_importance": {"A1": "review", "A2": "review", "B1": "review", "B2": "review", "C1": "fluency", "C2": "fluency"}
  },

  /* --- vocabulary buckets (demo) --- */
  {
    "id": "vocabulary",
    "parent_id": null,
    "language_code": "it",
    "label": "Vocabulary",
    "description": "Words the learner has met, organised per word, with sub-buckets per aspect (translation, gender, plural, conjugation).",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "core", "B2": "core", "C1": "core", "C2": "core"},
    "attributes": {"is_aggregate": true}
  },
  {
    "id": "vocabulary.it.casa",
    "parent_id": "vocabulary",
    "language_code": "it",
    "label": "casa (house)",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"},
    "attributes": {"is_aggregate": true, "lemma": "casa", "gender": "f", "pos": "noun"}
  },
  {
    "id": "vocabulary.it.casa.translation",
    "parent_id": "vocabulary.it.casa",
    "language_code": "it",
    "label": "casa: knowing the word",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
  },
  {
    "id": "vocabulary.it.casa.gender",
    "parent_id": "vocabulary.it.casa",
    "language_code": "it",
    "label": "casa: knowing the gender",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
  },
  {
    "id": "vocabulary.it.rosso",
    "parent_id": "vocabulary",
    "language_code": "it",
    "label": "rosso (red)",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"},
    "attributes": {"is_aggregate": true, "lemma": "rosso", "pos": "adjective", "adj_class": "o"}
  },
  {
    "id": "vocabulary.it.rosso.translation",
    "parent_id": "vocabulary.it.rosso",
    "language_code": "it",
    "label": "rosso: knowing the word",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
  },
  {
    "id": "vocabulary.it.rosso.adj_class",
    "parent_id": "vocabulary.it.rosso",
    "language_code": "it",
    "label": "rosso: knowing its agreement class",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
  },
  {
    "id": "vocabulary.it.grande",
    "parent_id": "vocabulary",
    "language_code": "it",
    "label": "grande (big)",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"},
    "attributes": {"is_aggregate": true, "lemma": "grande", "pos": "adjective", "adj_class": "e"}
  },
  {
    "id": "vocabulary.it.grande.translation",
    "parent_id": "vocabulary.it.grande",
    "language_code": "it",
    "label": "grande: knowing the word",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
  },
  {
    "id": "vocabulary.it.grande.adj_class",
    "parent_id": "vocabulary.it.grande",
    "language_code": "it",
    "label": "grande: knowing its agreement class",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
  },
  {
    "id": "vocabulary.it.andare",
    "parent_id": "vocabulary",
    "language_code": "it",
    "label": "andare (to go)",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"},
    "attributes": {"is_aggregate": true, "lemma": "andare", "pos": "verb", "auxiliary": "essere"}
  },
  {
    "id": "vocabulary.it.andare.translation",
    "parent_id": "vocabulary.it.andare",
    "language_code": "it",
    "label": "andare: knowing the word",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
  },
  {
    "id": "vocabulary.it.andare.auxiliary",
    "parent_id": "vocabulary.it.andare",
    "language_code": "it",
    "label": "andare: knowing its auxiliary (essere)",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
  },
  {
    "id": "vocabulary.it.mercato",
    "parent_id": "vocabulary",
    "language_code": "it",
    "label": "mercato (market)",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"},
    "attributes": {"is_aggregate": true, "lemma": "mercato", "gender": "m", "pos": "noun"}
  },
  {
    "id": "vocabulary.it.mercato.translation",
    "parent_id": "vocabulary.it.mercato",
    "language_code": "it",
    "label": "mercato: knowing the word",
    "cefr_importance": {"A1": "core", "A2": "core", "B1": "review", "B2": "fluency", "C1": "fluency", "C2": "fluency"}
  }
];
