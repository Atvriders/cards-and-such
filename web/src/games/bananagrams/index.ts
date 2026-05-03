import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { BananagramsState, BananagramsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Bananagrams = /* @__PURE__ */ lazy(() => import("./Bananagrams.js").then((mod) => ({ default: mod.Bananagrams as unknown as React.ComponentType<unknown> })));
export const bananagramsSettings = {
  tileCount: {
    kind: "enum" as const,
    label: "Tile count",
    options: ["15", "21", "30"] as const,
    default: "21" as const,
  },
} as const;

type BananagramsSettingsType = SettingsOf<typeof bananagramsSettings>;

export const bananagramsPlugin: GamePlugin<BananagramsState, BananagramsAction, typeof bananagramsSettings> = {
  id: "bananagrams",
  title: "Bananagrams",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Arrange letter tiles into a connected crossword grid where every word is valid.",
  howToPlay: `Bananagrams is a single-player tile-arranging puzzle. You start with a hand of letter tiles and must arrange them all into a connected crossword-style grid before time runs out. Every continuous run of two or more tiles in the same row or column must form a valid English word.

How to play: first, click a tile in your hand (it will highlight). Then click any empty cell on the grid to place it there. You can remove a placed tile by clicking it — it returns to your hand. Keep rearranging until all tiles form a valid connected grid.

When you think your arrangement is correct, click the Validate button. The game will check every horizontal and vertical sequence of two or more letters. If all sequences are valid words and the grid is fully connected, you score points equal to 10 per tile placed, with a 50-point bonus if you used every tile in your hand. If any word is invalid, the game shows you which ones to fix.

The game ends automatically when the 5-minute timer expires. Your score at that point is based on whatever valid tiles you have placed.

Settings allow you to choose 15, 21, or 30 starting tiles. More tiles means more complex arrangements but higher potential scores. Tips: try to build out from the center, linking shorter words with longer ones. Use common 2- and 3-letter words to bridge gaps. Words like AT, IT, IN, OR, and AN are very useful connectors.`,
  settings: bananagramsSettings,
  initialState: (seed: number, settings: BananagramsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: BananagramsState): HintTarget | null => {
    if (state.gameOver) return null;
    return { selector: ".bng-grid-scroll", pulses: 3 };
  },
  component: Bananagrams,
};
