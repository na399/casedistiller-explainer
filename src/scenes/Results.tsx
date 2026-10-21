import React from "react";
import { useCurrentFrame } from "remotion";
import { C, S, T } from "../theme";
import { Bar, Caption, Claim, Code, Count, DataLine, Em, Fade, Header, Kicker, prog, s, Slide } from "../components/ui";
import { ACT, bestDirect, bestSql, f3, macro } from "../data";

// 9 · EMS against the hand-written definition
export const Ems: React.FC = () => {
  const frame = useCurrentFrame();
  const total = 55, found = 33, cols = 11;
  return (
    <Slide>
      <Header kicker="Result · EMS suicide attempt" width={1100} size={48}>
        On EMS, the learned program <Em at={s(1.2)}>matches</Em> the hand-written definition.
      </Header>
      <div style={{ position: "absolute", top: 200, left: 0, width: 470, display: "grid", gridTemplateColumns: "1fr 1fr", gap: S.s4 }}>
        <Fade at={s(1.8)}>
          <div style={{ ...T.numeralL, color: C.teal }}><Count to={0.8} at={s(1.8)} /></div>
          <Caption style={{ color: C.ink, marginTop: S.s3 }}>SQL program, learned</Caption>
        </Fade>
        <Fade at={s(3)}>
          <div style={{ ...T.numeralL, color: C.ink }}><Count to={0.8} at={s(3)} /></div>
          <Caption style={{ color: C.ink, marginTop: S.s3 }}>NC DETECT, hand-written</Caption>
        </Fade>
        <Fade at={s(4.4)} style={{ gridColumn: "1 / span 2", display: "grid", gap: 4, borderTop: `1px solid ${C.rule}`, paddingTop: S.s3 }}>
          <DataLine>test F1 · 275 records, 84 attempts</DataLine>
          <DataLine>SQL program 95% CI 0.726–0.865</DataLine>
          <DataLine>paired difference −0.076 to 0.075</DataLine>
          <DataLine>T14.91 code alone: F1 0.509</DataLine>
        </Fade>
      </div>
      <div style={{ position: "absolute", top: 200, left: 600, width: 552 }}>
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
            <span style={{ ...T.body, fontSize: 18 }}>of 55 test attempts with no T14.91 code were still found by the SQL program</span>
          </div>
        </Fade>
      </div>
    </Slide>
  );
};

// 10 · ACT macro-F1
export const Act: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { label: "SQL scorecard", vals: [macro("sql_scorecard")], color: C.blue },
    { label: "SQL program", vals: [macro("sql")], color: C.blue },
    { label: "Agent-refined SQL program", sub: "Qwen / GLM", vals: [macro("sql_qwen"), macro("sql_glm")], color: C.teal },
    { label: "Direct LLM classification", sub: "Qwen / GLM, every note", vals: [macro("direct_qwen"), macro("direct_glm")], color: C.dot },
  ];
  const max = 0.8, W = 400;
  const gap = macro("direct_glm") - macro("sql_glm");
  return (
    <Slide>
      <Header kicker="Result · ACT, ten phenotypes" width={1100} size={48}>
        Agents bring ACT to within <Em at={s(1.2)}>0.015</Em> of direct LLM classification.
      </Header>
      <div style={{ position: "absolute", top: 180, left: 0, width: 780 }}>
        <Fade at={s(1.4)}><Caption style={{ paddingBottom: S.s3 }}>Macro-F1 over ten phenotypes, test split (agents: mean of 3 runs)</Caption></Fade>
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
                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: S.s3 }}>
                    <div style={{ display: "grid", gap: 4 }}>
                      {r.vals.map((v, j) => (
                        <Bar key={j} value={v} max={max} width={W} height={r.vals.length > 1 ? 17 : 38} color={r.color} at={at + 4 + j * 4} />
                      ))}
                    </div>
                    <span style={{ ...T.numeralM, fontSize: 30, whiteSpace: "nowrap" }}>{r.vals.map(f3).join(" / ")}</span>
                    {i === rows.length - 1 && (
                      // The remaining gap: from the GLM agent bar end to the GLM direct bar end.
                      <div style={{ position: "absolute", left: (macro("sql_glm") / max) * W, top: -46, opacity: prog(frame, s(8), 18) }}>
                        <div style={{ width: 2, height: 88, background: C.coral }} />
                        <div style={{ width: (gap / max) * W + 2, height: 3, background: C.coral }} />
                        <div style={{ ...T.title, fontSize: 24, color: C.coral, marginTop: 4, marginLeft: -20 }}>{f3(gap)} gap</div>
                      </div>
                    )}
                  </div>
                </div>
              </Fade>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", top: 200, left: 840, width: 312, display: "grid", gap: S.s5 }}>
        <Fade at={s(9)}>
          <div style={{ ...T.numeralM, color: C.ink }}>10 of 60</div>
          <div style={{ ...T.body, marginTop: S.s2 }}>agent runs from the SQL program were significantly better than their start. None was worse.</div>
        </Fade>
        <Fade at={s(11)}>
          <div style={{ ...T.numeralM, fontSize: 40, color: C.tealDeep }}>0.630 → 0.711</div>
          <div style={{ ...T.body, marginTop: S.s2 }}>advanced heart disease, mean of three agent runs; the SQL program had high precision and low recall</div>
        </Fade>
      </div>
    </Slide>
  );
};

// 11 · Where each approach leads
export const Split: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [...ACT].sort((a, b) => bestSql(b) - bestDirect(b) - (bestSql(a) - bestDirect(a)));
  const lo = 0.4, hi = 0.9, X = 330, W = 560;
  const x = (v: number) => X + ((v - lo) / (hi - lo)) * W;
  const sqlLeads = rows.filter((r) => bestSql(r) > bestDirect(r)).length;
  return (
    <Slide>
      <Header kicker="Result · per phenotype" width={1100} size={48}>
        SQL leads on {sqlLeads} phenotypes; direct LLM leads on {rows.length - sqlLeads}.
      </Header>
      <svg width={1152} height={400} style={{ position: "absolute", top: 140, left: 0 }}>
        <g opacity={prog(frame, s(1.2), 16)}>
          <circle cx={X} cy={10} r={7} fill={C.teal} />
          <text x={X + 14} y={15} style={{ ...T.caption }} fill={C.ink}>best SQL setup</text>
          <circle cx={X + 170} cy={10} r={7} fill={C.paper} stroke={C.blue} strokeWidth={2.5} />
          <text x={X + 184} y={15} style={{ ...T.caption }} fill={C.ink}>better direct LLM</text>
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
                {d > 0 ? "SQL +" : "LLM +"}{Math.abs(d).toFixed(3)}
              </text>
            </g>
          );
        })}
      </svg>
      <Fade at={s(7)} style={{ position: "absolute", bottom: 0, left: 0 }}>
        <DataLine>Best of six SQL setups against the better of two direct models · test F1 · the campaigns are not paired, so gaps are descriptive</DataLine>
      </Fade>
    </Slide>
  );
};

// 12 · Deployment and review
export const Audit: React.FC = () => (
  <Slide>
    <Header kicker="Deployment and review" width={1100} size={48}>
      Every program runs as plain SQL. Every route can be <Em at={s(1.2)}>reviewed</Em>.
    </Header>
    <div style={{ position: "absolute", top: 210, left: 0, width: 520 }}>
      <Fade at={s(1.8)}>
        <div style={{ display: "flex", alignItems: "baseline", gap: S.s3 }}>
          <span style={{ ...T.numeralXl, color: C.teal }}>172</span>
          <span style={{ ...T.title, color: C.ink }}>of 172</span>
        </div>
        <div style={{ ...T.lede, marginTop: S.s4, maxWidth: 480 }}>
          frozen programs ran in SQLite with no added function and selected exactly the evaluator&rsquo;s cohort
        </div>
      </Fade>
    </div>
    <div style={{ position: "absolute", top: 210, left: 600, width: 552, display: "grid", gap: S.s3 }}>
      <Fade at={s(5)}>
        <div style={{ display: "flex", alignItems: "baseline", gap: S.s3 }}>
          <span style={{ ...T.numeralL, fontSize: 80, color: C.coral }}>11</span>
          <span style={{ ...T.title, fontSize: 26 }}>of 64 routes</span>
        </div>
        <div style={{ ...T.body, fontSize: 18, marginTop: S.s2 }}>in the EMS and ACT SQL programs were flagged as candidate shortcuts</div>
      </Fade>
      <Fade at={s(7.4)}>
        <Code style={{ fontSize: 15, lineHeight: "22px" }}>like(' unde(r|rdosing|termined) ') AND phrase('overdose')</Code>
        <Caption style={{ marginTop: S.s2 }}>
          Joins unrelated words that share a prefix · 23 test fires, 21 positive · removing it is a one-line edit
        </Caption>
      </Fade>
    </div>
    <Fade at={s(10)} style={{ position: "absolute", bottom: 0, left: 0 }}>
      <DataLine>Agents rarely removed inherited shortcuts, so removal stays a reviewer task.</DataLine>
    </Fade>
  </Slide>
);

// 13 · Close
export const Close: React.FC = () => (
  <Slide fadeOut={false}>
    <div style={{ position: "absolute", top: 120, left: 0, width: 900, display: "grid", gap: S.s4 }}>
      <Fade at={0}><Kicker>CaseDistiller</Kicker></Fade>
      <Fade at={8}>
        <Claim width={900} size={60}>
          Accurate enough, <Em at={s(1)}>auditable</Em>, and CPU-only.
        </Claim>
      </Fade>
      <Fade at={s(1.8)}>
        <div style={{ ...T.lede, color: C.inkMuted, maxWidth: 780 }}>
          SQL programs learned from the words of labeled notes, refined by LLM agents only while they are built, and reviewed route by route before deployment.
        </div>
      </Fade>
    </div>
    <Fade at={s(3)} style={{ position: "absolute", left: 0, bottom: 0, display: "grid", gap: 6 }}>
      <div style={{ ...T.code, fontSize: 20, color: C.ink }}>github.com/VACLab/CaseDistiller</div>
    </Fade>
  </Slide>
);
