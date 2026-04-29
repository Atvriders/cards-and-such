import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MahjongZenStoneGame } from "./Game.js";

const settings = {} as const;

export const mahjongZenStonePlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-zen-stone",
  title: "Mahjong Zen Stone",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a zen rock garden with three stacked stone clusters in raked sand.",
  howToPlay: "Mahjong Zen Stone is a Mahjong solitaire layout depicting a small Japanese zen rock garden, with three small stone clusters each rising three layers above a wide flat sand bed beneath them. The rest of the sand bed forms a long flat horizon stretching across the bottom.\n\nClick any free tile to highlight it; click another free tile with the same face to remove the pair. A tile is free when no tile sits on top AND at least one same-layer side has no neighbour. Mismatches simply transfer the highlight forward.\n\nThe three stone columns are isolated, so each one's topmost tiles are always free, and peeling them down quickly opens the sand bed beneath each cluster. Save the flat sand-bed tiles for the endgame so you don't run out of pairs while peeling stones. A perfect clear scores up to ten thousand points minus fifty per move; partial clears earn proportional credit for removed tiles.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: MahjongZenStoneGame,
};
