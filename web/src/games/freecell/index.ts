import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FreeCellState, FreeCellAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
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
  component: FreeCell,
};
