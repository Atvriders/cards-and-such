import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MahjongDragonPearlGame } from "./Game.js";

const settings = {} as const;

export const mahjongDragonPearlPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-dragon-pearl",
  title: "Mahjong Dragon Pearl",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a coiled dragon shape protecting a centre pearl.",
  howToPlay: "Mahjong Dragon Pearl is a Mahjong solitaire layout shaped like a coiled dragon with a thick rectangular outer body, an inner second ring, and a layered central pearl rising two layers above the dragon's grip. The dragon's frame is mostly flat, but the central pearl is the puzzle's keystone.\n\nClick any free tile (no tile on top, at least one open horizontal edge) to highlight it, then click another free tile with the same face to remove the pair. Mismatches transfer your highlight to the new tile. The pearl is a small two-tile column rising two layers — the topmost layer is always free, and clearing it exposes the layer below.\n\nThe outer frame is full of free tiles from the start, so the game's tension comes from sequencing matches: clear the pearl too early and you may lose the matching pairs needed for the inner ring. A perfect clear scores up to ten thousand points minus fifty per move played.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongDragonPearlGame,
};
