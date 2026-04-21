// ─── Frogger-like state ───────────────────────────────────────────────────────
// Grid: 13 rows × 13 cols
// Row 0  : home spots (5 positions)
// Row 1-2: water lanes (logs)
// Row 3  : safe median
// Row 4-6: road lanes (cars)
// Row 7  : safe start strip
// Frog spawns at row 7, col 6

export const COLS = 13;
export const ROWS = 8; // 0..7; row 0 = home, row 7 = start
export const HOME_ROW = 0;
export const START_ROW = 7;
export const MEDIAN_ROW = 3;

export type Dir = "up" | "down" | "left" | "right";

export interface Obstacle {
  row: number;
  col: number; // left edge (float)
  width: number; // in cells
  speed: number; // cells/tick, positive = right, negative = left
}

export interface FroggerSettings {
  // no settings for now (fixed difficulty)
  lives: "3" | "5";
}

export interface FroggerState {
  settings: FroggerSettings;
  frogRow: number;
  frogCol: number;
  obstacles: readonly Obstacle[]; // cars + logs
  homesFilled: readonly boolean[]; // 5 booleans
  homesReached: number;
  deaths: number;
  lives: number;
  score: number;
  over: boolean;
  won: boolean;
  tickCount: number;
}

export type FroggerAction =
  | { type: "tick" }
  | { type: "move"; dir: Dir };

// ─── Fixed lane config ────────────────────────────────────────────────────────
interface LaneConfig {
  row: number;
  obstacles: Array<{ startCol: number; width: number; speed: number }>;
}

const LANE_CONFIGS: LaneConfig[] = [
  // Water lanes (rows 1-2): logs move right
  {
    row: 1,
    obstacles: [
      { startCol: 0, width: 3, speed: 0.08 },
      { startCol: 6, width: 3, speed: 0.08 },
    ],
  },
  {
    row: 2,
    obstacles: [
      { startCol: 2, width: 2, speed: -0.06 },
      { startCol: 8, width: 2, speed: -0.06 },
    ],
  },
  // Car lanes (rows 4-6): cars move left or right
  {
    row: 4,
    obstacles: [
      { startCol: 0, width: 2, speed: 0.12 },
      { startCol: 7, width: 2, speed: 0.12 },
    ],
  },
  {
    row: 5,
    obstacles: [
      { startCol: 1, width: 2, speed: -0.10 },
      { startCol: 8, width: 2, speed: -0.10 },
    ],
  },
  {
    row: 6,
    obstacles: [
      { startCol: 3, width: 2, speed: 0.14 },
      { startCol: 10, width: 2, speed: 0.14 },
    ],
  },
];

// Home column positions (0-indexed, spread across 13 cols)
export const HOME_COLS = [1, 3, 5, 7, 9] as const;

function buildObstacles(): Obstacle[] {
  const obs: Obstacle[] = [];
  for (const lane of LANE_CONFIGS) {
    for (const cfg of lane.obstacles) {
      obs.push({ row: lane.row, col: cfg.startCol, width: cfg.width, speed: cfg.speed });
    }
  }
  return obs;
}

export function initialState(seed: number, settings: FroggerSettings): FroggerState {
  void seed; // deterministic: no rng needed
  const lives = parseInt(settings.lives, 10);
  return {
    settings,
    frogRow: START_ROW,
    frogCol: Math.floor(COLS / 2),
    obstacles: buildObstacles(),
    homesFilled: [false, false, false, false, false],
    homesReached: 0,
    deaths: 0,
    lives,
    score: 0,
    over: false,
    won: false,
    tickCount: 0,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isWaterRow(row: number): boolean {
  return row === 1 || row === 2;
}

function isRoadRow(row: number): boolean {
  return row === 4 || row === 5 || row === 6;
}

/** Get obstacles on this row */
function obstaclesOnRow(obstacles: readonly Obstacle[], row: number): Obstacle[] {
  return obstacles.filter((o) => o.row === row);
}

/** Check if a cell [row, col] has an obstacle overlapping it */
function hasObstacle(obstacles: readonly Obstacle[], row: number, col: number): boolean {
  for (const o of obstacles) {
    if (o.row !== row) continue;
    const left = ((o.col % COLS) + COLS) % COLS;
    // Wrap-aware overlap check
    for (let i = 0; i < o.width; i++) {
      const oc = (left + i) % COLS;
      if (oc === col) return true;
    }
  }
  return false;
}

/** For water rows: is frog ON a log? Returns the log's speed or null. */
function getLogSpeed(obstacles: readonly Obstacle[], row: number, col: number): number | null {
  for (const o of obstaclesOnRow(obstacles, row)) {
    const left = ((o.col % COLS) + COLS) % COLS;
    for (let i = 0; i < o.width; i++) {
      const oc = (left + i) % COLS;
      if (oc === col) return o.speed;
    }
  }
  return null;
}

function advanceObstacles(obstacles: readonly Obstacle[]): Obstacle[] {
  return obstacles.map((o) => ({
    ...o,
    col: ((o.col + o.speed) % COLS + COLS) % COLS,
  }));
}

function dieFrog(state: FroggerState): FroggerState {
  const newLives = state.lives - 1;
  const newDeaths = state.deaths + 1;
  const over = newLives <= 0;
  return {
    ...state,
    frogRow: START_ROW,
    frogCol: Math.floor(COLS / 2),
    lives: newLives,
    deaths: newDeaths,
    over,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: FroggerState, action: FroggerAction): FroggerState {
  if (state.over || state.won) return state;

  switch (action.type) {
    case "tick": {
      const newObstacles = advanceObstacles(state.obstacles);
      let frogRow = state.frogRow;
      let frogCol = state.frogCol;

      // If frog is on a water row, ride the log
      if (isWaterRow(frogRow)) {
        const speed = getLogSpeed(newObstacles, frogRow, frogCol);
        if (speed !== null) {
          // Ride log
          frogCol = Math.round(((frogCol + speed) % COLS + COLS) % COLS);
        } else {
          // Fell in water
          return dieFrog({ ...state, obstacles: newObstacles });
        }
      }

      // Check collision after riding (frog out of bounds or in water gap)
      if (frogCol < 0 || frogCol >= COLS) {
        return dieFrog({ ...state, obstacles: newObstacles });
      }

      return { ...state, obstacles: newObstacles, frogRow, frogCol, tickCount: state.tickCount + 1 };
    }

    case "move": {
      let newRow = state.frogRow;
      let newCol = state.frogCol;

      if (action.dir === "up") newRow -= 1;
      else if (action.dir === "down") newRow = Math.min(START_ROW, newRow + 1);
      else if (action.dir === "left") newCol = Math.max(0, newCol - 1);
      else if (action.dir === "right") newCol = Math.min(COLS - 1, newCol + 1);

      // Clamp to grid
      newRow = Math.max(HOME_ROW, Math.min(START_ROW, newRow));

      // Check home row arrival
      if (newRow === HOME_ROW) {
        const homeIdx = HOME_COLS.indexOf(newCol as typeof HOME_COLS[number]);
        if (homeIdx === -1) {
          // Not a home spot — die
          return dieFrog(state);
        }
        if (state.homesFilled[homeIdx]) {
          // Already filled — die
          return dieFrog(state);
        }
        const newHomesFilled = [...state.homesFilled] as boolean[];
        newHomesFilled[homeIdx] = true;
        const newHomesReached = state.homesReached + 1;
        const won = newHomesReached >= 5;
        return {
          ...state,
          frogRow: won ? HOME_ROW : START_ROW,
          frogCol: won ? newCol : Math.floor(COLS / 2),
          homesFilled: newHomesFilled,
          homesReached: newHomesReached,
          score: newHomesReached * 100 - state.deaths * 20,
          won,
          over: false,
        };
      }

      // Check car collision on road rows
      if (isRoadRow(newRow) && hasObstacle(state.obstacles, newRow, newCol)) {
        return dieFrog(state);
      }

      // Check water: must be on a log
      if (isWaterRow(newRow)) {
        const speed = getLogSpeed(state.obstacles, newRow, newCol);
        if (speed === null) {
          // No log → die
          return dieFrog(state);
        }
      }

      return { ...state, frogRow: newRow, frogCol: newCol };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FroggerState): { score: number } | null {
  if (state.won) return { score: state.homesReached * 100 - state.deaths * 20 };
  if (state.over) return { score: Math.max(0, state.homesReached * 100 - state.deaths * 20) };
  return null;
}
