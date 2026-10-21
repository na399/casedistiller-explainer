# CaseDistiller explainer: narration script

18 scenes · 855 words · 8:41 total · 18 scenes timed to measured voice clips, the rest estimated at 2.1 words/s.

A scene lasts its minimum build time or its voice clip plus lead-in and tail, whichever is longer. The lead-in is 0.8 s (Cover 1.8 s); the tail is 0.8 s (Foil 3 s). Clips live in `public/audio/<Scene id>.wav` (made by `scripts/tts.mjs`); run `node scripts/audio-durations.mjs` after changing them.

| # | Scene | Starts | Length | Voice | Words |
|---|---|---|---|---|---|
| 1 | Cover | 0:00 | 30.6 s | 28.0 s | 41 |
| 2 | Compare | 0:30 | 32.3 s | 30.7 s | 41 |
| 3 | Approach | 1:02 | 24.7 s | 23.1 s | 41 |
| 4 | Routes | 1:27 | 29.1 s | 27.5 s | 45 |
| 5 | Expansion | 1:56 | 20.2 s | 18.6 s | 36 |
| 6 | Masked | 2:16 | 24.4 s | 22.7 s | 46 |
| 7 | Candidates | 2:41 | 22.8 s | 21.2 s | 41 |
| 8 | Foil | 3:04 | 57.0 s | 53.2 s | 106 |
| 9 | Selection | 4:01 | 23.4 s | 21.8 s | 50 |
| 10 | Scorecard | 4:24 | 26.0 s | 24.4 s | 47 |
| 11 | AgentLoop | 4:50 | 32.2 s | 30.6 s | 51 |
| 12 | AgentEdit | 5:22 | 28.2 s | 26.6 s | 45 |
| 13 | Tasks | 5:50 | 29.3 s | 27.7 s | 40 |
| 14 | Ems | 6:20 | 33.8 s | 32.1 s | 49 |
| 15 | Act | 6:54 | 32.4 s | 30.8 s | 50 |
| 16 | Split | 7:26 | 24.0 s | 22.4 s | 45 |
| 17 | Execution | 7:50 | 28.1 s | 26.5 s | 47 |
| 18 | Close | 8:18 | 22.9 s | 21.3 s | 34 |

## 1. Cover (0:00, 30.6 s)

Clinical case identification asks whether a record documents an event or condition under a specified definition. Examples include suspected suicide attempt and advanced heart disease. CaseDistiller learns explicit criteria from labeled records and definition-derived seeds, then exports the classifier as SQL.

> Directed: [warm, curious] Clinical case identification asks whether a record documents an event or condition under a specified definition. [short pause] Examples include suspected suicide attempt and advanced heart disease. [confident] CaseDistiller learns explicit criteria from labeled records and definition-derived seeds, then exports the classifier as SQL.

## 2. Compare (0:30, 32.3 s)

Expert rules, conventional text classifiers, and direct language-model classification offer different trade-offs in construction effort, representation, and inference requirements. CaseDistiller learns an executable rule representation. An optional language model can help refine it during construction; deployment then uses the resulting query.

> Directed: [thoughtful] Expert rules, conventional text classifiers, and direct language-model classification offer different trade-offs in construction effort, representation, and inference requirements. [short pause] CaseDistiller learns an executable rule representation. An optional language model can help refine it during construction; deployment then uses the resulting query.

## 3. Approach (1:02, 24.7 s)

CaseDistiller-Lite learns Boolean programs or integer scorecards on a CPU. CaseDistiller-Agentic can optionally propose edits, which a host measures and selects. Both paths produce an explicit classifier that runs using native SQL operations. The deployed query does not call an LLM.

> Directed: [clear, explaining the plan] CaseDistiller-Lite learns Boolean programs or integer scorecards on a CPU. CaseDistiller-Agentic can optionally propose edits, which a host measures and selects. [short pause] Both paths produce an explicit classifier that runs using native SQL operations. [firm] The deployed query does not call an LLM.

## 4. Routes (1:27, 29.1 s)

A Boolean program is an OR of routes. Within each route, predicates are joined by AND. Predicates can match phrases, patterns, or numerical values. Any matching route flags the record, and one record can match several routes. These examples come from the learned EMS program.

> Directed: [clear and lively, showing an example] A Boolean program is an or of routes. Within each route, predicates are joined by and. Predicates can match phrases, patterns, or numerical values. [short pause] Any matching route flags the record, and one record can match several routes. These examples come from the learned EMS program.

## 5. Expansion (1:56, 20.2 s)

The renderer translates supported predicates into native SQL operations. This pattern expands into four phrase forms. Text normalization is included in the query, so the exported classifier contains both the matching operations and the decision logic.

> Directed: [matter-of-fact] The renderer translates supported predicates into native SQL operations. This pattern expands into four phrase forms. [short pause] Text normalization is included in the query, so the exported classifier contains both the matching operations and the decision logic.

## 6. Masked (2:16, 24.4 s)

A masked phrase suppresses specified occurrences without rejecting the entire record. For the depression predicate, ST depression is an exception. If another depression occurrence remains, the predicate can still match. SQL removes the specified forms with nested REPLACE operations, then tests the remaining text with LIKE.

> Directed: [a little playful, pointing out a trap] A masked phrase suppresses specified occurrences without rejecting the entire record. For the depression predicate, ST depression is an exception. [short pause] If another depression occurrence remains, the predicate can still match. SQL removes the specified forms with nested REPLACE operations, then tests the remaining text with LIKE.

## 7. Candidates (2:41, 22.8 s)

Learning starts with the training records. The learner extracts short phrases within sentences or fields and ranks their association with positive labels. Definition-derived seeds, phrase pairs, and generalized patterns contribute candidate routes. Some routes are then extended using FOIL information gain.

> Directed: [engaged, step by step] Learning starts with the training records. The learner extracts short phrases within sentences or fields and ranks their association with positive labels. [short pause] Definition-derived seeds, phrase pairs, and generalized patterns contribute candidate routes. Some routes are then extended using FOIL information gain.

## 8. Foil (3:04, 57.0 s)

FOIL grows a route one condition at a time. It tests additions among the records that already match. In this illustration, poisoning matches twenty positive and twenty negative training records. Adding took keeps sixteen positives and four negatives: precision rises from fifty to eighty percent. FOIL information gain rewards that increase while accounting for the positive records retained. A more precise condition can have lower gain if it retains fewer positives. A rare condition matching only three positives is rejected because it loses too much coverage. CaseDistiller also requires a minimum precision improvement. Each accepted extension becomes a candidate route. Choosing the complete program comes next.

> Directed: [engaged, step by step] FOIL grows a route one condition at a time. It tests additions among the records that already match. [short pause] In this illustration, poisoning matches twenty positive and twenty negative training records. Adding took keeps sixteen positives and four negatives: precision rises from fifty to eighty percent. [short pause] FOIL information gain rewards that increase while accounting for the positive records retained. A more precise condition can have lower gain if it retains fewer positives. [short pause] A rare condition matching only three positives is rejected because it loses too much coverage. CaseDistiller also requires a minimum precision improvement. [short pause] Each accepted extension becomes a candidate route. Choosing the complete program comes next.

## 9. Selection (4:01, 23.4 s)

A separate local search chooses routes together, adding, dropping, and swapping them. It balances missed cases, false positives, and program size across a grid of weights. In EMS, one hundred and seventy-seven candidates became a pool of one hundred and ten routes. Validation F1 selected a program containing eleven routes.

> Directed: [focused, building momentum] A separate local search chooses routes together, adding, dropping, and swapping them. It balances missed cases, false positives, and program size across a grid of weights. [short pause] In EMS, one hundred and seventy-seven candidates became a pool of one hundred and ten routes. Validation F1 selected a program containing eleven routes.

## 10. Scorecard (4:24, 26.0 s)

A scorecard combines positive and negative evidence as integer points. Each matched predicate contributes once. In the exploratory mortality model, the complete scorecard has one hundred and thirty-nine terms and flags a record when its total reaches three hundred and sixty-six. The displayed terms are an excerpt.

> Directed: [lighter, offering an alternative] A scorecard combines positive and negative evidence as integer points. Each matched predicate contributes once. [short pause] In the exploratory mortality model, the complete scorecard has one hundred and thirty-nine terms and flags a record when its total reaches three hundred and sixty-six. The displayed terms are an excerpt.

## 11. AgentLoop (4:50, 32.2 s)

During optional refinement, the agent inspects training evidence and proposes edits. The host compiles each candidate and measures it on training and validation records. Promotion uses pooled development F1, with smaller programs resolving ties. Validation metrics are not shown to the agent. The final artifact remains within the supported SQL representation.

> Directed: [measured, precise] During optional refinement, the agent inspects training evidence and proposes edits. The host compiles each candidate and measures it on training and validation records. [short pause] Promotion uses pooled development F1, with smaller programs resolving ties. Validation metrics are not shown to the agent. The final artifact remains within the supported SQL representation.

## 12. AgentEdit (5:22, 28.2 s)

For advanced heart disease, the agent extended the ejection-fraction criterion from abbreviations to the spelled-out term, retaining the numerical bounds. In this illustrative run, held-out F1 increased from zero point six three zero to zero point seven zero seven. This shows one selected program edit.

> Directed: [interested] For advanced heart disease, the agent extended the ejection-fraction criterion from abbreviations to the spelled-out term, retaining the numerical bounds. [short pause] In this illustrative run, held-out F1 increased from zero point six three zero to zero point seven zero seven. This shows one selected program edit.

## 13. Tasks (5:50, 29.3 s)

EMS and ACT were the principal case-identification applications. The EMS target required a suspected attempt act; ideation or an uninitiated plan alone was insufficient. ACT covered ten phenotypes. Thirty-day mortality was exploratory. Selected classifiers were evaluated on held-out test splits.

> Directed: [clear, setting the stage] EMS and ACT were the principal case-identification applications. The EMS target required a suspected attempt act; ideation or an uninitiated plan alone was insufficient. [short pause] ACT covered ten phenotypes. Thirty-day mortality was exploratory. Selected classifiers were evaluated on held-out test splits.

## 14. Ems (6:20, 33.8 s)

For EMS, the learned Boolean program and NC DETECT both had an F1 point estimate of zero point eight zero, with different precision and recall. The scorecard reached zero point eight three three. Among fifty-five positive encounters without the T fourteen point ninety-one code, the Boolean program identified thirty-three.

> Directed: [measured] For EMS, the learned Boolean program and NC DETECT both had an F1 point estimate of zero point eight zero, with different precision and recall. The scorecard reached zero point eight three three. [short pause] Among fifty-five positive encounters without the T fourteen point ninety-one code, the Boolean program identified thirty-three.

## 15. Act (6:54, 32.4 s)

Across ACT, Boolean-program macro-F1 increased from zero point six six zero to zero point six seven six with Qwen and zero point six eight zero with GLM. Ten of sixty refinement runs had statistically significant increases; no significant decrease was detected in that group. Comparisons with direct classification were descriptive.

> Directed: [confident, careful] Across ACT, Boolean-program macro-F1 increased from zero point six six zero to zero point six seven six with Qwen and zero point six eight zero with GLM. [short pause] Ten of sixty refinement runs had statistically significant increases; no significant decrease was detected in that group. Comparisons with direct classification were descriptive.

## 16. Split (7:26, 24.0 s)

Performance varied by phenotype. The highest observed SQL-condition F1 exceeded both direct classifiers for alcohol abuse, advanced cancer, and depression. At least one direct model had a higher point estimate for the other seven phenotypes. These retrospective comparisons do not establish why the methods differ.

> Directed: [curious, careful] Performance varied by phenotype. The highest observed SQL-condition F1 exceeded both direct classifiers for alcohol abuse, advanced cancer, and depression. At least one direct model had a higher point estimate for the other seven phenotypes. [short pause] These retrospective comparisons do not establish why the methods differ.

## 17. Execution (7:50, 28.1 s)

All one hundred and seventy-two final programs produced identical SQL and evaluator predictions on the records checked in SQLite: all EMS and ACT test records, and the first fifteen hundred LCD test records. This supports execution consistency on those inputs. Clinical validity and usability require separate evaluation.

> Directed: [earnest and precise] All one hundred and seventy-two final programs produced identical SQL and evaluator predictions on the records checked in SQLite: all EMS and ACT test records, and the first fifteen hundred LCD test records. [short pause] This supports execution consistency on those inputs. Clinical validity and usability require separate evaluation.

## 18. Close (8:18, 22.9 s)

CaseDistiller learns explicit case classifiers from labeled clinical records, supports optional LLM refinement during construction, and exports native SQL. Its evaluation showed selective refinement gains. Applying the classifiers in another setting requires evaluation there.

> Directed: [warm, wrapping up] CaseDistiller learns explicit case classifiers from labeled clinical records, supports optional LLM refinement during construction, and exports native SQL. Its evaluation showed selective refinement gains. [short pause] Applying the classifiers in another setting requires evaluation there.
