import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const CATEGORIES = ["ones","twos","threes","fours","fives","sixes","threeKind","fourKind","fullHouse","straight","temple"] as const;
export type Category = typeof CATEGORIES[number];

export interface DiceTempleSettings { dummy: boolean; }

export interface DiceTempleState {
  rngSeed: number;
  dice: number[];
  rerolls: number;
  card: Partial<Record<Category, number>>;
  score: number;
  phase: "roll" | "score" | "done";
  log: string;
}

export type DiceTempleAction = { type: "roll" } | { type: "claim"; cat: Category };

export function initialState(seed: number, _settings: DiceTempleSettings): DiceTempleState {
  return { rngSeed: seed, dice: [0,0,0,0,0], rerolls: 0, card: {}, score: 0, phase: "roll", log: "" };
}

export function categoryScore(cat: Category, dice: number[]): number {
  const counts = new Map<number, number>();
  dice.forEach(d => counts.set(d, (counts.get(d) ?? 0) + 1));
  const sum = dice.reduce((a,b)=>a+b,0);
  if (cat === "ones") return (counts.get(1) ?? 0) * 1;
  if (cat === "twos") return (counts.get(2) ?? 0) * 2;
  if (cat === "threes") return (counts.get(3) ?? 0) * 3;
  if (cat === "fours") return (counts.get(4) ?? 0) * 4;
  if (cat === "fives") return (counts.get(5) ?? 0) * 5;
  if (cat === "sixes") return (counts.get(6) ?? 0) * 6;
  const counts3 = Array.from(counts.values()).some(c => c >= 3);
  const counts4 = Array.from(counts.values()).some(c => c >= 4);
  const counts5 = Array.from(counts.values()).some(c => c >= 5);
  if (cat === "threeKind") return counts3 ? sum : 0;
  if (cat === "fourKind") return counts4 ? sum + 8 : 0;
  if (cat === "fullHouse") {
    const vals = Array.from(counts.values()).sort();
    return vals.length === 2 && vals[0] === 2 && vals[1] === 3 ? 25 : 0;
  }
  if (cat === "straight") {
    const sorted = Array.from(new Set(dice)).sort((a,b)=>a-b);
    if (sorted.length >= 4) {
      let run = 1;
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === sorted[i-1]! + 1) run++; else run = 1;
        if (run >= 4) return 30;
      }
    }
    return 0;
  }
  if (cat === "temple") return counts5 ? 50 : 0;
  return 0;
}

export function reducer(state: DiceTempleState, action: DiceTempleAction): DiceTempleState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "roll") {
    if (state.rerolls >= 3) return state;
    const rng = mulberry32(state.rngSeed);
    const dice = state.dice.map(() => 1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, dice, rerolls: state.rerolls + 1, phase: state.rerolls + 1 >= 3 ? "score" : "roll" };
  }
  if (action.type === "claim" && state.dice.every(d => d > 0)) {
    if (state.card[action.cat] !== undefined) return state;
    const pts = categoryScore(action.cat, state.dice);
    const card = { ...state.card, [action.cat]: pts };
    const score = state.score + pts;
    const phase: DiceTempleState["phase"] = Object.keys(card).length >= CATEGORIES.length ? "done" : "roll";
    return { ...state, card, score, phase, dice: [0,0,0,0,0], rerolls: 0, log: `Claimed ${action.cat} for ${pts}.` };
  }
  return state;
}

export function isTerminal(state: DiceTempleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
