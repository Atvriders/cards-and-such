import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FreeCellState, FreeCellAction } from "./state.js";
import { initialState, reducer, isTerminal, freecellRuleset } from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { FreeCell } from "./FreeCell.js";

export const freecellSettings = {
  freeCells: {
    kind: "number" as const,
    label: "Free Cells",
    min: 4,
    max: 4,
    step: 1,
    default: 4,
  },
} as const;

type FreeCellSettings = SettingsOf<typeof freecellSettings>;

export const freecellPlugin: GamePlugin<FreeCellState, FreeCellAction, typeof freecellSettings> = {
  id: "freecell",
  title: "FreeCell",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic FreeCell — move all cards to foundations using free cells as buffers.",
  howToPlay: `Build all four foundation piles up from Ace to King, one pile per suit. Unlike Klondike, all 52 cards are dealt face-up into 8 tableau columns at the start — the full game is visible from move one.

Moves: On the tableau, build down in alternating colors (red-on-black), one card at a time. The four free cells at the top can each hold exactly one card as a temporary buffer — use them wisely. Empty tableau columns also act as temporary parking spots. Click a card to select it; click a legal destination to move it.

Scoring: FreeCell has no point scoring — it's a pure win-or-lose puzzle. Nearly every deal is solvable with correct play, so the challenge is finding the right sequence.

Tips: Think several moves ahead before parking cards in free cells — once all four cells and empty columns are occupied, you can be completely stuck. Prefer moving cards to foundations as soon as possible to free up tableau space. Plan to unblock buried Aces early.`,
  settings: freecellSettings,
  initialState: (seed: number, settings: FreeCellSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: FreeCellState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const FREECELL_IDS = ["fc1", "fc2", "fc3", "fc4"];
    const CASCADE_IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];
    // Priority 1: any cascade/freecell card that can go to a foundation.
    const sources = [...CASCADE_IDS, ...FREECELL_IDS];
    for (const sourceId of sources) {
      const source = state.piles.find((p) => p.id === sourceId);
      if (!source || source.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        const move = { fromPile: sourceId, toPile: foundId, count: 1 };
        if (canMove(state.piles, move, freecellRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    // Priority 2: any cascade-top card that can be parked into an empty
    // free cell. Walk cascades; pick the first one with a free-cell-able
    // card (always count=1 satisfies freecellCellStack).
    const emptyCell = FREECELL_IDS.map((id) =>
      state.piles.find((p) => p.id === id),
    ).find((p) => p && p.cards.length === 0);
    if (emptyCell) {
      for (const cascadeId of CASCADE_IDS) {
        const cascade = state.piles.find((p) => p.id === cascadeId);
        if (cascade && cascade.cards.length > 0) {
          return { selector: `[data-testid="pile-${cascadeId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: FreeCell,
};
