// Numbers from the CaseDistiller Results Atlas (SUMMARY block, status 20 October 2026)
// and from manuscript.md (abstract, Results, Figure 4, Supplementary Table S3).
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

// EMS SQL program (atlas PROGRAMS.ems.sql), first routes in listing order.
export const EMS_ROUTES = [
  { rule: "phrase('suicide attempt', except ⇒ ('behavior suicide attempt')) AND phrase('t14.91')", tp: 29, fp: 1 },
  { rule: "like(' appro(priate|ximately) ') AND phrase('overdose')", tp: 10, fp: 2 },
  { rule: "like(' unde(r|rdosing|termined) ') AND phrase('overdose')", tp: 21, fp: 2 },
  { rule: "phrase('ingestion') AND phrase('took')", tp: 15, fp: 0 },
  { rule: "phrase('intentional') AND phrase('self')", tp: 19, fp: 2 },
  { rule: "phrase('poisoning') AND phrase('took')", tp: 21, fp: 3 },
];

// LCD SQL scorecard (atlas PROGRAMS.lcd.sql_scorecard): threshold 366, 139 terms.
export const LCD_TERMS = [
  { term: "hospice", points: 100 }, { term: "comfort", points: 97 }, { term: "dnr", points: 88 },
  { term: "metastatic", points: 60 }, { term: "palliative", points: 48 }, { term: "facility", points: 41 },
  { term: "goals of", points: 35 }, { term: "shower", points: -29 }, { term: "ambulating", points: -28 },
];
