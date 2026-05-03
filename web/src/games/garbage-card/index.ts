import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type GarbageState, type GarbageAction } from "./state.js";
const GarbageGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GarbageGame as unknown as React.ComponentType<unknown> })));
export const garbageCardSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["3", "5", "7"] as const, default: "3" as const },
} as const;

export const garbageCardPlugin: GamePlugin<GarbageState, GarbageAction, typeof garbageCardSettings> = {
  id: "garbage-card",
  title: "Garbage",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill your 10 numbered slots with the right cards before the bot does!",
  howToPlay: `Garbage (also called Trash) is a two-player card game where each player races to fill ten numbered layout slots.

Each player has ten face-down positions numbered 1 through 10. On your turn, draw a card from the draw pile. If the card is numbered 1–10 (Ace=1), place it face-up in the matching slot. If that slot held a face-down card, flip it — that displaced card becomes your next card to place, creating a chain reaction! Keep placing until you draw or reveal a Queen or King (garbage) — discard it and your turn ends.

Jacks are wild and may be placed in any empty slot. When you place a wild, the displaced face-down card continues the chain if it has a valid slot.

The first player to fill all ten slots with face-up cards wins the round. Play a best-of match (3, 5, or 7 rounds). The bot plays automatically on its turn.

Score 200 points per round you win; 50 per round you win even in a loss.`,
  settings: garbageCardSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: GarbageState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-garbage-card-primary"]', pulses: 3 };
  },
  component: GarbageGame,
};
