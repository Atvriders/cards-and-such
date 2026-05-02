import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniSpider1suitState, MiniSpider1suitAction, MiniSpider1suitSettings } from "./state.js";
import { initialState, reducer, isTerminal, ruleset } from "./state.js";
import { MiniSpider1suitGame } from "./Game.js";

import { canMove } from "../../engines/tableau/moves.js";
const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const miniSpider1suitPlugin: GamePlugin<MiniSpider1suitState, MiniSpider1suitAction, typeof settings> = {
  id: "mini-spider-1suit",
  title: "Mini Spider (1-suit)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mini Spider — single deck, six columns, suit packing.",
  howToPlay: "Mini Spider — single deck, six columns, suit packing. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniSpider1suitSettings),
  reducer,
  isTerminal,
  hint: (state: MiniSpider1suitState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1","f2","f3","f4"];
    const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6"];
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
  component: MiniSpider1suitGame,
};
