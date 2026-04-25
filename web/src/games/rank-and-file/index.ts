import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { RankAndFileState, RankAndFileAction, RankAndFileSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RankAndFile } from "./RankAndFile.js";

export const rankAndFileSettings = {} as const;

export const rankAndFilePlugin: GamePlugin<RankAndFileState, RankAndFileAction, typeof rankAndFileSettings> = {
  id: "rank-and-file",
  title: "Rank and File",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A Forty Thieves variant with alternating-color tableau builds and a small stock.",
  howToPlay: `Rank and File (also known as Dress Parade) is a demanding single-deck solitaire that puts a fresh spin on the Forty Thieves format.

Setup: Ten tableau columns of four cards each are dealt with only the top card face-up. A small stock of twelve cards sits at the side. Four foundations begin empty.

Goal: Build all four foundations up by suit from Ace to King.

Tableau: Build down in alternating colors (red on black, black on red), one card at a time. Unlike Forty Thieves, you do not need to match suit when moving a card to the tableau — any alternating-color descending play is legal. Only one card may be moved at a time (no sequences).

Stock: Draw one card at a time to the waste. The waste top is playable to foundations or the tableau. The stock cannot be recycled.

When a tableau column is emptied, any single card may fill it.

Tip: The alternating-color rule gives slightly more freedom than same-suit building. Use it to maneuver face-down cards into view. Because only single cards move, empty columns are precious — plan carefully before filling them so you do not block your own progress.`,
  settings: rankAndFileSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: RankAndFile,
};
