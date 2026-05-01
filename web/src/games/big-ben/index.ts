import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BigBenState, BigBenAction, BigBenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BigBenGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const bigBenPlugin: GamePlugin<BigBenState, BigBenAction, typeof settings> = {
  id: "big-ben",
  title: "Big Ben",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Big Ben: clock built up by suit from each hour.",
  howToPlay: "Two-deck Big Ben: clock built up by suit from each hour. Click Tick to flip the held card into its rank-slot; the next card in that slot becomes the new held card. Win when every slot fills before the centre runs out.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BigBenSettings),
  reducer,
  isTerminal,
  component: BigBenGame,
};
