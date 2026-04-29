import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MeyerBluffState, MeyerBluffAction, MeyerBluffSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MeyerBluffGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const meyerBluffPlugin: GamePlugin<MeyerBluffState, MeyerBluffAction, typeof settings> = {
  id: "meyer-bluff",
  title: "Meyer Bluff Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Scandinavian Meyer bluff dice — rank-based two-dice betting.",
  howToPlay: "Meyer is the Scandinavian ranking-based dice bluff game where the highest hand is 'Mia' (the 2-1 combination), then doubles, then high sums. This adaptation drops the bluffing for pure roll prediction. Across 13 rounds two dice are rolled. Predict: Meyer/Mia (a 2-1 result, 5.6% of rolls) pays +60, Pair (both dice equal, 16.7%) pays +20, High Sum (9-12, 27.8%) pays +12, Low Sum (everything else, 50%) pays +5. The Mia hit is rare but hugely profitable per occurrence; the doublet bet is steady; the high-sum wager is moderate; low-sum is the catch-all. Wrong call scores zero. Strategy: average score for always-low is +65 across thirteen rounds; punting Mia twice can add +60 on a single hit. The Pair-only player expects about +43 over thirteen rounds. Mixed strategy hits +130 if luck cooperates. Top score wins. Meyer originated in Danish pubs in the 1900s.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MeyerBluffSettings),
  reducer,
  isTerminal,
  component: MeyerBluffGame,
};
