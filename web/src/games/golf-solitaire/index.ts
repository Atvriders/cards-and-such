import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GolfSolitaireState, GolfSolitaireAction, GolfSolitaireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { rankVal } from "../_shared/solitaire-family-engine.js";
const GolfSolitaireGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GolfSolitaireGame as unknown as React.ComponentType<unknown> })));
const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const golfSolitairePlugin: GamePlugin<GolfSolitaireState, GolfSolitaireAction, typeof settings> = {
  id: "golf-solitaire",
  title: "Golf Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Golf — one less or more than the waste; no recycling.",
  howToPlay: "Classic Golf — one less or more than the waste; no recycling. Click any available column-top whose rank is one above or below the waste top to play it; draw from the stock when the board stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GolfSolitaireSettings),
  reducer,
  isTerminal,
  hint: (state: GolfSolitaireState): HintTarget | null => {
    if (state.won || state.lost) return null;
    const wasteTop = state.waste[state.waste.length - 1];
    if (wasteTop) {
      const wv = rankVal(wasteTop);
      // Find first column whose bottom-most non-removed card is rank ±1.
      for (let ci = 0; ci < state.columns.length; ci++) {
        const col = state.columns[ci]!;
        const removed = state.removed[ci]!;
        for (let ri = col.length - 1; ri >= 0; ri--) {
          if (!removed[ri]) {
            const cv = rankVal(col[ri]!);
            if (Math.abs(cv - wv) === 1) {
              return { selector: `[data-testid="hint-target-golf-solitaire-${ci}-${ri}"]`, pulses: 3 };
            }
            break;
          }
        }
      }
    }
    if (state.stock.length > 0) {
      return { selector: '[data-testid="hint-target-golf-solitaire-draw"]', pulses: 3 };
    }
    return null;
  },
  component: GolfSolitaireGame,
};
