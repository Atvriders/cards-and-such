import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrossCluesState, CrossCluesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrossClues } from "./CrossClues.js";

export const crossCluesSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type CrossCluesSettingsType = SettingsOf<typeof crossCluesSettings>;

export const crossCluesPlugin: GamePlugin<CrossCluesState, CrossCluesAction, typeof crossCluesSettings> = {
  id: "cross-clues",
  title: "Cross Clues Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill a 3×3 grid where each cell must satisfy both its row and column category.",
  howToPlay: `Cross Clues Mini presents a 3×3 grid. Each row has a category label and each column has a category label. Your goal is to fill every cell with a word that simultaneously belongs to both its row category and its column category.

For example, if row 1 is "Types of music" and column 2 is "Colors," the cell at row 1 / column 2 needs a word that is both a type of music and a color — the answer might be "blues."

Click any empty cell to select it, then type your answer in the input field below the grid. Press Enter or click Submit All to check all your answers at once. Correct cells turn green; incorrect cells turn red and show what they needed.

Need help? Click the Hint button to reveal one cell's answer — but each hint costs 50 points from your potential score. Use hints sparingly!

Scoring: 100 points per correct cell (900 maximum), minus 50 per hint used. A clean solve with no hints scores 900 points.

Difficulty affects the puzzle chosen: easy puzzles use everyday categories with obvious overlaps, medium adds less obvious combinations, and hard uses obscure or tricky intersections.

Tips: think about words that wear many hats. A word like "coral" is both a color and a sea creature. "Jazz" is music and can describe a style. Cross-domain thinking is the key skill here.`,
  settings: crossCluesSettings,
  initialState: (seed: number, settings: CrossCluesSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CrossClues,
};
