import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROUNDS = 8;
export const GODS = ["sun", "moon", "river"] as const;
export type God = typeof GODS[number];

export interface DiceShrineSettings { dummy: boolean; }

export interface DiceShrineState {
  rngSeed: number;
  round: number;
  god: God;
  rolls: number[] | null;
  score: number;
  phase: "roll" | "result" | "done";
  log: string;
}

export type DiceShrineAction = { type: "offer" } | { type: "next" };

export function godScore(god: God, rolls: number[]): { pts: number; desc: string } {
  const sum = rolls.reduce((a,b)=>a+b,0);
  const evens = rolls.filter(r => r%2===0).length;
  const odds = rolls.length - evens;
  const high = rolls.filter(r => r>=5).length;
  if (god === "sun") return { pts: high * 8 + odds * 2, desc: `Sun favors odd & high (${high}H, ${odds}O)` };
  if (god === "moon") return { pts: evens * 6 + (sum >= 12 ? 8 : 0), desc: `Moon favors evens (${evens}E)` };
  return { pts: sum + (rolls[0] === rolls[1] && rolls[1] === rolls[2] ? 18 : 0), desc: `River favors flow (sum ${sum})` };
}

function pickGod(rng: () => number): God {
  return GODS[Math.floor(rng() * GODS.length)]!;
}

export function initialState(seed: number, _settings: DiceShrineSettings): DiceShrineState {
  const rng = mulberry32(seed);
  const god = pickGod(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, round: 1, god, rolls: null, score: 0, phase: "roll", log: "" };
}

export function reducer(state: DiceShrineState, action: DiceShrineAction): DiceShrineState {
  if (state.phase === "done") return state;
  if (action.type === "offer" && state.phase === "roll") {
    const rng = mulberry32(state.rngSeed);
    const r = [1+Math.floor(rng()*6), 1+Math.floor(rng()*6), 1+Math.floor(rng()*6)];
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { pts, desc } = godScore(state.god, r);
    return { ...state, rngSeed: nextSeed, rolls: r, score: state.score + pts, phase: "result", log: `${desc} +${pts}` };
  }
  if (action.type === "next" && state.phase === "result") {
    if (state.round >= ROUNDS) return { ...state, phase: "done" };
    const rng = mulberry32(state.rngSeed);
    const god = pickGod(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, round: state.round + 1, god, rolls: null, phase: "roll", log: "" };
  }
  return state;
}

export function isTerminal(state: DiceShrineState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
