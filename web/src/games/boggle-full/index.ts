import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const BoggleFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.BoggleFullGame as unknown as React.ComponentType<unknown>,
  }))
);

const settings = {
  duration: {
    kind: "enum" as const,
    label: "Round length",
    options: ["90", "180", "300"] as const,
    default: "180" as const,
  },
} as const;

type S = SettingsOf<typeof settings>;

export const boggleFullPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "boggle-full",
  title: "Boggle (Full)",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "3-minute word-finding race on a 4x4 grid of letter dice — longer words score more.",
  howToPlay:
    "Boggle (Full) is the classic 4x4 word-hunt against the clock. Sixteen standard Hasbro 1992 Boggle dice are rolled and laid out in a 4x4 grid. The countdown timer starts as soon as the game loads — default 3 minutes, configurable to 90s or 5 minutes in Settings.\n\nFind words by tracing through adjacent letters: click a starting cell, then click each subsequent letter. Letters are adjacent if they touch horizontally, vertically, or diagonally. You cannot reuse the same die in a single word. Click an already-selected cell to retrace back to that point. Press Clear (or Esc) to start over. Press Submit (or Enter) to lock in your word.\n\nYou can also type a word in the text box and press Enter — the game will auto-find any valid trace on the grid and submit it for you.\n\nWords must be at least 3 letters and appear in the embedded ~3000-word dictionary. Lookup is case-insensitive. Duplicate words are rejected.\n\nScoring: 3-4 letters = 1 pt, 5 = 2 pt, 6 = 3 pt, 7 = 5 pt, 8 or more = 11 pt. Hunt those long words!\n\nThe game runs a greedy CPU solver on the same grid at startup, finding a representative set of dictionary words to give you a target score to beat. If your final score exceeds the CPU's, you earn a 100-point bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (state: GameState): HintTarget | null => {
    if (state.done) return null;
    // If a trace has started, pulse the most recent cell — encouraging
    // the player to extend. Otherwise pulse the first cell as a nudge to
    // begin a word.
    const idx =
      state.currentPath.length > 0
        ? state.currentPath[state.currentPath.length - 1]!
        : 0;
    return { selector: `[data-testid="bgf-cell-${idx}"]`, pulses: 3 };
  },
  component: BoggleFullGame,
};
