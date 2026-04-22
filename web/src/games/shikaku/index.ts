import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShikakuState, ShikakuAction, ShikakuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Shikaku } from "./Shikaku.js";

export const shikakuSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type ShikakuSettingsType = SettingsOf<typeof shikakuSettings>;

export const shikakuPlugin: GamePlugin<ShikakuState, ShikakuAction, typeof shikakuSettings> = {
  id: "shikaku",
  title: "Shikaku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Divide the grid into rectangles; each must contain exactly one number equal to its area.",
  howToPlay: `Shikaku (also called Rectangles) is a Japanese logic puzzle. The grid contains some numbered cells. Your task is to divide the entire grid into non-overlapping rectangles (including squares) so that each rectangle contains exactly one numbered cell and the rectangle's area equals that number.

For example, a cell showing "6" must be inside a rectangle that covers exactly 6 cells — this could be 1×6, 2×3, 6×1, or 3×2. Every cell on the grid must belong to exactly one rectangle, with no gaps.

To draw a rectangle, click and drag across the cells you want to include. The rectangle highlights green if it is valid (exactly one clue inside, area matches the clue). Release the mouse to confirm. An invalid drag is discarded. Click an existing rectangle to remove it.

Strategy: start with larger numbers since they constrain the shape more tightly. Numbers near the edge can only be oriented in a limited number of ways. Work from constrained cells outward, eliminating possibilities until only one valid tiling remains.`,
  settings: shikakuSettings,
  initialState: (seed: number, settings: ShikakuSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Shikaku,
};
