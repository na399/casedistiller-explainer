// Numbers from the CaseDistiller Results Atlas (SUMMARY block, status 20 October 2026),
// checked against the revised manuscript.md (Results, Table 2, Table 4, Figure 2).
export type Row = {
  task: string; name: string;
  sql: number; sql_scorecard: number; sql_qwen: number; sql_glm: number;
  sc_qwen: number; sc_glm: number; direct_qwen: number; direct_glm: number;
};

export const SUMMARY: Row[] = [
  { task: "ems_suicide_attempt", name: "EMS suicide attempt", sql: 0.8, sql_scorecard: 0.8333, sql_qwen: 0.7975, sql_glm: 0.8107, sc_qwen: 0.8265, sc_glm: 0.8267, direct_qwen: 0.861, direct_glm: 0.879 },
  { task: "act_alcohol", name: "Alcohol abuse", sql: 0.678, sql_scorecard: 0.7042, sql_qwen: 0.7394, sql_glm: 0.794, sc_qwen: 0.7159, sc_glm: 0.7445, direct_qwen: 0.571, direct_glm: 0.562 },
  { task: "act_cancer", name: "Advanced cancer", sql: 0.7541, sql_scorecard: 0.7353, sql_qwen: 0.75, sql_glm: 0.7133, sc_qwen: 0.7353, sc_glm: 0.7353, direct_qwen: 0.596, direct_glm: 0.704 },
  { task: "act_depression", name: "Depression", sql: 0.8235, sql_scorecard: 0.8333, sql_qwen: 0.8248, sql_glm: 0.8152, sc_qwen: 0.8324, sc_glm: 0.8419, direct_qwen: 0.779, direct_glm: 0.796 },
  { task: "act_heart", name: "Advanced heart disease", sql: 0.6304, sql_scorecard: 0.5766, sql_qwen: 0.7114, sql_glm: 0.711, sc_qwen: 0.5766, sc_glm: 0.5801, direct_qwen: 0.804, direct_glm: 0.768 },
  { task: "act_lung", name: "Advanced lung disease", sql: 0.4483, sql_scorecard: 0.4364, sql_qwen: 0.4493, sql_glm: 0.4541, sc_qwen: 0.464, sc_glm: 0.488, direct_qwen: 0.471, direct_glm: 0.491 },
  { task: "act_neurologic", name: "Chronic neurological dystrophies", sql: 0.5806, sql_scorecard: 0.5369, sql_qwen: 0.5801, sql_glm: 0.5958, sc_qwen: 0.5308, sc_glm: 0.5489, direct_qwen: 0.76, direct_glm: 0.72 },
  { task: "act_obesity", name: "Obesity", sql: 0.7391, sql_scorecard: 0.7391, sql_qwen: 0.7339, sql_glm: 0.7339, sc_qwen: 0.7391, sc_glm: 0.7446, direct_qwen: 0.76, direct_glm: 0.808 },
  { task: "act_pain", name: "Chronic pain", sql: 0.541, sql_scorecard: 0.5366, sql_qwen: 0.5355, sql_glm: 0.5391, sc_qwen: 0.5399, sc_glm: 0.5374, direct_qwen: 0.594, direct_glm: 0.672 },
  { task: "act_psychiatric", name: "Psychiatric disorders", sql: 0.7846, sql_scorecard: 0.7402, sql_qwen: 0.7959, sql_glm: 0.8071, sc_qwen: 0.7835, sc_glm: 0.8007, direct_qwen: 0.838, direct_glm: 0.703 },
  { task: "act_substance", name: "Substance abuse", sql: 0.6207, sql_scorecard: 0.5974, sql_qwen: 0.6361, sql_glm: 0.6327, sc_qwen: 0.6033, sc_glm: 0.6059, direct_qwen: 0.738, direct_glm: 0.725 },
  { task: "lcd_mortality30", name: "LCD 30-day mortality", sql: 0.2821, sql_scorecard: 0.302, sql_qwen: 0.2815, sql_glm: 0.2771, sc_qwen: 0.3098, sc_glm: 0.3144, direct_qwen: 0.309, direct_glm: 0.218 },
];

export const ACT = SUMMARY.filter((r) => r.task.startsWith("act_"));
type Key = Exclude<keyof Row, "task" | "name">;
export const macro = (k: Key) => ACT.reduce((s, r) => s + r[k], 0) / ACT.length;
const SQL_KEYS: Key[] = ["sql", "sql_scorecard", "sql_qwen", "sql_glm", "sc_qwen", "sc_glm"];
export const bestSql = (r: Row) => Math.max(...SQL_KEYS.map((k) => r[k]));
export const bestDirect = (r: Row) => Math.max(r.direct_qwen, r.direct_glm);
export const f3 = (x: number) => x.toFixed(3);

// EMS Boolean program (atlas PROGRAMS.ems.sql), first routes in listing order, with held-out
// test TP/FP per route. Route counts overlap: a record can match several routes.
export const EMS_ROUTES = [
  { rule: "phrase('suicide attempt', except ⇒ ('behavior suicide attempt')) AND phrase('t14.91')", tp: 29, fp: 1 },
  { rule: "like(' appro(priate|ximately) ') AND phrase('overdose')", tp: 10, fp: 2 },
  { rule: "like(' unde(r|rdosing|termined) ') AND phrase('overdose')", tp: 21, fp: 2 },
  { rule: "phrase('ingestion') AND phrase('took')", tp: 15, fp: 0 },
  { rule: "phrase('intentional') AND phrase('self')", tp: 19, fp: 2 },
  { rule: "phrase('poisoning') AND phrase('took')", tp: 21, fp: 3 },
];

// LCD SQL scorecard, exploratory task: threshold 366, 139 terms. The ten-term excerpt is the
// one the manuscript reports (Results, program excerpts).
export const LCD_TERMS = [
  { term: "hospice", points: 100 }, { term: "comfort", points: 97 }, { term: "dnr", points: 88 },
  { term: "metastatic", points: 60 }, { term: "palliative", points: 48 }, { term: "shower", points: -29 },
  { term: "ambulating", points: -28 }, { term: "ambulatory independent", points: -27 },
  { term: "take your", points: -27 }, { term: "ambulatory", points: -24 },
];
export const LCD_THRESHOLD = 366;
export const LCD_TERM_COUNT = 139;

// EMS held-out test results (manuscript Results and Table 2).
export const EMS = {
  test: { records: 275, positives: 84 },
  program: { f1: 0.8, ci: [0.726, 0.865], precision: 0.87, recall: 0.74 },
  ncDetect: { f1: 0.8, ci: [0.731, 0.857], precision: 0.75, recall: 0.857 },
  scorecard: { f1: 0.833, ci: [0.767, 0.89] },
  t1491: { f1: 0.509, ci: [0.396, 0.618] },
  withoutT1491: { positives: 55, program: 33, scorecard: 41 },
};

// Final-program execution checks (manuscript Table 4): SQLite against the CaseDistiller-Lite
// evaluator on all EMS and ACT test records and the first 1,500 LCD test records.
export const EXECUTION = [
  { task: "EMS", agree: 18, total: 18, scope: "all 275 test records" },
  { task: "ACT", agree: 140, total: 140, scope: "all 322 test summaries" },
  { task: "LCD", agree: 14, total: 14, scope: "first 1,500 test notes" },
];

// ---------------------------------------------------------------------------------------
// FOIL route-growth ILLUSTRATION. Synthetic training counts constructed for teaching; these
// are NOT reported EMS training results. Everything shown in the Foil scene derives from here.
export const FOIL_START = { route: "phrase('poisoning')", p: 20, n: 20 };
export const FOIL_ADDITIONS = [
  { id: "took", label: "AND phrase('took')", p: 16, n: 4 },
  { id: "other", label: "AND another candidate term", p: 12, n: 2 },
  { id: "rare", label: "AND a rare candidate term", p: 3, n: 0 },
];
// CaseDistiller growth settings reported in the manuscript (not universal FOIL properties).
export const FOIL_RULES = { minRetained: 0.5, minPositives: 2, seMultiplier: 1.5, maxConjuncts: 3 };

export const precision = (p: number, n: number) => p / (p + n);
// FOIL gain = p1 · log2(P1 / P0), with P = p / (p + n).
export const foilGain = (p0: number, n0: number, p1: number, n1: number) =>
  p1 * Math.log2(precision(p1, n1) / precision(p0, n0));
export const foilCheck = (add: { p: number; n: number }) => {
  const P0 = precision(FOIL_START.p, FOIL_START.n), P1 = precision(add.p, add.n);
  const retainedOk = add.p >= FOIL_RULES.minRetained * FOIL_START.p && add.p >= FOIL_RULES.minPositives;
  const precisionOk = P1 - P0 >= FOIL_RULES.seMultiplier * Math.sqrt((P0 * (1 - P0)) / (add.p + add.n));
  return {
    precision: P1, retained: add.p / FOIL_START.p, gain: foilGain(FOIL_START.p, FOIL_START.n, add.p, add.n),
    retainedOk, precisionOk, eligible: retainedOk && precisionOk,
  };
};
