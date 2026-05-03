import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CaliforniaJackState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CaliforniaJackGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CaliforniaJackGame as unknown as React.ComponentType<unknown> })));
export const californiaJackSettings = {
  target: { kind: "enum" as const, label: "Points to win", options: ["5", "7", "10"] as const, default: "7" as const },
} as const;

type CaliforniaJackAction =
  | { type: "play"; cardId: string }
  | { type: "collectTrick" }
  | { type: "nextRound" };

export const californiaJackPlugin: GamePlugin<CaliforniaJackState, CaliforniaJackAction, typeof californiaJackSettings> = {
  id: "california-jack",
  title: "California Jack",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "2-player All Fours variant. Win points for High, Low, Jack, and Game from trump tricks.",
  howToPlay: `California Jack is a classic 2-player trick-taking game derived from All Fours, popular in 19th-century California.

Setup: 6 cards are dealt to each player. The next card from the deck sets the trump suit for the round. The remaining cards form the stock pile.

Gameplay: players take turns leading a trick. The leader plays any card; the follower must follow suit if possible, otherwise may play any card. The higher card of the led suit wins, unless a trump is played — trump always beats non-trump. Both players then draw one card from the stock.

Scoring each round (4 points available):
- High: player who captures the highest trump card in play earns 1 point.
- Low: player who captures the lowest trump card earns 1 point.
- Jack: player who captures the Jack of trumps earns 1 point.
- Game: player with the most pip-point value in their tricks earns 1 point (Ace=4, King=3, Queen=2, Jack=1, Ten=10).

Match: first player to reach the target score (5, 7, or 10) wins the match.`,
  settings: californiaJackSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "drawing") return { selector: '[data-testid="hint-target-california-jack-collect"]', pulses: 3 };
    if (state.phase === "scoring") return { selector: '[data-testid="hint-target-california-jack-next"]', pulses: 3 };
    if (state.phase === "playing") return { selector: '[data-testid="hint-target-california-jack-play"]', pulses: 3 };
    return null;
  },
  component: CaliforniaJackGame,
};
