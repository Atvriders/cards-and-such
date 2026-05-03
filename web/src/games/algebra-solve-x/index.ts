import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { AlgebraSolveXState, AlgebraSolveXAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AlgebraSolveXGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AlgebraSolveXGame as unknown as React.ComponentType<unknown> })));
export const algebraSolveXSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "50"] as const,
    default: "10" as const,
  },
} as const;

type AlgebraSolveXSettingsType = SettingsOf<typeof algebraSolveXSettings>;

export const algebraSolveXPlugin: GamePlugin<AlgebraSolveXState, AlgebraSolveXAction, typeof algebraSolveXSettings> = {
  id: "algebra-solve-x",
  title: "Solve for X",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solve linear equations of the form ax + b = c. Find the value of x and type it in.",
  howToPlay: `Solve for X presents linear algebra equations and asks you to find the value of the unknown variable x. Each problem takes the form ax + b = c — for example 3x + 4 = 19 — and you must work out what x equals, then type it and press Enter.

All solutions are positive integers, so no fractions or negatives to worry about. The key technique is inverse operations: first subtract b from both sides to isolate the term with x, then divide both sides by a. For the example: 3x + 4 = 19 → 3x = 15 → x = 5.

Three difficulty levels control how large the numbers get. Easy keeps the coefficient (a) between 1 and 5 and x between 1 and 10, making mental arithmetic straightforward. Medium raises the coefficient to 10 and x to 20, requiring more mental multiplication. Hard pushes coefficients to 20 and x up to 50, demanding fluent arithmetic with larger numbers.

Each correct answer earns 10 points. Wrong answers show the correct x so you can see where you went astray.

Tips: Always check your answer by plugging x back into the equation. If 3 × 5 + 4 = 19, you're right. Look for single-step equations first — when b = 0, just divide c by a. With practice you will recognize common multiples instantly and speed through the problems.`,
  settings: algebraSolveXSettings,
  initialState: (seed: number, settings: AlgebraSolveXSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: AlgebraSolveXState): HintTarget | null => (state.phase === "playing" ? { selector: '[data-testid="hint-target-algebra-solve-x-primary"]', pulses: 3 } : null),
  component: AlgebraSolveXGame,
};
