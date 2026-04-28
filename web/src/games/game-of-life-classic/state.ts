import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const BOARD_LEN = 30;

// Each square: a life event with an effect on cash and family.
// type: payday/expense add cash; job sets income; marry/baby grows family; retire ends game.
export type SquareKind = "start" | "job" | "payday" | "expense" | "marry" | "baby" | "promotion" | "vacation" | "lottery" | "taxes" | "retire";
export interface Square { kind: SquareKind; label: string; cash: number; family: number; }
export const BOARD: Square[] = [
  { kind: "start",     label: "Start",        cash: 0,    family: 1 },
  { kind: "job",       label: "First Job",    cash: 30,   family: 0 },
  { kind: "payday",    label: "Payday",       cash: 50,   family: 0 },
  { kind: "expense",   label: "Rent Due",     cash: -20,  family: 0 },
  { kind: "marry",     label: "Get Married",  cash: -30,  family: 1 },
  { kind: "payday",    label: "Payday",       cash: 50,   family: 0 },
  { kind: "baby",      label: "First Child",  cash: -25,  family: 1 },
  { kind: "promotion", label: "Promotion",    cash: 80,   family: 0 },
  { kind: "expense",   label: "Car Repair",   cash: -40,  family: 0 },
  { kind: "vacation",  label: "Vacation",     cash: -50,  family: 0 },
  { kind: "payday",    label: "Payday",       cash: 60,   family: 0 },
  { kind: "baby",      label: "Second Child", cash: -25,  family: 1 },
  { kind: "lottery",   label: "Lottery!",     cash: 120,  family: 0 },
  { kind: "expense",   label: "Hospital",     cash: -50,  family: 0 },
  { kind: "payday",    label: "Payday",       cash: 70,   family: 0 },
  { kind: "promotion", label: "Big Raise",    cash: 100,  family: 0 },
  { kind: "expense",   label: "Home Repair",  cash: -60,  family: 0 },
  { kind: "payday",    label: "Payday",       cash: 70,   family: 0 },
  { kind: "vacation",  label: "Cruise",       cash: -80,  family: 0 },
  { kind: "lottery",   label: "Inheritance",  cash: 150,  family: 0 },
  { kind: "taxes",     label: "Taxes",        cash: -90,  family: 0 },
  { kind: "payday",    label: "Payday",       cash: 80,   family: 0 },
  { kind: "expense",   label: "College Fund", cash: -70,  family: 0 },
  { kind: "promotion", label: "Bonus",        cash: 110,  family: 0 },
  { kind: "payday",    label: "Payday",       cash: 80,   family: 0 },
  { kind: "expense",   label: "Wedding Gift", cash: -40,  family: 0 },
  { kind: "lottery",   label: "Stock Win",    cash: 140,  family: 0 },
  { kind: "payday",    label: "Final Payday", cash: 100,  family: 0 },
  { kind: "vacation",  label: "Retreat",      cash: -60,  family: 0 },
  { kind: "retire",    label: "Retire",       cash: 200,  family: 0 },
];

export interface ClassicSettings { dummy: boolean; }
export interface ClassicState {
  rngSeed: number;
  pos: number;
  cash: number;
  family: number;
  turn: number;
  lastSpin: number | null;
  lastSquare: number;
  phase: "spinning" | "resolved" | "done";
}
export type ClassicAction = { type: "spin" } | { type: "next" };

export function initialState(seed: number, _s: ClassicSettings): ClassicState {
  return { rngSeed: seed, pos: 0, cash: 100, family: 1, turn: 1, lastSpin: null, lastSquare: 0, phase: "spinning" };
}

export function reducer(state: ClassicState, action: ClassicAction): ClassicState {
  if (state.phase === "done") return state;
  if (action.type === "spin" && state.phase === "spinning") {
    const rng = mulberry32(state.rngSeed);
    const spin = 1 + Math.floor(rng() * 10);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pos = state.pos + spin;
    if (pos >= BOARD.length) pos = BOARD.length - 1;
    const sq = BOARD[pos]!;
    const cash = state.cash + sq.cash;
    const family = state.family + sq.family;
    const isRetire = sq.kind === "retire" || pos >= BOARD.length - 1;
    return { ...state, rngSeed: nextSeed, pos, cash, family, lastSpin: spin, lastSquare: pos, phase: isRetire ? "done" : "resolved" };
  }
  if (action.type === "next" && state.phase === "resolved") {
    return { ...state, turn: state.turn + 1, phase: "spinning", lastSpin: null };
  }
  return state;
}

export function score(s: ClassicState): number {
  // Cash + 25 per family member is the life score.
  return Math.max(0, s.cash + s.family * 25);
}

export function isTerminal(s: ClassicState): { score: number } | null {
  return s.phase === "done" ? { score: score(s) } : null;
}
