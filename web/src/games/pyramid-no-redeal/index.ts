import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PyramidNoRedealState, PyramidNoRedealAction, PyramidNoRedealSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PyramidNoRedealGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PyramidNoRedealGame as unknown as React.ComponentType<unknown> })));
const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pyramidNoRedealPlugin: GamePlugin<PyramidNoRedealState, PyramidNoRedealAction, typeof settings> = {
  id: "pyramid-no-redeal",
  title: "Pyramid (No Redeal)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pyramid with a single pass through the stock.",
  howToPlay: "Pyramid with a single pass through the stock. Click a card to select it, then click another that pairs with it to sum thirteen — Kings drop alone. Use the stock when the pyramid stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PyramidNoRedealSettings),
  hint: (state: PyramidNoRedealState): HintTarget | null => {
    if (state.won || state.lost) return null;
    const isAvail = (r: number, c: number): boolean => {
      const cell = state.pyramid[r]?.[c];
      if (!cell || cell.removed) return false;
      if (r === state.pyramid.length - 1) return true;
      const a = state.pyramid[r + 1]?.[c];
      const b = state.pyramid[r + 1]?.[c + 1];
      return (!a || a.removed) && (!b || b.removed);
    };
    type Avail = { row: number; col: number; rank: number };
    const avail: Avail[] = [];
    for (let r = 0; r < state.pyramid.length; r++) {
      const row = state.pyramid[r]!;
      for (let c = 0; c < row.length; c++) {
        if (isAvail(r, c)) {
          const cell = row[c];
          if (cell && !cell.removed) avail.push({ row: r, col: c, rank: cell.card.rank as number });
        }
      }
    }
    const king = avail.find(a => a.rank === 13);
    if (king) return { selector: `[data-testid="hint-target-pyramid-no-redeal-pyramid-${king.row}-${king.col}"]`, pulses: 3 };
    for (const a of avail) {
      for (const b of avail) {
        if (a === b) continue;
        if (a.rank + b.rank === 13) {
          return { selector: `[data-testid="hint-target-pyramid-no-redeal-pyramid-${a.row}-${a.col}"]`, pulses: 3 };
        }
      }
    }
    const wasteTop = state.waste[state.waste.length - 1];
    if (wasteTop) {
      const wr = wasteTop.rank as number;
      const m = avail.find(a => a.rank + wr === 13);
      if (m) return { selector: `[data-testid="hint-target-pyramid-no-redeal-pyramid-${m.row}-${m.col}"]`, pulses: 3 };
    }
    if (state.stock.length > 0) return { selector: '[data-testid="hint-target-pyramid-no-redeal-draw"]', pulses: 3 };
    if (state.redealsRemaining > 0) return { selector: '[data-testid="hint-target-pyramid-no-redeal-redeal"]', pulses: 3 };
    return null;
  },
  reducer,
  isTerminal,
  component: PyramidNoRedealGame,
};
