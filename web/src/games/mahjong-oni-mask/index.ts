import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MahjongOniMaskGame } from "./Game.js";

const settings = {} as const;

export const mahjongOniMaskPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-oni-mask",
  title: "Mahjong Oni Mask",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire shaped like a fearsome Japanese oni demon mask.",
  howToPlay: "Mahjong Oni Mask is a Mahjong solitaire layout shaped like a fearsome Japanese oni demon mask, complete with a wide brow, fanged mouth, layered horns, and a domed central nose ridge that rises two layers above the rest of the face. The dramatic vertical stack at the centre makes for a memorable silhouette.\n\nClick any free tile (no tile on top, at least one open horizontal edge) to highlight it; click a second free tile bearing the same face to remove the pair. Mismatches simply transfer your highlight without penalty. The horns and ridge form the tallest stacks on the layout — peel them down layer by layer to expose the brow, cheeks, and mouth beneath.\n\nVictory means every tile cleared; deadlock means no matching free pair remains. A perfect clear scores up to ten thousand points minus fifty per move; partial clears earn proportional credit for tiles removed.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: MahjongOniMaskGame,
};
