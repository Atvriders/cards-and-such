import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SlyFoxState, SlyFoxAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SlyFox = /* @__PURE__ */ lazy(() => import("./SlyFox.js").then((mod) => ({ default: mod.SlyFox as unknown as React.ComponentType<unknown> })));
export const slyFoxSettings = {} as const;

export const slyFoxPlugin: GamePlugin<SlyFoxState, SlyFoxAction, typeof slyFoxSettings> = {
  id: "sly-fox",
  title: "Sly Fox",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw one at a time onto a 20-card layout; move cards to Ace-up foundations.",
  howToPlay: `Sly Fox is a relaxed single-deck solitaire with a 5×4 grid of face-up tableau cards. Your goal is to build all four foundations up from Ace to King in suit.

Deal: One Ace of each suit is automatically placed on the four foundations. The remaining 48 cards are split: 20 go to the 5×4 tableau grid (one per slot, all face-up), and 28 form the stock.

Playing: Click any face-up tableau card to auto-move it to a foundation if it fits. You can also drag cards directly to a foundation. Only moves to foundations are allowed — there is no tableau-to-tableau building. The top card of the waste pile is also playable to foundations.

Stock: Click the stock to draw one card at a time to the waste pile. Drawn cards can be played directly to foundations if they fit, or they remain in the waste.

Redeals: When the stock runs out, you can trigger a redeal (up to 2 times). The tableau cards are reshuffled back into the layout, giving you a fresh arrangement of cards to play.

Win: All 52 cards on the four foundations — each suit complete from Ace to King.

Scoring: +10 per card moved to a foundation.

Tips: Always check the tableau for playable cards before drawing from stock. Multiple redeals make this game very forgiving.`,
  settings: slyFoxSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: SlyFox,
};
