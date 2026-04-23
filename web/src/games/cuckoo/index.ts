import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CuckooState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Cuckoo } from "./Cuckoo.js";

export const cuckooSettings = {} as const;

type CuckooSettingsType = SettingsOf<typeof cuckooSettings>;
type CuckooAction = { type: "keep" } | { type: "swap" };

export const cuckooPlugin: GamePlugin<CuckooState, CuckooAction, typeof cuckooSettings> = {
  id: "cuckoo",
  title: "Cuckoo",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "4-player bluffing card game. Keep or swap your card. Lowest card loses a life!",
  howToPlay: `Cuckoo (also called Ranter-Go-Round) is a fast bluffing card game for four players — you and three bots.

Setup: Each player starts with three lives represented by hearts. One card is dealt to each player from a shuffled deck.

Objective: Avoid holding the lowest-ranked card at the end of each round. The player with the lowest card loses one life. Last player with lives remaining wins.

Your turn: When it's your turn you see your card. You choose to Keep it or Swap it with the next player (Bot 1). If the next player holds a King, they may refuse the swap — you keep your card regardless.

Bot turns: After you act, bots 1 and 2 each decide to keep or swap in sequence. Bot 3 (the last seat) instead draws the top card from the remaining stock.

Reveal: All cards are shown. The player holding the lowest-ranked card (Ace = 1, King = 13) loses a life. If multiple players tie for lowest, all lose a life.

Elimination: Any player reaching zero lives is eliminated. Play continues until one player remains.

Strategy: Swap low cards to pass the problem along. Watch for Kings that block swaps — you may be stuck with a bad card!`,
  settings: cuckooSettings,
  initialState: (seed: number, _settings: CuckooSettingsType) =>
    initialState(seed, { placeholder: "none" }),
  reducer,
  isTerminal,
  component: Cuckoo,
};
