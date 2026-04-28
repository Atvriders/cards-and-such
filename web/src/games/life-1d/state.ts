import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const WIDTH = 32;

export type Rule = "30" | "90" | "110";

export interface Life1dSettings { rule: Rule; }
export interface Life1dState {
  rngSeed: number;
  row: number[];
  rule: Rule;
  generation: number;
  patterns: Set<string>; // serialized rows seen
  uniqueCount: number;
  phase: "running" | "done";
}
export type Life1dAction = { type: "step" } | { type: "step10" } | { type: "reset"; rule?: Rule } | { type: "finish" };

function ruleNum(r: Rule): number { return r === "30" ? 30 : r === "90" ? 90 : 110; }

export function initialState(seed: number, settings: Life1dSettings): Life1dState {
  const row = new Array(WIDTH).fill(0);
  row[Math.floor(WIDTH / 2)] = 1; // single seed cell in middle
  const sig = row.join("");
  return { rngSeed: seed, row, rule: settings.rule, generation: 0, patterns: new Set([sig]), uniqueCount: 1, phase: "running" };
}

export function step(row: number[], rule: Rule): number[] {
  const r = ruleNum(rule);
  const next = new Array(row.length).fill(0);
  for (let i = 0; i < row.length; i++) {
    const left = row[(i - 1 + row.length) % row.length]!;
    const center = row[i]!;
    const right = row[(i + 1) % row.length]!;
    const idx = (left << 2) | (center << 1) | right;
    next[i] = (r >> idx) & 1;
  }
  return next;
}

export function reducer(state: Life1dState, action: Life1dAction): Life1dState {
  if (state.phase === "done" && action.type !== "reset") return state;
  if (action.type === "step") {
    const row = step(state.row, state.rule);
    const sig = row.join("");
    const patterns = new Set(state.patterns);
    const before = patterns.size;
    patterns.add(sig);
    const uniqueCount = patterns.size > before ? state.uniqueCount + 1 : state.uniqueCount;
    return { ...state, row, generation: state.generation + 1, patterns, uniqueCount };
  }
  if (action.type === "step10") {
    let s = state;
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "step" });
    return s;
  }
  if (action.type === "reset") {
    return initialState(state.rngSeed, { rule: action.rule ?? state.rule });
  }
  if (action.type === "finish") {
    return { ...state, phase: "done" };
  }
  // Use rngSeed to satisfy unused warning - it's available for future expansion
  void mulberry32;
  return state;
}

export function score(s: Life1dState): number { return s.uniqueCount * 5 + s.generation; }
export function isTerminal(s: Life1dState): { score: number } | null { return s.phase === "done" ? { score: score(s) } : null; }
