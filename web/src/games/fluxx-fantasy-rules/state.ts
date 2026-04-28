import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const CARDS_PER_ROUND = 3;
export const DECK: { name: string; value: number }[] = [
  { name: "Princess", value: 2 },
  { name: "Knight", value: 3 },
  { name: "Mage", value: 4 },
  { name: "Dragon", value: 5 },
  { name: "Wizard", value: 6 },
];

export const RULES = ["Sum","Max","Pair"] as const;
export type Rule = typeof RULES[number];
export interface FluxxFantasyRulesSettings { dummy: boolean; }
export interface FluxxFantasyRulesState {
  rngSeed: number;
  round: number;
  hand: number[];
  rule: Rule;
  lastPts: number;
  score: number;
  phase: "drawing" | "scored" | "done";
}
export type FluxxFantasyRulesAction = { type: "draw" } | { type: "next" };
export function initialState(seed: number, _s: FluxxFantasyRulesSettings): FluxxFantasyRulesState {
  return { rngSeed: seed, round: 1, hand: [], rule: "Sum", lastPts: 0, score: 0, phase: "drawing" };
}
export function scoreHand(hand: number[], rule: Rule): number {
  const vals = hand.map(i => DECK[i]?.value ?? 0);
  if (rule === "Sum") return vals.reduce((a,b)=>a+b,0);
  if (rule === "Max") return Math.max(...vals, 0) * 3;
  // Pair
  const counts = new Map<number, number>();
  for (const v of vals) counts.set(v, (counts.get(v) ?? 0) + 1);
  const hasPair = [...counts.values()].some(c => c >= 2);
  return hasPair ? 10 + Math.max(...vals, 0) : 5;
}
export function reducer(state: FluxxFantasyRulesState, action: FluxxFantasyRulesAction): FluxxFantasyRulesState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand: number[] = [];
    for (let i = 0; i < CARDS_PER_ROUND; i++) hand.push(Math.floor(rng() * DECK.length));
    const rule = RULES[Math.floor(rng() * RULES.length)]!;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = scoreHand(hand, rule);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, rule, lastPts: pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], rule: "Sum", lastPts: 0, phase: "drawing" };
  }
  return state;
}
export function isTerminal(state: FluxxFantasyRulesState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
