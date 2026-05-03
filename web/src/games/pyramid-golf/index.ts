import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, isAvailable } from "./state.js";
import type { PyramidGolfState, PyramidGolfAction, PyramidGolfSettings } from "./state.js";
const PyramidGolf = /* @__PURE__ */ lazy(() => import("./PyramidGolf.js").then((mod) => ({ default: mod.PyramidGolf as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const pyramidGolfPlugin: GamePlugin<PyramidGolfState, PyramidGolfAction, typeof settings> = {
  id: "pyramid-golf",
  title: "Pyramid Golf",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hybrid of Pyramid and Golf solitaire — clear the 28-card pyramid using two removal rules.",
  howToPlay: `Pyramid Golf blends two classic solitaires into one. A standard 28-card pyramid is laid out in 7 rows (1 card at top, 7 at bottom), with the remaining 24 cards in a face-down stock.

A starting card is dealt face-up to the waste pile. Your goal is to clear every card from the pyramid.

You have two ways to remove an available pyramid card (one not covered by any card below it):

Pyramid rule: if a pyramid card and the waste top together sum to 13, click the pyramid card to remove both. For example, a 5 pairs with an 8, a Queen pairs with an Ace. Kings (rank 13) can be removed solo by clicking them.

Golf rule: if a pyramid card is exactly one rank higher or lower than the waste top (regardless of suit), click it. The removed card slides onto the waste, becoming the new waste top and enabling a chain.

When no pyramid card can be removed, draw from the stock to advance the waste top. Plan ahead — drawing too quickly can lock you out of needed pairs or chains. Win by clearing all 28 pyramid cards.`,
  settings,
  initialState: (seed: number, _settings: PyramidGolfSettings) => initialState(seed, _settings),
  reducer,
  isTerminal,
  hint: (state: PyramidGolfState): HintTarget | null => {
    if (state.won || state.lost) return null;
    const wasteTop = state.waste[state.waste.length - 1];
    const wRank = wasteTop ? (wasteTop.rank as number) : null;
    for (let r = 0; r < state.pyramid.length; r++) {
      const row = state.pyramid[r]!;
      for (let c = 0; c < row.length; c++) {
        const cell = row[c];
        if (!cell || cell.removed) continue;
        if (!isAvailable(state.pyramid, r, c)) continue;
        if ((cell.card.rank as number) === 13) {
          return { selector: `[data-testid="hint-target-pyramid-golf-${r}-${c}"]`, pulses: 3 };
        }
      }
    }
    if (wRank !== null) {
      for (let r = 0; r < state.pyramid.length; r++) {
        const row = state.pyramid[r]!;
        for (let c = 0; c < row.length; c++) {
          const cell = row[c];
          if (!cell || cell.removed) continue;
          if (!isAvailable(state.pyramid, r, c)) continue;
          const cv = cell.card.rank as number;
          if (cv + wRank === 13 || Math.abs(cv - wRank) === 1) {
            return { selector: `[data-testid="hint-target-pyramid-golf-${r}-${c}"]`, pulses: 3 };
          }
        }
      }
    }
    if (state.stock.length > 0) {
      return { selector: '[data-testid="hint-target-pyramid-golf-draw"]', pulses: 3 };
    }
    return null;
  },
  component: PyramidGolf,
};
