import React from "react";
import { useCurrentFrame } from "remotion";
import { C, S, T } from "../theme";
import { Caption, Claim, Code, DataLine, Em, Fade, Header, Kicker, Panel, prog, Reveal, s, Slide, superellipse } from "../components/ui";
import { EMS_ROUTES } from "../data";

// 1 · Cover
export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Slide>
      <div style={{ position: "absolute", left: 0, top: 70, width: 660, display: "grid", gap: S.s4 }}>
        <Fade at={0}><Kicker>CaseDistiller · case definitions from clinical text</Kicker></Fade>
        <Fade at={8}>
          <Claim width={660} size={60}>
            Case definitions you can <Em at={s(1.4)}>read</Em>, run in SQL, and audit.
          </Claim>
        </Fade>
        <Fade at={s(2.2)}>
          <div style={{ ...T.lede, color: C.inkMuted, maxWidth: 560 }}>
            Learned from the words of labeled notes. Refined by LLM agents while they are built. No model at deployment.
          </div>
        </Fade>
      </div>
      {/* Carolina slab: many notes condense into one rule line */}
      <div style={{ position: "absolute", right: 0, top: 0, width: 400, height: 592, opacity: prog(frame, 4, 20) }}>
        <svg width={400} height={592}>
          <path d={superellipse(400, 592, 5)} fill={C.teal} />
          {Array.from({ length: 15 }).map((_, i) => {
            const col = i % 5, row = Math.floor(i / 5);
            const p = prog(frame, s(1) + i * 3, 14);
            return (
              <g key={i} opacity={p} transform={`translate(${52 + col * 62}, ${70 + row * 78})`}>
                <rect width={44} height={56} rx={8} fill={C.onCool} />
                {[14, 24, 34, 44].map((y, j) => (
                  <rect key={y} x={8} y={y - 4} width={j === 3 ? 16 : 28} height={3} fill={C.tealSoft} />
                ))}
              </g>
            );
          })}
          <g opacity={prog(frame, s(3), 18)}>
            <path d="M200 330 L200 400" stroke={C.onCool} strokeWidth={1.5} />
            <path d="M190 390 L200 404 L210 390" stroke={C.onCool} strokeWidth={1.5} fill="none" />
          </g>
          <g opacity={prog(frame, s(3.6), 18)}>
            <rect x={52} y={428} width={296} height={84} rx={14} fill={C.blue} />
            <text x={200} y={480} textAnchor="middle" fill={C.onCool} style={{ ...T.code, fontSize: 24, fontWeight: 500 }}>
              SELECT … WHERE
            </text>
          </g>
        </svg>
      </div>
      <Fade at={s(4.2)} style={{ position: "absolute", left: 0, bottom: 0, width: 620 }}>
        <Caption>
          CaseDistiller: Auditable, SQL-Executable Case Definitions Learned from Clinical Text with Construction-Time Large Language Model Refinement
        </Caption>
      </Fade>
    </Slide>
  );
};

// 3 · CaseDistiller-Lite and CaseDistiller-Agentic
export const Approach: React.FC = () => {
  const W = 344, H = 300;
  const Box: React.FC<{ at: number; fill: string; kicker: string; title: string; body: string; foot?: React.ReactNode }> = ({
    at, fill, kicker, title, body, foot,
  }) => (
    <Fade at={at}>
      <Panel w={W} h={H} fill={fill} pad={28}>
        <div style={{ display: "grid", gap: S.s3, alignContent: "start", height: "100%" }}>
          <span style={{ ...T.kicker, color: C.ink }}>{kicker}</span>
          <div style={{ ...T.title, fontSize: 28 }}>{title}</div>
          <div style={{ ...T.body, fontSize: 17, lineHeight: "25px" }}>{body}</div>
          {foot}
        </div>
      </Panel>
    </Fade>
  );
  const frame = useCurrentFrame();
  const Arrow: React.FC<{ at: number }> = ({ at }) => (
    <svg width={44} height={H} style={{ opacity: prog(frame, at, 14) }}>
      <path d={`M6 ${H / 2} L36 ${H / 2}`} stroke={C.blue} strokeWidth={1.5} />
      <path d={`M29 ${H / 2 - 7} L37 ${H / 2} L29 ${H / 2 + 7}`} stroke={C.blue} strokeWidth={1.5} fill="none" />
    </svg>
  );
  return (
    <Slide>
      <Header kicker="The approach" width={1100} size={46}>
        Learn the definition once, with or without an LLM. Run it as <Em at={s(1.2)}>one SQL query</Em>.
      </Header>
      <div style={{ position: "absolute", top: 200, left: 0, display: "flex", alignItems: "center" }}>
        <Box at={s(1.8)} fill={C.paperSunk} kicker="Build · CaseDistiller-Lite" title="A CPU learner reads labeled notes"
          body="It searches phrases, patterns and FOIL conjuncts for an SQL program, or fits an SQL scorecard of integer points over the same routes." />
        <Arrow at={s(4)} />
        <Box at={s(4.4)} fill={C.oak} kicker="Refine · CaseDistiller-Agentic" title="An LLM agent proposes edits"
          body="Through host tools only, while the program is built. The host measures each edit and keeps it only if development F1 improves." />
        <Arrow at={s(7)} />
        <Box at={s(7.4)} fill={C.tealSoft} kicker="Deploy" title="Frozen. One SELECT."
          body="The program runs in any SQL database as one plain query."
          foot={<div style={{ ...T.title, fontSize: 28, color: C.tealDeep, marginTop: S.s2 }}>No LLM. No GPU.</div>} />
      </div>
      <Fade at={s(10)} style={{ position: "absolute", bottom: 0, left: 0 }}>
        <DataLine>What is new: the case definition itself is learned, and the LLM leaves before deployment.</DataLine>
      </Fade>
    </Slide>
  );
};

// 4a · Routes
export const Routes: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Slide>
      <Header kicker="Rule language" width={1100} size={46}>
        A program is an OR of routes. A route is an AND of words.
      </Header>
      <div style={{ position: "absolute", top: 160, left: 0, right: 0, display: "grid", gap: 0 }}>
        <Fade at={s(1)} style={{ display: "flex", justifyContent: "space-between", paddingBottom: S.s2 }}>
          <Caption>EMS suicide attempt · SQL program · 6 of 11 routes</Caption>
          <Caption style={{ width: 200 }}>Test true / false positives</Caption>
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
      <Fade at={s(8.4)} style={{ position: "absolute", bottom: 0, left: 0 }}>
        <DataLine>Any matching route flags the note. Every route is readable text, with its own hits and misses.</DataLine>
      </Fade>
    </Slide>
  );
};

// 4b · A pattern becomes plain SQL
export const Expansion: React.FC = () => {
  const forms = ["suicide attempts", "suicide attempt", "suicidal attempts", "suicidal attempt"];
  const hl = (t: string) => <span style={{ background: C.coralSoft, borderBottom: `2px solid ${C.coral}` }}>{t}</span>;
  return (
    <Slide>
      <Header kicker="Rule language" width={1000}>
        Each pattern expands into <Em at={s(1.2)}>plain SQL</Em>.
      </Header>
      <Fade at={s(1.6)} style={{ position: "absolute", top: 170, left: 0, width: 1152 }}>
        <Code style={{ fontSize: 22, lineHeight: "32px", padding: "18px 24px" }}>
          like(' suicid{hl("(e|al)")} attempt{hl("s?")} ') AND NOT phrase('denies')
        </Code>
      </Fade>
      <div style={{ position: "absolute", top: 268, left: 0, width: 700 }}>
        <Fade at={s(3)}><Caption style={{ paddingBottom: S.s2 }}>SQLite · rendered by the engine and run against the evaluator</Caption></Fade>
        <div style={{ ...T.code, fontSize: 17, lineHeight: "28px", background: C.paperSunk, borderRadius: 12, padding: "16px 22px" }}>
          <Reveal at={s(3.4)}>(note_text NOT LIKE '% denies %'</Reveal>
          <Reveal at={s(3.8)}>&nbsp;&nbsp;AND (</Reveal>
          {forms.map((f, i) => (
            <Reveal key={f} at={s(4.4) + i * s(0.7)}>
              &nbsp;&nbsp;&nbsp;&nbsp;{i ? "OR " : "   "}note_text GLOB '* {f} *'
            </Reveal>
          ))}
          <Reveal at={s(7.2)}>&nbsp;&nbsp;));</Reveal>
        </div>
      </div>
      <div style={{ position: "absolute", top: 300, left: 760, width: 392, display: "grid", gap: S.s4 }}>
        <Fade at={s(5)}>
          <div style={{ ...T.numeralL, color: C.teal }}>4</div>
          <div style={{ ...T.lede, marginTop: S.s2 }}>simple forms from one pattern; at most 64 allowed</div>
        </Fade>
        <Fade at={s(7.6)}>
          <div style={{ ...T.body, borderTop: `1px solid ${C.rule}`, paddingTop: S.s3 }}>
            The same engine renders SQL Server, DuckDB and PostgreSQL. No user-defined function is needed.
          </div>
        </Fade>
      </div>
    </Slide>
  );
};

// 5 · Masked phrases
export const Masked: React.FC = () => {
  const rows: [string, string, string][] = [
    ["“ST depression on ECG”", "No match", "No match"],
    ["“history of depression”", "Match", "Match"],
    ["both phrases in one note", "Match", "No match"],
  ];
  const cell: React.CSSProperties = { ...T.body, fontSize: 18, padding: "12px 16px", borderTop: `1px solid ${C.rule}` };
  return (
    <Slide>
      <Header kicker="Masked phrases" width={1100} size={48}>
        A masked phrase keeps <Em at={s(1.2)}>depression</Em>, not ST depression.
      </Header>
      <Fade at={s(1.6)} style={{ position: "absolute", top: 160, left: 0 }}>
        <Code style={{ fontSize: 20, lineHeight: "30px", padding: "14px 22px" }}>phrase('depression', except ⇒ ('st depression'))</Code>
      </Fade>
      <div style={{ position: "absolute", top: 248, left: 0, width: 1152, display: "grid", gridTemplateColumns: "420px 300px 1fr" }}>
        {["The note contains", "Masked phrase", "Record-wide NOT phrase('st depression')"].map((h) => (
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
          <div style={{ ...T.body }}>Erase the excepted form, then test the term. Plain SQL in every dialect; 103 programs use one.</div>
        </Fade>
      </div>
    </Slide>
  );
};
