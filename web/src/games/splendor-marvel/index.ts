import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SplendorMarvelState, SplendorMarvelAction, SplendorMarvelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SplendorMarvelGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const splendorMarvelPlugin: GamePlugin<SplendorMarvelState, SplendorMarvelAction, typeof settings> = {
  id: "splendor-marvel",
  title: "Splendor Marvel",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Marvel-themed Splendor mini: 10 turns of recruiting Heroes with Stones.",
  howToPlay: "Splendor Marvel reskins the gem-economy classic into the Marvel universe across ten turns. You start with $200 cash, no Heroes, and no Stones. Each turn, pick one action: Recruit a Hero for $40, Save your cash for 5% interest, Acquire a Stone (boost) for $60, or Sell a Hero back to the market for a roughly $30-50 payout. After your action, every Hero on your team earns $8 in prestige, and every Stone you hold earns you $12 in cosmic power. A Marvel event flavors the turn. Your final score is your net worth — cash plus the cost-basis value of your heroes and stones. The fun is in balance: heroes generate steady prestige but cost capital, stones amplify income but cost more, and saving plays it safe. Aim for a balanced Marvel team by turn 10. Strong runs reach $700+ net worth.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SplendorMarvelSettings),
  reducer,
  isTerminal,
  component: SplendorMarvelGame,
};
