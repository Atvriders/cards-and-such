import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MahjongWarriorHelmetGame } from "./Game.js";

const settings = {} as const;

export const mahjongWarriorHelmetPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-warrior-helmet",
  title: "Mahjong Warrior Helmet",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a samurai-style warrior helmet with horn and cheek guards.",
  howToPlay: "Mahjong Warrior Helmet is a Mahjong solitaire layout shaped like a samurai-style warrior helmet, with a domed crown, side plates, broad face, lower cheek guards, and a small horn rising two extra layers from the very top. The vertical horn is the puzzle's signature feature.\n\nClick any free tile (no tile on top, at least one open same-layer side) to highlight it, then click another free tile bearing the same face to remove the matching pair. Mismatches transfer the highlight to the new tile rather than losing it.\n\nWork the horn down first — the topmost layer-2 tiles are always free, and peeling them opens the layer-1 face plates beneath. The cheek guards are flat and easy to clear once you have spare matches. Save your last matching pairs to handle the central face cells, which are the deepest reachable when the horn is fully cleared. A perfect clear scores up to ten thousand points minus fifty per move played.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: MahjongWarriorHelmetGame,
};
