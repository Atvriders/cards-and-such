import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GolfState, GolfAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Golf = /* @__PURE__ */ lazy(() => import("./Golf.js").then((mod) => ({ default: mod.Golf as unknown as React.ComponentType<unknown> })));
export const golfSettings = {
  wrapAces: { kind: "boolean" as const, label: "Wrap Aces (K↔A↔2)", default: false },
} as const;

type GolfSettings = SettingsOf<typeof golfSettings>;

export const golfPlugin: GamePlugin<GolfState, GolfAction, typeof golfSettings> = {
  id: "golf",
  title: "Golf Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Move tableau cards to the foundation one rank up or down.",
  howToPlay: `Clear all 35 tableau cards by moving them onto the waste pile.

Deal: Seven columns of five face-up cards form the tableau. One card is turned face-up as the starting waste card. The remaining 16 cards sit in the stock.

Moves: Click any top card in the tableau to move it to the waste if it is exactly one rank higher or lower than the current waste top (e.g. a 7 plays on a 6 or 8). Kings are high (rank 13) and Aces are low (rank 1) — with Wrap Aces OFF, King and Ace do not connect. Turn on Wrap Aces to allow King↔Ace connections. Click the face-down stock (or the Draw button) to flip the next card onto the waste and change the target rank.

Scoring: +1 point for every tableau card moved to the waste.

Tips: Look several cards ahead — a chain of consecutive-rank cards can be cleared in one burst. Save draws from the stock for when you're stuck; each draw changes the waste top and may unlock new plays. Columns with long runs of adjacent ranks are valuable to uncover quickly.`,
  settings: golfSettings,
  initialState: (seed: number, settings: GolfSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: GolfState): HintTarget | null => {
    if (state.won) return null;
    const wasteTop = state.waste[state.waste.length - 1];
    if (wasteTop) {
      const wv = wasteTop.rank as number;
      const wrap = state.settings.wrapAces;
      for (let ci = 0; ci < state.tableau.length; ci++) {
        const col = state.tableau[ci]!;
        if (col.length === 0) continue;
        const top = col[col.length - 1]!;
        const cv = top.rank as number;
        const diff = Math.abs(cv - wv);
        const adj = diff === 1 || (wrap && diff === 12);
        if (adj) {
          return { selector: `[data-testid="hint-target-golf-col-${ci}"]`, pulses: 3 };
        }
      }
    }
    if (state.stock.length > 0) {
      return { selector: '[data-testid="hint-target-golf-draw"]', pulses: 3 };
    }
    return null;
  },
  component: Golf,
};
