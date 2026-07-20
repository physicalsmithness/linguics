# Formation-trigger audit, 2026-07-19

Run by a fresh-context read-only agent on Architecture's dispatch after Smith's live catch on pp_reg_ere_04
(typed the well-formed imperfetto "credevo", took misses on BOTH passato-prossimo formation buckets he never
attempted). Architect spot-audited 6 verdicts against disk before acting: all exact. Re-derive before trusting
any count here; the itemised ids are the durable part.

**The rule audited** (Rev 26 / Rev 28): a formation drill must FORCE its target tense/mood, so a miss is
unambiguously "couldn't form it". Forcing mechanisms: (a) tense/mood named in the cue; (b) supplied partial
form (auxiliary, stare); (c) genuinely excluding frame (co-text same-tense verb, telic bound); (d) MCQ menu;
(e) imperativo command frame. **A bare temporal adverb (ieri, domani, quella sera, il giorno prima) is NOT a
trigger** — it leaves aspect (imperfetto vs PP), register (PP vs remoto) or tense (present-for-future vs futuro) open.

## Tally

571 formation items scanned | SUPPLIED 106 | FRAME-FORCED 323 | **AMBIGUOUS 142 (25%)** |
ambiguous with prompt_supplies_base_form=true: **120** (mis-attribution live AND second-chance rescue disabled) |
ambiguous with NO flag key: **22** (all passato_prossimo, incl. the type case).

| topic | scanned | supplied | frame-forced | ambiguous |
|---|---|---|---|---|
| condizionale | 49 | 0 | 30 | 19 |
| congiuntivo | 90 | 0 | 90 | 0 |
| future | 52 | 2 | 5 | 45 |
| gerundio | 36 | 36 | 0 | 0 |
| imperativo | 56 | 22 | 34 | 0 |
| imperfect | 54 | 0 | 43 | 11 |
| passato_prossimo | 70 | 46 | 2 | 22 |
| passato_remoto | 39 | 0 | 4 | 35 |
| present_indicative | 91 | 0 | 84 | 7 |
| trapassato_prossimo | 34 | 0 | 31 | 3 |

## Itemised ambiguous ids (competitor in parens; HIGH = competitor equally/more natural)

**future (45, all flag=true; competitor = present indicative).** HIGH: fut_are_parlare_1sg_01 (parlo),
fut_are_lavorare_3sg_01, fut_are_abitare_2sg_01, fut_are_arrivare_3pl_01, fut_are_studiare_1pl_01,
fut_are_cenare_2pl_01, fut_ere_prendere_1sg_01, fut_ere_scrivere_3sg_01, fut_ere_leggere_3pl_01,
fut_ere_chiudere_2sg_01, fut_ire_partire_3sg_01, fut_ire_finire_3pl_01, fut_orth_cg_cercare_1sg_01,
fut_orth_cg_pagare_1pl_01, fut_orth_cg_giocare_3sg_01, fut_orth_cg_spiegare_3pl_01, fut_orth_cig_cominciare_1sg_01,
fut_orth_cig_mangiare_3pl_01, fut_orth_cig_lasciare_2sg_01, fut_orth_cig_viaggiare_1pl_01, fut_irr_sync_avere_1sg_01,
fut_irr_sync_andare_3sg_01, fut_irr_sync_dovere_1pl_01, fut_irr_sync_potere_3pl_01, fut_irr_sync_vedere_1sg_01
(ci vediamo; ALSO the vedere_ci bug thread), fut_irr_sync_cadere_2sg_01, fut_irr_rr_volere_1sg_01,
fut_irr_rr_venire_3sg_01, fut_irr_rr_tenere_2sg_01, fut_irr_rr_rimanere_1pl_01, fut_irr_rr_bere_3pl_01,
fut_irr_rr_volere_3pl_01, fut_irr_ess_essere_1sg_01, fut_irr_ess_essere_3sg_01, fut_irr_ess_essere_3pl_01,
fut_irr_ess_essere_2pl_01, fut_irr_dsf_fare_1sg_01, fut_irr_dsf_dare_3sg_01, fut_irr_dsf_stare_1pl_01,
fut_irr_dsf_fare_3pl_01. normal: fut_ire_capire_1sg_01, fut_ire_dormire_2sg_01, fut_irr_sync_sapere_2sg_01,
fut_irr_sync_vivere_3pl_01, fut_irr_dsf_stare_2sg_01. (fut_fant_* / fu_prob_ant_* are forced; not listed.)

**passato_remoto (35, all flag=true; competitor = passato prossimo, or imperfetto for statives/habituals; the
competitor is the MODERN register, so nearly all HIGH).** prem_are_parlare_1sg_01, prem_are_parlare_3sg_02,
prem_are_mangiare_1pl_03 (mangiavamo, "ogni sera"), prem_ere_credere_1sg_01, prem_ere_credere_3sg_02,
prem_ere_vendere_1sg_03, prem_ire_dormire_1sg_01, prem_ire_dormire_3sg_02, prem_ire_capire_1pl_03,
prem_strong_prendere_1sg_01, prem_strong_prendere_2sg_02, prem_strong_prendere_3pl_03, prem_strong_scrivere_1sg_04,
prem_strong_scrivere_3sg_05 (normal: Manzoni frame), prem_strong_vedere_1sg_06, prem_strong_vedere_3pl_07,
prem_strong_mettere_1pl_09, prem_strong_chiedere_1sg_10, prem_strong_leggere_3sg_11, prem_strong_vivere_3pl_12,
prem_strong_venire_3sg_13, prem_strong_venire_2pl_14, prem_supp_essere_1sg_01, prem_supp_essere_3sg_02,
prem_supp_essere_3pl_03, prem_supp_avere_1sg_04, prem_supp_avere_3sg_05, prem_supp_avere_2sg_06,
prem_supp_fare_1sg_07, prem_supp_fare_3sg_08 (normal), prem_supp_stare_1sg_10, prem_supp_dire_3sg_11,
prem_trap_finire_3sg_01, prem_trap_partire_3sg_02, prem_trap_fare_3pl_03.
(Forced survivors: prem_are_arrivare_3pl_04, prem_ere_temere_3pl_04, prem_strong_mettere_3sg_08, prem_supp_dare_3sg_09 — co-text remoto verb.)

**passato_prossimo (22, ALL missing the flag key; competitor = imperfetto).** HIGH: pp_reg_ere_04 (credevo; THE
TYPE CASE), pp_irr_aprire_01 (apriva; imperfetto co-text "faceva"), pp_irr_stato_01 (ero). normal: pp_reg_are_02,
pp_reg_are_03, pp_reg_are_04, pp_reg_ere_02, pp_reg_ere_03, pp_reg_ire_02, pp_reg_ire_03, pp_reg_ire_04,
pp_irr_fare_02, pp_irr_dire_02, pp_irr_prendere_01, pp_irr_vedere_02, pp_irr_scrivere_02, pp_irr_mettere_01,
pp_irr_chiudere_01, pp_irr_morire_01, pp_irr_venire_01, pp_irr_bere_01, pp_aux_refl_05.
(Forced survivors: pp_irr_leggere_01 "in due giorni", pp_irr_nascere_01.)

**condizionale (19, all flag=true; competitor = present indicative, polite/gnomic).** HIGH:
cond_irr_sync_potere_2sg_01 (puoi), cond_irr_sync_potere_1sg_01, cond_irr_sync_dovere_3sg_01,
cond_irr_sync_sapere_1sg_01, cond_irr_sync_vedere_3pl_01, cond_irr_dr_volere_2sg_01, cond_irr_dr_bere_3pl_01,
cond_irr_ess_essere_3pl_01, cond_irr_dsf_fare_2sg_01. normal: cond_ere_prendere_1sg_01, cond_ire_capire_1sg_01,
cond_ire_finire_3sg_01, cond_orth_ciare_mangiare_3sg_01, cond_orth_ciare_lasciare_2pl_01, cond_irr_dr_volere_1sg_01,
cond_irr_ess_essere_3sg_01, cond_passato_finire_1sg_01, cond_passato_partire_2sg_fem_01, cond_passato_arrivare_1pl_mpl_01
(last three: present condizionale competes with target condizionale passato). (Al posto tuo / se+cong frames are forced; not listed.)

**imperfect (11, all flag=true).** HIGH: imp_disc_dov_05 (dovevo), imp_disc_vol_02 (volevo), imp_disc_vol_04
(voleva). normal: imp_form_essere_01, imp_form_fare_04, imp_form_tradurre_02, imp_use_bg_03, imp_use_bg_04,
imp_disc_sap_01, imp_disc_dov_02, imp_disc_dov_04. (Several are PP-target items inside the imperfect topic's
discrimination set; a well-formed imperfetto fails a PP formation bucket.)

**present_indicative (7, all flag=true, all normal; competitor = futuro via smuggled future adverb).**
pres_ire_partire_3pl_01, pres_irr_mono_fare_2pl_01, pres_irr_go_venire_3pl_01, pres_irr_go_rimanere_1sg_01,
pres_irr_modal_dovere_1sg_01, pres_irr_modal_dovere_1pl_01, pres_irr_avere_2pl_01.

**trapassato_prossimo (3, all flag=true, all HIGH).** tpp_av_lui_02 (credeva), tpp_av_dop_la_01 (l'ha fatta),
tpp_es_sorelle_partite_01 (sono partite) — the latter two lack a past-anchor clause in the sentence itself.

## Why the clean topics are clean (the prescription)

congiuntivo 0/90: every item embeds a governing trigger (Penso che / Pensavo che / Se+cong / Magari) which
selects mood AND sub-tense. gerundio 36/36 supplied: the cue names the target form. imperativo 0/56: command
frame + form label. present 84/91: present-time frames with no competing pull. **The durable fix for the fire
topics is mechanism (a), name the tense/mood in the cue chip** — aspect (PP vs imperfetto) and register (PP vs
remoto) are genuine learner choices no frame can reliably force, and Rev 26 already licenses the tense name in
a formation cue as the trigger, not a criterion-13 leak.
