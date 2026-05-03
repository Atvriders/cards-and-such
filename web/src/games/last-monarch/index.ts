import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { LastMonarchState, LastMonarchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LastMonarch = /* @__PURE__ */ lazy(() => import("./LastMonarch.js").then((mod) => ({ default: mod.LastMonarch as unknown as React.ComponentType<unknown> })));
export const lastMonarchPlugin: GamePlugin<LastMonarchState, LastMonarchAction, Record<string, never>> = {
  id: "last-monarch",
  title: "Last Monarch",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Discard all non-King cards until only the four Kings remain.",
  howToPlay: `Last Monarch is a single-deck elimination patience game with one glorious goal: leave only the four Kings on the table — the last monarchs standing.

Setup: All 52 cards are dealt face-up in a single row. The order is random and determined by your seed.

Moves: You may discard a card if the card exactly three positions ahead of it (counting only non-gap positions) matches it in either suit or rank. Click any highlighted card (shown in blue) to discard it. The discarded card disappears, leaving a gap in the row.

Chain reactions: After each discard the positions shift — gaps are counted as empty, so new three-away pairs may emerge. Look ahead to plan chains that clear non-King cards efficiently.

Kings are sacred: Kings can be discarded too if they legally match a card three ahead, but doing so ends your hope of winning. Protect your Kings and discard everything around them.

Winning: When only the four Kings remain and no other cards are left, you win. Score is 100 for a win, or your discard count for a partial game.

Tips: Plan several moves ahead. Early discards can ripple through the row and open unexpected chains. Avoid stranding Kings in positions where they'd be forced to discard.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: LastMonarch,
};
