import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 5;
export interface DiceThroneBattleSettings { dummy: boolean; }
export interface DiceThroneBattleState {
  rngSeed: number;
  round: number;
  rolls: number[];
  bonus: number;
  bonusName: string;
  lastPts: number;
  score: number;
  phase: "rolling" | "scored" | "done";
}
export type DiceThroneBattleAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _s: DiceThroneBattleSettings): DiceThroneBattleState {
  return { rngSeed: seed, round: 1, rolls: [], bonus: 0, bonusName: "", lastPts: 0, score: 0, phase: "rolling" };
}
export function scoreRoll(rolls: number[]): { base: number; bonus: number; name: string } {
  const base = rolls.reduce((a,b)=>a+b,0);
  const counts = new Map<number, number>();
  for (const r of rolls) counts.set(r, (counts.get(r) ?? 0) + 1);
  const cs = [...counts.values()].sort((a,b)=>b-a);
  let bonus = 0;
  let name = "No Match";
  if (cs[0] === 5) { bonus = 30; name = "Five of a Kind"; }
  else if (cs[0] === 4) { bonus = 20; name = "Four of a Kind"; }
  else if (cs[0] === 3 && cs[1] === 2) { bonus = 15; name = "Full House"; }
  else if (cs[0] === 3) { bonus = 10; name = "Three of a Kind"; }
  else if (cs[0] === 2 && cs[1] === 2) { bonus = 6; name = "Two Pair"; }
  else if (cs[0] === 2) { bonus = 3; name = "Pair"; }
  return { base, bonus, name };
}
export function reducer(state: DiceThroneBattleState, action: DiceThroneBattleAction): DiceThroneBattleState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const rolls: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) rolls.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { base, bonus, name } = scoreRoll(rolls);
    const total = base + bonus;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, rolls, bonus, bonusName: name, lastPts: total, score: state.score + total, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, rolls: [], bonus: 0, bonusName: "", lastPts: 0, phase: "rolling" };
  }
  return state;
}
export function isTerminal(state: DiceThroneBattleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
