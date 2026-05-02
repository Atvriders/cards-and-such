import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LadyOfManorState, LadyOfManorAction, LadyOfManorSettings } from "./state.js";
import { initialState, reducer, isTerminal, ruleset } from "./state.js";
import { LadyOfManorGame } from "./Game.js";

import { canMove } from "../../engines/tableau/moves.js";
const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const ladyOfManorPlugin: GamePlugin<LadyOfManorState, LadyOfManorAction, typeof settings> = {
  id: "lady-of-manor",
  title: "Lady of Manor",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Lady of Manor variant.",
  howToPlay: "Two-deck Lady of Manor variant. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LadyOfManorSettings),
  reducer,
  isTerminal,
  hint: (state: LadyOfManorState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1","f2","f3","f4","f5","f6","f7","f8"];
    const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8"];
    const sources = TABLEAU_IDS;
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, ruleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: LadyOfManorGame,
};
