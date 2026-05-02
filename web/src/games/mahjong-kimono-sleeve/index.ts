import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MahjongKimonoSleeveGame } from "./Game.js";

const settings = {} as const;

export const mahjongKimonoSleevePlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-kimono-sleeve",
  title: "Mahjong Kimono Sleeve",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire shaped like a kimono with extended sleeves and an obi sash.",
  howToPlay: "Mahjong Kimono Sleeve is a Mahjong solitaire layout depicting a traditional Japanese kimono, with a tall narrow body, two extended rectangular sleeves, an obi (sash) running across the middle as a layered band, and a small layered collar at the top. The contrast of broad flat areas and the obi's stack drives the strategy.\n\nClick a free tile (no tile on top, at least one open horizontal edge on its layer) to highlight it. Click another free tile bearing the same face to remove the pair. Mismatched clicks transfer the highlight without penalty.\n\nThe sleeves and lower body have many free tiles from the start, but progress requires peeling the obi band on layer 1 before the body tiles beneath it become reachable. The collar is the smallest stack and can wait until late game. A perfect clear scores up to ten thousand points minus fifty per move played.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongKimonoSleeveGame,
};
