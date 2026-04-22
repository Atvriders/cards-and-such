import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MathProblem {
  a: number;
  b: number;
  op: "+" | "-" | "*";
  answer: number;
  display: string;
}

export interface MathChallengeState {
  settings: { duration: "30" | "60" | "120"; operations: "add-sub" | "all" };
  problem: MathProblem;
  typed: string;
  elapsed: number;
  problemElapsed: number;
  score: number;
  attempted: number;
  correct: number;
  ended: boolean;
  rngSeed: number;
  rngCounter: number;
}

export type MathChallengeAction =
  | { type: "tick"; dt: number }
  | { type: "type"; text: string }
  | { type: "submit" };

const PROBLEM_TIME = 5; // seconds

function rngAt(seed: number, counter: number): number {
  const rng = mulberry32(seed + counter * 1000003);
  return rng();
}

function genProblem(
  seed: number,
  counter: number,
  difficulty: number, // 0-1
  operations: "add-sub" | "all",
): { problem: MathProblem; counter: number } {
  let c = counter;
  const maxNum = Math.round(10 + difficulty * 90); // 10 at start, up to 100 at hard

  const ops: Array<"+" | "-" | "*"> = operations === "all" ? ["+", "-", "*"] : ["+", "-"];
  const opIdx = Math.floor(rngAt(seed, c++) * ops.length);
  const op = ops[opIdx]!;

  let a: number;
  let b: number;
  let answer: number;

  if (op === "*") {
    // Keep multiplication manageable: up to 12×12
    a = 2 + Math.floor(rngAt(seed, c++) * 11);
    b = 2 + Math.floor(rngAt(seed, c++) * 11);
    answer = a * b;
  } else if (op === "+") {
    a = 1 + Math.floor(rngAt(seed, c++) * maxNum);
    b = 1 + Math.floor(rngAt(seed, c++) * maxNum);
    answer = a + b;
  } else {
    // subtraction: ensure positive result
    a = 1 + Math.floor(rngAt(seed, c++) * maxNum);
    b = 1 + Math.floor(rngAt(seed, c++) * (a));
    answer = a - b;
  }

  return {
    problem: { a, b, op, answer, display: `${a} ${op} ${b} = ?` },
    counter: c,
  };
}

export function initialState(
  seed: number,
  settings: { duration: "30" | "60" | "120"; operations: "add-sub" | "all" },
): MathChallengeState {
  const { problem, counter } = genProblem(seed, 0, 0, settings.operations);
  return {
    settings,
    problem,
    typed: "",
    elapsed: 0,
    problemElapsed: 0,
    score: 0,
    attempted: 0,
    correct: 0,
    ended: false,
    rngSeed: seed,
    rngCounter: counter,
  };
}

function nextProblem(state: MathChallengeState, difficulty: number): MathChallengeState {
  const { problem, counter } = genProblem(
    state.rngSeed,
    state.rngCounter,
    difficulty,
    state.settings.operations,
  );
  return { ...state, problem, typed: "", problemElapsed: 0, rngCounter: counter };
}

export function reducer(state: MathChallengeState, action: MathChallengeAction): MathChallengeState {
  if (state.ended) return state;

  switch (action.type) {
    case "tick": {
      const duration = parseInt(state.settings.duration, 10);
      const newElapsed = state.elapsed + action.dt;
      const newProblemElapsed = state.problemElapsed + action.dt;

      if (newElapsed >= duration) {
        return { ...state, elapsed: duration, ended: true };
      }

      if (newProblemElapsed >= PROBLEM_TIME) {
        // Time's up on this problem — advance to next, no points
        const difficulty = Math.min(1, newElapsed / duration);
        const s2 = nextProblem(
          { ...state, elapsed: newElapsed, attempted: state.attempted + 1 },
          difficulty,
        );
        return s2;
      }

      return { ...state, elapsed: newElapsed, problemElapsed: newProblemElapsed };
    }

    case "type": {
      // Allow digits and optional leading minus sign
      const cleaned = action.text.replace(/[^0-9-]/g, "").slice(0, 6);
      return { ...state, typed: cleaned };
    }

    case "submit": {
      if (state.typed === "") return state;
      const guess = parseInt(state.typed, 10);
      const correct = guess === state.problem.answer;
      const difficulty = Math.min(1, state.elapsed / parseInt(state.settings.duration, 10));
      const base = nextProblem(
        {
          ...state,
          score: correct ? state.score + 10 : state.score,
          attempted: state.attempted + 1,
          correct: correct ? state.correct + 1 : state.correct,
        },
        difficulty,
      );
      return base;
    }

    default:
      return state;
  }
}

export function isTerminal(state: MathChallengeState): { score: number } | null {
  if (!state.ended) return null;
  return { score: state.score };
}
