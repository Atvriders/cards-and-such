#!/usr/bin/env node
// Scaffold cooperative + party games into web/src/games.
// Generates state.ts, Game.tsx, Game.css, index.ts, state.test.ts using
// shared coop-engine / quiz-engine + per-game theming.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const GAMES = path.join(ROOT, "web/src/games");

function pascal(s) {
  return s.replace(/(^|[-_/])(\w)/g, (_, _b, c) => c.toUpperCase());
}
function exists(name) { return fs.existsSync(path.join(GAMES, name)); }
function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }

// ---------------------- Coop CSS template ----------------------
function coopCss(prefix, accent, bg) {
  const p = prefix;
  return `.${p}-wrap{font-family:'Inter',system-ui,sans-serif;max-width:680px;margin:0 auto;padding:18px;display:flex;flex-direction:column;gap:14px;color:#0f172a;background:${bg};border-radius:14px}
.${p}-header{display:flex;align-items:center;gap:10px;font-weight:700;font-size:1.05rem}
.${p}-icon{font-size:1.6rem}
.${p}-scenario{flex:1;color:${accent}}
.${p}-round{font-family:'JetBrains Mono',monospace;font-size:0.85rem;color:#475569;background:#fff;padding:2px 8px;border-radius:6px;border:1px solid #cbd5e1}
.${p}-intro{font-size:0.9rem;color:#475569;background:rgba(255,255,255,0.6);padding:10px;border-radius:8px;border-left:3px solid ${accent}}
.${p}-bars{display:flex;flex-direction:column;gap:6px}
.${p}-bar-label{font-family:'JetBrains Mono',monospace;font-size:0.75rem;color:#334155;margin-bottom:2px}
.${p}-bar-track{height:10px;border-radius:5px;background:#e2e8f0;overflow:hidden}
.${p}-bar-fill{height:100%;transition:width 200ms ease}
.${p}-bar-good{background:linear-gradient(90deg,#10b981,#059669)}
.${p}-bar-bad{background:linear-gradient(90deg,#f59e0b,#dc2626)}
.${p}-morale{font-size:1rem;color:#dc2626;letter-spacing:2px;font-family:'JetBrains Mono',monospace}
.${p}-last{font-family:'JetBrains Mono',monospace;font-size:0.8rem;color:#475569;background:#fff;padding:6px 10px;border-radius:6px;border:1px solid #cbd5e1}
.${p}-tactics{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.${p}-tactic{cursor:pointer;text-align:left;padding:10px;border-radius:10px;background:#fff;border:2px solid transparent;transition:all 150ms;display:flex;flex-direction:column;gap:2px;font-family:'Inter',system-ui,sans-serif}
.${p}-tactic:hover:not(:disabled){border-color:${accent};transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.08)}
.${p}-tactic:disabled{opacity:0.5;cursor:not-allowed}
.${p}-tactic-emoji{font-size:1.4rem}
.${p}-tactic-name{font-weight:700;color:${accent}}
.${p}-tactic-meta{font-family:'JetBrains Mono',monospace;font-size:0.7rem;color:#64748b}
.${p}-tactic-desc{font-size:0.78rem;color:#475569;line-height:1.3}
.${p}-log{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;max-height:140px;overflow-y:auto}
.${p}-log-line{font-family:'JetBrains Mono',monospace;font-size:0.72rem;color:#64748b;padding:3px 6px;border-radius:4px;background:rgba(255,255,255,0.5)}
.${p}-final{text-align:center;padding:24px;background:#fff;border-radius:14px}
.${p}-final-title{margin:0 0 8px;color:${accent}}
.${p}-final-score{font-family:'JetBrains Mono',monospace;font-size:1.8rem;font-weight:900;color:${accent}}
.${p}-final-stats{margin-top:8px;font-size:0.85rem;color:#64748b;font-family:'JetBrains Mono',monospace}
`;
}

function quizCss(prefix, accent, bg) {
  const p = prefix;
  return `.${p}-wrap{font-family:'Inter',system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;display:flex;flex-direction:column;gap:14px;color:#0f172a;background:${bg};border-radius:14px}
.${p}-header{display:flex;align-items:center;justify-content:space-between;font-weight:700}
.${p}-progress{font-family:'JetBrains Mono',monospace;font-size:0.85rem;color:#475569}
.${p}-score{font-family:'JetBrains Mono',monospace;font-size:0.9rem;color:${accent};font-weight:700}
.${p}-q{font-size:1.1rem;font-weight:600;line-height:1.4;padding:14px;background:#fff;border-radius:10px;border-left:4px solid ${accent}}
.${p}-choices{display:flex;flex-direction:column;gap:8px}
.${p}-choice{cursor:pointer;text-align:left;padding:12px 14px;border-radius:10px;background:#fff;border:2px solid #e2e8f0;font-family:'Inter',system-ui,sans-serif;font-size:1rem;transition:all 120ms;color:#0f172a}
.${p}-choice:hover:not(:disabled){border-color:${accent};background:#f8fafc}
.${p}-choice:disabled{cursor:not-allowed}
.${p}-choice.${p}-correct{background:#dcfce7;border-color:#16a34a;color:#15803d}
.${p}-choice.${p}-wrong{background:#fee2e2;border-color:#dc2626;color:#991b1b}
.${p}-feedback{font-weight:700;text-align:center;padding:12px;border-radius:10px}
.${p}-feedback.${p}-good{background:#dcfce7;color:#15803d}
.${p}-feedback.${p}-bad{background:#fee2e2;color:#991b1b}
.${p}-next{cursor:pointer;padding:10px 24px;border-radius:8px;background:${accent};color:#fff;border:none;font-weight:700;font-size:1rem;align-self:center}
.${p}-final{text-align:center;padding:24px;background:#fff;border-radius:14px}
.${p}-final-title{margin:0 0 8px;color:${accent}}
.${p}-final-score{font-family:'JetBrains Mono',monospace;font-size:1.8rem;font-weight:900;color:${accent}}
.${p}-streak{font-family:'JetBrains Mono',monospace;font-size:0.8rem;color:#64748b}
`;
}

// ---------------------- Coop game writer ----------------------
function writeCoopGame(spec) {
  const { folder, prefix, title, description, accent, bg, cfg, tactics, intro, difficulty } = spec;
  const dir = path.join(GAMES, folder);
  if (!exists(folder)) return false;
  ensureDir(dir);
  const Cls = pascal(folder);
  const stateTs = `import { coopInitial, coopStep, coopScore, type CoopEngineConfig, type CoopState } from "../_shared/coop-engine.js";

export const ${Cls}_CFG: CoopEngineConfig = ${JSON.stringify({ ...cfg, tactics }, null, 2)};

export interface ${Cls}Settings { difficulty: "Easy" | "Standard" | "Hard"; }
export type ${Cls}State = CoopState;
export type ${Cls}Action = { type: "play"; tacticId: string };

function diffNum(s: ${Cls}Settings): number {
  if (s.difficulty === "Easy") return 0.8;
  if (s.difficulty === "Hard") return 1.3;
  return 1.0;
}

export function initialState(seed: number, s: ${Cls}Settings): ${Cls}State {
  return coopInitial(seed, ${Cls}_CFG, diffNum(s));
}

export function reducer(state: ${Cls}State, action: ${Cls}Action): ${Cls}State {
  if (action.type === "play") return coopStep(state, ${Cls}_CFG, action.tacticId);
  return state;
}

export function isTerminal(state: ${Cls}State): { score: number } | null {
  const r = coopScore(state, ${Cls}_CFG);
  return r ? { score: r.score } : null;
}

export const TOTAL_ROUNDS = ${Cls}_CFG.totalRounds;
export const TARGET_SCORE = ${Cls}_CFG.progressTarget;
export const FLAVOR = ${JSON.stringify(intro || "")};
`;
  const gameTsx = `import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { ${Cls}State, ${Cls}Action, ${Cls}Settings } from "./state.js";
import { ${Cls}_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ${Cls}Game({ state, dispatch, onGameOver }: GameProps<${Cls}State, ${Cls}Settings>): JSX.Element {
  return (
    <CoopView
      prefix=${JSON.stringify(prefix)}
      cfg={${Cls}_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as ${Cls}Action)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, ${Cls}_CFG)}
      intro={FLAVOR}
    />
  );
}
`;
  const indexTs = `import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ${Cls}State, ${Cls}Action, ${Cls}Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ${Cls}Game } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const ${folder.replace(/-/g, "_")}_plugin: GamePlugin<${Cls}State, ${Cls}Action, typeof settings> = {
  id: ${JSON.stringify(folder)},
  title: ${JSON.stringify(title)},
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: ${JSON.stringify(description)},
  howToPlay: ${JSON.stringify(`${title} is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.`)},
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ${Cls}Settings),
  reducer,
  isTerminal,
  component: ${Cls}Game,
};

export default ${folder.replace(/-/g, "_")}_plugin;
`;
  const testTs = `import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, TARGET_SCORE } from "./state.js";

const S = { difficulty: "Standard" as const };

describe(${JSON.stringify(folder)}, () => {
  it("starts in choose phase with full morale", () => {
    const s = initialState(42, S);
    expect(s.phase).toBe("choose");
    expect(s.progress).toBe(0);
    expect(s.morale).toBeGreaterThan(0);
    expect(s.round).toBe(1);
  });
  it("playing a tactic advances round", () => {
    const s0 = initialState(42, S);
    const tid = ${JSON.stringify(tactics[0].id)};
    const s1 = reducer(s0, { type: "play", tacticId: tid });
    expect(s1.round).toBe(2);
    expect(s1.lastTactic).toBe(tid);
  });
  it("isTerminal null until done", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game ends within total rounds", () => {
    let s = initialState(7, S);
    let safety = 0;
    while (s.phase !== "done" && safety++ < TOTAL_ROUNDS + 5) {
      s = reducer(s, { type: "play", tacticId: ${JSON.stringify(tactics[0].id)} });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("invalid tactic id is a no-op", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "play", tacticId: "__bogus__" });
    expect(s1).toBe(s0);
  });
  it("target score is positive", () => { expect(TARGET_SCORE).toBeGreaterThan(0); });
});
`;
  fs.writeFileSync(path.join(dir, "state.ts"), stateTs);
  fs.writeFileSync(path.join(dir, "Game.tsx"), gameTsx);
  fs.writeFileSync(path.join(dir, "Game.css"), coopCss(prefix, accent, bg));
  fs.writeFileSync(path.join(dir, "index.ts"), indexTs);
  fs.writeFileSync(path.join(dir, "state.test.ts"), testTs);
  return true;
}

// ---------------------- Quiz game writer ----------------------
function writeQuizGame(spec) {
  const { folder, prefix, title, description, accent, bg, questions } = spec;
  const dir = path.join(GAMES, folder);
  if (!exists(folder)) return false;
  ensureDir(dir);
  const Cls = pascal(folder);
  const stateTs = `import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const ${Cls}_QUESTIONS: QuizQuestion[] = ${JSON.stringify(questions, null, 2)};

const CFG = { totalQuestions: Math.min(10, ${Cls}_QUESTIONS.length), pool: ${Cls}_QUESTIONS };

export interface ${Cls}Settings { dummy: boolean; }
export type ${Cls}State = QuizState;
export type ${Cls}Action = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: ${Cls}Settings): ${Cls}State {
  return quizInitial(seed, CFG);
}

export function reducer(state: ${Cls}State, action: ${Cls}Action): ${Cls}State {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: ${Cls}State): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
`;
  const gameTsx = `import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ${Cls}State, ${Cls}Action, ${Cls}Settings } from "./state.js";
import { isTerminal, TOTAL_QUESTIONS } from "./state.js";
import "./Game.css";

const P = ${JSON.stringify(prefix)};

export function ${Cls}Game({ state, dispatch, onGameOver }: GameProps<${Cls}State, ${Cls}Settings>): JSX.Element {
  const [start, setStart] = useState<number>(() => Date.now());
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  useEffect(() => { if (state.phase === "ask") setStart(Date.now()); }, [state.current, state.phase]);
  if (state.phase === "done") {
    return (
      <div className={\`\${P}-wrap\`}>
        <div className={\`\${P}-final\`}>
          <h2 className={\`\${P}-final-title\`}>${title} — Complete</h2>
          <div className={\`\${P}-final-score\`}>{state.score} pts</div>
          <div className={\`\${P}-streak\`}>{state.questions.length} questions answered</div>
        </div>
      </div>
    );
  }
  const q = state.questions[state.current];
  if (!q) return <div className={\`\${P}-wrap\`}>Loading…</div>;
  return (
    <div className={\`\${P}-wrap\`}>
      <div className={\`\${P}-header\`}>
        <span className={\`\${P}-progress\`}>Q{state.current + 1} / {TOTAL_QUESTIONS}</span>
        <span className={\`\${P}-score\`}>Score {state.score} · 🔥 {state.streak}</span>
      </div>
      <div className={\`\${P}-q\`}>{q.q}</div>
      <div className={\`\${P}-choices\`}>
        {q.choices.map((c, i) => {
          const isSel = state.lastAnswerIdx === i;
          const cls = state.phase === "feedback"
            ? i === q.answer ? \`\${P}-choice \${P}-correct\` : isSel ? \`\${P}-choice \${P}-wrong\` : \`\${P}-choice\`
            : \`\${P}-choice\`;
          return (
            <button
              key={i}
              className={cls}
              disabled={state.phase !== "ask"}
              type="button"
              onClick={() => dispatch({ type: "answer", choice: i, elapsedMs: Date.now() - start } as ${Cls}Action)}
            >{c}</button>
          );
        })}
      </div>
      {state.phase === "feedback" && (
        <>
          <div className={\`\${P}-feedback \${state.lastCorrect ? P + "-good" : P + "-bad"}\`}>
            {state.lastCorrect ? "Correct!" : \`Answer: \${q.choices[q.answer]}\`}
          </div>
          <button className={\`\${P}-next\`} type="button" onClick={() => dispatch({ type: "next" } as ${Cls}Action)}>
            {state.current + 1 >= TOTAL_QUESTIONS ? "See Results" : "Next"}
          </button>
        </>
      )}
    </div>
  );
}
`;
  const indexTs = `import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ${Cls}State, ${Cls}Action, ${Cls}Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ${Cls}Game } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ${folder.replace(/-/g, "_")}_plugin: GamePlugin<${Cls}State, ${Cls}Action, typeof settings> = {
  id: ${JSON.stringify(folder)},
  title: ${JSON.stringify(title)},
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: ${JSON.stringify(description)},
  howToPlay: ${JSON.stringify(`${title} solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.`)},
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ${Cls}Settings),
  reducer,
  isTerminal,
  component: ${Cls}Game,
};

export default ${folder.replace(/-/g, "_")}_plugin;
`;
  const testTs = `import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_QUESTIONS } from "./state.js";

const S = { dummy: false };

describe(${JSON.stringify(folder)}, () => {
  it("starts at first question", () => {
    const s = initialState(1, S);
    expect(s.current).toBe(0);
    expect(s.phase).toBe("ask");
    expect(s.questions.length).toBeGreaterThanOrEqual(1);
  });
  it("answering goes to feedback", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "answer", choice: 0, elapsedMs: 0 });
    expect(s1.phase).toBe("feedback");
  });
  it("next advances current", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "answer", choice: 0, elapsedMs: 0 });
    s = reducer(s, { type: "next" });
    expect(s.current).toBe(1);
  });
  it("isTerminal null until done", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("scoring correct yields >= 10 points", () => {
    const s0 = initialState(1, S);
    const correctIdx = s0.questions[0]!.answer;
    const s1 = reducer(s0, { type: "answer", choice: correctIdx, elapsedMs: 0 });
    expect(s1.score).toBeGreaterThanOrEqual(10);
  });
  it("completing all questions terminates", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      s = reducer(s, { type: "answer", choice: 0, elapsedMs: 0 });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
`;
  fs.writeFileSync(path.join(dir, "state.ts"), stateTs);
  fs.writeFileSync(path.join(dir, "Game.tsx"), gameTsx);
  fs.writeFileSync(path.join(dir, "Game.css"), quizCss(prefix, accent, bg));
  fs.writeFileSync(path.join(dir, "index.ts"), indexTs);
  fs.writeFileSync(path.join(dir, "state.test.ts"), testTs);
  return true;
}

export { writeCoopGame, writeQuizGame, exists, GAMES, ROOT };
