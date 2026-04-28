import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const DECK: { name: string; value: number }[] = [
  { name: "Equipment", value: 2 },
  { name: "Equipment", value: 3 },
  { name: "Equipment", value: 4 },
  { name: "Equipment", value: 5 },
  { name: "Equipment", value: 6 },
  { name: "Monster", value: 1 },
  { name: "Monster", value: 3 },
  { name: "Monster", value: 5 },
  { name: "Monster", value: 7 },
];

export interface WelcomeToDungeonSettings { dummy: boolean; }
export interface WelcomeToDungeonState {
  rngSeed: number;
  round: number;
  you: number[];
  foe: number[];
  lastPts: number;
  score: number;
  phase: "drawing" | "scored" | "done";
}
export type WelcomeToDungeonAction = { type: "draw" } | { type: "next" };
export function initialState(seed: number, _s: WelcomeToDungeonSettings): WelcomeToDungeonState {
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
export function reducer(state: WelcomeToDungeonState, action: WelcomeToDungeonAction): WelcomeToDungeonState {
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
export function isTerminal(state: WelcomeToDungeonState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
