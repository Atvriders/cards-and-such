import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { WishState, WishAction, WishSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Wish } from "./Wish.js";

export const wishSettings = {} as const;

export const wishPlugin: GamePlugin<WishState, WishAction, typeof wishSettings> = {
  id: "wish",
  title: "Wish",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Remove all cards by pairing same-rank tops from a 32-card deck.",
  howToPlay: `Wish is a quick solitaire played with a 32-card deck — the standard 52-card pack with all 2s through 6s removed, leaving Aces and 7s through Kings in all four suits.

At the start, all 32 cards are dealt face-up into four piles of eight. Only the top card of each pile is available for play.

On your turn, click any two piles whose top cards share the same rank — for example, two Aces or two Queens. Those two cards are removed together, and the next card in each pile becomes available. You score 2 points for each pair removed.

The goal is to clear all 32 cards by removing all 16 pairs. Strategy matters because removing one pair exposes cards that may enable or block future pairs. Plan ahead to avoid locking yourself into a position where no matching tops remain.

If no matching pairs are currently available on top, the game is blocked and cannot be won from that state. There are no draws or recycling — Wish is decided entirely by the order the cards are dealt and the sequence in which you remove pairs.

Win by clearing all four piles completely. A perfect game removes 16 pairs in sequence without ever getting stuck.`,
  settings: wishSettings,
  initialState: (seed: number) => initialState(seed, {} as WishSettings),
  reducer,
  isTerminal,
  component: Wish,
};
