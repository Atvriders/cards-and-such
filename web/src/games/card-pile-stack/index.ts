import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPileStackState, CardPileStackAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardPileStack } from "./CardPileStack.js";

export const cardPileStackSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof cardPileStackSettings>;

export const cardPileStackPlugin: GamePlugin<CardPileStackState, CardPileStackAction, typeof cardPileStackSettings> = {
  id: "card-pile-stack",
  title: "Card Pile Stack",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw cards and bank your total before busting over 21.",
  howToPlay: `Card Pile Stack is a push-your-luck card game. Each round you draw cards one at a time, adding their values to a growing pile. Card values follow blackjack rules: numbered cards are worth their number, face cards (Jack, Queen, King) are worth 10, and Aces are worth 11.

Your goal is to bank the highest possible total before going over 21. Click Draw Card to add another card to your pile. Click Bank to collect your current total as points and move to the next round.

If your pile total exceeds 21, you bust — you lose all unbanked points for that round and the next round begins automatically.

Play continues for 5, 10, or 15 rounds. Your score accumulates across all successfully banked rounds.

Tips: Bank early on high totals like 18-21 to guarantee points. If your total is 12 or lower, drawing is almost always safe. Be cautious around 15-17 — there is a high chance of busting. Tracking which high-value cards have appeared can help you judge the risk.`,
  settings: cardPileStackSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    const cardValue = (c: number) => { const r = (c % 13) + 1; if (r === 1) return 11; if (r >= 11) return 10; return r; };
    const total = (state.pile ?? []).reduce((s: number, c: number) => s + cardValue(c), 0);
    if (total > 21) return null;
    if (total >= 17 && state.pile && state.pile.length > 0) return { selector: '[data-testid="hint-target-card-pile-stack-bank"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-card-pile-stack-draw"]', pulses: 3 };
  },
  component: CardPileStack,
};
