import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrosswordMiniState, CrosswordMiniAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CrosswordMini = /* @__PURE__ */ lazy(() => import("./CrosswordMini.js").then((mod) => ({ default: mod.CrosswordMini as unknown as React.ComponentType<unknown> })));
export const crosswordMiniSettings = {} as const;

type CrosswordMiniSettingsType = SettingsOf<typeof crosswordMiniSettings>;

export const crosswordMiniPlugin: GamePlugin<CrosswordMiniState, CrosswordMiniAction, typeof crosswordMiniSettings> = {
  id: "crossword-mini",
  title: "Crossword Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solve a compact 5×5 crossword with across and down clues.",
  howToPlay: `Crossword Mini presents a small 5×5 grid with numbered across and down clues. Your goal is to fill every white cell with the correct letter.

Click any white cell to select it. The selected cell is highlighted in blue. If you click the same cell twice, the active direction switches between across and down. You can also press Tab to toggle direction at any time.

Once a cell is selected, type any letter on your keyboard to fill it in — the cursor automatically advances to the next cell in the active direction. Press Backspace or Delete to erase the current cell's letter.

When you think you have finished (or just want to check your progress), click the Check Answers button. The grid will color green for every correct letter and red for every incorrect one. Your final score is the percentage of cells filled correctly, on a 0–100 scale.

Tips: start with the short answers you are most confident about to anchor the grid. Each black square separates answers, so any crossing word provides a letter that must work for both directions. If a cell conflicts, reconsider one of the two crossing answers. The puzzle is randomly selected from a set of 10 hand-crafted grids, so each game may feel different.`,
  settings: crosswordMiniSettings,
  initialState: (seed: number, settings: CrosswordMiniSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-crossword-mini-action"]', pulses: 3 }; },
  component: CrosswordMini,
};
