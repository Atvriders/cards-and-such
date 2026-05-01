import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const BOARD_LEN = 30;

// Each square is a life event with deterministic effect on the player.
// Order traces a young-to-old life arc.
export type SquareKind =
  | "start"
  | "job"        // sets jobIncome (early career)
  | "promotion"  // raises jobIncome (mid career)
  | "payday"     // adds current jobIncome to cash
  | "marry"      // +1 family, small cost
  | "baby"       // +1 family, modest cost
  | "expense"    // cash drain
  | "vacation"   // cash drain (treat yourself)
  | "lottery"    // cash boost
  | "taxes"      // cash drain
  | "retire";    // end square: cash bonus, lock in score

export type Stage = "early" | "mid" | "late" | "retired";

export interface Square {
  kind: SquareKind;
  label: string;
  cash: number;       // immediate cash delta (positive or negative)
  family: number;     // family delta
  income?: number;    // if defined: sets jobIncome (job) or adds to it (promotion)
}

// 30 squares. Job sits at square 1; promotions punctuate the journey;
// paydays add accumulated income. Retire is square 29 (final).
export const BOARD: Square[] = [
  { kind: "start",     label: "Start",          cash: 0,    family: 1 },
  { kind: "job",       label: "First Job",      cash: 20,   family: 0, income: 40 },
  { kind: "payday",    label: "Payday",         cash: 0,    family: 0 },
  { kind: "expense",   label: "Rent Due",       cash: -25,  family: 0 },
  { kind: "marry",     label: "Get Married",    cash: -30,  family: 1 },
  { kind: "payday",    label: "Payday",         cash: 0,    family: 0 },
  { kind: "vacation",  label: "Honeymoon",      cash: -40,  family: 0 },
  { kind: "promotion", label: "Promotion",      cash: 30,   family: 0, income: 25 },
  { kind: "baby",      label: "First Child",    cash: -25,  family: 1 },
  { kind: "payday",    label: "Payday",         cash: 0,    family: 0 },
  { kind: "lottery",   label: "Stock Win",      cash: 90,   family: 0 },
  { kind: "expense",   label: "Car Repair",     cash: -45,  family: 0 },
  { kind: "baby",      label: "Second Child",   cash: -30,  family: 1 },
  { kind: "promotion", label: "Big Raise",      cash: 40,   family: 0, income: 30 },
  { kind: "payday",    label: "Payday",         cash: 0,    family: 0 },
  { kind: "expense",   label: "Hospital",       cash: -55,  family: 0 },
  { kind: "vacation",  label: "Family Trip",    cash: -50,  family: 0 },
  { kind: "payday",    label: "Payday",         cash: 0,    family: 0 },
  { kind: "lottery",   label: "Inheritance",    cash: 130,  family: 0 },
  { kind: "expense",   label: "Home Repair",    cash: -65,  family: 0 },
  { kind: "promotion", label: "Executive",      cash: 60,   family: 0, income: 40 },
  { kind: "taxes",     label: "Taxes Due",      cash: -90,  family: 0 },
  { kind: "payday",    label: "Payday",         cash: 0,    family: 0 },
  { kind: "expense",   label: "College Fund",   cash: -70,  family: 0 },
  { kind: "lottery",   label: "Bonus Quarter",  cash: 110,  family: 0 },
  { kind: "vacation",  label: "Cruise",         cash: -60,  family: 0 },
  { kind: "payday",    label: "Final Payday",   cash: 0,    family: 0 },
  { kind: "expense",   label: "Wedding Gift",   cash: -40,  family: 0 },
  { kind: "lottery",   label: "Pension Bonus",  cash: 120,  family: 0 },
  { kind: "retire",    label: "Retire",         cash: 200,  family: 0 },
];

export interface ClassicSettings {
  startingCash: number;
}

export interface LogEntry {
  turn: number;
  spin: number;
  square: number;
  label: string;
  cashDelta: number;
  familyDelta: number;
  cashAfter: number;
  familyAfter: number;
  incomeAfter: number;
}

export interface ClassicState {
  rngSeed: number;
  pos: number;
  cash: number;
  family: number;
  jobIncome: number;     // current per-payday income
  isRetired: boolean;
  turn: number;
  lastSpin: number | null;
  lastSquare: number;
  stage: Stage;
  phase: "spinning" | "spin-anim" | "resolved" | "done";
  spinAnimValue: number; // displayed during spin animation
  log: LogEntry[];       // most-recent-first, capped
}

export type ClassicAction =
  | { type: "spin" }
  | { type: "spin-tick"; value: number }
  | { type: "spin-finish" }
  | { type: "next" };

export function stageFor(pos: number, retired: boolean): Stage {
  if (retired) return "retired";
  if (pos < 8) return "early";
  if (pos < 20) return "mid";
  return "late";
}

export function initialState(seed: number, s: ClassicSettings): ClassicState {
  const cash = s.startingCash ?? 100;
  return {
    rngSeed: seed,
    pos: 0,
    cash,
    family: 1,
    jobIncome: 0,
    isRetired: false,
    turn: 1,
    lastSpin: null,
    lastSquare: 0,
    stage: "early",
    phase: "spinning",
    spinAnimValue: 1,
    log: [],
  };
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

    let cashDelta = sq.cash;
    let jobIncome = state.jobIncome;
    if (sq.kind === "job") jobIncome = sq.income ?? jobIncome;
    else if (sq.kind === "promotion") jobIncome = jobIncome + (sq.income ?? 0);
    else if (sq.kind === "payday") cashDelta = jobIncome; // payday pays current income

    const cash = state.cash + cashDelta;
    const family = state.family + sq.family;
    const isRetire = sq.kind === "retire" || pos >= BOARD.length - 1;
    const stage: Stage = isRetire ? "retired" : stageFor(pos, false);

    const entry: LogEntry = {
      turn: state.turn,
      spin,
      square: pos,
      label: sq.label,
      cashDelta,
      familyDelta: sq.family,
      cashAfter: cash,
      familyAfter: family,
      incomeAfter: jobIncome,
    };
    const log = [entry, ...state.log].slice(0, 8);

    return {
      ...state,
      rngSeed: nextSeed,
      pos,
      cash,
      family,
      jobIncome,
      isRetired: isRetire,
      lastSpin: spin,
      lastSquare: pos,
      stage,
      phase: isRetire ? "done" : "resolved",
      spinAnimValue: spin,
      log,
    };
  }

  if (action.type === "next" && state.phase === "resolved") {
    return { ...state, turn: state.turn + 1, phase: "spinning", lastSpin: null };
  }

  return state;
}

export function score(s: ClassicState): number {
  // Life score = remaining cash + 25 per family + 50 per stage reached.
  const stageBonus = s.stage === "retired" ? 200 : s.stage === "late" ? 100 : s.stage === "mid" ? 50 : 0;
  return Math.max(0, s.cash + s.family * 25 + stageBonus);
}

export function isTerminal(s: ClassicState): { score: number } | null {
  return s.phase === "done" ? { score: score(s) } : null;
}
