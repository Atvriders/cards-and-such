import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MahjongMountainRangeGame } from "./Game.js";

const settings = {} as const;

export const mahjongMountainRangePlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-mountain-range",
  title: "Mahjong Mountain Range",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire arranged like a stepped mountain range with stacked peaks.",
  howToPlay: "Mahjong Mountain Range is a Mahjong solitaire layout that resembles a tall mountain range, with each successive horizontal row a little narrower than the one below it and a small stacked peak rising from the middle. The widest row sits at the bottom, evoking foothills, while the very top has tiles stacked into pointed summits.\n\nA tile is free when no tile rests on top of it AND at least one side on its layer is unblocked. Click any free tile (the highlight glow shows it is selectable) and then click another free tile with the same face to remove the matching pair. If a clicked tile does not match, the highlight simply transfers to the new tile.\n\nWork down from the peaks to expose the lower rows; rushing horizontally across the bottom can lock matches above. You win when every tile is cleared and the run ends in deadlock when no matching pair remains. A complete clear earns up to ten thousand points.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongMountainRangeGame,
};
