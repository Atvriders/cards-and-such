import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MahjongDragonCoilGame } from "./Game.js";

const settings = {} as const;

export const mahjongDragonCoilPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-dragon-coil",
  title: "Mahjong Dragon Coil",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a coiled dragon body with overlapping arcs.",
  howToPlay: "Mahjong Dragon Coil is a Mahjong solitaire layout depicting a serpentine Chinese dragon coiled around itself, with an outer rectangular ring forming the dragon's body, an inner three-layer-deep coiled arc, and a small two-tile peak at the centre representing the dragon's eye. The coil's depth makes for a visually striking puzzle.\n\nClick any free tile (no tile on top, at least one open same-layer side) to highlight it, then click another free tile with the same face to clear the pair. Mismatches simply switch your highlight to the new tile.\n\nThe outer body ring is open from the start, so you can build momentum quickly. The inner coil's stacked layers must be peeled top-down before the underlying body tiles become reachable. A perfect clear scores up to ten thousand points minus fifty per move; partial clears earn proportional credit for tiles removed before deadlock.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongDragonCoilGame,
};
