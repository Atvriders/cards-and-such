import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FortyThievesState, FortyThievesAction } from "./state.js";
import { initialState, reducer, isTerminal, fortyThievesRuleset } from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const FortyThieves = /* @__PURE__ */ lazy(() => import("./FortyThieves.js").then((mod) => ({ default: mod.FortyThieves as unknown as React.ComponentType<unknown> })));
export const fortyThievesSettings = {} as const;

type FortyThievesSettings = SettingsOf<typeof fortyThievesSettings>;

export const fortyThievesPlugin: GamePlugin<FortyThievesState, FortyThievesAction, typeof fortyThievesSettings> = {
  id: "forty-thieves",
  title: "Forty Thieves",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck solitaire. Build tableau down same-suit, one card at a time.",
  howToPlay: `Move all 104 cards (two full decks) to the eight foundations to win.

Deal: Ten tableau columns of four face-up cards each (40 total). Eight foundations sit at top-right — two per suit. The remaining 64 cards form the stock.

Moves: Only one card may be moved at a time. On the tableau, build down in the same suit — a 6♠ lands only on a 7♠. Empty columns accept any single card. Drag a card or click it to auto-move to a valid destination. Click the stock to flip one card at a time to the waste; the waste top is always playable. There is no redeal.

Foundations start with Aces and build up by suit to King. Because two decks are in play, each suit has two foundation piles.

Scoring: +10 for each card moved to a foundation.

Tips: This game is very difficult — fewer than 1 in 6 deals win with optimal play. Keep the waste accessible by moving waste cards to foundations or tableau quickly. Empty columns are extremely valuable; use them as temporary parking spots to sequence same-suit cards. Try to build long same-suit runs on the tableau rather than scattering cards.`,
  settings: fortyThievesSettings,
  initialState: (seed: number, settings: FortyThievesSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: FortyThievesState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1","f2","f3","f4","f5","f6","f7","f8"];
    const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10"];
    const sources = ["waste", ...TABLEAU_IDS];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, fortyThievesRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    const stock = state.piles.find((p) => p.id === "stock");
    if (stock && stock.cards.length > 0) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    return null;
  },
  component: FortyThieves,
};
