import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CTSState, CTSAction, CTSSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrossTheStreams } from "./CrossTheStreams.js";

export const ctsSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium"] as const,
    default: "easy",
  },
} as const;

type CTSSettingsType = SettingsOf<typeof ctsSettings>;

export const crossTheStreamsPlugin: GamePlugin<CTSState, CTSAction, typeof ctsSettings> = {
  id: "cross-the-streams",
  title: "Cross the Streams",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill a grid with black and white cells to match run-length clues on every row and column.",
  howToPlay: `Cross the Streams is a binary logic puzzle closely related to Nonograms. A grid must be filled with black (filled) or white (empty) cells. Each row and column is labeled with one or more numbers that describe runs of consecutive filled cells in that line, reading left-to-right or top-to-bottom.

A clue like "3 1" means there is a group of exactly 3 consecutive filled cells, then at least one empty cell gap, then exactly 1 filled cell. A clue of "0" means the entire line is empty. The runs must appear in the order given and must have at least one empty cell between them, but may have any number of empty cells outside or between runs.

Click any cell to cycle through three states: blank (unset), filled (solid black), or empty (marked with ×). Use the empty mark to record cells you are certain must be white. Row and column clues turn green when their filled pattern exactly matches.

Strategy: calculate the minimum space each row's runs require (sum of runs plus gaps between them). If this nearly fills the line, many cells are forced. Overlap the earliest and latest possible positions for each run to find definite fills. Cross-reference rows against columns — a cell forced black by its row clue must also be black in its column.`,
  settings: ctsSettings,
  initialState: (seed: number, settings: CTSSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-cross-the-streams-action"]', pulses: 3 }; },
  component: CrossTheStreams,
};
