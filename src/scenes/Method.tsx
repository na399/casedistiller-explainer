import React from "react";
import { useCurrentFrame } from "remotion";
import { C, S, T } from "../theme";
import { Bar, Caption, Code, DataLine, Em, Fade, Header, Panel, prog, Reveal, s, Slide } from "../components/ui";
import {
  FOIL_ADDITIONS, FOIL_RULES, FOIL_START, foilCheck, LCD_TERM_COUNT, LCD_TERMS, LCD_THRESHOLD, precision,
} from "../data";
import { sentenceCues } from "../timing";

const Step: React.FC<{ n: number | string; title: string; children: React.ReactNode }> = ({ n, title, children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "34px 1fr", gap: S.s2 }}>
    <span style={{ ...T.numeralM, fontSize: 28, color: C.teal }}>{n}</span>
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ ...T.body, fontSize: 19, fontWeight: 700 }}>{title}</div>
      <div style={{ ...T.body, fontSize: 16, lineHeight: "23px" }}>{children}</div>
    </div>
  </div>
);

const pct = (x: number) => `${(x * 100).toFixed(x === 1 || x === 0.5 || x === 0.8 ? 0 : 1)}%`;

// 7 · CaseDistiller-Lite: the candidate inventory
export const Candidates: React.FC = () => {
  const frame = useCurrentFrame();
  const sources = [
    { label: "Phrase inventory", v: 140, color: C.teal },
    { label: "Definition-derived seeds", v: 16, color: C.blue },
  ];
  return (
    <Slide>
      <Header kicker="CaseDistiller-Lite · the candidate inventory" width={1100} size={44}>
        Learning starts by building an <Em at={s(1.2)}>inventory of candidate routes</Em>.
      </Header>
      <div style={{ position: "absolute", top: 170, left: 0, width: 560, display: "grid", gap: S.s4 }}>
        <Fade at={s(1.8)}>
          <Step n={1} title="Phrase inventory from training records">
            Short phrases within one sentence or field, ranked by their association with positive labels (smoothed log-odds).
          </Step>
        </Fade>
        <Fade at={s(3.4)}>
          <Step n={2} title="Definition-derived seeds">
            Phrases and values taken from the case definition enter alongside the learned phrases.
          </Step>
        </Fade>
        <Fade at={s(5)}>
          <Step n={3} title="Candidate routes">
            Single predicates, phrase pairs, and generalized patterns that merge words sharing a prefix, such as <span style={{ ...T.code, fontSize: 14 }}>unde(r|rdosing|termined)</span>. Some routes are then grown with FOIL.
          </Step>
        </Fade>
      </div>
      <div style={{ position: "absolute", top: 196, left: 640, width: 512, display: "grid", gap: S.s4 }}>
        <Fade at={s(2.4)}><Caption>EMS suspected suicide attempt · training split</Caption></Fade>
        {sources.map((r, i) => (
          <Fade key={r.label} at={s(2.8) + i * s(1.4)}>
            <div style={{ display: "flex", alignItems: "center", gap: S.s3 }}>
              <Bar value={r.v} max={177} width={320} height={30} color={r.color} at={s(2.8) + i * s(1.4) + 4} />
              <span style={{ ...T.numeralM, fontSize: 34 }}>{r.v}</span>
            </div>
            <Caption style={{ marginTop: 4 }}>{r.label}</Caption>
          </Fade>
        ))}
        <Fade at={s(6)} style={{ borderTop: `1px solid ${C.rule}`, paddingTop: S.s3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: S.s3 }}>
            <Bar value={177} max={177} width={320} height={30} color={C.ink} at={s(6) + 4} />
            <span style={{ ...T.numeralM, fontSize: 34 }}>177</span>
          </div>
          <Caption style={{ marginTop: 4 }}>candidate routes, after pairs and patterns</Caption>
        </Fade>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, opacity: prog(frame, s(8), 18) }}>
        <DataLine>Training records only · CPU only · no network and no LLM in CaseDistiller-Lite</DataLine>
      </div>
    </Slide>
  );
};

// 8 · FOIL route growth, on SYNTHETIC training counts (src/data.ts FOIL_*)
// Builds land on the narration's sentences (timing.ts sentenceCues), in wall-clock frames.
const GRID_COLS = 8, GRID_ROWS = 5, PITCH = 46;
// Fixed layout of the 40 records matched by the starting route: 20 positive, 20 negative.
const LAYOUT: ("p" | "n")[] = "pnppnpnn pnpnnppn npnppnpn nppnpnnp pnnpnppn".replace(/ /g, "").split("") as ("p" | "n")[];
const POS = LAYOUT.map((t, i) => (t === "p" ? i : -1)).filter((i) => i >= 0);
const NEG = LAYOUT.map((t, i) => (t === "n" ? i : -1)).filter((i) => i >= 0);
// Which records each condition keeps (counts must match FOIL_ADDITIONS).
const KEEP: Record<string, Set<number>> = {
  start: new Set(LAYOUT.map((_, i) => i)),
  took: new Set([...POS.slice(0, 16), ...NEG.slice(0, 4)]),
  other: new Set([...POS.slice(2, 14), ...NEG.slice(1, 3)]),
  rare: new Set([...POS.slice(5, 8)]),
};

export const Foil: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = sentenceCues("Foil");
  const at = (i: number) => cue[Math.min(i, cue.length - 1)] ?? 0;
  const [, , tGrid, tTook, tGain, tOther, tRare, tRules, tPool, tNext] = cue.map((_, i) => at(i));
  // Grid state over time: start → took → other → rare → took.
  const states: [string, number][] = [["start", 0], ["took", tTook], ["other", tOther], ["rare", tRare], ["took", tRules]];
  const idx = states.reduce((a, [, t], i) => (frame >= t ? i : a), 0);
  const cur = states[idx][0], prev = states[Math.max(0, idx - 1)][0];
  const k = idx === 0 ? 1 : prog(frame, states[idx][1], 14);
  const op = (i: number) => {
    const a = KEEP[prev].has(i) ? 1 : 0.16, b = KEEP[cur].has(i) ? 1 : 0.16;
    return a + (b - a) * k;
  };
  const shown = cur === "start" ? { p: FOIL_START.p, n: FOIL_START.n } : FOIL_ADDITIONS.find((x) => x.id === cur)!;
  const took = FOIL_ADDITIONS[0];
  const cardAt = [tGain, tOther, tRare];

  return (
    <Slide>
      <Header kicker="CaseDistiller-Lite · route growth" width={900} size={42}>
        Grow one route with <Em at={s(1)}>FOIL information gain</Em>.
      </Header>
      <div style={{ position: "absolute", top: 0, right: 0, ...T.kicker, fontSize: 12, color: C.ink, background: C.yellowSoft, padding: "6px 10px" }}>
        Illustrative training data · synthetic counts
      </div>

      {/* the route, growing by one AND */}
      <Fade at={6} style={{ position: "absolute", top: 124, left: 0, width: 520 }}>
        <Code style={{ fontSize: 19, padding: "10px 16px" }}>
          {FOIL_START.route}
          <span style={{ color: C.blue, fontWeight: 500, opacity: prog(frame, tTook, 14) }}> AND phrase('took')</span>
        </Code>
      </Fade>

      {/* forty fixed record markers: circles positive, squares negative */}
      <svg width={GRID_COLS * PITCH} height={GRID_ROWS * PITCH} style={{ position: "absolute", top: 196, left: 8, opacity: prog(frame, tGrid, 16) }}>
        {LAYOUT.map((t, i) => {
          const x = (i % GRID_COLS) * PITCH + PITCH / 2, y = Math.floor(i / GRID_COLS) * PITCH + PITCH / 2;
          return t === "p"
            ? <circle key={i} cx={x} cy={y} r={14} fill={C.teal} opacity={op(i)} />
            : <rect key={i} x={x - 12} y={y - 12} width={24} height={24} fill={C.dot} opacity={op(i)} />;
        })}
      </svg>
      <div style={{ position: "absolute", top: 434, left: 8, width: 520, opacity: prog(frame, tGrid, 16), display: "flex", gap: S.s4, alignItems: "baseline" }}>
        <span style={{ ...T.body, fontSize: 18 }}>
          <svg width={14} height={14} style={{ marginRight: 6 }}><circle cx={7} cy={7} r={6} fill={C.teal} /></svg>
          <b>{shown.p}</b> positive
        </span>
        <span style={{ ...T.body, fontSize: 18 }}>
          <svg width={14} height={14} style={{ marginRight: 6 }}><rect x={1} y={1} width={12} height={12} fill={C.dot} /></svg>
          <b>{shown.n}</b> negative
        </span>
        <span style={{ ...T.body, fontSize: 18 }}>precision <b>{pct(precision(shown.p, shown.n))}</b></span>
      </div>

      {/* candidate additions, compared */}
      <div style={{ position: "absolute", top: 124, left: 580, width: 572, display: "grid", gap: 10 }}>
        {FOIL_ADDITIONS.map((a, i) => {
          const c = foilCheck(a);
          const best = a.id === took.id && frame >= tRules;
          const rejected = !c.eligible && frame >= tRare + 20;
          return (
            <Fade key={a.id} at={cardAt[i]}>
              <div style={{
                background: best ? C.tealSoft : C.paperSunk, borderRadius: 14, padding: "12px 16px",
                display: "grid", gap: 6, outline: cur === a.id && frame < tRules ? `2px solid ${C.blue}` : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ ...T.code, fontSize: 16 }}>{a.label}</span>
                  <span style={{ ...T.kicker, fontSize: 12, color: rejected ? C.coral : best ? C.tealDeep : C.inkMuted }}>
                    {rejected ? "rejected" : best ? "highest gain · accepted" : c.eligible ? "eligible" : ""}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "120px 130px 1fr 90px", ...T.body, fontSize: 15, color: C.ink }}>
                  <span>{a.p} pos · {a.n} neg</span>
                  <span>precision {pct(c.precision)}</span>
                  <span style={{ color: rejected ? C.coral : C.ink }}>
                    keeps {a.p} of {FOIL_START.p} positives{rejected ? ` (< ${FOIL_RULES.minRetained * FOIL_START.p})` : ""}
                  </span>
                  <span style={{ textAlign: "right" }}>gain <b>{c.gain.toFixed(2)}</b></span>
                </div>
              </div>
            </Fade>
          );
        })}
        <Fade at={tOther + 30}>
          <Caption>Positives kept are relative to the current route&rsquo;s matches, not to the whole corpus.</Caption>
        </Fade>
      </div>

      {/* admission rules first, then gain ranks what remains */}
      <Fade at={tRules} style={{ position: "absolute", top: 470, left: 0, width: 600 }}>
        <div style={{ ...T.kicker, fontSize: 12, color: C.inkMuted, marginBottom: 6 }}>In this study · eligibility first, then rank by gain</div>
        <div style={{ display: "grid", gap: 2, ...T.body, fontSize: 15 }}>
          <span>1 · keeps at least half of the current positives, and at least {FOIL_RULES.minPositives}</span>
          <span>2 · raises precision by at least {FOIL_RULES.seMultiplier} binomial standard errors</span>
          <span>3 · ranks the eligible additions by FOIL gain = p₁ · log₂(P₁ / P₀)</span>
          <span style={{ color: C.inkMuted }}>Routes grow to at most {FOIL_RULES.maxConjuncts} conjuncts.</span>
        </div>
      </Fade>
      {/* accepted extensions join the candidate pool */}
      <Fade at={tPool} style={{ position: "absolute", top: 470, left: 640, width: 512 }}>
        <div style={{ ...T.kicker, fontSize: 12, color: C.inkMuted, marginBottom: 6 }}>Candidate pool</div>
        <div style={{ display: "flex", flexWrap: "nowrap", gap: 6 }}>
          <span style={{ ...T.code, fontSize: 11, background: C.blueSoft, padding: "3px 7px", borderRadius: 4, whiteSpace: "nowrap" }}>{FOIL_START.route}</span>
          <span style={{ ...T.code, fontSize: 11, background: C.tealSoft, padding: "3px 7px", borderRadius: 4, whiteSpace: "nowrap" }}>{FOIL_START.route} AND phrase('took')</span>
          <span style={{ ...T.code, fontSize: 11, color: C.inkMuted, border: `1px dashed ${C.dot}`, padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap", opacity: prog(frame, tPool + 20, 14) }}>… AND ?</span>
        </div>
        <div style={{ ...T.body, fontSize: 16, marginTop: 10, fontWeight: 700, color: C.tealDeep, opacity: prog(frame, tNext, 14) }}>
          Next: choose the complete OR program.
        </div>
      </Fade>
    </Slide>
  );
};

// 9 · CaseDistiller-Lite: choosing routes together, as one program
export const Selection: React.FC = () => {
  const frame = useCurrentFrame();
  // Illustrative local search: moves over a small pool, cost falling.
  const moves = [
    { move: "start", on: [1, 0, 1, 0, 0, 1, 0, 0], cost: 2140 },
    { move: "add", on: [1, 0, 1, 1, 0, 1, 0, 0], cost: 1870 },
    { move: "swap", on: [1, 0, 0, 1, 0, 1, 0, 1], cost: 1615 },
    { move: "drop", on: [1, 0, 0, 1, 0, 0, 0, 1], cost: 1590 },
    { move: "add", on: [1, 1, 0, 1, 0, 0, 0, 1], cost: 1480 },
    { move: "swap", on: [1, 1, 0, 1, 1, 0, 0, 0], cost: 1455 },
  ];
  const searchAt = s(2.4), per = s(0.9);
  const k = Math.min(moves.length - 1, Math.max(0, Math.floor((frame - searchAt) / per)));
  const cur = moves[k];
  const finalists = Array.from({ length: 22 }, (_, i) => i >= 18); // 18 plain SQL, then 4 converted
  return (
    <Slide>
      <Header kicker="CaseDistiller-Lite · choosing the program" width={1100} size={44}>
        A separate search chooses routes <Em at={s(1.2)}>together, as one program</Em>.
      </Header>
      <div style={{ position: "absolute", top: 160, left: 0, width: 560, display: "grid", gap: 12 }}>
        <Fade at={s(1.6)}>
          <Step n={1} title="Local search over the pool">
            Add, drop and swap moves minimise a training cost, across a grid of weights:
          </Step>
        </Fade>
        <Fade at={s(3)}>
          <Code style={{ fontSize: 16, marginLeft: 42, padding: "8px 14px", whiteSpace: "nowrap" }}>cost(S) = 100·FN + c_fp·FP + w_r·|S| + w_l·L(S)</Code>
          <Caption style={{ marginLeft: 42, marginTop: 4 }}>The grid varies the trade-off: missed cases weigh 100; false positives 50 to 300; |S| routes and L(S) literals price size</Caption>
        </Fade>
        <div style={{ marginLeft: 42, marginTop: S.s2, opacity: prog(frame, searchAt, 12) }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {cur.on.map((o, i) => (
              <div key={i} style={{ width: 44, height: 22, background: o ? C.teal : C.paperSunk }} />
            ))}
            <span style={{ ...T.kicker, color: C.blue, marginLeft: S.s2 }}>{cur.move}</span>
            <span style={{ ...T.data, color: C.ink, marginLeft: "auto" }}>cost {cur.cost.toLocaleString()}</span>
          </div>
          <Caption style={{ marginTop: 4 }}>Illustration of one trajectory: pool routes toggle until no move lowers the cost.</Caption>
        </div>
        <Fade at={s(9)}>
          <Step n={2} title="Finalist choice on validation">
            Plain-SQL finalists and guarded candidates converted to plain SQL (an approximation, evaluated as a new candidate) compete on validation F1, then fewer literals.
          </Step>
        </Fade>
      </div>
      <div style={{ position: "absolute", top: 172, left: 620, width: 532, display: "grid", gap: 14 }}>
        <Fade at={s(5)}><Caption>EMS suspected suicide attempt · units: routes</Caption></Fade>
        {[{ v: 177, l: "candidate routes" }, { v: 110, l: "routes in the pool, after merging routes that flag the same records" }].map((f, i) => (
          <Fade key={f.v} at={s(5.4) + i * s(1.2)}>
            <div style={{ display: "flex", alignItems: "center", gap: S.s3 }}>
              <Bar value={f.v} max={177} width={340} height={26} color={C.teal} at={s(5.4) + i * s(1.2) + 4} />
              <span style={{ ...T.numeralM, fontSize: 32 }}>{f.v}</span>
            </div>
            <Caption style={{ marginTop: 2 }}>{f.l}</Caption>
          </Fade>
        ))}
        <Fade at={s(8.2)} style={{ borderTop: `1px solid ${C.rule}`, paddingTop: S.s3 }}>
          <Caption style={{ paddingBottom: 6 }}>units: programs · 18 plain-SQL finalists + 4 converted guarded candidates</Caption>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {finalists.map((conv, i) => (
              <div key={i} style={{
                width: 16, height: 22, opacity: prog(frame, s(8.4) + i * 2, 10),
                background: conv ? C.paper : C.blue, outline: conv ? `2px solid ${C.blue}` : "none", outlineOffset: -2,
              }} />
            ))}
          </div>
        </Fade>
        <Fade at={s(10.4)}>
          <div style={{ display: "flex", alignItems: "center", gap: S.s3 }}>
            <div style={{ display: "grid", gap: 3 }}>
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} style={{ width: 120 - (i % 4) * 14, height: 5, background: C.coral, opacity: prog(frame, s(10.6) + i * 2, 10) }} />
              ))}
            </div>
            <div>
              <div style={{ ...T.title, fontSize: 24, color: C.coral }}>1 program, 11 routes</div>
              <Caption>selected by validation F1</Caption>
            </div>
          </div>
        </Fade>
      </div>
    </Slide>
  );
};

// 10 · The SQL scorecard (LCD, exploratory)
export const Scorecard: React.FC = () => {
  const frame = useCurrentFrame();
  const unit = 1.4; // px per point in the term list
  const tally = [
    { term: "hospice", v: 100 }, { term: "comfort", v: 97 }, { term: "dnr", v: 88 },
    { term: "metastatic", v: 60 }, { term: "palliative", v: 48 },
  ];
  const shower = 29, peak = tally.reduce((a, t) => a + t.v, 0), after = peak - shower;
  const trackMax = 420, trackW = 500, X = (v: number) => (v / trackMax) * trackW;
  const showerAt = s(5.8) + tally.length * s(1);
  let acc = 0;
  return (
    <Slide>
      <Header kicker="CaseDistiller-Lite · the SQL scorecard" width={1000} size={44}>
        A scorecard adds <Em at={s(1.2)}>integer points</Em> for and against.
      </Header>
      <div style={{ position: "absolute", top: 156, left: 0, width: 540 }}>
        <Fade at={s(1.4)}><Caption style={{ paddingBottom: S.s2 }}>LCD 30-day mortality (exploratory) · 10 of {LCD_TERM_COUNT} terms</Caption></Fade>
        {LCD_TERMS.map((t, i) => {
          const at = s(1.8) + i * 6;
          const p = prog(frame, at, 20);
          return (
            <div key={t.term} style={{ display: "grid", gridTemplateColumns: "200px 56px 1fr", alignItems: "center", height: 31, opacity: p, borderTop: `1px solid ${C.rule}` }}>
              <span style={{ ...T.code, fontSize: 15 }}>{t.term}</span>
              <span style={{ ...T.data, fontSize: 15, color: C.ink, textAlign: "right", paddingRight: 12 }}>{t.points > 0 ? `+${t.points}` : `−${-t.points}`}</span>
              <div style={{ position: "relative", height: 14 }}>
                <div style={{ position: "absolute", left: 50, top: -9, bottom: -9, width: 1, background: C.ink }} />
                <div style={{
                  position: "absolute", top: 0, height: 14, background: t.points > 0 ? C.teal : C.blue,
                  left: t.points > 0 ? 51 : 50 + t.points * unit * p, width: Math.abs(t.points) * unit * p,
                }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 180, left: 600, width: 552, display: "grid", gap: S.s3 }}>
        <Fade at={s(4.6)}><div style={{ ...T.title, fontSize: 24 }}>A record is flagged when its total reaches {LCD_THRESHOLD}.</div></Fade>
        <Fade at={s(5.2)}>
          <svg width={trackW + 40} height={150}>
            <rect x={0} y={40} width={trackW} height={44} fill={C.paperSunk} />
            {tally.map((t, i) => {
              const x = X(acc);
              acc += t.v;
              const at = s(5.8) + i * s(1);
              const p = prog(frame, at, 18);
              const last = i === tally.length - 1;
              const w = X(t.v);
              return (
                <g key={t.term}>
                  <rect x={x} y={40} width={w * p} height={44} fill={last ? C.coral : C.teal} stroke={C.paper} strokeWidth={2} />
                  <text x={x + w / 2} y={i % 2 ? 128 : 108} textAnchor="middle" opacity={p} style={{ ...T.data, fontSize: 12 }} fill={C.ink}>{t.term}</text>
                </g>
              );
            })}
            {/* shower subtracts: the total falls back below the threshold */}
            <g opacity={prog(frame, showerAt, 18)}>
              <rect x={X(after)} y={40} width={X(shower)} height={44} fill={C.blue} opacity={0.85} />
              <text x={X(after) + X(shower) / 2 + 18} y={146} textAnchor="middle" style={{ ...T.data, fontSize: 12 }} fill={C.blue}>shower −{shower}</text>
            </g>
            <line x1={X(LCD_THRESHOLD)} x2={X(LCD_THRESHOLD)} y1={22} y2={94} stroke={C.ink} strokeWidth={3} />
            <text x={X(LCD_THRESHOLD)} y={14} textAnchor="middle" style={{ ...T.data, fontSize: 13 }} fill={C.ink}>{LCD_THRESHOLD}</text>
          </svg>
        </Fade>
        <Fade at={showerAt + s(1)}>
          <div style={{ ...T.body, fontSize: 17 }}>
            Four terms give <b>345</b>; <b>palliative</b> brings it to <b>{peak}</b>; <b>shower</b> subtracts {shower}, leaving <b>{after}</b>, just below {LCD_THRESHOLD}.
          </div>
        </Fade>
        <Fade at={showerAt + s(2)}>
          <Caption>Illustrative tally of excerpted weights, not a patient record. Each matched term counts once; the threshold applies to the complete {LCD_TERM_COUNT}-term scorecard.</Caption>
        </Fade>
      </div>
      <Fade at={s(8)} style={{ position: "absolute", bottom: 0, left: 0 }}>
        <DataLine>L1 logistic regression on routes and frequent phrases · 5-fold CV · integer points, |points| ≤ 100</DataLine>
      </Fade>
    </Slide>
  );
};

// 11 · CaseDistiller-Agentic: optional refinement, measured and selected by the host
export const AgentLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = [
    { who: "agent", title: "Inspect", sub: "training evidence only", fill: C.teal, ink: C.onCool },
    { who: "agent", title: "Propose", sub: "an explicit program edit", fill: C.teal, ink: C.onCool },
    { who: "host", title: "Measure", sub: "compile, then score on training and validation", fill: C.oak, ink: C.ink },
    { who: "host", title: "Promote", sub: "pooled development F1; ties go to the smaller program", fill: C.oak, ink: C.ink },
  ];
  const W = 252, G = 48;
  return (
    <Slide>
      <Header kicker="CaseDistiller-Agentic · optional refinement" width={1100} size={44}>
        The agent proposes; <Em at={s(1.2)}>the host measures and selects</Em>.
      </Header>
      <div style={{ position: "absolute", top: 150, left: 0, width: 1152, height: 170 }}>
        {steps.map((st, i) => (
          <Fade key={st.title} at={s(1.6) + i * s(0.8)} style={{ position: "absolute", left: i * (W + G), top: 0, width: W }}>
            <Panel w={W} h={112} fill={st.fill} pad={16}>
              <div style={{ display: "grid", gap: 4 }}>
                <span style={{ ...T.kicker, fontSize: 11, color: st.ink }}>{i + 1} · {st.who}</span>
                <div style={{ ...T.title, fontSize: 21, color: st.ink }}>{st.title}</div>
                <div style={{ ...T.caption, color: st.ink }}>{st.sub}</div>
              </div>
            </Panel>
          </Fade>
        ))}
        <svg width={1152} height={170} style={{ position: "absolute", inset: 0 }}>
          {[0, 1, 2].map((i) => {
            const x = i * (W + G) + W + 8;
            return (
              <g key={i} opacity={prog(frame, s(2.2) + i * s(0.8), 12)}>
                <path d={`M${x} 56 L${x + G - 16} 56`} stroke={C.blue} strokeWidth={1.5} />
                <path d={`M${x + G - 23} 49 L${x + G - 15} 56 L${x + G - 23} 63`} stroke={C.blue} strokeWidth={1.5} fill="none" />
              </g>
            );
          })}
          {/* back to the agent for the next proposal */}
          <g opacity={prog(frame, s(4.6), 14)}>
            <path d={`M${3 * (W + G) + W / 2} 116 L${3 * (W + G) + W / 2} 146 L${W / 2} 146 L${W / 2} 122`} stroke={C.blue} strokeWidth={1.5} fill="none" />
            <path d={`M${W / 2 - 7} 130 L${W / 2} 121 L${W / 2 + 7} 130`} stroke={C.blue} strokeWidth={1.5} fill="none" />
            <text x={(3 * (W + G) + W) / 2} y={140} textAnchor="middle" style={{ ...T.caption, fontSize: 13 }} fill={C.blue}>next proposal, against the current incumbent</text>
          </g>
        </svg>
      </div>
      <div style={{ position: "absolute", top: 340, left: 0, width: 1152, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: S.s5 }}>
        <Fade at={s(5.4)}>
          <Caption style={{ color: C.ink, fontWeight: 700, paddingBottom: S.s2 }}>Training-only evidence probes</Caption>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["inspect", "read_evidence", "probe_fit"].map((t, i) => (
              <Reveal key={t} at={s(5.6) + i * 5}><span style={{ ...T.code, fontSize: 15, background: C.blueSoft, padding: "2px 8px", borderRadius: 4 }}>{t}</span></Reveal>
            ))}
          </div>
        </Fade>
        <Fade at={s(7)}>
          <Caption style={{ color: C.ink, fontWeight: 700, paddingBottom: S.s2 }}>Registered candidates, measured by the host</Caption>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["edit_and_measure", "widen_and_measure"].map((t, i) => (
              <Reveal key={t} at={s(7.2) + i * 5}><span style={{ ...T.code, fontSize: 15, background: C.oak, padding: "2px 8px", borderRadius: 4 }}>{t}</span></Reveal>
            ))}
          </div>
          <Caption style={{ marginTop: 6 }}>Widening is offered conditionally. Unsupported plain-SQL predicates are rejected before measurement.</Caption>
        </Fade>
        <Fade at={s(8.6)}>
          <Caption style={{ color: C.ink, fontWeight: 700, paddingBottom: S.s2 }}>What the agent sees</Caption>
          <div style={{ ...T.body, fontSize: 16, lineHeight: "23px" }}>
            Training metrics, the training records that changed, each route&rsquo;s contribution.
            <div style={{ marginTop: 6, color: C.tealDeep, fontWeight: 700 }}>Validation metrics: never.</div>
          </div>
        </Fade>
      </div>
      <Fade at={s(11)} style={{ position: "absolute", bottom: 0, left: 0, display: "grid", gap: 4 }}>
        <DataLine>Agent: Qwen3.8-27B or GLM-5.3-Flash, temperature 0, through a controller and Pi runtime that expose host tools only.</DataLine>
        <DataLine>Patience: five measured candidates without improvement stop a run, only after at least ten measured edits.</DataLine>
      </Fade>
    </Slide>
  );
};

// 12 · CaseDistiller-Agentic: one selected edit (ACT advanced heart disease, Figure 2)
export const AgentEdit: React.FC = () => (
  <Slide>
    <Header kicker="CaseDistiller-Agentic · an example edit" width={1100} size={44}>
      One selected edit extends the <Em at={s(1.2)}>ejection-fraction criterion</Em>.
    </Header>
    <div style={{ position: "absolute", top: 170, left: 0, width: 700, display: "grid", gap: S.s3 }}>
      <Fade at={s(1.6)}><Caption>ACT advanced heart disease · learned program, then Qwen run 2 of 3, selected by development F1</Caption></Fade>
      <Fade at={s(2)}>
        <div style={{ ...T.kicker, color: C.inkMuted, marginBottom: 6 }}>Learned route S1</div>
        <Code style={{ fontSize: 20, padding: "12px 18px" }}>value('ef', min ⇒ 5, max ⇒ 30)</Code>
      </Fade>
      <Fade at={s(4)}>
        <div style={{ ...T.kicker, color: C.tealDeep, marginBottom: 6 }}>Added by the agent · A2</div>
        <Code style={{ fontSize: 20, padding: "12px 18px", background: C.tealSoft }}>
          value('<b style={{ fontWeight: 600 }}>ejection fraction</b>', min ⇒ 5, max ⇒ 30)
        </Code>
        <Caption style={{ marginTop: 6 }}>The abbreviation extended to the spelled-out term; the learned bounds 5–30 retained.</Caption>
      </Fade>
      <Fade at={s(6.4)}>
        <Caption>The run also added routes A4–A7 for aortic stenosis and transplant; reported as a group, they matched 0 true and 1 false positive on the test split.</Caption>
      </Fade>
    </div>
    <div style={{ position: "absolute", top: 196, left: 780, width: 372, display: "grid", gap: S.s4 }}>
      <Fade at={s(7.4)}>
        <div style={{ ...T.numeralM, fontSize: 48, color: C.tealDeep }}>0.630 → 0.707</div>
        <Caption style={{ marginTop: 6 }}>held-out test F1 for this run</Caption>
      </Fade>
      <Fade at={s(8.6)}>
        <div style={{ ...T.body, fontSize: 17 }}>precision 0.78 → 0.80</div>
        <div style={{ ...T.body, fontSize: 17 }}>recall 0.53 → 0.64</div>
      </Fade>
      <Fade at={s(9.6)}>
        <div style={{ ...T.body, fontSize: 16, borderTop: `1px solid ${C.rule}`, paddingTop: S.s3 }}>
          One selected program edit, shown as an illustration; the mean over runs is on the ACT results slide.
        </div>
      </Fade>
    </div>
  </Slide>
);
