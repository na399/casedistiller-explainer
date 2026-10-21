import React from "react";
import { useCurrentFrame } from "remotion";
import { C, S, T } from "../theme";
import { Bar, Caption, Claim, Count, DataLine, Em, Fade, Header, Kicker, prog, s, Slide } from "../components/ui";
import { ACT, bestDirect, bestSql, EMS, EXECUTION, f3, macro } from "../data";
import { TITLE } from "./Intro";

const ci = (c: number[]) => `${f3(c[0])}–${f3(c[1])}`;

// 14 · EMS: the learned program and NC DETECT share an F1 point estimate
export const Ems: React.FC = () => {
  const frame = useCurrentFrame();
  const { total, found, cols } = { total: EMS.withoutT1491.positives, found: EMS.withoutT1491.program, cols: 11 };
  return (
    <Slide>
      <Header kicker="Result · EMS suspected suicide attempt" width={1100} size={44}>
        The learned program and NC DETECT have <Em at={s(1.2)}>the same F1 point estimate</Em>.
      </Header>
      <div style={{ position: "absolute", top: 180, left: 0, width: 520, display: "grid", gridTemplateColumns: "1fr 1fr", gap: S.s4 }}>
        <Fade at={s(1.8)}>
          <div style={{ ...T.numeralL, color: C.teal }}><Count to={EMS.program.f1} at={s(1.8)} /></div>
          <Caption style={{ color: C.ink, marginTop: S.s2 }}>Boolean program, learned</Caption>
          <DataLine>95% CI {ci(EMS.program.ci)}</DataLine>
          <DataLine>precision {EMS.program.precision.toFixed(2)} · recall {EMS.program.recall.toFixed(2)}</DataLine>
        </Fade>
        <Fade at={s(3)}>
          <div style={{ ...T.numeralL, color: C.ink }}><Count to={EMS.ncDetect.f1} at={s(3)} /></div>
          <Caption style={{ color: C.ink, marginTop: S.s2 }}>NC DETECT, published</Caption>
          <DataLine>95% CI {ci(EMS.ncDetect.ci)}</DataLine>
          <DataLine>precision {EMS.ncDetect.precision.toFixed(2)} · recall {EMS.ncDetect.recall.toFixed(2)}</DataLine>
        </Fade>
        <Fade at={s(4.6)} style={{ gridColumn: "1 / span 2", display: "grid", gap: 4, borderTop: `1px solid ${C.rule}`, paddingTop: S.s3 }}>
          <DataLine>SQL scorecard: F1 {f3(EMS.scorecard.f1)} (95% CI {ci(EMS.scorecard.ci)})</DataLine>
          <DataLine>T14.91 code alone: F1 {f3(EMS.t1491.f1)} (95% CI {ci(EMS.t1491.ci)})</DataLine>
          <DataLine>held-out test · {EMS.test.records} encounters, {EMS.test.positives} positive</DataLine>
        </Fade>
      </div>
      <div style={{ position: "absolute", top: 190, left: 600, width: 552 }}>
        <Fade at={s(5.4)}>
          <svg width={552} height={250}>
            {Array.from({ length: total }).map((_, i) => {
              const c = i % cols, r = Math.floor(i / cols);
              const on = frame > s(6.6) + i * 3 && i < found;
              return (
                <circle key={i} cx={22 + c * 46} cy={22 + r * 46} r={16}
                  fill={on ? C.coral : "none"} stroke={on ? C.coral : C.dot} strokeWidth={2} />
              );
            })}
          </svg>
        </Fade>
        <Fade at={s(6)}>
          <div style={{ display: "flex", alignItems: "baseline", gap: S.s3 }}>
            <span style={{ ...T.numeralM, color: C.coral }}><Count to={found} at={s(6.6)} dur={found * 3} digits={0} /></span>
            <span style={{ ...T.body, fontSize: 18 }}>of {total} positive test encounters without the T14.91 code were identified by the Boolean program</span>
          </div>
          <Caption style={{ marginTop: S.s2 }}>Other structured fields, such as complaint, impression and injury cause, can still be present. The scorecard identified {EMS.withoutT1491.scorecard}.</Caption>
        </Fade>
      </div>
    </Slide>
  );
};

// 15 · ACT macro-F1 after refinement
export const Act: React.FC = () => {
  const rows = [
    { label: "SQL scorecard", vals: [macro("sql_scorecard")], color: C.blue },
    { label: "Boolean program", sub: "learned starting program", vals: [macro("sql")], color: C.blue },
    { label: "After agent refinement", sub: "Qwen / GLM · mean of 3 runs", vals: [macro("sql_qwen"), macro("sql_glm")], color: C.teal },
    { label: "Direct LLM classification", sub: "Qwen / GLM · descriptive", vals: [macro("direct_qwen"), macro("direct_glm")], color: C.dot },
  ];
  const max = 0.8, W = 400;
  return (
    <Slide>
      <Header kicker="Result · ACT, ten phenotypes" width={1100} size={44}>
        Refinement raised Boolean-program macro-F1 from <Em at={s(1.2)}>0.660 to 0.676 and 0.680</Em>.
      </Header>
      <div style={{ position: "absolute", top: 180, left: 0, width: 780 }}>
        <Fade at={s(1.4)}><Caption style={{ paddingBottom: S.s3 }}>Macro-F1 over ten phenotypes, held-out test split</Caption></Fade>
        <div style={{ display: "grid", gap: 26 }}>
          {rows.map((r, i) => {
            const at = s(1.8) + i * s(1.4);
            return (
              <Fade key={r.label} at={at}>
                <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", alignItems: "center", gap: S.s3 }}>
                  <div>
                    <div style={{ ...T.body, fontSize: 17, fontWeight: 700 }}>{r.label}</div>
                    {r.sub && <Caption>{r.sub}</Caption>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: S.s3 }}>
                    <div style={{ display: "grid", gap: 4 }}>
                      {r.vals.map((v, j) => (
                        <Bar key={j} value={v} max={max} width={W} height={r.vals.length > 1 ? 17 : 38} color={r.color} at={at + 4 + j * 4} />
                      ))}
                    </div>
                    <span style={{ ...T.numeralM, fontSize: 30, whiteSpace: "nowrap" }}>{r.vals.map(f3).join(" / ")}</span>
                  </div>
                </div>
              </Fade>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", top: 196, left: 840, width: 312, display: "grid", gap: S.s5 }}>
        <Fade at={s(9)}>
          <div style={{ ...T.numeralM, color: C.coral }}>10 of 60</div>
          <div style={{ ...T.body, fontSize: 17, marginTop: S.s2 }}>refinement runs from ACT Boolean programs had statistically significant increases; no significant decrease was detected in that group.</div>
        </Fade>
        <Fade at={s(11)}>
          <div style={{ ...T.numeralM, fontSize: 38, color: C.tealDeep }}>0.630 → 0.711</div>
          <div style={{ ...T.body, fontSize: 16, marginTop: S.s2 }}>advanced heart disease, mean of agent runs; all six runs increased significantly</div>
        </Fade>
      </div>
      <Fade at={s(12)} style={{ position: "absolute", bottom: 0, left: 0 }}>
        <DataLine>Per-run paired comparisons are exploratory and unadjusted. Comparisons with direct classification are descriptive.</DataLine>
      </Fade>
    </Slide>
  );
};

// 16 · Performance varies by phenotype (descriptive)
export const Split: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [...ACT].sort((a, b) => bestSql(b) - bestDirect(b) - (bestSql(a) - bestDirect(a)));
  const lo = 0.4, hi = 0.9, X = 330, W = 560;
  const x = (v: number) => X + ((v - lo) / (hi - lo)) * W;
  const sqlLeads = rows.filter((r) => bestSql(r) > bestDirect(r)).length;
  return (
    <Slide>
      <Header kicker="Result · per phenotype" width={1100} size={44}>
        Performance <Em at={s(1.2)}>varied by phenotype</Em>.
      </Header>
      <Fade at={s(0.8)} style={{ position: "absolute", top: 92, left: 0 }}>
        <div style={{ ...T.body, fontSize: 17, color: C.inkMuted }}>
          Highest observed SQL F1 exceeded both direct models on {sqlLeads} phenotypes; a direct model was higher on {rows.length - sqlLeads}.
        </div>
      </Fade>
      <svg width={1152} height={400} style={{ position: "absolute", top: 140, left: 0 }}>
        <g opacity={prog(frame, s(1.2), 16)}>
          <circle cx={X} cy={10} r={7} fill={C.teal} />
          <text x={X + 14} y={15} style={{ ...T.caption }} fill={C.ink}>highest observed SQL condition</text>
          <circle cx={X + 250} cy={10} r={7} fill={C.paper} stroke={C.blue} strokeWidth={2.5} />
          <text x={X + 264} y={15} style={{ ...T.caption }} fill={C.ink}>better of two direct models</text>
          {[0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((v) => (
            <text key={v} x={x(v)} y={52 + 9 * 34 + 34} textAnchor="middle" style={{ ...T.data, fontSize: 12 }} fill={C.inkMuted}>{v.toFixed(1)}</text>
          ))}
        </g>
        {rows.map((r, i) => {
          const y = 52 + i * 34;
          const p = prog(frame, s(1.8) + i * 8, 18);
          const a = bestSql(r), b = bestDirect(r);
          const d = a - b;
          return (
            <g key={r.task} opacity={p}>
              <line x1={0} x2={1152} y1={y + 17} y2={y + 17} stroke={C.rule} strokeWidth={1} />
              <text x={0} y={y + 5} style={{ ...T.body, fontSize: 16 }} fill={C.ink}>{r.name}</text>
              <line x1={x(Math.min(a, b))} x2={x(Math.min(a, b)) + Math.abs(x(a) - x(b)) * p} y1={y} y2={y} stroke={C.dot} strokeWidth={3} />
              <circle cx={x(b)} cy={y} r={8} fill={C.paper} stroke={C.blue} strokeWidth={2.5} />
              <circle cx={x(a)} cy={y} r={8} fill={C.teal} />
              <text x={1152} y={y + 5} textAnchor="end" style={{ ...T.data, fontSize: 14 }} fill={C.ink}>
                {d > 0 ? "SQL +" : "direct +"}{Math.abs(d).toFixed(3)}
              </text>
            </g>
          );
        })}
      </svg>
      <Fade at={s(7)} style={{ position: "absolute", bottom: 0, left: 0 }}>
        <DataLine>Retrospective maxima: six SQL conditions, two direct models · held-out test F1 · descriptive, not evidence of cause</DataLine>
      </Fade>
    </Slide>
  );
};

// 17 · Execution: the exported SQL reproduces the evaluator's predictions on the checked records
export const Execution: React.FC = () => {
  const frame = useCurrentFrame();
  const lane = (y: number, at: number, title: string, sub: string, fill: string) => (
    <g opacity={prog(frame, at, 16)}>
      <rect x={300} y={y} width={300} height={72} rx={14} fill={fill} />
      <text x={320} y={y + 32} style={{ ...T.title, fontSize: 20 }} fill={C.ink}>{title}</text>
      <text x={320} y={y + 55} style={{ ...T.caption, fontSize: 13 }} fill={C.ink}>{sub}</text>
      <path d={`M232 ${y + 36} L292 ${y + 36}`} stroke={C.blue} strokeWidth={1.5} />
      <path d={`M285 ${y + 29} L293 ${y + 36} L285 ${y + 43}`} stroke={C.blue} strokeWidth={1.5} fill="none" />
      <path d={`M604 ${y + 36} L664 ${y + 36}`} stroke={C.blue} strokeWidth={1.5} />
      <path d={`M657 ${y + 29} L665 ${y + 36} L657 ${y + 43}`} stroke={C.blue} strokeWidth={1.5} fill="none" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={672 + i * 22} y={y + 26} width={16} height={20} fill={[1, 4, 5].includes(i) ? C.blue : C.paperSunk} />
      ))}
    </g>
  );
  return (
    <Slide>
      <Header kicker="Execution check" width={1100} size={44}>
        The exported SQL <Em at={s(1.2)}>reproduced the evaluator&rsquo;s predictions</Em> on the checked records.
      </Header>
      <svg width={1152} height={240} style={{ position: "absolute", top: 150, left: 0 }}>
        <g opacity={prog(frame, s(1.6), 16)}>
          <rect x={0} y={60} width={220} height={108} rx={14} fill={C.paperSunk} />
          <text x={18} y={92} style={{ ...T.title, fontSize: 19 }} fill={C.ink}>Same final program</text>
          <text x={18} y={118} style={{ ...T.caption, fontSize: 13 }} fill={C.ink}>and the same checked</text>
          <text x={18} y={136} style={{ ...T.caption, fontSize: 13 }} fill={C.ink}>held-out records</text>
        </g>
        {lane(18, s(2.6), "SQLite", "the exported SQL query", C.blueSoft)}
        {lane(132, s(3.4), "Reference evaluator", "CaseDistiller-Lite", C.oak)}
        <g opacity={prog(frame, s(4.4), 16)}>
          <text x={870} y={124} style={{ ...T.title, fontSize: 22 }} fill={C.tealDeep}>binary predictions</text>
          <text x={870} y={150} style={{ ...T.title, fontSize: 22 }} fill={C.tealDeep}>identical</text>
        </g>
      </svg>
      <div style={{ position: "absolute", top: 400, left: 0, width: 1152, display: "grid", gridTemplateColumns: "300px 1fr", gap: S.s5, alignItems: "start" }}>
        <Fade at={s(5.4)}>
          <div style={{ display: "flex", alignItems: "baseline", gap: S.s3 }}>
            <span style={{ ...T.numeralL, color: C.teal }}>172</span>
            <span style={{ ...T.title, fontSize: 24 }}>of 172</span>
          </div>
          <Caption>final programs agreed on every checked record</Caption>
        </Fade>
        <Fade at={s(6.4)} style={{ display: "grid", gap: 6, paddingTop: S.s2 }}>
          {EXECUTION.map((e) => (
            <div key={e.task} style={{ display: "grid", gridTemplateColumns: "60px 90px 1fr", ...T.body, fontSize: 16 }}>
              <b>{e.task}</b><span>{e.agree} / {e.total}</span><span style={{ color: C.inkMuted }}>{e.scope}</span>
            </div>
          ))}
        </Fade>
      </div>
      <Fade at={s(8)} style={{ position: "absolute", bottom: 0, left: 0 }}>
        <DataLine>Execution consistency on these records and this engine; not cross-engine equivalence, clinical validity, or usability.</DataLine>
      </Fade>
    </Slide>
  );
};

// 18 · Close
export const Close: React.FC = () => (
  <Slide fadeOut={false}>
    <div style={{ position: "absolute", top: 110, left: 0, width: 960, display: "grid", gap: S.s4 }}>
      <Fade at={0}><Kicker>CaseDistiller</Kicker></Fade>
      <Fade at={8}>
        <Claim width={960} size={54}>
          Explicit classifiers, optional LLM refinement, <Em at={s(1)}>native SQL</Em>.
        </Claim>
      </Fade>
      <Fade at={s(1.8)}>
        <div style={{ ...T.lede, color: C.inkMuted, maxWidth: 820 }}>
          Learned from labeled clinical records, refined by an LLM only during construction if chosen, and exported as SQL with no LLM at deployment. Applying a classifier in another setting requires evaluation there.
        </div>
      </Fade>
    </div>
    <Fade at={s(3)} style={{ position: "absolute", left: 0, bottom: 0, width: 760 }}>
      <Caption>{TITLE}</Caption>
    </Fade>
  </Slide>
);
