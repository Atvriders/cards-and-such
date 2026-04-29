import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TokaidoCrossroadsState, TokaidoCrossroadsAction, TokaidoCrossroadsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TokaidoCrossroadsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tokaidoCrossroadsPlugin: GamePlugin<TokaidoCrossroadsState, TokaidoCrossroadsAction, typeof settings> = {
  id: "tokaido-crossroads",
  title: "Tokaido: Crossroads",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Crossroads expansion of Tokaido with encounters and event cards.",
  howToPlay: "Tokaido: Crossroads expands the journey with encounter event cards. In this adaptation you place 15 themed encounter tiles on a 5x5 grid representing five road features: inn, temple, panorama, encounter, and souvenir. Click any empty cell to place the next tile from the queue. Each placement scores 1 base point plus 1 per orthogonally adjacent same-type tile. Strategy: cluster panorama tiles to build a sweeping vista or collect all temple tiles in one zone for a pilgrim's reward. With five types over 15 tiles you average three of each, opening 1-2 strong cluster opportunities per type. After all placements the game finalises. A solid Tokaido: Crossroads score is 26-34 points; clusterers reach 42+. Random tile queues ensure every journey along the road feels different — adapt your placements based on the unfolding queue.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TokaidoCrossroadsSettings),
  reducer,
  isTerminal,
  component: TokaidoCrossroadsGame,
};
