import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { NarcoticState, NarcoticAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const narcoticSettings = {} as const;

export const narcoticPlugin: GamePlugin<NarcoticState, NarcoticAction, typeof narcoticSettings> = {
  id: "narcotic",
  title: "Narcotic",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Turn cards onto a single pile; collapse matching rank/suit sequences.",
  howToPlay: `Narcotic is a fast, addictive solitaire played with one deck of 52 cards.

Setup: Shuffle the full deck into a stock pile. There is one discard pile that starts empty.

Drawing: Click the stock to flip the top card onto the discard pile. Keep turning cards one at a time.

Collapsing: After each draw, look at the top card and scan downward through the discard pile. If any lower card shares the same rank or suit as the top card, you can remove all cards between those two cards — the two matching cards then become adjacent. The game auto-collapses chains when possible, but you can also manually click a highlighted matching card to trigger the removal.

Goal: Empty the stock completely while reducing the discard pile as much as possible. If the stock empties and the discard pile is also empty, you win. If the stock empties with cards still on the pile, the game is over.

Scoring: +5 points for each card removed from the pile via a collapse.

Tips: Cards removed in bulk score well. Pay attention to suits — multiple same-suit cards spread across the pile mean big collapses are possible. Don't rush; sometimes waiting a draw or two sets up a massive chain collapse.`,
  settings: narcoticSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: Game,
};
