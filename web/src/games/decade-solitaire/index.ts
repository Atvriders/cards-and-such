import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DecadeSolitaireState, DecadeSolitaireAction, DecadeSolitaireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DecadeSolitaire = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DecadeSolitaire as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const decadeSolitairePlugin: GamePlugin<DecadeSolitaireState, DecadeSolitaireAction, typeof settings> = {
  id: "decade-solitaire",
  title: "Decade Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Remove groups of top cards that sum to exactly 10 or 20. Clear all four columns to win!",
  howToPlay: `Decade Solitaire is a patience card game based on removing groups summing to 10 or 20. The full 52-card deck is dealt into four columns of 13 cards each. Cards are stacked and only the top card of each column is accessible.

Card values: Ace = 1, number cards equal their number, and 10, Jack, Queen, King all count as 10.

Click the top card of any column to select it (highlighted in orange). Select two or more top cards that together sum to exactly 10 or 20, then click Remove to discard them. If you want to undo your selection, press Clear.

A single 10-value card (10, J, Q, K) can be removed alone as it equals 10. Two fives sum to 10. Two tens sum to 20. An ace and a 9 sum to 10. Plan your removals carefully to expose useful cards buried below.

Clear all four columns to win and score 100 points. If no valid move remains, the game ends with a partial score based on remaining cards.`,
  settings,
  initialState: (seed: number, s: typeof settings) => initialState(seed, s as DecadeSolitaireSettings),
  reducer, isTerminal, component: DecadeSolitaire,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
};
