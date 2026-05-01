import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShortDeckHoldemState, ShortDeckHoldemAction, ShortDeckHoldemSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShortDeckHoldemGame } from "./Game.js";

const settings = {
  startingBankroll: { kind: "enum" as const, label: "Starting Stack", options: ["500", "1000", "5000"] as const, default: "1000" },
  smallBlind: { kind: "enum" as const, label: "Small Blind", options: ["5", "10", "25"] as const, default: "10" },
} as const;
type S = SettingsOf<typeof settings>;

export const shortDeckHoldemPlugin: GamePlugin<ShortDeckHoldemState, ShortDeckHoldemAction, typeof settings> = {
  id: "short-deck-holdem",
  title: "Short Deck Hold'em",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up Short-Deck (6+) Hold'em: 36-card deck, flush beats full house, A-6-7-8-9 is a straight.",
  howToPlay:
    "Short-Deck Hold'em (a.k.a. 6+ Hold'em) is Texas Hold'em with all 2s, 3s, 4s, and 5s removed — leaving 36 cards. Modified rankings:\n\n- A flush BEATS a full house (flushes are rarer with fewer cards of each suit).\n- The wheel A-6-7-8-9 is the lowest straight.\n- Trips and straights swap in some house rules; this game keeps trips below straights for simplicity.\n\nUse Fold/Check/Call/Raise. Beat the CPU over 8 hands.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ShortDeckHoldemSettings),
  reducer,
  isTerminal,
  component: ShortDeckHoldemGame,
};
