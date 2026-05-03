import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { BigTwoState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BigTwoGame } from "./Game.js";

export const bigTwoSettings = {
  dummy: { kind: "enum" as const, label: "Mode", options: ["off"] as const, default: "off" as const },
} as const;

type BigTwoAction = { type: "play"; cardIds: string[] } | { type: "pass" };

export const bigTwoPlugin: GamePlugin<BigTwoState, BigTwoAction, typeof bigTwoSettings> = {
  id: "big-two",
  title: "Big Two",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Chinese climbing game. Beat the last play with higher cards. First to empty hand wins.",
  howToPlay: `Big Two (also called Choh Dai Di) is a 4-player Chinese climbing game. You play against three bots.

Setup: all 52 cards are dealt — 13 per player. The player holding the 3 of Diamonds (3♦) must lead the very first play of the game.

Card ranking: 3 is lowest, rising through 4-5-6-7-8-9-10-J-Q-K-A, with 2 as the highest rank. When ranks are equal, suit breaks the tie: ♦ < ♣ < ♥ < ♠.

Legal plays: you may play a single card, a pair (two of same rank), a triple (three of same rank), or a 5-card poker hand (straight, flush, full house, four-of-a-kind, or straight flush). Every play must match the category of the current pile and beat it (higher card or better poker hand).

Passing: you may pass on any play you cannot or don't wish to beat. Once all opponents pass, the last player to play leads any new hand type.

Winning: the first player to run out of cards wins (score 100). Finishing 2nd scores 60, 3rd scores 30, last scores 0.

Controls: click cards to select them (they lift), then press Play. Press Pass to skip your turn.`,
  settings: bigTwoSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase !== "playing") return null;
    if (state.turn !== 0) return null;
    if (state.lastPlay) return { selector: '[data-testid="hint-target-big-two-pass"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-big-two-play"]', pulses: 3 };
  },
  component: BigTwoGame,
};
