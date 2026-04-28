import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const DAYS = 30;

export interface PaydaySettings { dummy: boolean; }
export interface PaydayState {
  rngSeed: number;
  day: number;
  bank: number;
  log: { day: number; amount: number; label: string }[];
  lastRoll: number | null;
  phase: "rolling" | "resolved" | "done";
}
export type PaydayAction = { type: "roll" } | { type: "next" };

const INCOME = [
  { v: 50, label: "Side gig" },
  { v: 80, label: "Freelance" },
  { v: 120, label: "Bonus" },
  { v: 200, label: "PAYDAY!" },
];
const BILLS = [
  { v: -30, label: "Coffee" },
  { v: -60, label: "Groceries" },
  { v: -100, label: "Bill" },
  { v: -180, label: "Rent" },
];

export function initialState(seed: number, _s: PaydaySettings): PaydayState {
  return { rngSeed: seed, day: 1, bank: 200, log: [], lastRoll: null, phase: "rolling" };
}

export function reducer(state: PaydayState, action: PaydayAction): PaydayState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "rolling") {
    const rng = mulberry32(state.rngSeed);
    const r = 1 + Math.floor(rng() * 6);
    // Days 1-5 are likely income (PAYDAY-ish weeks), 6-30 mixed; weekends (5,12,19,26) increase income chance.
    const isWeekend = state.day % 7 === 5 || state.day % 7 === 6;
    const incomeChance = isWeekend ? 0.7 : 0.5;
    const isIncome = rng() < incomeChance;
    const idx = (r - 1) % 4;
    const event = isIncome ? INCOME[idx]! : BILLS[idx]!;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const bank = state.bank + event.v;
    const log = state.log.concat({ day: state.day, amount: event.v, label: event.label });
    const isLast = state.day >= DAYS;
    return { ...state, rngSeed: nextSeed, bank, log, lastRoll: r, phase: isLast ? "done" : "resolved" };
  }
  if (action.type === "next" && state.phase === "resolved") {
    return { ...state, day: state.day + 1, phase: "rolling", lastRoll: null };
  }
  return state;
}

export function score(s: PaydayState): number { return Math.max(0, s.bank); }
export function isTerminal(s: PaydayState): { score: number } | null { return s.phase === "done" ? { score: score(s) } : null; }
