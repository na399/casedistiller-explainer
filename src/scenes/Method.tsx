import React from "react";
import { useCurrentFrame } from "remotion";
import { C, S, T } from "../theme";
import { Bar, Caption, Code, DataLine, Em, Fade, Header, Panel, prog, Reveal, s, Slide } from "../components/ui";
import { LCD_TERMS } from "../data";

const Step: React.FC<{ n: number | string; title: string; children: React.ReactNode }> = ({ n, title, children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "34px 1fr", gap: S.s2 }}>
    <span style={{ ...T.numeralM, fontSize: 28, color: C.teal }}>{n}</span>
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ ...T.body, fontSize: 19, fontWeight: 700 }}>{title}</div>
      <div style={{ ...T.body, fontSize: 16, lineHeight: "23px" }}>{children}</div>
    </div>
  </div>
);

// 7 · CaseDistiller-Lite, steps 1–2: inventory and candidate routes, with FOIL
export const Candidates: React.FC = () => {
  const frame = useCurrentFrame();
  const foilAt = s(7);
  const TP = { a: 37, b: 21 }, FP = { a: 8, b: 3 };
  return (
    <Slide>
      <Header kicker="CaseDistiller-Lite · building candidate routes" width={1100} size={46}>
        A CPU learner reads the words and <Em at={s(1.2)}>grows routes</Em> one conjunct at a time.
      </Header>
      <div style={{ position: "absolute", top: 180, left: 0, width: 560, display: "grid", gap: S.s4 }}>
        <Fade at={s(1.8)}>
          <Step n={1} title="Phrase inventory">
            Phrases of up to three words within one sentence or field, scored by smoothed log-odds toward positive notes. Seed phrases and values from the case definition enter as routes.
          </Step>
        </Fade>
        <Fade at={s(4.4)}>
          <Step n={2} title="Candidate routes">
            Top phrases alone and in pairs; patterns merge positive-leaning words that share a prefix, <span style={{ ...T.code, fontSize: 14 }}>unde(r|rdosing|termined)</span>. FOIL information gain on note labels extends a leading phrase with up to two more phrases or patterns.
          </Step>
        </Fade>
        <Fade at={s(11)}>
          <Step n="2b" title="Exception forms">
            A negation cue or neighbouring word seen beside the anchor in training notes, up to eight per phrase, becomes a masked phrase: a learned ConText trigger.
          </Step>
        </Fade>
      </div>
      <div style={{ position: "absolute", top: 180, left: 620, width: 532 }}>
        <Fade at={foilAt}><Caption style={{ paddingBottom: S.s3 }}>FOIL extension · EMS suicide attempt · test true / false positives</Caption></Fade>
        <Fade at={foilAt}>
          <Code style={{ fontSize: 17 }}>phrase('poisoning')</Code>
          <div style={{ display: "flex", alignItems: "center", gap: S.s3, marginTop: S.s2 }}>
            <Bar value={TP.a} max={40} width={300} height={16} color={C.teal} at={foilAt + 6} />
            <span style={{ ...T.data, color: C.ink }}>{TP.a} TP</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: S.s3, marginTop: 4 }}>
            <Bar value={FP.a} max={40} width={300} height={16} color={C.coral} at={foilAt + 6} />
            <span style={{ ...T.data, color: C.ink }}>{FP.a} FP</span>
          </div>
        </Fade>
        <Fade at={foilAt + s(1.8)} style={{ marginTop: S.s4 }}>
          <Code style={{ fontSize: 17 }}>phrase('poisoning') <b style={{ color: C.blue, fontWeight: 500 }}>AND phrase('took')</b></Code>
          <div style={{ display: "flex", alignItems: "center", gap: S.s3, marginTop: S.s2 }}>
            <Bar value={TP.b} max={40} width={300} height={16} color={C.teal} at={foilAt + s(1.8) + 6} />
            <span style={{ ...T.data, color: C.ink }}>{TP.b} TP</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: S.s3, marginTop: 4 }}>
            <Bar value={FP.b} max={40} width={300} height={16} color={C.coral} at={foilAt + s(1.8) + 6} />
            <span style={{ ...T.data, color: C.ink }}>{FP.b} FP</span>
          </div>
        </Fade>
        <Fade at={foilAt + s(3.6)} style={{ marginTop: S.s4 }}>
          <div style={{ ...T.body, fontSize: 16, borderTop: `1px solid ${C.rule}`, paddingTop: S.s3 }}>
            The conjunct is kept when it raises information gain: the route trades true positives for a far purer match. Other routes cover the rest.
          </div>
        </Fade>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, opacity: prog(frame, s(13.5), 18) }}>
        <DataLine>EMS: 140 phrases + 16 seeds → 177 candidate routes · no network, no LLM, no GPU</DataLine>
      </div>
    </Slide>
  );
};

// 8 · CaseDistiller-Lite, steps 3–4: whole-program selection by local search, then finalist choice
export const Selection: React.FC = () => {
  const frame = useCurrentFrame();
  const funnel = [
    { label: "Candidate routes", v: 177 },
    { label: "Pool, after collapsing routes that flag the same notes", v: 110 },
    { label: "Finalists: 18 SQL + 4 guarded, lowered to SQL", v: 22 },
    { label: "Routes in the incumbent program", v: 11 },
  ];
  // Illustrative local search: moves over a small pool, cost falling.
  const moves = [
    { move: "start", on: [1, 0, 1, 0, 0, 1, 0, 0], cost: 2140 },
    { move: "add", on: [1, 0, 1, 1, 0, 1, 0, 0], cost: 1870 },
    { move: "swap", on: [1, 0, 0, 1, 0, 1, 0, 1], cost: 1615 },
    { move: "drop", on: [1, 0, 0, 1, 0, 0, 0, 1], cost: 1590 },
    { move: "add", on: [1, 1, 0, 1, 0, 0, 0, 1], cost: 1480 },
    { move: "swap", on: [1, 1, 0, 1, 1, 0, 0, 0], cost: 1455 },
  ];
  const searchAt = s(2), per = s(0.9);
  const k = Math.min(moves.length - 1, Math.max(0, Math.floor((frame - searchAt) / per)));
  const cur = moves[k];
  return (
    <Slide>
      <Header kicker="CaseDistiller-Lite · choosing the program" width={1100} size={46}>
        The selector picks a <Em at={s(1.2)}>whole program</Em>, priced per missed case.
      </Header>
      <div style={{ position: "absolute", top: 165, left: 0, width: 560, display: "grid", gap: 12 }}>
        <Fade at={s(1.6)}>
          <Step n={3} title="Whole-program selection">
            Local search over add, drop and swap moves, five starts × 48 weight settings, minimises on training notes:
          </Step>
        </Fade>
        <Fade at={s(3)}>
          <Code style={{ fontSize: 16, marginLeft: 42, padding: "8px 14px", whiteSpace: "nowrap" }}>cost(S) = 100·FN + c_fp·FP + w_r·|S| + w_l·L(S)</Code>
          <Caption style={{ marginLeft: 42, marginTop: 4 }}>FN, FP of the whole disjunction · |S| routes · L(S) literals · c_fp 50–300, w_r 0–200, w_l 0 or 25 · the weights price false alarms and size against a missed case</Caption>
        </Fade>
        <div style={{ marginLeft: 42, marginTop: S.s2, opacity: prog(frame, searchAt, 12) }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {cur.on.map((o, i) => (
              <div key={i} style={{ width: 44, height: 22, background: o ? C.teal : C.paperSunk }} />
            ))}
            <span style={{ ...T.kicker, color: C.blue, marginLeft: S.s2 }}>{cur.move}</span>
            <span style={{ ...T.data, color: C.ink, marginLeft: "auto" }}>cost {cur.cost.toLocaleString()}</span>
          </div>
          <Caption style={{ marginTop: 4 }}>Illustration of one trajectory: pool routes toggle in and out until no move lowers the cost.</Caption>
        </div>
        <Fade at={s(9)}>
          <Step n={4} title="Finalist choice">
            Among SQL finalists and guarded finalists lowered to SQL, the highest validation F1, then fewer literals, becomes the incumbent every later edit must beat.
          </Step>
        </Fade>
      </div>
      <div style={{ position: "absolute", top: 180, left: 620, width: 532, display: "grid", gap: 18 }}>
        <Fade at={s(5)}><Caption>EMS suicide attempt</Caption></Fade>
        {funnel.map((f, i) => {
          const at = s(5.4) + i * s(1.4);
          const last = i === funnel.length - 1;
          return (
            <Fade key={f.label} at={at}>
              <div style={{ display: "flex", alignItems: "center", gap: S.s3 }}>
                <Bar value={f.v} max={177} width={340} height={34} color={last ? C.coral : C.teal} at={at + 4} />
                <span style={{ ...T.numeralM, fontSize: 38, color: last ? C.coral : C.ink }}>{f.v}</span>
              </div>
              <Caption style={{ marginTop: 4 }}>{f.label}</Caption>
            </Fade>
          );
        })}
      </div>
    </Slide>
  );
};

// 9 · The SQL scorecard (LCD)
export const Scorecard: React.FC = () => {
  const frame = useCurrentFrame();
  const unit = 1.5; // px per point in the term list
  const tally = [
    { term: "hospice", v: 100 }, { term: "comfort", v: 97 }, { term: "dnr", v: 88 },
    { term: "metastatic", v: 60 }, { term: "palliative", v: 48 },
  ];
  const threshold = 366, trackMax = 420, trackW = 500;
  let acc = 0;
  return (
    <Slide>
      <Header kicker="CaseDistiller-Lite · the SQL scorecard" width={1000}>
        Or weigh the same cues in <Em at={s(1.2)}>integer points</Em>.
      </Header>
      <div style={{ position: "absolute", top: 170, left: 0, width: 520 }}>
        <Fade at={s(1.4)}><Caption style={{ paddingBottom: S.s2 }}>LCD 30-day mortality · 9 of 139 terms</Caption></Fade>
        {LCD_TERMS.map((t, i) => {
          const at = s(1.8) + i * 6;
          const p = prog(frame, at, 20);
          return (
            <div key={t.term} style={{ display: "grid", gridTemplateColumns: "150px 60px 1fr", alignItems: "center", height: 36, opacity: p, borderTop: `1px solid ${C.rule}` }}>
              <span style={{ ...T.code, fontSize: 16 }}>{t.term}</span>
              <span style={{ ...T.data, fontSize: 16, color: C.ink, textAlign: "right", paddingRight: 12 }}>{t.points > 0 ? `+${t.points}` : `−${-t.points}`}</span>
              <div style={{ position: "relative", height: 16 }}>
                <div style={{ position: "absolute", left: 60, top: -10, bottom: -10, width: 1, background: C.ink }} />
                <div style={{
                  position: "absolute", top: 0, height: 16, background: t.points > 0 ? C.teal : C.blue,
                  left: t.points > 0 ? 61 : 60 + t.points * unit * p, width: Math.abs(t.points) * unit * p,
                }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 196, left: 600, width: 552, display: "grid", gap: S.s3 }}>
        <Fade at={s(4.6)}><div style={{ ...T.title, fontSize: 26 }}>A note is flagged when its points reach 366.</div></Fade>
        <Fade at={s(5.2)}>
          <svg width={trackW + 40} height={150}>
            <rect x={0} y={40} width={trackW} height={44} fill={C.paperSunk} />
            {tally.map((t, i) => {
              const x = (acc / trackMax) * trackW;
              acc += t.v;
              const at = s(5.8) + i * s(1);
              const p = prog(frame, at, 18);
              const last = i === tally.length - 1;
              const w = (t.v / trackMax) * trackW;
              return (
                <g key={t.term}>
                  <rect x={x} y={40} width={w * p} height={44} fill={last ? C.coral : C.teal} stroke={C.paper} strokeWidth={2} />
                  <text x={x + w / 2} y={i % 2 ? 128 : 108} textAnchor="middle" opacity={p} style={{ ...T.data, fontSize: 12 }} fill={C.ink}>{t.term}</text>
                </g>
              );
            })}
            <line x1={(threshold / trackMax) * trackW} x2={(threshold / trackMax) * trackW} y1={22} y2={94} stroke={C.ink} strokeWidth={3} />
            <text x={(threshold / trackMax) * trackW} y={14} textAnchor="middle" style={{ ...T.data, fontSize: 13 }} fill={C.ink}>366</text>
          </svg>
        </Fade>
        <Fade at={s(10.4)}>
          <div style={{ ...T.body, fontSize: 18 }}>
            <b>345</b> after four cues stays below the threshold; <b>palliative</b> brings it to <b>393</b>.
          </div>
        </Fade>
        <Fade at={s(11.2)}><Caption>Illustrative sum of five term weights, not a patient record.</Caption></Fade>
      </div>
      <Fade at={s(8)} style={{ position: "absolute", bottom: 0, left: 0 }}>
        <DataLine>L1 logistic regression on routes and frequent phrases · 5-fold CV · integer points, |points| ≤ 100</DataLine>
      </Fade>
    </Slide>
  );
};

// 10 · CaseDistiller-Agentic: the host–agent loop through the Pi runtime
export const AgentLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const y = 230;
  const Node: React.FC<{ x: number; w: number; at: number; fill: string; title: string; sub: string; ink?: string }> = ({ x, w, at, fill, title, sub, ink = C.ink }) => (
    <Fade at={at} style={{ position: "absolute", left: x, top: 0, width: w }}>
      <Panel w={w} h={120} fill={fill} pad={16}>
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ ...T.title, fontSize: 20, color: ink }}>{title}</div>
          <div style={{ ...T.caption, color: ink }}>{sub}</div>
        </div>
      </Panel>
    </Fade>
  );
  const Link: React.FC<{ x: number; at: number }> = ({ x, at }) => (
    <svg width={40} height={120} style={{ position: "absolute", left: x, top: 0, opacity: prog(frame, at, 12) }}>
      <path d="M4 52 L34 52 M27 45 L35 52 L27 59" stroke={C.blue} strokeWidth={1.5} fill="none" />
      <path d="M36 68 L6 68 M13 61 L5 68 L13 75" stroke={C.blue} strokeWidth={1.5} fill="none" />
    </svg>
  );
  return (
    <Slide>
      <Header kicker="CaseDistiller-Agentic · construction-time refinement" width={1100} size={46}>
        An LLM agent proposes through host tools. <Em at={s(1.2)}>The host alone decides.</Em>
      </Header>
      <div style={{ position: "absolute", top: 160, left: 0, width: 1152, height: 120 }}>
        <Node x={0} w={230} at={s(1.6)} fill={C.teal} ink={C.onCool} title="LLM agent" sub="Qwen3.8-27B or GLM-5.3-Flash, temperature 0" />
        <Link x={234} at={s(2.2)} />
        <Node x={278} w={250} at={s(2.4)} fill={C.paperSunk} title="Controller" sub="credential, grant, budget: 48 calls, 64 candidates" />
        <Link x={532} at={s(3)} />
        <Node x={576} w={250} at={s(3.2)} fill={C.paperSunk} title="Pi runtime" sub="host tools only; no file, shell or network access" />
        <Link x={830} at={s(3.8)} />
        <Node x={874} w={278} at={s(4)} fill={C.oak} title="Host" sub="CaseDistiller-Lite engine, journal of every candidate" />
      </div>
      <div style={{ position: "absolute", top: y + 70, left: 0, width: 1152, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: S.s5 }}>
        <Fade at={s(5)}>
          <Caption style={{ color: C.ink, fontWeight: 700, paddingBottom: S.s2 }}>What the agent can call</Caption>
          <div style={{ display: "grid", gap: 6 }}>
            {["inspect", "read_evidence", "probe_fit", "edit_and_measure", "widen", "finish"].map((t, i) => (
              <Reveal key={t} at={s(5.2) + i * 5}><span style={{ ...T.code, fontSize: 15, background: C.blueSoft, padding: "2px 8px", borderRadius: 4 }}>{t}</span></Reveal>
            ))}
          </div>
        </Fade>
        <Fade at={s(7.2)}>
          <Caption style={{ color: C.ink, fontWeight: 700, paddingBottom: S.s2 }}>What comes back from a measured edit</Caption>
          <div style={{ ...T.body, fontSize: 16, lineHeight: "24px" }}>
            Training metrics, the training notes that changed prediction, and each route&rsquo;s contribution.
            <div style={{ marginTop: S.s2, color: C.tealDeep, fontWeight: 700 }}>Validation metrics: never.</div>
          </div>
        </Fade>
        <Fade at={s(9.4)}>
          <Caption style={{ color: C.ink, fontWeight: 700, paddingBottom: S.s2 }}>How the host promotes</Caption>
          <div style={{ ...T.body, fontSize: 16, lineHeight: "24px" }}>
            A candidate replaces the incumbent only if it ranks higher on development F1, then on fewer literals and routes. Candidates with no exact plain-SQL form are refused before measurement.
          </div>
        </Fade>
      </div>
      <Fade at={s(12)} style={{ position: "absolute", bottom: 0, left: 0 }}>
        <DataLine>Five measured candidates without a gain end construction, but only after ten measured edits: a broad first draft cannot end a run.</DataLine>
      </Fade>
    </Slide>
  );
};

// 11 · CaseDistiller-Agentic: what an agent run adds (ACT advanced heart disease, Figure 3B)
export const AgentEdit: React.FC = () => {
  const frame = useCurrentFrame();
  const phases = ["CONSTRUCTING", "WIDEN", "FINISH_REQUIRED", "FINISHED"];
  const phaseAt = (i: number) => s(1.6) + i * s(0.8);
  const active = phases.reduce((a, _, i) => (frame >= phaseAt(i) ? i : a), -1);
  const inherited = [
    { rule: "value('ef', min ⇒ 5, max ⇒ 30)", tp: 23, fp: 5 },
    { rule: "value('lvef', min ⇒ 5, max ⇒ 30)", tp: 7, fp: 0 },
    { rule: "phrase('severe aortic stenosis')", tp: 3, fp: 3 },
  ];
  const added = [
    { rule: "value('ejection fraction', min ⇒ 5, max ⇒ 30)", tp: 8, fp: 1 },
    { rule: "phrase('critical aortic stenosis')", tp: 0, fp: 0 },
    { rule: "phrase('cardiac transplant')", tp: 0, fp: 0 },
    { rule: "phrase('severe aortic valve stenosis')", tp: 0, fp: 1 },
  ];
  const Row: React.FC<{ r: { rule: string; tp: number; fp: number }; at: number; added?: boolean }> = ({ r, at, added: isNew }) => (
    <Reveal at={at}>
      <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 90px", gap: S.s2, alignItems: "center", padding: "8px 0", borderTop: `1px solid ${C.rule}` }}>
        <span style={{ ...T.kicker, color: isNew ? C.coral : C.inkMuted }}>{isNew ? "A" : "S"}</span>
        <span style={{ ...T.code, fontSize: 15 }}>{r.rule}</span>
        <span style={{ ...T.data, color: C.ink, textAlign: "right" }}>{r.tp} / {r.fp}</span>
      </div>
    </Reveal>
  );
  return (
    <Slide>
      <Header kicker="CaseDistiller-Agentic · what a run adds" width={1100} size={46}>
        Agent edits are <Em at={s(1.2)}>clinically specific</Em>, and the test split stays sealed.
      </Header>
      <Fade at={s(1.4)} style={{ position: "absolute", top: 150, left: 0, width: 1152 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
          {phases.map((p, i) => (
            <div key={p} style={{ ...T.kicker, fontSize: 12, padding: "9px 10px", background: i <= active ? C.tealSoft : C.paperSunk, color: C.ink }}>{p}</div>
          ))}
        </div>
      </Fade>
      <div style={{ position: "absolute", top: 212, left: 0, width: 700 }}>
        <Fade at={s(4)} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 6 }}>
          <Caption>ACT advanced heart disease · SQL program, then the development-best run (Qwen, run 2)</Caption>
          <Caption>test TP / FP</Caption>
        </Fade>
        {inherited.map((r, i) => <Row key={r.rule} r={r} at={s(4.4) + i * 10} />)}
        {added.map((r, i) => <Row key={r.rule} r={r} at={s(6.4) + i * s(0.8)} added />)}
      </div>
      <div style={{ position: "absolute", top: 220, left: 760, width: 392, display: "grid", gap: S.s4 }}>
        <Fade at={s(7)}>
          <div style={{ ...T.body, fontSize: 17 }}>The agent carried the learned ejection-fraction bound to the spelled-out term and added aortic stenosis and transplant routes.</div>
        </Fade>
        <Fade at={s(10)}>
          <div style={{ ...T.numeralM, fontSize: 44, color: C.tealDeep }}>0.630 → 0.707</div>
          <Caption style={{ marginTop: 6 }}>test F1, scored once after the run froze its incumbent</Caption>
        </Fade>
        <Fade at={s(12)}>
          <div style={{ ...T.body, fontSize: 16, borderTop: `1px solid ${C.rule}`, paddingTop: S.s3 }}>
            The agent chose from training evidence only; the host measured development F1; nobody saw the test notes.
          </div>
        </Fade>
      </div>
      <Fade at={s(13)} style={{ position: "absolute", bottom: 0, left: 0 }}>
        <DataLine>3 runs per model and start (4 on EMS) · each run freezes its incumbent with its lineage · no run was selected after test scoring</DataLine>
      </Fade>
    </Slide>
  );
};
