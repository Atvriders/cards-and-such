import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlorentineSoliState, FlorentineSoliAction, FlorentineSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal, ruleset } from "./state.js";
const FlorentineSoliGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FlorentineSoliGame as unknown as React.ComponentType<unknown> })));
import { canMove } from "../../engines/tableau/moves.js";
const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const florentineSoliPlugin: GamePlugin<FlorentineSoliState, FlorentineSoliAction, typeof settings> = {
  id: "florentine-soli",
  title: "Florentine Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact Florentine — four reserves and a single-card draw.",
  howToPlay: "Compact Florentine — four reserves and a single-card draw. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as FlorentineSoliSettings),
  reducer,
  isTerminal,
  hint: (state: FlorentineSoliState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1","f2","f3","f4"];
    const TABLEAU_IDS = ["t1","t2","t3","t4"];
    const sources = ["waste", ...TABLEAU_IDS];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, ruleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    const stock = state.piles.find((p) => p.id === "stock");
    if (stock && stock.cards.length > 0) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    const waste = state.piles.find((p) => p.id === "waste");
    if (waste && waste.cards.length > 0) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    return null;
  },
  component: FlorentineSoliGame,
};
