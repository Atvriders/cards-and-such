import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClockState, ClockAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Clock } from "./Clock.js";

export const clockSettings = {} as const;

type ClockSettings = SettingsOf<typeof clockSettings>;

export const clockPlugin: GamePlugin<ClockState, ClockAction, typeof clockSettings> = {
  id: "clock",
  title: "Clock Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deal cards to clock positions by rank. Win if all cards flip before the fourth King.",
  howToPlay: `A luck-based solitaire whose outcome is determined by the shuffle. Still fun to watch!

Setup: All 52 cards are dealt face-down into 13 piles of 4 each — 12 piles arranged like a clock face (positions Ace through Queen, going clockwise) plus a center pile representing the King. You start by drawing from the center.

Play: Click "Flip Card" to reveal the top face-down card of the current pile. The card's rank tells you which clock position it belongs to — Ace goes to the 1 o'clock pile, 2 goes to 2 o'clock, and so on up to Queen at 12 o'clock; Kings stay at the center. The flipped card is placed face-up on its destination pile, and you then flip the top face-down card from that pile. Continue until the game ends.

Win: If all non-King piles are completely face-up before you must flip the fourth King, you win!

Lose: When you flip the fourth King from the center pile with face-down cards still remaining elsewhere, the game is over.

Scoring: +1 per flip. The game typically ends after exactly 51 flips if you win.`,
  settings: clockSettings,
  initialState: (seed: number, settings: ClockSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Clock,
};
