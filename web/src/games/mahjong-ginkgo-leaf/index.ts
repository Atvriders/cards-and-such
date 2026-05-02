import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MahjongGinkgoLeafGame } from "./Game.js";

const settings = {} as const;

export const mahjongGinkgoLeafPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-ginkgo-leaf",
  title: "Mahjong Ginkgo Leaf",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a wide fan-shaped ginkgo leaf with a slender stem.",
  howToPlay: "Mahjong Ginkgo Leaf is a Mahjong solitaire layout depicting a wide fan-shaped ginkgo leaf above a slender stem, with several radiating rows expanding outward and a layered central vein at the top of the leaf. The graceful curve evokes autumn ginkgo trees lining Tokyo streets.\n\nClick any free tile to highlight it; click another free tile with the same face to remove the pair. A free tile has no tile on top AND has at least one same-layer side open. Mismatches transfer the highlight forward.\n\nMost rows of the leaf are flat layer-0 tiles, so progress is wide and shallow. The layered central vein on the upper leaf is the only stack and will not block the wide lower rows. Plan your matches early so you do not finish with a single tile of an unpaired face still trapped beneath the vein. A perfect clear earns up to ten thousand points.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongGinkgoLeafGame,
};
