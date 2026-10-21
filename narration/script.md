# CaseDistiller explainer: narration script

17 scenes · 775 words · 6:37 total · 17 scenes timed to measured voice clips, the rest estimated at 2.6 words/s · 0.8 s lead-in and 0.8 s tail per scene.

Each scene's voice clip starts 0.8 s after the scene begins. Clips live in `public/audio/<Scene id>.wav` (made by `scripts/tts.mjs`); run `node scripts/audio-durations.mjs` after changing them.

| # | Scene | Starts | Length | Voice | Words |
|---|---|---|---|---|---|
| 1 | Cover | 0:00 | 24.3 s | 21.6 s | 48 |
| 2 | Compare | 0:24 | 27.4 s | 25.8 s | 65 |
| 3 | Approach | 0:51 | 23.8 s | 22.2 s | 50 |
| 4 | Routes | 1:15 | 20.0 s | 18.4 s | 44 |
| 5 | Expansion | 1:35 | 18.7 s | 17.1 s | 37 |
| 6 | Masked | 1:54 | 20.3 s | 18.7 s | 37 |
| 7 | Candidates | 2:14 | 26.8 s | 25.1 s | 49 |
| 8 | Selection | 2:41 | 26.7 s | 25.1 s | 52 |
| 9 | Scorecard | 3:07 | 25.7 s | 24.1 s | 50 |
| 10 | AgentLoop | 3:33 | 28.4 s | 26.8 s | 51 |
| 11 | AgentEdit | 4:02 | 21.0 s | 19.4 s | 46 |
| 12 | Tasks | 4:23 | 21.4 s | 19.8 s | 42 |
| 13 | Ems | 4:44 | 28.8 s | 27.2 s | 46 |
| 14 | Act | 5:13 | 24.6 s | 23.0 s | 49 |
| 15 | Split | 5:37 | 19.4 s | 17.8 s | 34 |
| 16 | Audit | 5:57 | 21.7 s | 20.1 s | 46 |
| 17 | Close | 6:18 | 18.2 s | 16.6 s | 29 |

## 1. Cover (0:00, 24.3 s)

Suppose you need every patient whose notes describe a suicide attempt, or advanced heart disease, across a whole health system. You could read the notes. You could send each one to a language model. Or you could run one SQL query that you can read, defend, and edit.

> Directed: [warm, curious] Suppose you need every patient whose notes describe a suicide attempt, or advanced heart disease, across a whole health system. You could read the notes. You could send each one to a language model. [short pause] [confident, excited] Or you could run <emphasis>one SQL query</emphasis> that you can read, defend, and edit.

## 2. Compare (0:24, 27.4 s)

Each of the usual routes gives something up. Experts bring judgement, but reading one note at a time is slow and costly. Classical NLP is deterministic, but hard to set up and awkward to edit. A generative LLM is strong, but it needs a model call for every note: a GPU, latency, and logic nobody can read. CaseDistiller keeps the strengths and drops the costs.

> Directed: [thoughtful] Each of the usual routes gives something up. Experts bring judgement, but reading one note at a time is slow and costly. Classical NLP is deterministic, but hard to set up and awkward to edit. A generative LLM is strong, but it needs a model call for every note: a GPU, latency, and logic nobody can read. [short pause] [upbeat] CaseDistiller keeps the strengths and <emphasis>drops the costs</emphasis>.

## 3. Approach (0:51, 23.8 s)

Here is what is new. CaseDistiller learns the case definition itself, as an SQL program that reads like a clinician's checklist. CaseDistiller-Lite learns it on a CPU. CaseDistiller-Agentic lets an LLM agent refine it, but only while it is built. What ships is one SELECT statement. No model, no GPU.

> Directed: [energetic, revealing the key idea] Here is what is new. [short pause] CaseDistiller learns the case definition itself, as an SQL program that reads like a clinician's checklist. CaseDistiller-Lite learns it on a CPU. CaseDistiller-Agentic lets an LLM agent refine it, but only while it is built. [short pause] What ships is one SELECT statement. [emphatic] <stress>No model, no GPU.</stress>

## 4. Routes (1:15, 20.0 s)

Here is a learned definition, for suicide attempt in EMS records. A program is an OR of routes; a route is an AND of words. Each route shows the cases it catches and the false alarms it raises. Any matching route flags the note.

> Directed: [clear and lively, showing an example] Here is a learned definition, for suicide attempt in EMS records. A program is an or of routes. A route is an and of words. Each route shows the cases it catches and the false alarms it raises. [short pause] Any matching route flags the note.

## 5. Expansion (1:35, 18.7 s)

Under the hood, each pattern expands into plain SQL. This one covers four forms of suicide attempt as four pattern tests, and the negation becomes NOT LIKE. The same program renders for SQL Server, DuckDB, and PostgreSQL.

> Directed: [matter-of-fact] Under the hood, each pattern expands into plain SQL. This one covers four forms of suicide attempt as four pattern tests, and the negation becomes NOT LIKE. [short pause] The same program renders for SQL Server, DuckDB, and PostgreSQL.

## 6. Masked (1:54, 20.3 s)

Words alone can mislead, so a route can mask exceptions. Depression counts; ST depression, a heart finding, does not; and a note that mentions both still matches. Nested REPLACE erases the exception, then LIKE tests the term.

> Directed: [a little playful, pointing out a trap] Words alone can mislead, so a route can mask exceptions. Depression counts; ST depression, a heart finding, <emphasis>does not</emphasis>; and a note that mentions both still matches. Nested REPLACE erases the exception, then LIKE tests the term.

## 7. Candidates (2:14, 26.8 s)

CaseDistiller-Lite finds these routes in the words. A phrase inventory, scored by log odds toward positive notes. Then routes: phrases alone and in pairs, prefix patterns, and FOIL information gain, which adds conjuncts. Poisoning alone catches many cases but some false alarms; adding took makes it far more precise.

> Directed: [engaged, step by step] CaseDistiller-Lite finds these routes in the words. [short pause] A phrase inventory, scored by log odds toward positive notes. Then routes: phrases alone and in pairs, prefix patterns, and FOIL information gain, which adds conjuncts. [short pause] Poisoning alone catches many cases, but some false alarms. [pleased] Adding "took" makes it far more precise.

## 8. Selection (2:41, 26.7 s)

Then CaseDistiller-Lite chooses routes together. A local search adds, drops, and swaps routes to minimise one cost: a heavy price for each missed case, a smaller price for each false alarm, and a price for size. Across many weight settings, one hundred and seventy-seven candidates become eleven routes, chosen by validation F1.

> Directed: [focused, building momentum] Then CaseDistiller-Lite chooses routes together. A local search adds, drops, and swaps routes to minimise one cost: a heavy price for each missed case, a smaller price for each false alarm, and a price for size. [short pause] Across many weight settings, one hundred and seventy-seven candidates become <emphasis>eleven routes</emphasis>, chosen by validation F1.

## 9. Scorecard (3:07, 25.7 s)

CaseDistiller-Lite can also weigh the same cues instead of requiring them. An L1 logistic regression, rounded to integer points, gives an SQL scorecard. For death within thirty days, hospice adds the most, then comfort and DNR, and some words subtract. A note is flagged once its points pass a threshold.

> Directed: [lighter, offering an alternative] CaseDistiller-Lite can also weigh the same cues instead of requiring them. An L1 logistic regression, rounded to integer points, gives an SQL scorecard. For death within thirty days, hospice adds the most, then comfort and DNR, and some words subtract. [short pause] A note is flagged once its points pass a threshold.

## 10. AgentLoop (3:33, 28.4 s)

CaseDistiller-Agentic goes one step further: an LLM agent edits the program, but the host decides. The agent works through a Pi runtime that exposes host tools only. It sees training metrics, never validation. The host keeps an edit only if development F1 improves, and refuses anything that is not plain SQL.

> Directed: [intrigued, then firm] CaseDistiller-Agentic goes one step further: an LLM agent edits the program, [short pause] but <emphasis>the host decides</emphasis>. The agent works through a Pi runtime that exposes host tools only. It sees training metrics, never validation. The host keeps an edit only if development F1 improves, and refuses anything that is not plain SQL.

## 11. AgentEdit (4:02, 21.0 s)

The edits read like a clinician's. For advanced heart disease, the agent carried the learned ejection-fraction bound to the spelled-out term, and added routes for aortic stenosis and transplant. Test F1 rose by about eight points, and nobody, agent or host, ever saw the test notes.

> Directed: [genuinely impressed] The edits read like a clinician's. For advanced heart disease, the agent carried the learned ejection-fraction bound to the spelled-out term, and added routes for aortic stenosis and transplant. [short pause] Test F1 rose by <emphasis>about eight points</emphasis>, and nobody, agent or host, ever saw the test notes.

## 12. Tasks (4:23, 21.4 s)

Does it hold up? We tested it on three corpora: emergency medical services records for suicide attempt, MIMIC discharge summaries for ten phenotypes, and discharge notes labeled for death within thirty days. Each test split was scored once, after the programs froze.

> Directed: [rising interest, turning to the big question] Does it hold up? [short pause] We tested it on three corpora: emergency medical services records for suicide attempt, MIMIC discharge summaries for ten phenotypes, and discharge notes labeled for death within thirty days. Each test split was scored once, after the programs froze.

## 13. Ems (4:44, 28.8 s)

Start with suicide attempt. The learned program scores zero point eight zero, the same as NC DETECT, the definition experts wrote by hand. The diagnosis code alone scores near zero point five. And of fifty-five attempts with no code at all, the program still found thirty-three.

> Directed: [building to a reveal] Start with suicide attempt. The learned program scores zero point eight zero, [short pause] [delighted] <emphasis>the same as NC DETECT</emphasis>, the definition experts wrote by hand. The diagnosis code alone scores near zero point five. [short pause] And of fifty-five attempts with no code at all, the program still found <emphasis>thirty-three</emphasis>.

## 14. Act (5:13, 24.6 s)

Across the ten phenotypes, the SQL program averages zero point six six. Agent refinement closes about half the gap to an LLM that reads every note, landing within zero point zero one five of direct classification. Ten of sixty agent runs improved significantly on their start; none got worse.

> Directed: [confident] Across the ten phenotypes, the SQL program averages zero point six six. Agent refinement closes about half the gap to an LLM that reads every note, landing within <emphasis>zero point zero one five</emphasis> of direct classification. [short pause] Ten of sixty agent runs improved significantly on their start. [firm] None got worse.

## 15. Split (5:37, 19.4 s)

The averages hide a pattern. SQL leads where a few phrases carry the definition: alcohol abuse, cancer, depression. Direct classification leads where the note must be read as a whole. These gaps are descriptive.

> Directed: [curious, noticing something] The averages hide a pattern. SQL leads where a few phrases carry the definition: alcohol abuse, cancer, depression. Direct classification leads where the note must be read as a whole. These gaps are descriptive.

## 16. Audit (5:57, 21.7 s)

And every program can be checked. All one hundred and seventy-two frozen programs ran in SQLite and selected exactly the evaluator's cohort. Eleven of sixty-four routes were flagged as shortcuts, and removing one is a one-line edit. Agents rarely removed them; that is the reviewer's job.

> Directed: [earnest and reassuring] And every program can be checked. All one hundred and seventy-two frozen programs ran in SQLite and selected <emphasis>exactly</emphasis> the evaluator's cohort. [short pause] Eleven of sixty-four routes were flagged as shortcuts, and removing one is a one-line edit. Agents rarely removed them; that is the reviewer's job.

## 17. Close (6:18, 18.2 s)

CaseDistiller: accurate enough, auditable, and CPU-only. A definition you can read, an LLM you can send home, and a query you can run tomorrow. The code is on GitHub.

> Directed: [upbeat, wrapping up with a smile] CaseDistiller: accurate enough, auditable, and CPU-only. [short pause] A definition you can read, an LLM you can send home, and a query you can run tomorrow. [warm] The code is on GitHub.
