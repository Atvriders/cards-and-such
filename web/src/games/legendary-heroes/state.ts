import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const DECK: { name: string; value: number }[] = [
  { name: "Recruit", value: 1 },
  { name: "Sidekick", value: 2 },
  { name: "Hero", value: 3 },
  { name: "Champion", value: 4 },
  { name: "Legend", value: 5 },
  { name: "Avenger", value: 6 },
  { name: "Avatar", value: 7 },
];

export interface LegendaryHeroesSettings { dummy: boolean; }
export interface LegendaryHeroesState {
  rngSeed: number;
  round: number;
  you: number[];
  foe: number[];
  lastPts: number;
  score: number;
  phase: "drawing" | "scored" | "done";
}
export type LegendaryHeroesAction = { type: "draw" } | { type: "next" };
export function initialState(seed: number, _s: LegendaryHeroesSettings): LegendaryHeroesState {
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
export function reducer(state: LegendaryHeroesState, action: LegendaryHeroesAction): LegendaryHeroesState {
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
export function isTerminal(state: LegendaryHeroesState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
