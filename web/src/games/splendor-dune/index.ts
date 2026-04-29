import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SplendorDuneState, SplendorDuneAction, SplendorDuneSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SplendorDuneGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const splendorDunePlugin: GamePlugin<SplendorDuneState, SplendorDuneAction, typeof settings> = {
  id: "splendor-dune",
  title: "Splendor Dune",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dune-themed Splendor mini: 10 turns of trading Spice with Mentats.",
  howToPlay: "Splendor Dune reskins the gem-economy classic into the desert world of Arrakis. You begin with $200 solaris, no Spice cards, and no Mentats. Each turn, pick one action: Buy a Spice card for $40, Save your cash for 5% interest, Hire a Mentat for $60, or Sell a Spice card back for a roughly $30-50 payout. After your action, every Spice card earns you $8 from melange demand and every Mentat earns you $12 from political insight. A Dune event flavors the turn. Your final score is your net worth — cash plus the cost-basis value of your spice cards and mentats. The strategic balance: spice cards yield reliable income but tie up capital, mentats amplify your wins but cost more, and saving is slow but safe. Aim for a balanced spice empire by turn 10. He who controls the spice controls the universe — and the leaderboards.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SplendorDuneSettings),
  reducer,
  isTerminal,
  component: SplendorDuneGame,
};
