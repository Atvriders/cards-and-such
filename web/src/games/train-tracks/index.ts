import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TTState, TTAction, TTSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TrainTracks } from "./TrainTracks.js";

export const ttSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium"] as const,
    default: "easy",
  },
} as const;

type TTSettingsType = SettingsOf<typeof ttSettings>;

export const trainTracksPlugin: GamePlugin<TTState, TTAction, typeof ttSettings> = {
  id: "train-tracks",
  title: "Train Tracks",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lay rail tiles to form a continuous path through the grid, matching row and column counts.",
  howToPlay: `Train Tracks is a rail-laying logic puzzle. A single continuous track enters the grid from one border cell and must exit at another. Your goal is to fill in all the rail tiles so the path is unbroken and every row and column contains exactly as many track cells as its clue number says.

Six tile shapes are available: straight horizontal (━), straight vertical (┃), and four curve types connecting two perpendicular directions (┏ ┓ ┗ ┛). Some cells are pre-placed to get you started. You choose a tile shape from the toolbar, then click any empty cell to lay that tile. Right-click (or use Clear) to remove a misplaced tile.

Cells turn green once they match the correct answer. Row and column clue numbers turn green when their count is satisfied.

Strategy: start with rows or columns whose clue is 0 (no track in that line) or whose clue equals the grid size (all track). Pre-placed tiles constrain which directions the path can travel in or out of neighboring cells. Trace the path from the known entry and exit points, filling in forced tiles step by step. Curve tiles are especially powerful for changing direction while satisfying multiple clue constraints at once.`,
  settings: ttSettings,
  initialState: (seed: number, settings: TTSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-train-tracks-action"]', pulses: 3 }; },
  component: TrainTracks,
};
