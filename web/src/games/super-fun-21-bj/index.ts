import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SuperFun21BjState, SuperFun21BjAction, SuperFun21BjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SuperFun21BjGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const superFun21BjPlugin: GamePlugin<SuperFun21BjState, SuperFun21BjAction, typeof settings> = {
  id: "super-fun-21-bj", title: "Super Fun 21", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Blackjack variant with player-friendly bonus rules and even-money naturals.",
  howToPlay: "Super Fun 21 is a Blackjack variant with extra player-friendly rules. You can double on any number of cards, hit any time including after splits, and a player blackjack always beats a dealer blackjack (no push). The trade-off: natural blackjacks pay even money, not three-to-two.\n\nEach round you place a one-credit bet and are dealt two cards. The dealer shows one upcard. You then hit or stand. The dealer hits on sixteen and stands on seventeen. Cards are valued as in standard blackjack: 2-10 face value, J/Q/K count ten, aces eleven or one.\n\nTwelve rounds are played. A win pays twelve points, including blackjacks (because of the even-money rule). A loss pays zero. A bonus of fifteen points is awarded if you win with a hand of six or more cards (the Super Fun rule). Twenty-ones with five or more cards add a five-point flair bonus.\n\nAverage expected score is around forty-five to fifty-five points; an excellent run pushes seventy-five. Hit harder than you would in normal blackjack — the rule changes reward aggression.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SuperFun21BjSettings),
  reducer, isTerminal, component: SuperFun21BjGame,
};
