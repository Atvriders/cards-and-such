import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { JeopardyState, JeopardyAction, JeopardySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const JeopardyLike = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.JeopardyLike as unknown as React.ComponentType<unknown> })));
const settings = {
  finalRound: {
    kind: "boolean" as const,
    label: "Final Round",
    default: true,
  },
} as const;

export const jeopardyLikePlugin: GamePlugin<JeopardyState, JeopardyAction, typeof settings> = {
  id: "jeopardy-like",
  title: "Jeopardy-like",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Answer trivia clues across six categories on a classic point-value board. Wager everything in the Final Round.",
  howToPlay: `Jeopardy-like is a trivia game played on a board of six categories, each with five clues worth 200, 400, 600, 800, and 1,000 points. Your goal is to earn the highest possible score by answering clues correctly.

Click any dollar value on the board to reveal that clue. The category and point value appear at the top of the clue card. Press Answer when you are ready to type your response. Type your answer and press Submit (or Enter). If you are correct, that amount is added to your score. If you are wrong, it is subtracted — so think carefully before guessing on big-value clues.

After revealing your result, click Back to Board to continue. Work through all 30 clues on the board at any pace you like. Once all clues have been played, the game moves to the Final Round (if enabled in settings).

In the Final Round a single high-stakes clue is revealed. Enter your wager — any amount between 0 and your current score (minimum 1,000). You cannot go below 0 from a wrong Final answer. After wagering, type your answer and submit. A correct Final answer adds your wager; a wrong one deducts it.

Your final score is displayed when the game ends. Negative scores are floored to 0. Aim for 30,000 points — that requires getting every clue and the Final right!`,
  settings,
  initialState: (seed: number, s: JeopardySettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".jeo-btn", pulses: 3 }; },
  component: JeopardyLike,
};
