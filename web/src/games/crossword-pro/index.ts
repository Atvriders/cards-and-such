import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrosswordProState, CrosswordProAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CrosswordPro = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CrosswordPro as unknown as React.ComponentType<unknown> })));
export const crosswordProSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type CrosswordProSettingsType = SettingsOf<typeof crosswordProSettings>;

export const crosswordProPlugin: GamePlugin<CrosswordProState, CrosswordProAction, typeof crosswordProSettings> = {
  id: "crossword-pro",
  title: "Crossword Pro",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solve a classic crossword puzzle with across and down clues.",
  howToPlay: `Fill in all the white squares using the provided across and down clues. Every answer is an English word or phrase that fits the numbered pattern.

Click a clue from the list on the right to highlight the corresponding cells on the grid. Then type letters into each input cell. Answers are automatically checked — the puzzle is solved when every white square contains the correct letter.

If you get stuck, use the "Reveal a Letter" button to automatically fill in one incorrect or empty cell. Each reveal costs 100 points from your final score.

Scoring: 1000 − reveals × 100, minimum 50. Completing the puzzle without any reveals scores a perfect 1000.

Easy uses a compact 5×5 grid with simple vocabulary. Medium adds more crossing answers on a 5×5 grid. Hard challenges you with a 7×7 grid and longer, more complex words.

Tips: Start with shorter words — 2–3 letter answers help anchor longer crossing words. Fill in letters you are confident about first, then use those crossing letters as hints for the harder clues.`,
  settings: crosswordProSettings,
  initialState: (seed: number, settings: CrosswordProSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-crossword-pro-action"]', pulses: 3 }; },
  component: CrosswordPro,
};
