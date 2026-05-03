import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KlotskiState, KlotskiAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Klotski } from "./Klotski.js";

export const klotskiSettings = {
  layout: {
    kind: "enum" as const,
    label: "Layout",
    options: ["red-donkey", "easy", "medium"] as const,
    default: "red-donkey" as const,
  },
} as const;

type KlotskiSettingsType = SettingsOf<typeof klotskiSettings>;

export const klotskiPlugin: GamePlugin<KlotskiState, KlotskiAction, typeof klotskiSettings> = {
  id: "klotski",
  title: "Klotski",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slide rectangular blocks on a 4×5 grid to free the large red block through the exit.",
  howToPlay: `Klotski is a classic sliding-block puzzle played on a 4×5 grid. The board contains several rectangular blocks of different sizes that can slide horizontally or vertically — but never diagonally, and never through other blocks.

The goal: move the large red 2×2 block from the top of the board down to the exit opening at the bottom center. To escape, it must slide into row 3 at columns 1–2.

Click any block to select it (outlined in gold). Then use the arrow buttons to slide the selected block one space in any valid direction. A block can only move into empty space — it cannot pass through or over other blocks. Click a different block to switch your selection.

Blocks come in several types: the red 2×2 goal block, blue vertical pieces (1×2), green horizontal pieces (2×1), and purple 1×1 squares. Each must be maneuvered to create a path for the red block.

The "Red Donkey" layout (L'Âne Rouge) is the classic hardest configuration requiring at least 81 moves. The Easy and Medium layouts are more approachable starting points.

Scoring: 500 points minus 2 per move made, with a floor of 10. Fewer moves earns a higher score, so plan ahead and look for efficient sequences before you start sliding.`,
  settings: klotskiSettings,
  initialState: (seed: number, settings: KlotskiSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".klotski-board")) ? { selector: ".klotski-board", pulses: 3 } : null,
  component: Klotski,
};
