import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROUNDS = 10;

export interface DiceLaboratorySettings { dummy: boolean; }

export interface DiceLaboratoryState {
  rngSeed: number;
  round: number;
  rolls: number[];
  formula: number[]; // target formula, 3 dice values
  score: number;
  phase: "roll" | "result" | "done";
  log: string;
  matched: number;
}

export type DiceLaboratoryAction = { type: "mix" } | { type: "next" };

function makeFormula(rng: () => number): number[] {
  return [1+Math.floor(rng()*6), 1+Math.floor(rng()*6), 1+Math.floor(rng()*6)].sort();
}

export function initialState(seed: number, _settings: DiceLaboratorySettings): DiceLaboratoryState {
  const rng = mulberry32(seed);
  const formula = makeFormula(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, round: 1, rolls: [], formula, score: 0, phase: "roll", log: "", matched: 0 };
}

export function reducer(state: DiceLaboratoryState, action: DiceLaboratoryAction): DiceLaboratoryState {
  if (state.phase === "done") return state;
  if (action.type === "mix" && state.phase === "roll") {
    const rng = mulberry32(state.rngSeed);
    const r = [1+Math.floor(rng()*6), 1+Math.floor(rng()*6), 1+Math.floor(rng()*6)].sort();
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let matched = 0;
    const formCopy = [...state.formula];
    for (const d of r) {
      const i = formCopy.indexOf(d);
      if (i >= 0) { matched++; formCopy.splice(i, 1); }
    }
    let pts = matched * 8;
    if (matched === 3) pts += 14;
    return { ...state, rngSeed: nextSeed, rolls: r, score: state.score + pts, phase: "result", log: `Matched ${matched}/3 (+${pts}).`, matched };
  }
  if (action.type === "next" && state.phase === "result") {
    const round = state.round + 1;
    if (round > ROUNDS) return { ...state, phase: "done", log: "Lab session ends." };
    const rng = mulberry32(state.rngSeed);
    const formula = makeFormula(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, round, rngSeed: nextSeed, formula, rolls: [], phase: "roll", log: "", matched: 0 };
  }
  return state;
}

export function isTerminal(state: DiceLaboratoryState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
