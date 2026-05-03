import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniTripeaksState, MiniTripeaksAction, MiniTripeaksSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MiniTripeaksGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MiniTripeaksGame as unknown as React.ComponentType<unknown> })));
const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const miniTripeaksPlugin: GamePlugin<MiniTripeaksState, MiniTripeaksAction, typeof settings> = {
  id: "mini-tripeaks",
  title: "Mini Tri-Peaks",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact tri-peaks with smaller stock.",
  howToPlay: "Compact tri-peaks with smaller stock. Click any available column-top whose rank is one above or below the waste top to play it; draw from the stock when the board stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniTripeaksSettings),
  hint: (state: MiniTripeaksState): HintTarget | null => {
    if (state.won || state.lost) return null;
    const wasteTop = state.waste[state.waste.length - 1];
    if (wasteTop) {
      const wv = wasteTop.rank as number;
      for (let ci = 0; ci < state.columns.length; ci++) {
        const col = state.columns[ci]!;
        const removed = state.removed[ci]!;
        for (let ri = col.length - 1; ri >= 0; ri--) {
          if (!removed[ri]) {
            const cv = col[ri]!.rank as number;
            const adj = Math.abs(cv - wv) === 1 || (cv === 13 && wv === 1) || (cv === 1 && wv === 13);
            if (adj) {
              return { selector: `[data-testid="hint-target-mini-tripeaks-${ci}-${ri}"]`, pulses: 3 };
            }
            break;
          }
        }
      }
    }
    if (state.stock.length > 0) {
      return { selector: '[data-testid="hint-target-mini-tripeaks-draw"]', pulses: 3 };
    }
    return null;
  },
  reducer,
  isTerminal,
  component: MiniTripeaksGame,
};
