import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SeaTowersState, SeaTowersAction } from "./state.js";
import { initialState, reducer, isTerminal, seaTowersRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const SeaTowers = /* @__PURE__ */ lazy(() => import("./SeaTowers.js").then((mod) => ({ default: mod.SeaTowers as unknown as React.ComponentType<unknown> })));
export const seaTowersSettings = {} as const;

type SeaTowersSettings = SettingsOf<typeof seaTowersSettings>;

export const seaTowersPlugin: GamePlugin<SeaTowersState, SeaTowersAction, typeof seaTowersSettings> = {
  id: "sea-towers",
  title: "Sea Towers",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A FreeCell variant where tableau builds down in the same suit and only Kings fill empty columns.",
  howToPlay: `Sea Towers (also called Seahaven Towers) is a challenging FreeCell-style game with a key twist: tableau columns build down by the same suit instead of alternating colors.

Setup: All 52 cards are dealt face-up across 10 cascades of 5 cards each. Two of the four free cells start pre-filled with the two leftover cards, leaving only two free cells available at the start.

Goal: Move all 52 cards to the four foundation piles, building each foundation up from Ace to King in the same suit.

Tableau rules: Place a card on another only if it is the same suit and exactly one rank lower. For example, 7♠ may go onto 8♠. Only a King may be placed into an empty cascade — no other card may start a new column.

Free cells: Each of the four cells holds exactly one card. Use them as temporary buffers when rearranging the tableau.

Strategy: Because same-suit building is stricter than alternating-color building, fewer moves are available at any moment. Plan carefully before committing cards to free cells. Freeing buried Aces early is essential, and keeping at least one free cell open provides crucial flexibility.`,
  settings: seaTowersSettings,
  initialState: (seed: number, _settings: SeaTowersSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: SeaTowersState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["fc1", "fc2", "fc3", "fc4", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, seaTowersRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: SeaTowers,
};
