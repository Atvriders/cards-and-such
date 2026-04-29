import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NapoleonNapState, NapoleonNapAction, NapoleonNapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NapoleonNapGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const napoleonNapPlugin: GamePlugin<NapoleonNapState, NapoleonNapAction, typeof settings> = {
  id: "napoleon-nap", title: "Napoleon (Nap)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "British 5-card trick bidding game named for Bonaparte.",
  howToPlay: "Napoleon, or Nap, is a fast British five-card trick-taking bidding game from the Victorian era. Each round you and the CPU are dealt five cards, and bid on the number of tricks you will take from one to five. A bid of five (Napoleon, or Nap) wins the round outright if made. The highest bidder names trump and leads. Failed Naps lose double, succeeded Naps win double. In this one-on-one duel across six rounds, click Play Round to deal, bid, and play. Strategy: only bid Nap on a five-trump hand or when holding all four aces, otherwise aim for the safer two- or three-trick contracts. Pass when your hand is weak — bidding on weak hands is the surest way to lose. Aim for at least three made contracts and a total positive score across the match for a strong Nap result.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NapoleonNapSettings),
  reducer, isTerminal, component: NapoleonNapGame,
};
