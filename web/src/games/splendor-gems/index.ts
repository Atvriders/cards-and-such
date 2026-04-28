import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SplendorGemsState, SplendorGemsAction, SplendorGemsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SplendorGemsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const splendorGemsPlugin: GamePlugin<SplendorGemsState, SplendorGemsAction, typeof settings> = {
  id: "splendor-gems",
  title: "Splendor Gems",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gem-token economy. Buy gems to fund noble investments.",
  howToPlay: "Splendor Gems is a ten-turn engine builder loosely inspired by Splendor's gem economy. You begin with $200 cash. Each turn pick: Invest $40 to buy a Gem, Save (5% interest), Hire a Noble for $70 (representing a prestigious patron), or Trade a Gem for a $30-50 market price. After actions, each Gem pays $8 prestige dividend and each Noble pays $13 in noble support. Mid-screen flavor describes gem-buying decisions and patrons arriving. Score equals net worth at turn 10. The math: Gems pay 20% on cost, Nobles pay 19%, but saving compounds at 5% so engine-building always wins. Strategy: stack gems early (cheap) then buy 1-2 nobles late. Aim for 5-6 Gems plus 2 Nobles for $700-900. Pure noble buys are too slow; pure gem stacking caps at around $650.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SplendorGemsSettings),
  reducer,
  isTerminal,
  component: SplendorGemsGame,
};
