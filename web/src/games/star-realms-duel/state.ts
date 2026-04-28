import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const DECK: { name: string; value: number }[] = [
  { name: "Scout", value: 1 },
  { name: "Viper", value: 2 },
  { name: "Cutter", value: 3 },
  { name: "Frigate", value: 4 },
  { name: "Cruiser", value: 5 },
  { name: "Battleship", value: 6 },
  { name: "Destroyer", value: 7 },
  { name: "Dreadnought", value: 8 },
];

export interface StarRealmsDuelSettings { dummy: boolean; }
export interface StarRealmsDuelState {
  rngSeed: number;
  round: number;
  you: number[];
  foe: number[];
  lastPts: number;
  score: number;
  phase: "drawing" | "scored" | "done";
}
export type StarRealmsDuelAction = { type: "draw" } | { type: "next" };
export function initialState(seed: number, _s: StarRealmsDuelSettings): StarRealmsDuelState {
  return { rngSeed: seed, round: 1, you: [], foe: [], lastPts: 0, score: 0, phase: "drawing" };
}
function sumIdx(arr: number[]): number { return arr.reduce((a,i) => a + (DECK[i]?.value ?? 0), 0); }
export function scoreRound(you: number[], foe: number[]): number {
  const yv = sumIdx(you);
  const fv = sumIdx(foe);
  if (yv > fv) return Math.max(0, (yv - fv));
  if (yv < fv) return 0;
  return 1;
}
export function reducer(state: StarRealmsDuelState, action: StarRealmsDuelAction): StarRealmsDuelState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const you: number[] = [];
    const foe: number[] = [];
    for (let i = 0; i < 2; i++) you.push(Math.floor(rng() * DECK.length));
    for (let i = 0; i < 2; i++) foe.push(Math.floor(rng() * DECK.length));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = scoreRound(you, foe);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, you, foe, lastPts: pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, you: [], foe: [], lastPts: 0, phase: "drawing" };
  }
  return state;
}
export function isTerminal(state: StarRealmsDuelState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
