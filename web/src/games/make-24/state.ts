import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";

export interface Make24Settings {
  difficulty: "easy" | "medium" | "hard";
}

export interface Make24State {
  settings: Make24Settings;
  numbers: readonly number[]; // the 4 numbers
  expression: string;         // player's typed expression
  result: number | null;      // null if not yet evaluated or error
  error: string | null;
  won: boolean;
  attempts: number;
}

export type Make24Action =
  | { type: "setExpression"; value: string }
  | { type: "submit" }
  | { type: "clear" };

export function initialState(seed: number, settings: Make24Settings): Make24State {
  const rng = mulberry32(seed);
  const pool = PUZZLES[settings.difficulty];
  const idx = Math.floor(rng() * pool.length);
  const numbers = pool[idx]!.slice().sort(() => rng() - 0.5);

  return {
    settings,
    numbers,
    expression: "",
    result: null,
    error: null,
    won: false,
    attempts: 0,
  };
}

/**
 * Safely evaluate a mathematical expression using only +, -, *, /, (, ), spaces,
 * and the digits from the allowed set. Returns the numeric result or throws.
 *
 * Security: We only allow digits, operators, parens, and whitespace.
 */
export function safeEval(expr: string): number {
  // Whitelist: digits, spaces, operators, parens, decimal point
  if (!/^[\d\s+\-*/().]+$/.test(expr)) {
    throw new Error("Invalid characters in expression");
  }
  // Use Function constructor — safe given the whitelist above
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const result = Function(`"use strict"; return (${expr})`)() as unknown;
  if (typeof result !== "number" || !isFinite(result)) {
    throw new Error("Result is not a finite number");
  }
  return result;
}

/** Check that the digits used in expr match exactly the allowed numbers. */
export function usesCorrectNumbers(expr: string, numbers: readonly number[]): boolean {
  // Extract all digit sequences from the expression
  const matches = expr.match(/\d+/g);
  if (!matches) return false;
  const used = matches.map(Number);
  if (used.length !== numbers.length) return false;
  const sorted1 = used.slice().sort((a, b) => a - b);
  const sorted2 = numbers.slice().sort((a, b) => a - b);
  return sorted1.every((v, i) => v === sorted2[i]);
}

export function reducer(state: Make24State, action: Make24Action): Make24State {
  if (state.won) return state;

  switch (action.type) {
    case "setExpression":
      return { ...state, expression: action.value, error: null, result: null };

    case "clear":
      return { ...state, expression: "", error: null, result: null };

    case "submit": {
      const expr = state.expression.trim();
      if (!expr) return { ...state, error: "Enter an expression first" };

      if (!usesCorrectNumbers(expr, state.numbers)) {
        return {
          ...state,
          attempts: state.attempts + 1,
          error: `Use each of ${state.numbers.join(", ")} exactly once`,
          result: null,
        };
      }

      let val: number;
      try {
        val = safeEval(expr);
      } catch {
        return { ...state, attempts: state.attempts + 1, error: "Invalid expression", result: null };
      }

      const rounded = Math.round(val * 1000) / 1000; // handle floating point
      const won = Math.abs(rounded - 24) < 0.001;

      return {
        ...state,
        attempts: state.attempts + 1,
        result: rounded,
        error: won ? null : `= ${rounded}, not 24. Try again!`,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: Make24State): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - (state.attempts - 1) * 100) };
}
