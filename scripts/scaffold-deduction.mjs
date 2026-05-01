#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const GAMES = path.join(ROOT, "web/src/games");

function pascal(s) { return s.replace(/(^|[-_/])(\w)/g, (_, _b, c) => c.toUpperCase()); }
function exists(name) { return fs.existsSync(path.join(GAMES, name)); }

function deductionCss(prefix, accent, bg) {
  const p = prefix;
  return `.${p}-wrap{font-family:'Inter',system-ui,sans-serif;max-width:600px;margin:0 auto;padding:18px;display:flex;flex-direction:column;gap:14px;color:#0f172a;background:${bg};border-radius:14px}
.${p}-header{display:flex;align-items:center;gap:10px;font-weight:700}
.${p}-icon{font-size:1.6rem}
.${p}-scenario{flex:1;color:${accent}}
.${p}-round{font-family:'JetBrains Mono',monospace;font-size:0.85rem;background:#fff;padding:2px 8px;border-radius:6px;border:1px solid #cbd5e1;color:#475569}
.${p}-intro{font-size:0.9rem;color:#475569;background:rgba(255,255,255,0.6);padding:10px;border-radius:8px;border-left:3px solid ${accent}}
.${p}-history{display:flex;flex-direction:column;gap:6px;max-height:280px;overflow-y:auto}
.${p}-row{display:flex;align-items:center;gap:8px;padding:6px;background:#fff;border-radius:8px}
.${p}-row-pegs{display:flex;gap:4px;flex:1;flex-wrap:wrap}
.${p}-peg,.${p}-slot{display:inline-flex;align-items:center;justify-content:center;min-width:36px;height:36px;border-radius:8px;color:#fff;font-weight:700;font-family:'JetBrains Mono',monospace;font-size:0.85rem;padding:0 6px;border:none}
.${p}-row-fb{display:flex;gap:6px;font-family:'JetBrains Mono',monospace;font-size:0.8rem}
.${p}-fb-exact{color:#15803d;font-weight:700}
.${p}-fb-partial{color:#b45309}
.${p}-current{display:flex;gap:6px;justify-content:center;padding:10px;background:#fff;border-radius:10px;border:2px dashed ${accent};flex-wrap:wrap}
.${p}-slot{cursor:pointer;border:2px solid rgba(0,0,0,0.1);transition:transform 100ms}
.${p}-slot:hover{transform:scale(1.08)}
.${p}-submit{cursor:pointer;align-self:center;padding:10px 24px;border-radius:8px;background:${accent};color:#fff;border:none;font-weight:700}
.${p}-final{text-align:center;padding:24px;background:#fff;border-radius:14px}
.${p}-final-title{margin:0 0 8px;color:${accent}}
.${p}-final-score{font-family:'JetBrains Mono',monospace;font-size:1.8rem;font-weight:900;color:${accent}}
.${p}-final-stats{margin-top:8px;font-size:0.85rem;color:#475569;font-family:'JetBrains Mono',monospace}
`;
}

export function writeDeductionGame(spec) {
  const { folder, prefix, title, description, accent, bg, cfg, intro } = spec;
  const dir = path.join(GAMES, folder);
  if (!exists(folder)) return false;
  fs.mkdirSync(dir, { recursive: true });
  const Cls = pascal(folder);
  const stateTs = `import { deductionInitial, deductionSetCurrent, deductionSubmit, deductionScore, type DeductionConfig, type DeductionState } from "../_shared/deduction-engine.js";

export const ${Cls}_CFG: DeductionConfig = ${JSON.stringify(cfg, null, 2)};

export interface ${Cls}Settings { dummy: boolean; }
export type ${Cls}State = DeductionState;
export type ${Cls}Action = { type: "set"; position: number; value: number } | { type: "submit" };

export function initialState(seed: number, _s: ${Cls}Settings): ${Cls}State {
  return deductionInitial(seed, ${Cls}_CFG);
}

export function reducer(state: ${Cls}State, action: ${Cls}Action): ${Cls}State {
  if (action.type === "set") return deductionSetCurrent(state, action.position, action.value);
  if (action.type === "submit") return deductionSubmit(state, ${Cls}_CFG);
  return state;
}

export function isTerminal(state: ${Cls}State): { score: number } | null {
  const r = deductionScore(state, ${Cls}_CFG);
  return r ? { score: r.score } : null;
}

export const FLAVOR = ${JSON.stringify(intro || "")};
`;
  const gameTsx = `import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { ${Cls}State, ${Cls}Action, ${Cls}Settings } from "./state.js";
import { ${Cls}_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ${Cls}Game({ state, dispatch, onGameOver }: GameProps<${Cls}State, ${Cls}Settings>): JSX.Element {
  return (
    <DeductionView
      prefix=${JSON.stringify(prefix)}
      cfg={${Cls}_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as ${Cls}Action)}
      onSubmit={() => dispatch({ type: "submit" } as ${Cls}Action)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, ${Cls}_CFG)}
      intro={FLAVOR}
    />
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
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: ${JSON.stringify(description)},
  howToPlay: ${JSON.stringify(`${title} adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.`)},
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ${Cls}Settings),
  reducer,
  isTerminal,
  component: ${Cls}Game,
};

export default ${folder.replace(/-/g, "_")}_plugin;
`;
  const testTs = `import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ${Cls}_CFG } from "./state.js";

const S = { dummy: false };

describe(${JSON.stringify(folder)}, () => {
  it("starts in guess phase with empty history", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("guess");
    expect(s.guesses.length).toBe(0);
    expect(s.answer.length).toBe(${Cls}_CFG.answerLength);
  });
  it("set updates working guess", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "set", position: 0, value: 1 });
    expect(s1.current[0]).toBe(1);
  });
  it("submit appends a guess with feedback", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "submit" });
    expect(s1.guesses.length).toBe(1);
  });
  it("isTerminal null until done", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("submitting the answer wins", () => {
    let s = initialState(1, S);
    for (let i = 0; i < ${Cls}_CFG.answerLength; i++) {
      s = reducer(s, { type: "set", position: i, value: s.answer[i]! });
    }
    s = reducer(s, { type: "submit" });
    expect(s.phase).toBe("won");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("running out of guesses ends the puzzle", () => {
    let s = initialState(1, S);
    for (let i = 0; i < ${Cls}_CFG.maxGuesses; i++) {
      s = reducer(s, { type: "submit" });
    }
    expect(s.phase === "won" || s.phase === "lost").toBe(true);
  });
});
`;
  fs.writeFileSync(path.join(dir, "state.ts"), stateTs);
  fs.writeFileSync(path.join(dir, "Game.tsx"), gameTsx);
  fs.writeFileSync(path.join(dir, "Game.css"), deductionCss(prefix, accent, bg));
  fs.writeFileSync(path.join(dir, "index.ts"), indexTs);
  fs.writeFileSync(path.join(dir, "state.test.ts"), testTs);
  return true;
}

export { exists, GAMES };
