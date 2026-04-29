import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RedDogCasState, RedDogCasAction, RedDogCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RedDogCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const redDogCasPlugin: GamePlugin<RedDogCasState, RedDogCasAction, typeof settings> = {
  id: "red-dog-cas", title: "Red Dog (Casino)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-card between-spread casino game.",
  howToPlay: "Red Dog, also called Acey-Deucey or In-Between, is a casino card game where two cards are dealt and the player bets whether a third card will fall in rank between them. The wider the spread, the lower the payout.\n\nIn this single-player version you play fifteen rounds. Press Play each round to deal two cards. The system shows the spread, then deals a third. Hits in the spread pay according to the Red Dog paytable.\n\nKey payouts: spread of one (consecutive) ties unless the third card matches one of the bracket cards (paying five); spread of two pays eleven; spread of three pays four; spread of four to eleven pays two; pair on the bracket cards pays the third matching as eleven (jackpot of forty).\n\nThe house edge is roughly 2.8% with one deck. A strong total across fifteen rounds is around one hundred and fifty. Red Dog has been a casino fixture since the 1930s and is still found on some Las Vegas tables. Press Play to deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RedDogCasSettings),
  reducer, isTerminal, component: RedDogCasGame,
};
