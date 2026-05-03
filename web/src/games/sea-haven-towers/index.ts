import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SeaHavenTowersState, SeaHavenTowersAction } from "./state.js";
import { initialState, reducer, isTerminal, seaHavenRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const SeaHavenTowers = /* @__PURE__ */ lazy(() => import("./SeaHavenTowers.js").then((mod) => ({ default: mod.SeaHavenTowers as unknown as React.ComponentType<unknown> })));
export const seaHavenTowersSettings = {} as const;

export const seaHavenTowersPlugin: GamePlugin<SeaHavenTowersState, SeaHavenTowersAction, typeof seaHavenTowersSettings> = {
  id: "sea-haven-towers",
  title: "Sea Haven Towers",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A FreeCell-like solitaire where tableau builds are same-suit descending.",
  howToPlay: `Sea Haven Towers (also called Towers) is a cousin to FreeCell. The goal is to move all 52 cards to the four foundation piles, built up from Ace to King in suit.

Deal: 52 cards are spread across 10 tableau columns of 5 cards each. Two remaining cards start in the reserve cells. There are four reserve cells (towers) at the top-left and four foundation slots at the top-right.

Moves: Only single cards move at a time. On the tableau you may place a card on another card only if they share the same suit and the card you are placing is exactly one rank lower. For example the 9 of spades goes onto the 10 of spades. Empty tableau columns accept any card. Reserve cells hold any single card.

Strategy: The same-suit constraint makes Sea Haven harder than FreeCell. Plan carefully before blocking a cell. Try to sequence same-suit runs together so you can chain foundation builds. Clearing an entire column gives you a valuable free space.

Win condition: All four foundations built Ace through King by suit.`,
  settings: seaHavenTowersSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: SeaHavenTowersState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["r1", "r2", "r3", "r4", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, seaHavenRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: SeaHavenTowers,
};
