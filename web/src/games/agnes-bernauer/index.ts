import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AgnesBernauerState, AgnesBernauerAction, AgnesBernauerSettings } from "./state.js";
import { initialState, reducer, isTerminal, ruleset } from "./state.js";
const AgnesBernauerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AgnesBernauerGame as unknown as React.ComponentType<unknown> })));
import { canMove } from "../../engines/tableau/moves.js";
const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const agnesBernauerPlugin: GamePlugin<AgnesBernauerState, AgnesBernauerAction, typeof settings> = {
  id: "agnes-bernauer",
  title: "Agnes Bernauer",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Klondike-style with a 7-card reserve and same-colour tableau.",
  howToPlay: "Two-deck Klondike-style with a 7-card reserve and same-colour tableau. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as AgnesBernauerSettings),
  reducer,
  isTerminal,
  hint: (state: AgnesBernauerState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1","f2","f3","f4","f5","f6","f7","f8"];
    const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7"];
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
  component: AgnesBernauerGame,
};
