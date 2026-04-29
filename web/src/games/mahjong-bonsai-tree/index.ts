import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MahjongBonsaiTreeGame } from "./Game.js";

const settings = {} as const;

export const mahjongBonsaiTreePlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-bonsai-tree",
  title: "Mahjong Bonsai Tree",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a stylised bonsai tree silhouette with trunk, foliage, and pot.",
  howToPlay: "Mahjong Bonsai Tree is a tile-matching solitaire arranged in the shape of a small Japanese bonsai with a slim trunk, a wide layered canopy, and a wide rectangular pot at the base. The canopy peaks have stacked layers, so opening the highest tiles reveals the dense foliage beneath, while the pot is a single flat layer that becomes accessible early.\n\nClick a free tile (no tile resting directly on top, with at least one open left or right edge on the same layer) to highlight it in blue. Then click any other free tile bearing the same face. Matching pairs are removed. Click a different free tile to switch your highlight without losing progress.\n\nThe game is won when every tile is cleared and lost when no matching pair remains among free tiles. Plan early-canopy removals carefully — each tile you take from the leaves opens deeper structure beneath. A complete clear scores up to ten thousand points minus fifty per move.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: MahjongBonsaiTreeGame,
};
