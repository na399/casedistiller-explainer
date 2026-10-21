import React from "react";
import { useCurrentFrame } from "remotion";
import { C, S, T } from "../theme";
import { Caption, Em, Fade, Header, Panel, prog, s, Slide } from "../components/ui";

// Flat pictograms, two hues each, drawn on the spacing scale.
const Note: React.FC<{ x: number; y: number; w?: number; h?: number; fill?: string; line?: string }> = ({ x, y, w = 26, h = 34, fill = C.paper, line = C.blue }) => (
  <g transform={`translate(${x},${y})`}>
    <rect width={w} height={h} rx={4} fill={fill} />
    {[9, 16, 23].map((yy, i) => (
      <rect key={yy} x={6} y={yy} width={i === 2 ? w * 0.4 : w - 12} height={2} fill={line} />
    ))}
  </g>
);

const Experts: React.FC<{ p: number }> = ({ p }) => (
  <svg width={226} height={150}>
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${24 + i * 48}, 40)`} opacity={Math.min(1, p * 3 - i)}>
        <circle cx={18} cy={14} r={14} fill={C.teal} />
        <rect x={0} y={34} width={36} height={44} rx={18} fill={C.teal} />
      </g>
    ))}
    <g opacity={p}>
      <Note x={176} y={86} fill={C.paperSunk} />
      <Note x={184} y={74} fill={C.paperSunk} />
      <Note x={192} y={62} />
    </g>
    {/* a clock: time is the cost */}
    <g transform="translate(176,22)" opacity={p}>
      <circle cx={16} cy={16} r={15} fill="none" stroke={C.blue} strokeWidth={1.5} />
      <path d="M16 7 V16 H23" stroke={C.blue} strokeWidth={1.5} fill="none" />
    </g>
  </svg>
);

const Sieve: React.FC<{ p: number }> = ({ p }) => (
  <svg width={226} height={150}>
    <Note x={12} y={58} fill={C.paperSunk} />
    <path d="M46 75 L72 75 M66 69 L73 75 L66 81" stroke={C.blue} strokeWidth={1.5} fill="none" opacity={p} />
    <g transform="translate(80,30)">
      <rect width={90} height={90} rx={6} fill={C.blueSoft} />
      {[18, 36, 54, 72].map((v) => (
        <g key={v}>
          <line x1={v} x2={v} y1={0} y2={90} stroke={C.blue} strokeWidth={1} />
          <line x1={0} x2={90} y1={v} y2={v} stroke={C.blue} strokeWidth={1} />
        </g>
      ))}
    </g>
    <g opacity={p}>
      <path d="M176 75 L202 75 M196 69 L203 75 L196 81" stroke={C.blue} strokeWidth={1.5} fill="none" />
      <circle cx={214} cy={62} r={5} fill={C.teal} />
      <circle cx={214} cy={88} r={5} fill={C.dot} />
    </g>
  </svg>
);

const Model: React.FC<{ p: number }> = ({ p }) => (
  <svg width={226} height={150}>
    {/* a queue of notes waits for the model, one call each */}
    {[0, 1, 2, 3].map((i) => (
      <Note key={i} x={8 + i * 24} y={58} fill={i === 3 ? C.paper : C.paperSunk} line={i === 3 ? C.blue : C.dot} />
    ))}
    <path d="M108 75 L128 75 M122 69 L129 75 L122 81" stroke={C.blue} strokeWidth={1.5} fill="none" opacity={p} />
    <rect x={136} y={44} width={82} height={62} rx={31} fill={C.teal} />
    <text x={177} y={83} textAnchor="middle" fill={C.onCool} style={{ ...T.title, fontSize: 22 }}>LLM</text>
    <g transform="translate(146,112)" opacity={p}>
      <circle cx={12} cy={12} r={11} fill="none" stroke={C.blue} strokeWidth={1.5} />
      <path d="M12 5 V12 H17" stroke={C.blue} strokeWidth={1.5} fill="none" />
      <text x={30} y={17} fill={C.blue} style={{ ...T.caption, fontSize: 12 }}>per note</text>
    </g>
  </svg>
);

const Distiller: React.FC<{ p: number }> = ({ p }) => (
  <svg width={256} height={150}>
    <g>
      <Note x={8} y={70} fill={C.paperSunk} />
      <Note x={16} y={58} fill={C.paperSunk} />
      <Note x={24} y={46} />
    </g>
    <path d="M58 75 L82 75 M76 69 L83 75 L76 81" stroke={C.blue} strokeWidth={1.5} fill="none" />
    <rect x={90} y={52} width={92} height={46} rx={8} fill={C.blue} />
    <text x={136} y={82} textAnchor="middle" fill={C.onCool} style={{ ...T.code, fontSize: 15, fontWeight: 500 }}>SELECT</text>
    <path d="M190 75 L206 75 M200 69 L207 75 L200 81" stroke={C.blue} strokeWidth={1.5} fill="none" opacity={p} />
    {/* the whole table at once: a column of rows, the flagged ones coral */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i} opacity={Math.min(1, Math.max(0, p * 6 - i))}>
        <rect x={214} y={30 + i * 16} width={34} height={10} rx={2} fill={C.paperSunk} />
        <circle cx={221} cy={35 + i * 16} r={3.5} fill={i === 1 || i === 4 ? C.coral : C.dot} />
      </g>
    ))}
  </svg>
);

// Each card: how the classifier is built (pro line) and what it is at inference (con line).
// Descriptions only: no rankings, no unmeasured speed or cost claims.
type Card = { head: string; Pic: React.FC<{ p: number }>; pro: string; con: string };
const CARDS: Card[] = [
  { head: "Expert rules", Pic: Experts, pro: "Experts write criteria from a case definition, as in published surveillance definitions.", con: "Explicit and editable; construction takes expert effort." },
  { head: "Text classifiers", Pic: Sieve, pro: "Supervised models trained on labeled records.", con: "A representation of learned weights rather than readable criteria." },
  { head: "Direct LLM classification", Pic: Model, pro: "A language model reads each record and answers the definition.", con: "Inference needs the model, with a call for every record." },
];

// 2 · Ways to construct a case classifier
export const Compare: React.FC = () => {
  const frame = useCurrentFrame();
  const colW = 262, gap = 18, cdW = 300;
  const cdAt = s(13);
  return (
    <Slide>
      <Header kicker="Constructing a classifier" width={1100} size={46}>
        Each way to build a case classifier makes <Em at={s(1.2)}>different trade-offs</Em>.
      </Header>
      <div style={{ position: "absolute", top: 150, left: 0, display: "flex", gap }}>
        {CARDS.map((c, i) => {
          const at = s(1.8) + i * s(3.6);
          const p = prog(frame, at + 10, 30);
          return (
            <Fade key={c.head} at={at} style={{ width: colW }}>
              <Panel w={colW} h={400} fill={C.paperSunk} pad={18}>
                <div style={{ display: "grid", gap: S.s2, alignContent: "start" }}>
                  <c.Pic p={p} />
                  <div style={{ ...T.title, fontSize: 22 }}>{c.head}</div>
                  <div style={{ ...T.body, fontSize: 16, lineHeight: "22px", opacity: prog(frame, at + 20, 16) }}>{c.pro}</div>
                  <div style={{ ...T.body, fontSize: 15, lineHeight: "21px", color: C.inkMuted, borderTop: `1px solid ${C.rule}`, paddingTop: S.s2, opacity: prog(frame, at + s(1.4), 16) }}>{c.con}</div>
                </div>
              </Panel>
            </Fade>
          );
        })}
        <Fade at={cdAt} style={{ width: cdW }}>
          <Panel w={cdW} h={400} fill={C.tealSoft} pad={18}>
            <div style={{ display: "grid", gap: S.s2, alignContent: "start" }}>
              <Distiller p={prog(frame, cdAt + 10, 36)} />
              <div style={{ ...T.title, fontSize: 22, color: C.tealDeep }}>CaseDistiller</div>
              <div style={{ ...T.body, fontSize: 16, lineHeight: "22px", opacity: prog(frame, cdAt + 20, 16) }}>
                Executable rule learning: explicit criteria learned from labeled records; an LLM can optionally help during construction.
              </div>
              <div style={{ ...T.body, fontSize: 15, lineHeight: "21px", color: C.ink, borderTop: `1px solid ${C.blue}40`, paddingTop: S.s2, opacity: prog(frame, cdAt + s(1.6), 16) }}>
                Deployment runs the resulting SQL query, with no LLM call.
              </div>
            </div>
          </Panel>
        </Fade>
      </div>
      <Fade at={cdAt + s(3)} style={{ position: "absolute", bottom: 0, left: 0 }}>
        <div style={{ ...T.lede, color: C.tealDeep, fontWeight: 700 }}>The trade-offs: construction effort, representation, and what inference requires.</div>
      </Fade>
    </Slide>
  );
};

// 3 · The three tasks and their data
export const Tasks: React.FC = () => {
  const frame = useCurrentFrame();
  const corpora = [
    {
      kicker: "EMS · suspected suicide attempt", role: "principal", n: "1,842 encounters",
      input: "Structured fields and the crew's narrative. A suspected attempt act qualifies; ideation or an uninitiated plan alone does not.",
      split: [1290, 277, 275], pos: "84 test positives (30.5%)",
    },
    {
      kicker: "ACT · ten phenotypes", role: "principal", n: "1,610 discharge summaries",
      input: "MIMIC discharge summaries annotated for advanced cancer, heart, lung and neurological disease, chronic pain, alcohol and substance abuse, obesity, psychiatric disorders and depression.",
      split: [1127, 161, 322], pos: "25–92 test positives per phenotype",
    },
    {
      kicker: "LCD · 30-day mortality", role: "exploratory", n: "49,832 discharge notes",
      input: "Discharge notes; the outcome is death within 30 days of discharge.",
      split: [34759, 7505, 7568], pos: "261 test deaths (3.4%)",
    },
  ];
  const W = 340;
  return (
    <Slide>
      <Header kicker="The tasks" width={1100} size={44}>
        Two case-identification tasks, and <Em at={s(1.2)}>one exploratory outcome</Em>.
      </Header>
      <Fade at={s(1.6)} style={{ position: "absolute", top: 150, left: 0 }}>
        <div style={{ ...T.lede, maxWidth: 1000 }}>Each task flags the records that meet a definition, with training, validation and held-out test splits.</div>
      </Fade>
      <div style={{ position: "absolute", top: 210, left: 0, display: "flex", gap: 18 }}>
        {corpora.map((c, i) => {
          const at = s(2.6) + i * s(3.4);
          const total = c.split.reduce((a, b) => a + b, 0);
          const p = prog(frame, at + s(1.2), 30);
          return (
            <Fade key={c.kicker} at={at} style={{ width: 372 }}>
              <Panel w={372} h={300} fill={i === 2 ? C.paperSunk : i === 1 ? C.oak : C.blueSoft} pad={20}>
                <div style={{ display: "grid", gap: S.s2, alignContent: "start" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ ...T.kicker, color: C.ink }}>{c.kicker}</span>
                    <span style={{ ...T.kicker, fontSize: 11, color: c.role === "exploratory" ? C.inkMuted : C.tealDeep }}>{c.role}</span>
                  </div>
                  <div style={{ ...T.title, fontSize: 24 }}>{c.n}</div>
                  <div style={{ ...T.body, fontSize: 15, lineHeight: "21px", minHeight: 105 }}>{c.input}</div>
                  <div style={{ display: "flex", width: W, height: 22, gap: 2 }}>
                    {c.split.map((v, j) => (
                      <div key={j} style={{
                        width: Math.max(12, (v / total) * W) * p, height: 22,
                        background: j === 0 ? C.teal : j === 1 ? C.blue : C.paper,
                        outline: j === 2 ? `2px solid ${C.coral}` : undefined, outlineOffset: -2,
                      }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 14, opacity: p }}>
                    {["train", "validation", "held-out test"].map((l, j) => (
                      <span key={l} style={{ ...T.caption, color: j === 2 ? C.coral : C.ink }}>{c.split[j].toLocaleString()} {l}</span>
                    ))}
                  </div>
                  <Caption style={{ color: C.ink, opacity: p }}>{c.pos}</Caption>
                </div>
              </Panel>
            </Fade>
          );
        })}
      </div>
      <Fade at={s(14)} style={{ position: "absolute", bottom: 0, left: 0 }}>
        <div style={{ ...T.data, color: C.inkMuted }}>Learners and agents use training records; the host measures validation and performs the final held-out assessment.</div>
      </Fade>
    </Slide>
  );
};
