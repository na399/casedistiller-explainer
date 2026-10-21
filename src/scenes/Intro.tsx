import React from "react";
import { useCurrentFrame } from "remotion";
import { C, S, T } from "../theme";
import { Caption, Claim, Code, DataLine, Em, Fade, Header, Kicker, Panel, prog, Reveal, s, Slide, superellipse } from "../components/ui";
import { EMS_ROUTES } from "../data";

export const TITLE =
  "CaseDistiller: Learning SQL-Executable Case Definitions from Clinical Records with Construction-Time Large Language Model Refinement";

// 1 · Cover: labeled records and definition-derived seeds, as separate inputs, become one query.
export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Slide>
      <div style={{ position: "absolute", left: 0, top: 70, width: 660, display: "grid", gap: S.s4 }}>
        <Fade at={0}><Kicker>CaseDistiller · case identification from clinical records</Kicker></Fade>
        <Fade at={8}>
          <Claim width={660} size={58}>
            Explicit case criteria, learned from records and <Em at={s(1.4)}>exported as SQL</Em>.
          </Claim>
        </Fade>
        <Fade at={s(2.2)}>
          <div style={{ ...T.lede, color: C.inkMuted, maxWidth: 580 }}>
            Learned from labeled records and definition-derived seeds. Optional LLM refinement during construction. No LLM at deployment.
          </div>
        </Fade>
      </div>
      {/* Carolina slab: labeled records and definition seeds condense into one query */}
      <div style={{ position: "absolute", right: 0, top: 0, width: 400, height: 592, opacity: prog(frame, 4, 20) }}>
        <svg width={400} height={592}>
          <path d={superellipse(400, 592, 5)} fill={C.teal} />
          <text x={52} y={58} fill={C.onCool} style={{ ...T.kicker, fontSize: 12 }}>LABELED RECORDS</text>
          {Array.from({ length: 10 }).map((_, i) => {
            const col = i % 5, row = Math.floor(i / 5);
            const p = prog(frame, s(1) + i * 3, 14);
            const positive = [0, 3, 4, 7].includes(i);
            return (
              <g key={i} opacity={p} transform={`translate(${52 + col * 62}, ${74 + row * 74})`}>
                <rect width={44} height={56} rx={8} fill={C.onCool} />
                {[14, 24, 34].map((y, j) => (
                  <rect key={y} x={8} y={y - 4} width={j === 2 ? 16 : 28} height={3} fill={C.tealSoft} />
                ))}
                {/* the label: filled for a positive record, open for a negative */}
                <circle cx={34} cy={46} r={5} fill={positive ? C.blue : C.onCool} stroke={C.blue} strokeWidth={1.5} />
              </g>
            );
          })}
          <g opacity={prog(frame, s(2.4), 16)}>
            <text x={52} y={250} fill={C.onCool} style={{ ...T.kicker, fontSize: 12 }}>DEFINITION SEEDS</text>
            <rect x={52} y={262} width={140} height={32} rx={8} fill={C.blueSoft} />
            <text x={62} y={283} fill={C.ink} style={{ ...T.code, fontSize: 13 }}>suicide attempt</text>
            <rect x={202} y={262} width={92} height={32} rx={8} fill={C.blueSoft} />
            <text x={212} y={283} fill={C.ink} style={{ ...T.code, fontSize: 13 }}>t14.91</text>
          </g>
          <g opacity={prog(frame, s(3), 18)}>
            <path d="M200 316 L200 386" stroke={C.onCool} strokeWidth={1.5} />
            <path d="M190 376 L200 390 L210 376" stroke={C.onCool} strokeWidth={1.5} fill="none" />
          </g>
          <g opacity={prog(frame, s(3.6), 18)}>
            <rect x={52} y={414} width={296} height={84} rx={14} fill={C.blue} />
            <text x={200} y={466} textAnchor="middle" fill={C.onCool} style={{ ...T.code, fontSize: 24, fontWeight: 500 }}>
              SELECT … WHERE
            </text>
          </g>
        </svg>
      </div>
      <Fade at={s(4.2)} style={{ position: "absolute", left: 0, bottom: 0, width: 620 }}>
        <Caption>{TITLE}</Caption>
      </Fade>
    </Slide>
  );
};

// 3 · Construction (CaseDistiller-Lite, optional CaseDistiller-Agentic) and deployment
export const Approach: React.FC = () => {
  const frame = useCurrentFrame();
  const Box: React.FC<{ at: number; w: number; h: number; fill: string; kicker: string; title: string; body: string; foot?: React.ReactNode }> = ({
    at, w, h, fill, kicker, title, body, foot,
  }) => (
    <Fade at={at}>
      <Panel w={w} h={h} fill={fill} pad={24}>
        <div style={{ display: "grid", gap: S.s2 + 2, alignContent: "start" }}>
          <span style={{ ...T.kicker, color: C.ink }}>{kicker}</span>
          <div style={{ ...T.title, fontSize: 25 }}>{title}</div>
          <div style={{ ...T.body, fontSize: 16, lineHeight: "23px" }}>{body}</div>
          {foot}
        </div>
      </Panel>
    </Fade>
  );
  const top = 196;
  return (
    <Slide>
      <Header kicker="The approach" width={1100} size={44}>
        Learn the classifier on a CPU, optionally refine it with an LLM, and <Em at={s(1.2)}>deploy it as SQL</Em>.
      </Header>
      {/* stage labels */}
      <Fade at={s(1.4)} style={{ position: "absolute", top: top - 30, left: 0, width: 760, borderBottom: `1px solid ${C.rule}`, paddingBottom: 6 }}>
        <span style={{ ...T.kicker, color: C.inkMuted }}>Construction</span>
      </Fade>
      <Fade at={s(1.4)} style={{ position: "absolute", top: top - 30, left: 820, width: 332, borderBottom: `1px solid ${C.rule}`, paddingBottom: 6 }}>
        <span style={{ ...T.kicker, color: C.inkMuted }}>Deployment</span>
      </Fade>
      <div style={{ position: "absolute", top, left: 0 }}>
        <Box at={s(1.8)} w={320} h={330} fill={C.paperSunk} kicker="CaseDistiller-Lite" title="A CPU learner"
          body="Learns a Boolean program or an integer scorecard from labeled records and definition-derived seeds." />
      </div>
      <div style={{ position: "absolute", top, left: 440 }}>
        <Box at={s(4.4)} w={320} h={244} fill={C.oak} kicker="Optional · CaseDistiller-Agentic" title="An LLM agent proposes edits"
          body="The host measures each candidate and selects; the agent never decides." />
      </div>
      <div style={{ position: "absolute", top, left: 820 }}>
        <Box at={s(7.4)} w={332} h={330} fill={C.tealSoft} kicker="Deploy" title="One explicit classifier"
          body="Native SQL operations in supported dialects. The same query for every record."
          foot={<div style={{ ...T.title, fontSize: 25, color: C.tealDeep, marginTop: S.s2 }}>No LLM at deployment.</div>} />
      </div>
      <svg width={1152} height={360} style={{ position: "absolute", top, left: 0, pointerEvents: "none" }}>
        {/* direct path: Lite straight to SQL */}
        <g opacity={prog(frame, s(3.4), 14)}>
          <path d="M324 290 L812 290" stroke={C.blue} strokeWidth={2} />
          <path d="M804 283 L813 290 L804 297" stroke={C.blue} strokeWidth={2} fill="none" />
          <text x={568} y={278} textAnchor="middle" fill={C.blue} style={{ ...T.caption, fontSize: 14 }}>direct path</text>
        </g>
        {/* optional branch through the agent, dashed */}
        <g opacity={prog(frame, s(5.4), 14)}>
          <path d="M324 100 L432 100" stroke={C.blue} strokeWidth={1.5} strokeDasharray="6 5" />
          <path d="M424 93 L433 100 L424 107" stroke={C.blue} strokeWidth={1.5} fill="none" />
          <path d="M764 100 L812 100" stroke={C.blue} strokeWidth={1.5} strokeDasharray="6 5" />
          <path d="M804 93 L813 100 L804 107" stroke={C.blue} strokeWidth={1.5} fill="none" />
        </g>
      </svg>
      <Fade at={s(10)} style={{ position: "absolute", bottom: 0, left: 0 }}>
        <DataLine>Construction uses training and validation records; a held-out test split evaluates the selected classifier.</DataLine>
      </Fade>
    </Slide>
  );
};

// 4a · Routes: OR of routes, AND of predicates
export const Routes: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Slide>
      <Header kicker="Rule language" width={1100} size={44}>
        A program is an OR of routes. A route is an AND of predicates.
      </Header>
      <div style={{ position: "absolute", top: 160, left: 0, right: 0, display: "grid", gap: 0 }}>
        <Fade at={s(1)} style={{ display: "flex", justifyContent: "space-between", paddingBottom: S.s2 }}>
          <Caption>EMS suspected suicide attempt · learned Boolean program · 6 of 11 routes</Caption>
          <Caption style={{ width: 200 }}>held-out test TP / FP</Caption>
        </Fade>
        {EMS_ROUTES.map((r, i) => {
          const at = s(1.6) + i * s(1.1);
          return (
            <Reveal key={i} at={at}>
              <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 200px", gap: S.s3, alignItems: "center", padding: "11px 0", borderTop: `1px solid ${C.rule}` }}>
                <span style={{ ...T.kicker, color: i === 0 ? C.inkMuted : C.blue }}>{i === 0 ? "S1" : "OR"}</span>
                <span style={{ ...T.code, fontSize: 15, color: C.ink }}>
                  {r.rule.split(" AND ").map((part, j, all) => (
                    <React.Fragment key={j}>
                      {part}
                      {j < all.length - 1 && <b style={{ color: C.blue, fontWeight: 500 }}> AND </b>}
                    </React.Fragment>
                  ))}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: S.s2 }}>
                  <div style={{ width: (r.tp / 30) * 110 * prog(frame, at + 8, 18), height: 10, background: C.teal }} />
                  <div style={{ width: r.fp * 6 * prog(frame, at + 8, 18), height: 10, background: C.dot }} />
                  <span style={{ ...T.data, color: C.ink }}>{r.tp} / {r.fp}</span>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <Fade at={s(8.4)} style={{ position: "absolute", bottom: 0, left: 0, display: "grid", gap: 4 }}>
        <DataLine>Predicates match phrases, phrase sets, patterns or numerical values. Any matching route flags the record.</DataLine>
        <DataLine>Route counts overlap: one record can match several routes.</DataLine>
      </Fade>
    </Slide>
  );
};

// 4b · A pattern becomes native SQL
export const Expansion: React.FC = () => {
  const forms = ["suicide attempts", "suicide attempt", "suicidal attempts", "suicidal attempt"];
  const hl = (t: string) => <span style={{ background: C.coralSoft, borderBottom: `2px solid ${C.coral}` }}>{t}</span>;
  return (
    <Slide>
      <Header kicker="Rule language" width={1000}>
        Each pattern expands into <Em at={s(1.2)}>native SQL</Em>.
      </Header>
      <Fade at={s(1.6)} style={{ position: "absolute", top: 170, left: 0, width: 1152 }}>
        <Code style={{ fontSize: 22, lineHeight: "32px", padding: "18px 24px" }}>
          like(' suicid{hl("(e|al)")} attempt{hl("s?")} ')
        </Code>
      </Fade>
      <div style={{ position: "absolute", top: 268, left: 0, width: 700 }}>
        <Fade at={s(3)}><Caption style={{ paddingBottom: S.s2 }}>SQLite · note_text is the normalized, space-padded record text</Caption></Fade>
        <div style={{ ...T.code, fontSize: 17, lineHeight: "28px", background: C.paperSunk, borderRadius: 12, padding: "16px 22px" }}>
          <Reveal at={s(3.6)}>(</Reveal>
          {forms.map((f, i) => (
            <Reveal key={f} at={s(4.2) + i * s(0.7)}>
              &nbsp;&nbsp;{i ? "OR " : "   "}note_text GLOB '* {f} *'
            </Reveal>
          ))}
          <Reveal at={s(7)}>);</Reveal>
        </div>
      </div>
      <div style={{ position: "absolute", top: 300, left: 760, width: 392, display: "grid", gap: S.s4 }}>
        <Fade at={s(5)}>
          <div style={{ ...T.numeralL, color: C.teal }}>4</div>
          <div style={{ ...T.lede, marginTop: S.s2 }}>phrase forms from one pattern; at most 64 allowed</div>
        </Fade>
        <Fade at={s(7.6)}>
          <div style={{ ...T.body, borderTop: `1px solid ${C.rule}`, paddingTop: S.s3 }}>
            Text normalization is part of the exported query. Supported render targets include SQL Server, DuckDB and PostgreSQL.
          </div>
        </Fade>
      </div>
    </Slide>
  );
};

// 5 · Masked phrases: mask one occurrence, keep another
export const Masked: React.FC = () => {
  const rows: [string, string, string][] = [
    ["“ST depression on ECG”", "No match", "No match"],
    ["“history of depression”", "Match", "Match"],
    ["both phrases in one record", "Match", "No match"],
  ];
  const cell: React.CSSProperties = { ...T.body, fontSize: 18, padding: "12px 16px", borderTop: `1px solid ${C.rule}` };
  return (
    <Slide>
      <Header kicker="Masked phrases" width={1100} size={46}>
        A masked phrase skips <Em at={s(1.2)}>ST depression</Em> without rejecting the record.
      </Header>
      <Fade at={s(1.6)} style={{ position: "absolute", top: 160, left: 0 }}>
        <Code style={{ fontSize: 20, lineHeight: "30px", padding: "14px 22px" }}>phrase('depression', except ⇒ ('st depression'))</Code>
      </Fade>
      <div style={{ position: "absolute", top: 248, left: 0, width: 1152, display: "grid", gridTemplateColumns: "380px 300px 1fr" }}>
        {["The record contains", "Masked phrase", "phrase('depression') AND NOT phrase('st depression')"].map((h) => (
          <Fade key={h} at={s(2.4)} style={{ ...T.caption, color: C.inkMuted, padding: "0 16px 8px" }}>{h}</Fade>
        ))}
        {rows.map((r, i) =>
          r.map((v, j) => {
            const key = i === 2 && j === 1;
            return (
              <Reveal key={`${i}${j}`} at={s(3) + i * s(1.3) + j * 8} style={{ ...cell, background: key ? C.coralSoft : undefined, fontWeight: key ? 700 : 400 }}>
                {v}
              </Reveal>
            );
          }),
        )}
      </div>
      <div style={{ position: "absolute", left: 0, top: 470, width: 1152, display: "grid", gridTemplateColumns: "640px 1fr", gap: S.s5 }}>
        <Fade at={s(7.4)}>
          <div style={{ ...T.code, fontSize: 15, lineHeight: "22px", background: C.paperSunk, borderRadius: 12, padding: "12px 18px", whiteSpace: "pre" }}>
            REPLACE(REPLACE(note_text, ' st depression ', ' ~ '),{"\n"}        ' st depression ', ' ~ ') LIKE '% depression %'
          </div>
        </Fade>
        <Fade at={s(8.2)} style={{ alignSelf: "center" }}>
          <div style={{ ...T.body }}>Erase the excepted forms, then test what remains. A match is a text match, not a diagnosis. 103 programs use one.</div>
        </Fade>
      </div>
    </Slide>
  );
};
