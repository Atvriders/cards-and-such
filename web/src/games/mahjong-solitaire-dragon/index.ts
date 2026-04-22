import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongSolitaireState, MahjongAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MahjongSolitaireDragon } from "./MahjongSolitaireDragon.js";

const settings = {} as const;

export const mahjongDragonPlugin: GamePlugin<MahjongSolitaireState, MahjongAction, typeof settings> = {
  id: "mahjong-solitaire-dragon",
  title: "Mahjong Solitaire — Dragon",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong Solitaire in the classic Dragon layout — a wide, flat, serpentine arrangement of 144 tiles.",
  howToPlay: `Clear all 144 tiles by selecting matching pairs. This variant uses the Dragon layout — a long, winding, horizontally oriented arrangement that resembles a coiled dragon, with fewer stacked layers than the Turtle but a broader footprint.

A tile is selectable when it has no other tile resting on top of it AND at least one of its left or right sides is unblocked. Click a free tile to highlight it in blue, then click another free tile with the same face symbol to remove both from the board.

If the second tile you click does not match the first, it becomes the new selection — the first tile is deselected automatically. Tiles buried beneath others become available once the tiles above them are removed.

You win by clearing the entire board. The game ends early when no valid matching pair can be formed among the remaining free tiles.

Score: 10,000 points minus 50 per move on a full clear, or partial credit scaled to how many tiles you removed. Strategise by opening up clusters before committing to easy matches on the edges — the Dragon shape rewards planning through its mid-section.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: MahjongSolitaireDragon,
};
