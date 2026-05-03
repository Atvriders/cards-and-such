import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PerseveranceState, PerseveranceAction } from "./state.js";
import { initialState, reducer, isTerminal, perseveranceRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const Perseverance = /* @__PURE__ */ lazy(() => import("./Perseverance.js").then((mod) => ({ default: mod.Perseverance as unknown as React.ComponentType<unknown> })));
export const perseveranceSettings = {} as const;

type PerseveranceSettings = SettingsOf<typeof perseveranceSettings>;

export const perseverancePlugin: GamePlugin<PerseveranceState, PerseveranceAction, typeof perseveranceSettings> = {
  id: "perseverance",
  title: "Perseverance",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "1 deck, Aces pre-placed, 12 tableau piles. Build down same-suit. No stock needed.",
  howToPlay: `Move all 52 cards to the four foundations to win.

Deal: All four Aces are placed immediately on the foundations. The remaining 48 cards are dealt face-up into 12 tableau piles of four cards each. There is no stock pile and no redeal.

Foundations: Build each foundation up in suit from Ace to King (A→2→3→…→K). Only the top card of each tableau pile may be moved.

Tableau: Build down in the same suit only — a 6♥ may only be placed on a 7♥. Only single cards can be moved. Unlike Cruel, empty tableau columns may be filled with any single card, giving slightly more room to maneuver.

Strategy: Think several moves ahead — with no stock or redeal, every card you see is your entire set of resources. Prioritize building same-suit sequences so you can advance multiple foundations at once. Try to keep at least one empty column open as a temporary parking space. The name reflects the patience required — many deals require deep planning to solve.`,
  settings: perseveranceSettings,
  initialState: (seed: number, settings: PerseveranceSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: PerseveranceState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11", "t12"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, perseveranceRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: Perseverance,
};
