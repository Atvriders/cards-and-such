import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { BakersGameState, BakersGameAction } from "./state.js";
import { initialState, reducer, isTerminal, bakersRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const BakersGame = /* @__PURE__ */ lazy(() => import("./BakersGame.js").then((mod) => ({ default: mod.BakersGame as unknown as React.ComponentType<unknown> })));
export const bakersGameSettings = {} as const;

export const bakersGamePlugin: GamePlugin<BakersGameState, BakersGameAction, typeof bakersGameSettings> = {
  id: "bakers-game",
  title: "Baker's Game",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "FreeCell with same-suit descending tableau. Harder than classic FreeCell.",
  howToPlay: `Baker's Game plays exactly like FreeCell — 8 cascades, 4 free cells, 4 foundations, all 52 cards face-up from the start — with one critical difference: tableau columns build down in the same suit rather than alternating colors.

Layout: Eight cascades deal 7-7-7-7-6-6-6-6 cards. Four free cells each hold one card. Four foundations build up by suit from Ace to King.

Moves: Pick up one or more cards from a cascade top (they must form a descending same-suit sequence), and place them on a cascade ending in the next rank up of the same suit, or into an empty free cell (one card only), or onto a foundation (ascending same-suit). Empty cascades accept any card or sequence.

Multi-card moves: The number of cards you can move at once is (1 + empty free cells) × 2^(empty cascades). The game enforces this automatically.

Why it's harder: Same-suit sequences are rarer than alternating-color sequences, so the tableau becomes much more tangled. Long sequences are hard to build, and more moves require passing through free cells.

Strategy: Guard your free cells aggressively. Create empty cascades early. Prioritize same-suit runs whenever possible.`,
  settings: bakersGameSettings,
  initialState: (seed) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: BakersGameState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["fc1", "fc2", "fc3", "fc4", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, bakersRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: BakersGame,
};
