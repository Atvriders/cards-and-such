import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TriPeaksSolitaireState, TriPeaksSolitaireAction, TriPeaksSolitaireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TriPeaksSolitaireGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TriPeaksSolitaireGame as unknown as React.ComponentType<unknown> })));
const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const triPeaksSolitairePlugin: GamePlugin<TriPeaksSolitaireState, TriPeaksSolitaireAction, typeof settings> = {
  id: "tri-peaks-solitaire",
  title: "Tri-Peaks Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-peak board: clear cards rank-adjacent to the waste top.",
  howToPlay: "Three-peak board: clear cards rank-adjacent to the waste top. Click any available column-top whose rank is one above or below the waste top to play it; draw from the stock when the board stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as TriPeaksSolitaireSettings),
  hint: (state: TriPeaksSolitaireState): HintTarget | null => {
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
              return { selector: `[data-testid="hint-target-tri-peaks-solitaire-${ci}-${ri}"]`, pulses: 3 };
            }
            break;
          }
        }
      }
    }
    if (state.stock.length > 0) {
      return { selector: '[data-testid="hint-target-tri-peaks-solitaire-draw"]', pulses: 3 };
    }
    return null;
  },
  reducer,
  isTerminal,
  component: TriPeaksSolitaireGame,
};
