import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FroggerState, FroggerAction, Obstacle } from "./state.js";
import { initialState, reducer, isTerminal, COLS, HOME_ROW } from "./state.js";
import { Frogger } from "./Frogger.js";

export const froggerSettings = {
  lives: {
    kind: "enum" as const,
    label: "Lives",
    options: ["3", "5"] as const,
    default: "3" as const,
  },
} as const;

type FroggerSettingsType = SettingsOf<typeof froggerSettings>;

export const froggerPlugin: GamePlugin<FroggerState, FroggerAction, typeof froggerSettings> = {
  id: "frogger-like",
  title: "Frog Hop",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hop across traffic and water. Reach all 5 home spots without getting squashed or drowned.",
  howToPlay: `Guide your frog from the bottom of the screen to the five home lily-pads at the top without being squashed by traffic or drowning.

Use the Arrow keys or WASD to hop one cell at a time. The board has several zones: a safe start strip at the bottom, three lanes of traffic (rows 4-6), a safe median in the middle, and two water lanes with floating logs near the top. The home row has five spots marked with dotted outlines.

On the road, avoid cars — hopping into one costs a life. On the water, land on a log to ride it safely; hopping onto open water instantly drowns your frog. Logs move continuously, so time your jumps to hop onto them, then ride sideways if needed. If a log carries you off the edge of the screen you lose a life.

Fill all five home spots to win. You start with 3 lives (or 5 on the lives setting). Score = homes reached × 100 minus deaths × 20. Tips: watch the log rhythm before jumping, and plan a path through traffic gaps rather than rushing.`,
  settings: froggerSettings,
  initialState: (seed: number, settings: FroggerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: FroggerState): HintTarget | null => {
    if (state.over || state.won) return null;
    const { frogRow, frogCol, obstacles } = state;

    function cellHasObstacle(row: number, col: number): boolean {
      for (const o of obstacles as readonly Obstacle[]) {
        if (o.row !== row) continue;
        const left = ((Math.round(o.col) % COLS) + COLS) % COLS;
        for (let i = 0; i < o.width; i++) {
          if ((left + i) % COLS === col) return true;
        }
      }
      return false;
    }

    function isWaterRow(row: number): boolean {
      return row === 1 || row === 2;
    }

    function safeUp(): boolean {
      const r = frogRow - 1;
      if (r < HOME_ROW) return false;
      // Heading into water: must land on a log
      if (isWaterRow(r)) return cellHasObstacle(r, frogCol);
      // Heading into road: must NOT have a car
      if (r === 4 || r === 5 || r === 6) return !cellHasObstacle(r, frogCol);
      return true;
    }

    if (safeUp()) {
      const r = Math.max(HOME_ROW, frogRow - 1);
      return { selector: `[data-testid="hint-target-frogger-${r}-${frogCol}"]`, pulses: 3 };
    }
    // Lateral fallback: pulse left or right cell that is safe
    function safeLateral(dc: number): boolean {
      const c = frogCol + dc;
      if (c < 0 || c >= COLS) return false;
      if (isWaterRow(frogRow)) return cellHasObstacle(frogRow, c);
      if (frogRow === 4 || frogRow === 5 || frogRow === 6) return !cellHasObstacle(frogRow, c);
      return true;
    }
    if (safeLateral(-1)) {
      return { selector: `[data-testid="hint-target-frogger-${frogRow}-${frogCol - 1}"]`, pulses: 3 };
    }
    if (safeLateral(1)) {
      return { selector: `[data-testid="hint-target-frogger-${frogRow}-${frogCol + 1}"]`, pulses: 3 };
    }
    // Stay put — pulse current frog
    return { selector: `[data-testid="hint-target-frogger-${frogRow}-${frogCol}"]`, pulses: 3 };
  },
  component: Frogger,
};
