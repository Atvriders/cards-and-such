import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type MathBingoState, type MathBingoAction } from "./state.js";
const MathBingo = /* @__PURE__ */ lazy(() => import("./MathBingo.js").then((mod) => ({ default: mod.MathBingo as unknown as React.ComponentType<unknown> })));
export const mathBingoSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

export const mathBingoPlugin: GamePlugin<MathBingoState, MathBingoAction, typeof mathBingoSettings> = {
  id: "math-bingo",
  title: "Math Bingo",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solve math problems to mark your 5×5 bingo card. Complete a line to win!",
  howToPlay: `Math Bingo combines classic bingo with mental arithmetic. You receive a 5×5 bingo card filled with numbers. The center square is a FREE space — automatically marked from the start.

Click Draw Problem to reveal a math equation. Solve the equation mentally and check whether the answer appears on your card. If it does, that cell is automatically marked! You do not need to click anything — the game marks it for you.

Your goal is to complete a line — five marked cells in a row horizontally, vertically, or diagonally. Get a line and you win!

Difficulty settings change the type and complexity of problems:
- Easy: addition and subtraction with small numbers (answers 1–30)
- Medium: adds multiplication (answers up to 80)
- Hard: adds division; larger numbers (answers up to 144)

Up to 30 problems are drawn before the game ends. Score: 500 base for winning, plus 10 bonus points for every problem below 30 you used. So solving the puzzle in 20 problems scores 600 total. No bingo in 30 draws scores 0.

Tips: on easy mode most answers are small, so design your mental grid of likely answers. On hard mode, division produces precise integer answers — watch for those.`,
  settings: mathBingoSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-math-bingo-action"]', pulses: 3 }; },
  component: MathBingo,
};
