import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpoofBiddingState, SpoofBiddingAction, SpoofBiddingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpoofBiddingGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const spoofBiddingPlugin: GamePlugin<SpoofBiddingState, SpoofBiddingAction, typeof settings> = {
  id: "spoof-bidding",
  title: "Spoof Bidding",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Coin-in-hand guessing elimination game. Total coins bid in bar.",
  howToPlay: "Spoof Bidding is a bluffing pub game where each player conceals 0-3 coins in their fist, then everyone bids on the total number of coins in everyone's hands combined. The closest bid wins. In this digital adaptation, each turn you press Bid and a precision-roll determines whether your guess hit the actual total: 5% perfect-bid (20 points), descending tiers to a wildly-off bid (0 points). Across ten bids, the typical total is 60-90 with great runs above 130. Press Next after each bid. The original pub game is played in rounds where wrong-bid players are eliminated, the last player standing wins. In digital form, the bluffing math is collapsed into a precision-roll, but the rhythm of bid-and-reveal echoes the real-bar tension. Score equals total points across ten bids.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpoofBiddingSettings),
  reducer,
  isTerminal,
  component: SpoofBiddingGame,
};
