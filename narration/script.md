# CaseDistiller explainer: narration script

18 scenes · 855 words · 6:41 total · 18 scenes timed to measured voice clips, the rest estimated at 2.1 words/s.

A scene lasts its minimum build time or its voice clip plus lead-in and tail, whichever is longer. The lead-in is 0.8 s (Cover 1.8 s); the tail is 0.8 s (Foil 3 s). Clips live in `public/audio/<Scene id>.wav` (made by `scripts/tts.mjs`); run `node scripts/audio-durations.mjs` after changing them.

| # | Scene | Starts | Length | Voice | Words |
|---|---|---|---|---|---|
| 1 | Cover | 0:00 | 21.7 s | 19.1 s | 41 |
| 2 | Compare | 0:21 | 24.0 s | 19.5 s | 41 |
| 3 | Approach | 0:45 | 21.0 s | 19.4 s | 41 |
| 4 | Routes | 1:06 | 18.1 s | 16.5 s | 45 |
| 5 | Expansion | 1:24 | 16.2 s | 14.6 s | 36 |
| 6 | Masked | 1:41 | 20.0 s | 18.4 s | 46 |
| 7 | Candidates | 2:01 | 18.4 s | 16.8 s | 41 |
| 8 | Foil | 2:19 | 50.0 s | 42.7 s | 106 |
| 9 | Selection | 3:09 | 22.6 s | 20.9 s | 50 |
| 10 | Scorecard | 3:31 | 20.5 s | 18.9 s | 47 |
| 11 | AgentLoop | 3:52 | 23.4 s | 21.8 s | 51 |
| 12 | AgentEdit | 4:15 | 20.2 s | 18.6 s | 45 |
| 13 | Tasks | 4:36 | 20.8 s | 19.2 s | 40 |
| 14 | Ems | 4:56 | 20.9 s | 19.3 s | 49 |
| 15 | Act | 5:17 | 23.2 s | 21.5 s | 50 |
| 16 | Split | 5:40 | 20.3 s | 18.7 s | 45 |
| 17 | Execution | 6:01 | 21.9 s | 20.2 s | 47 |
| 18 | Close | 6:23 | 18.2 s | 16.6 s | 34 |

## 1. Cover (0:00, 21.7 s)

Clinical case identification asks whether a record documents an event or condition under a specified definition. Examples include suspected suicide attempt and advanced heart disease. CaseDistiller learns explicit criteria from labeled records and definition-derived seeds, then exports the classifier as SQL.

> Directed: [warm, curious] Clinical case identification asks whether a record documents an event or condition under a specified definition. [short pause] Examples include suspected suicide attempt and advanced heart disease. [confident] CaseDistiller learns explicit criteria from labeled records and definition-derived seeds, then exports the classifier as SQL.

## 2. Compare (0:21, 24.0 s)

Expert rules, conventional text classifiers, and direct language-model classification offer different trade-offs in construction effort, representation, and inference requirements. CaseDistiller learns an executable rule representation. An optional language model can help refine it during construction; deployment then uses the resulting query.

> Directed: [thoughtful] Expert rules, conventional text classifiers, and direct language-model classification offer different trade-offs in construction effort, representation, and inference requirements. [short pause] CaseDistiller learns an executable rule representation. An optional language model can help refine it during construction; deployment then uses the resulting query.

## 3. Approach (0:45, 21.0 s)

CaseDistiller-Lite learns Boolean programs or integer scorecards on a CPU. CaseDistiller-Agentic can optionally propose edits, which a host measures and selects. Both paths produce an explicit classifier that runs using native SQL operations. The deployed query does not call an LLM.

> Directed: [clear, explaining the plan] CaseDistiller-Lite learns Boolean programs or integer scorecards on a CPU. CaseDistiller-Agentic can optionally propose edits, which a host measures and selects. [short pause] Both paths produce an explicit classifier that runs using native SQL operations. [firm] The deployed query does not call an LLM.

## 4. Routes (1:06, 18.1 s)

A Boolean program is an OR of routes. Within each route, predicates are joined by AND. Predicates can match phrases, patterns, or numerical values. Any matching route flags the record, and one record can match several routes. These examples come from the learned EMS program.

> Directed: [clear and lively, showing an example] A Boolean program is an or of routes. Within each route, predicates are joined by and. Predicates can match phrases, patterns, or numerical values. [short pause] Any matching route flags the record, and one record can match several routes. These examples come from the learned EMS program.

## 5. Expansion (1:24, 16.2 s)

The renderer translates supported predicates into native SQL operations. This pattern expands into four phrase forms. Text normalization is included in the query, so the exported classifier contains both the matching operations and the decision logic.

> Directed: [matter-of-fact] The renderer translates supported predicates into native SQL operations. This pattern expands into four phrase forms. [short pause] Text normalization is included in the query, so the exported classifier contains both the matching operations and the decision logic.

## 6. Masked (1:41, 20.0 s)

A masked phrase suppresses specified occurrences without rejecting the entire record. For the depression predicate, ST depression is an exception. If another depression occurrence remains, the predicate can still match. SQL removes the specified forms with nested REPLACE operations, then tests the remaining text with LIKE.

> Directed: [a little playful, pointing out a trap] A masked phrase suppresses specified occurrences without rejecting the entire record. For the depression predicate, ST depression is an exception. [short pause] If another depression occurrence remains, the predicate can still match. SQL removes the specified forms with nested REPLACE operations, then tests the remaining text with LIKE.

## 7. Candidates (2:01, 18.4 s)

Learning starts with the training records. The learner extracts short phrases within sentences or fields and ranks their association with positive labels. Definition-derived seeds, phrase pairs, and generalized patterns contribute candidate routes. Some routes are then extended using FOIL information gain.

> Directed: [engaged, step by step] Learning starts with the training records. The learner extracts short phrases within sentences or fields and ranks their association with positive labels. [short pause] Definition-derived seeds, phrase pairs, and generalized patterns contribute candidate routes. Some routes are then extended using FOIL information gain.

## 8. Foil (2:19, 50.0 s)

FOIL grows a route one condition at a time. It tests additions among the records that already match. In this illustration, poisoning matches twenty positive and twenty negative training records. Adding took keeps sixteen positives and four negatives: precision rises from fifty to eighty percent. FOIL information gain rewards that increase while accounting for the positive records retained. A more precise condition can have lower gain if it retains fewer positives. A rare condition matching only three positives is rejected because it loses too much coverage. CaseDistiller also requires a minimum precision improvement. Each accepted extension becomes a candidate route. Choosing the complete program comes next.

> Directed: [engaged, step by step] FOIL grows a route one condition at a time. It tests additions among the records that already match. [short pause] In this illustration, poisoning matches twenty positive and twenty negative training records. Adding took keeps sixteen positives and four negatives: precision rises from fifty to eighty percent. [short pause] FOIL information gain rewards that increase while accounting for the positive records retained. A more precise condition can have lower gain if it retains fewer positives. [short pause] A rare condition matching only three positives is rejected because it loses too much coverage. CaseDistiller also requires a minimum precision improvement. [short pause] Each accepted extension becomes a candidate route. Choosing the complete program comes next.

## 9. Selection (3:09, 22.6 s)

A separate local search chooses routes together, adding, dropping, and swapping them. It balances missed cases, false positives, and program size across a grid of weights. In EMS, one hundred and seventy-seven candidates became a pool of one hundred and ten routes. Validation F1 selected a program containing eleven routes.

> Directed: [focused, building momentum] A separate local search chooses routes together, adding, dropping, and swapping them. It balances missed cases, false positives, and program size across a grid of weights. [short pause] In EMS, one hundred and seventy-seven candidates became a pool of one hundred and ten routes. Validation F1 selected a program containing eleven routes.

## 10. Scorecard (3:31, 20.5 s)

A scorecard combines positive and negative evidence as integer points. Each matched predicate contributes once. In the exploratory mortality model, the complete scorecard has one hundred and thirty-nine terms and flags a record when its total reaches three hundred and sixty-six. The displayed terms are an excerpt.

> Directed: [lighter, offering an alternative] A scorecard combines positive and negative evidence as integer points. Each matched predicate contributes once. [short pause] In the exploratory mortality model, the complete scorecard has one hundred and thirty-nine terms and flags a record when its total reaches three hundred and sixty-six. The displayed terms are an excerpt.

## 11. AgentLoop (3:52, 23.4 s)

During optional refinement, the agent inspects training evidence and proposes edits. The host compiles each candidate and measures it on training and validation records. Promotion uses pooled development F1, with smaller programs resolving ties. Validation metrics are not shown to the agent. The final artifact remains within the supported SQL representation.

> Directed: [measured, precise] During optional refinement, the agent inspects training evidence and proposes edits. The host compiles each candidate and measures it on training and validation records. [short pause] Promotion uses pooled development F1, with smaller programs resolving ties. Validation metrics are not shown to the agent. The final artifact remains within the supported SQL representation.

## 12. AgentEdit (4:15, 20.2 s)

For advanced heart disease, the agent extended the ejection-fraction criterion from abbreviations to the spelled-out term, retaining the numerical bounds. In this illustrative run, held-out F1 increased from zero point six three zero to zero point seven zero seven. This shows one selected program edit.

> Directed: [interested] For advanced heart disease, the agent extended the ejection-fraction criterion from abbreviations to the spelled-out term, retaining the numerical bounds. [short pause] In this illustrative run, held-out F1 increased from zero point six three zero to zero point seven zero seven. This shows one selected program edit.

## 13. Tasks (4:36, 20.8 s)

EMS and ACT were the principal case-identification applications. The EMS target required a suspected attempt act; ideation or an uninitiated plan alone was insufficient. ACT covered ten phenotypes. Thirty-day mortality was exploratory. Selected classifiers were evaluated on held-out test splits.

> Directed: [clear, setting the stage] EMS and ACT were the principal case-identification applications. The EMS target required a suspected attempt act; ideation or an uninitiated plan alone was insufficient. [short pause] ACT covered ten phenotypes. Thirty-day mortality was exploratory. Selected classifiers were evaluated on held-out test splits.

## 14. Ems (4:56, 20.9 s)

For EMS, the learned Boolean program and NC DETECT both had an F1 point estimate of zero point eight zero, with different precision and recall. The scorecard reached zero point eight three three. Among fifty-five positive encounters without the T fourteen point ninety-one code, the Boolean program identified thirty-three.

> Directed: [measured] For EMS, the learned Boolean program and NC DETECT both had an F1 point estimate of zero point eight zero, with different precision and recall. The scorecard reached zero point eight three three. [short pause] Among fifty-five positive encounters without the T fourteen point ninety-one code, the Boolean program identified thirty-three.

## 15. Act (5:17, 23.2 s)

Across ACT, Boolean-program macro-F1 increased from zero point six six zero to zero point six seven six with Qwen and zero point six eight zero with GLM. Ten of sixty refinement runs had statistically significant increases; no significant decrease was detected in that group. Comparisons with direct classification were descriptive.

> Directed: [confident, careful] Across ACT, Boolean-program macro-F1 increased from zero point six six zero to zero point six seven six with Qwen and zero point six eight zero with GLM. [short pause] Ten of sixty refinement runs had statistically significant increases; no significant decrease was detected in that group. Comparisons with direct classification were descriptive.

## 16. Split (5:40, 20.3 s)

Performance varied by phenotype. The highest observed SQL-condition F1 exceeded both direct classifiers for alcohol abuse, advanced cancer, and depression. At least one direct model had a higher point estimate for the other seven phenotypes. These retrospective comparisons do not establish why the methods differ.

> Directed: [curious, careful] Performance varied by phenotype. The highest observed SQL-condition F1 exceeded both direct classifiers for alcohol abuse, advanced cancer, and depression. At least one direct model had a higher point estimate for the other seven phenotypes. [short pause] These retrospective comparisons do not establish why the methods differ.

## 17. Execution (6:01, 21.9 s)

All one hundred and seventy-two final programs produced identical SQL and evaluator predictions on the records checked in SQLite: all EMS and ACT test records, and the first fifteen hundred LCD test records. This supports execution consistency on those inputs. Clinical validity and usability require separate evaluation.

> Directed: [earnest and precise] All one hundred and seventy-two final programs produced identical SQL and evaluator predictions on the records checked in SQLite: all EMS and ACT test records, and the first fifteen hundred LCD test records. [short pause] This supports execution consistency on those inputs. Clinical validity and usability require separate evaluation.

## 18. Close (6:23, 18.2 s)

CaseDistiller learns explicit case classifiers from labeled clinical records, supports optional LLM refinement during construction, and exports native SQL. Its evaluation showed selective refinement gains. Applying the classifiers in another setting requires evaluation there.

> Directed: [warm, wrapping up] CaseDistiller learns explicit case classifiers from labeled clinical records, supports optional LLM refinement during construction, and exports native SQL. Its evaluation showed selective refinement gains. [short pause] Applying the classifiers in another setting requires evaluation there.
