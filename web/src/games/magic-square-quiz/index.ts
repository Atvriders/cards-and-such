import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MagicSquareQuizState, MagicSquareQuizAction, MagicSquareQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MagicSquareQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MagicSquareQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const magicSquareQuizPlugin: GamePlugin<MagicSquareQuizState, MagicSquareQuizAction, typeof settings> = {
  id: "magic-square-quiz",
  title: "Magic Square Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Quick quiz on magic squares: arrangements where rows, columns, and diagonals all sum to the same magic constant.",
  howToPlay: "Magic Square Quiz tests your knowledge of arrangements where every row, column, and diagonal sums to the same constant. The classic 3x3 magic square uses digits 1-9 and sums to 15 along every line. A 4x4 normal magic square sums to 34. Larger squares have larger constants based on the formula M = n(n^2 + 1)/2.\n\nThis quiz includes facts (constants for 3x3, 4x4, 5x5), classic completions (given a partial 3x3 magic square, what fills the empty cell), and famous historical squares like the Lo Shu of ancient China.\n\nYou'll see six questions per round. Each gives a small magic-square fact or a fill-in-the-blank with four multiple-choice options. Pick the correct answer; you score 100 points plus a time bonus per correct response.\n\nWrong answers reveal the correct value. Press Next to continue. Magic Square Quiz is a nice mathematical history lesson tucked into a puzzle game format.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as MagicSquareQuizSettings),
  reducer,
  isTerminal,
  hint: (state: MagicSquareQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: MagicSquareQuizGame,
};
