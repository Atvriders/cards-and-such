import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FrozenRiverSettings {
  width: "5" | "7" | "9";
}

export type IceTile = "ice" | "crack" | "hole" | "start" | "end" | "rock";

export interface FrozenRiverState {
  settings: FrozenRiverSettings;
  grid: IceTile[];
  cols: number;
  rows: number;
  playerPos: number;
  steps: number;
  fell: boolean;
  won: boolean;
  gameOver: boolean;
  message: string;
}

export type FrozenRiverAction =
  | { type: "move"; dir: "up" | "down" | "left" | "right" }
  | { type: "restart" };

function buildIceGrid(seed: number, cols: number): { grid: IceTile[]; rows: number } {
  const rng = mulberry32(seed);
  const rows = cols;
  const total = cols * rows;
  const grid: IceTile[] = Array.from({ length: total }, () => {
    const r = rng();
    if (r < 0.15) return "hole";
    if (r < 0.28) return "crack";
    if (r < 0.36) return "rock";
    return "ice";
  });
  grid[0] = "start";
  grid[total - 1] = "end";
  // carve a safe path
  let r2 = 0, c = 0;
  while (r2 < rows - 1 || c < cols - 1) {
    const idx = r2 * cols + c;
    if (grid[idx] !== "start" && grid[idx] !== "end") grid[idx] = "ice";
    if (r2 < rows - 1 && c < cols - 1) {
      if (rng() < 0.5) r2++; else c++;
    } else if (r2 < rows - 1) r2++;
    else c++;
  }
  return { grid, rows };
}

export function initialState(seed: number, settings: FrozenRiverSettings): FrozenRiverState {
  const cols = parseInt(settings.width, 10);
  const { grid, rows } = buildIceGrid(seed, cols);
  return {
    settings,
    grid,
    cols,
    rows,
    playerPos: 0,
    steps: 0,
    fell: false,
    won: false,
    gameOver: false,
    message: "Cross the frozen river carefully!",
  };
}

export function reducer(state: FrozenRiverState, action: FrozenRiverAction): FrozenRiverState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (action.type === "move" && !state.gameOver) {
    const { cols, rows, playerPos, grid } = state;
    const row = Math.floor(playerPos / cols);
    const col = playerPos % cols;
    let nr = row, nc = col;
    if (action.dir === "up") nr--;
    else if (action.dir === "down") nr++;
    else if (action.dir === "left") nc--;
    else if (action.dir === "right") nc++;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return state;
    const newPos = nr * cols + nc;
    const tile = grid[newPos]!;
    if (tile === "rock") return { ...state, message: "Blocked by a rock!" };
    if (tile === "hole") {
      return { ...state, playerPos: newPos, steps: state.steps + 1, fell: true, gameOver: true, message: "You fell through the ice!" };
    }
    const crackPenalty = tile === "crack" ? 1 : 0;
    const won = tile === "end";
    return {
      ...state,
      playerPos: newPos,
      steps: state.steps + 1 + crackPenalty,
      won,
      gameOver: won,
      message: won ? "Safely across!" : tile === "crack" ? "Cracked ice (+1 step penalty)" : "Step carefully...",
    };
  }
  return state;
}

export function isTerminal(state: FrozenRiverState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.fell) return { score: 0 };
  const maxSteps = state.cols * state.rows;
  const score = Math.max(50, 1000 - state.steps * Math.floor(1000 / maxSteps));
  return { score };
}
