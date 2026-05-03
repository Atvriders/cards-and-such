import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardBingoPro, CardBingoProAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardBingoProGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardBingoProGame as unknown as React.ComponentType<unknown> })));
export const cardBingoProSettings = {
  cards: {
    kind: "enum" as const,
    label: "Cards",
    options: ["1", "2", "4"] as const,
    default: "2" as const,
  },
} as const;

type CardBingoProSettings = SettingsOf<typeof cardBingoProSettings>;

export const cardBingoProPlugin: GamePlugin<CardBingoPro, CardBingoProAction, typeof cardBingoProSettings> = {
  id: "card-bingo-pro",
  title: "Card Bingo Pro",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic B-I-N-G-O with 1, 2, or 4 cards. Draw numbers and race to complete a line as fast as possible.",
  howToPlay: `Card Bingo Pro is a faithful digital recreation of classic bingo. Each of your cards is a 5×5 grid organized into five columns labeled B, I, N, G, and O. The B column holds numbers from 1–15, I covers 16–30, N is 31–45, G is 46–60, and O is 61–75. The center square is a FREE space — already marked at the start.

Press Draw Number to call a random number from the pool of 75. Any matching numbers on your cards are automatically highlighted. A running ticker at the bottom shows the ten most recent calls.

You win the moment any card completes a full line — five marked squares in a horizontal row, a vertical column, or either diagonal. The game ends immediately and your score is calculated.

Scoring rewards speed: you earn 20 points for each number that was never drawn (i.e., 75 minus the count of drawn numbers, times 20), plus 100 points per bingo card that completed a line. Getting bingo in fewer draws means a higher score.

Play with 1 card for a focused single-card challenge, 2 cards to double your chances, or 4 cards for a busy multi-card session with the best odds of an early bingo. The cards and draw order are seeded randomly each game.`,
  settings: cardBingoProSettings,
  initialState: (seed: number, settings: CardBingoProSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-card-bingo-pro-action"]', pulses: 3 }; },
  component: CardBingoProGame,
};
