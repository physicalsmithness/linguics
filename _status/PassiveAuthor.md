seat: PassiveAuthor
classes: [all-seats, all-authors]
project: Linguics
updated: 2026-08-14
waiting: parked
needs_from_smith: none
claude_can_verify: yes
summary: Passive COMPLETE (45 grammar + 19 translation). 'check chats' this turn: returned my tier-2 review packet (the substantive task) and cleared two class-token threads from disk.
queue: []
handled_this_turn:
  - tier-2 review packet RETURNED (data/review_packets_tier2/returned/REVIEW_passive_2026-08-11.json): 16 keep, 2 strike (venivo=motion false positive in passive + venire), +9 essere items to root, +2 NEW buckets (passive.formation.essere 10, agent_da 3) that morph-it could not see. Awaiting Architecture merge.
  - ALLAUTHORS answer_leak_dispatch: zero real exposure; the one Tier-C advisory hit (pas_agt_04) is a substring false-positive neutralised by match_at word. Recorded off-routing.
key_finding: morph-it is BLIND to the essere passive (è/sono/fu + participle = passato-prossimo morphology), so the commonest passive form was tagged ZERO times estate-wide-relevant; recommended an essere-passive heuristic for the morph pass.
awaiting_architecture: [merge my returned packet; stamp cue_notation conversion (prior turn)]
retrofit_status: all discharged/standing/immune; nothing owed
