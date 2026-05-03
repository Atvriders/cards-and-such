import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CardSpinnerState, CardSpinnerAction, CardSpinnerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardSpinner = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardSpinner as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
} as const;

export const cardSpinnerPlugin: GamePlugin<CardSpinnerState, CardSpinnerAction, typeof settings> = {
  id: "card-spinner",
  title: "Card Spinner",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bet on rank, suit, or color before spinning a virtual roulette wheel through all 52 cards.",
  howToPlay: `Card Spinner is a betting mini-game played over 5, 10, or 15 rounds. Each round, a random card is drawn from the full 52-card deck. Before the draw, you place bets predicting what the card will be.

Three types of bets are available:

Color bet (costs 5, pays 30 on win): predict whether the card will be red (Hearts/Diamonds) or black (Spades/Clubs). Roughly 50/50 odds.

Suit bet (costs 10, pays 30 on win): predict the exact suit (♠ ♥ ♦ ♣). Roughly 4:1 odds with a 3× payout — slightly unfavorable, but the bonus is large.

Rank bet (costs 20, pays 130 on win): predict the exact rank (A through K). Roughly 13:1 odds — the riskiest bet with the biggest payout.

You may place up to 3 bets per round in any combination. After placing your bets, click Spin to reveal the card. Winnings and losses are tallied immediately. Then click Next Round to clear and repeat.

Your running score starts at 0 and goes up or down each round. At the end of all rounds, 500 base points are added so even a losing session earns something. Aim to predict wisely and maximize your score across all rounds.

Tips: color bets are the safest and most consistent. Suit bets are negative-expected-value, so use them sparingly. Rank bets on A, K, or Q pay off big when you're feeling lucky.`,
  settings,
  initialState: (seed: number, s: CardSpinnerSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if ((state as any).gameOver) return null;
    if ((state as any).spunCard !== null) return { selector: '[data-testid="hint-target-card-spinner-next"]', pulses: 3 };
    const bets = (state as any).bets ?? [];
    if (bets.length === 0) return { selector: '[data-testid="hint-target-card-spinner-bet"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-card-spinner-spin"]', pulses: 3 };
  },
  component: CardSpinner,
};
