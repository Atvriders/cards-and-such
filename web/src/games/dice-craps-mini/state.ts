import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Craps Mini: 12 rounds. Player chooses Pass or Don't Pass before each shooter sequence.
// Standard craps rules: come-out roll: 7 or 11 = pass wins; 2,3,12 = pass loses (don't pass wins on 2,3; ties on 12).
// Otherwise that number is the "point". Roll until point repeats (pass wins) or 7 (pass loses).
// We'll auto-resolve the entire sequence.
// Win: pass bet wins -> +10. Don't pass wins -> +10. Don't-pass push (12 on come out) -> 0.

export const TOTAL_ROUNDS = 12;

export interface DiceCrapsMiniSettings { dummy: boolean; }

export interface RollEvent { a: number; b: number; sum: number; }

export interface DiceCrapsMiniState {
  rngSeed: number;
  round: number;
  bet: "pass" | "dontpass" | null;
  rolls: RollEvent[];
  point: number | null;
  outcome: "passWin" | "passLose" | "push" | null;
  score: number;
  phase: "betting" | "result" | "done";
  lastPts: number;
}

export type DiceCrapsMiniAction = { type: "bet"; choice: "pass" | "dontpass" } | { type: "next" };

function roll(rng: () => number): RollEvent {
  const a = 1 + Math.floor(rng() * 6);
  const b = 1 + Math.floor(rng() * 6);
  return { a, b, sum: a + b };
}

export function initialState(seed: number, _settings: DiceCrapsMiniSettings): DiceCrapsMiniState {
  return { rngSeed: seed, round: 1, bet: null, rolls: [], point: null, outcome: null, score: 0, phase: "betting", lastPts: 0 };
}

export function reducer(state: DiceCrapsMiniState, action: DiceCrapsMiniAction): DiceCrapsMiniState {
  if (state.phase === "done") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const rng = mulberry32(state.rngSeed);
    const rolls: RollEvent[] = [];
    let outcome: "passWin" | "passLose" | "push" | null = null;
    let point: number | null = null;
    const first = roll(rng);
    rolls.push(first);
    if (first.sum === 7 || first.sum === 11) outcome = "passWin";
    else if (first.sum === 2 || first.sum === 3) outcome = "passLose";
    else if (first.sum === 12) {
      outcome = action.choice === "dontpass" ? "push" : "passLose";
    } else {
      point = first.sum;
      // keep rolling
      for (let safety = 0; safety < 200 && outcome === null; safety++) {
        const r = roll(rng);
        rolls.push(r);
        if (r.sum === 7) outcome = "passLose";
        else if (r.sum === point) outcome = "passWin";
      }
    }
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    if (outcome === "push") pts = 0;
    else if (outcome === "passWin" && action.choice === "pass") pts = 10;
    else if (outcome === "passLose" && action.choice === "dontpass") pts = 10;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, bet: action.choice, rolls, point, outcome, score: state.score + pts, phase: isLast ? "done" : "result", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, bet: null, rolls: [], point: null, outcome: null, phase: "betting", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DiceCrapsMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
