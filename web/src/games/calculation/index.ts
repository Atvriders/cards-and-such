import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CalculationState, CalculationAction, CalculationSettings } from "./state.js";
const Calculation = /* @__PURE__ */ lazy(() => import("./Calculation.js").then((mod) => ({ default: mod.Calculation as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const calculationPlugin: GamePlugin<CalculationState, CalculationAction, typeof settings> = {
  id: "calculation",
  title: "Calculation",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build four foundations using modular arithmetic — each pile has its own counting step.",
  howToPlay: `Calculation is a deeply strategic solitaire. Four foundations start with one card each: an Ace, a 2, a 3, and a 4 (from any four different suits). Each foundation is built by a different increment using modular arithmetic (counting wraps around after King back to Ace).

Foundation 1 starts at Ace, increases by 1: A 2 3 4 5 6 7 8 9 10 J Q K.
Foundation 2 starts at 2, increases by 2: 2 4 6 8 10 Q A 3 5 7 9 J K.
Foundation 3 starts at 3, increases by 3: 3 6 9 Q 2 5 8 J A 4 7 10 K.
Foundation 4 starts at 4, increases by 4: 4 8 Q 3 7 J 2 6 10 A 5 9 K.

The remaining 48 cards sit in a face-down stock. One card is revealed at a time. If it fits the next slot of any foundation, send it there. Otherwise, place it on one of four waste piles. You may play the top card of any waste pile to a foundation at any time.

Strategy is everything: manage the four waste piles like a hand of four slots. Keep the piles logically organized — separate cards by what each foundation needs next. A wrong placement can block you, since waste cards can only come off the top.`,
  settings,
  initialState: (seed: number, _settings: CalculationSettings) => initialState(seed, _settings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: Calculation,
};
