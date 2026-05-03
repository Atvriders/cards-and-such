import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { LastCardState } from "./state.js";
import type { Suit } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LastCardGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LastCardGame as unknown as React.ComponentType<unknown> })));
export const lastCardSettings = {
  dummy: { kind: "enum" as const, label: "Mode", options: ["off"] as const, default: "off" as const },
} as const;

type LastCardAction =
  | { type: "play"; cardId: string; suit?: Suit }
  | { type: "draw" }
  | { type: "callLastCard" };

export const lastCardPlugin: GamePlugin<LastCardState, LastCardAction, typeof lastCardSettings> = {
  id: "last-card",
  title: "Last Card",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "New Zealand's favourite card game — Uno with a Kiwi twist. Match suit or rank and shed all your cards.",
  howToPlay: `Last Card is New Zealand's beloved card game, similar to Uno. You play against three bots, racing to be first to empty your hand.

Setup: each player receives 7 cards. The top card of the remaining deck starts the discard pile.

Playing: on your turn, play a card matching the current suit or rank of the top discard. If you can't play, draw one card.

Special cards:
• 8 — Wild card: play on anything and choose the new suit
• 2 — Draw 2: next player must draw 2 (or stack another 2)
• 7 — Skip: next player loses their turn
• Ace — Reverse: direction of play flips

Last Card rule: when you play your second-to-last card, you MUST click "Call Last Card!" before playing your final card, or you risk a penalty. It's the iconic New Zealand twist on the classic rule.

Stacking: if a Draw 2 is played, you can play your own 2 to stack the penalty onto the next player.

Winning: first player to shed all cards wins. Score 100 for a win, 0 for a loss.`,
  settings: lastCardSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: LastCardState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-last-card-primary"]', pulses: 3 };
  },
  component: LastCardGame,
};
