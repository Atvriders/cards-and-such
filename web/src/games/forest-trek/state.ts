import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ForestTrekSettings {
  size: "5" | "6" | "7";
}

export type CellType = "path" | "tree" | "start" | "end" | "river";

export interface Cell {
  type: CellType;
  visited: boolean;
}

export interface ForestTrekState {
  settings: ForestTrekSettings;
  grid: Cell[];
  cols: number;
  playerPos: number;
  moves: number;
  won: boolean;
  gameOver: boolean;
  message: string;
}

export type ForestTrekAction =
  | { type: "move"; dir: "up" | "down" | "left" | "right" }
  | { type: "restart" };

function buildGrid(seed: number, cols: number): Cell[] {
  const rng = mulberry32(seed);
  const total = cols * cols;
  const cells: Cell[] = Array.from({ length: total }, () => ({
    type: "path" as CellType,
    visited: false,
  }));
  cells[0]!.type = "start";
  cells[total - 1]!.type = "end";
  for (let i = 1; i < total - 1; i++) {
    const r = rng();
    if (r < 0.22) cells[i]!.type = "tree";
    else if (r < 0.30) cells[i]!.type = "river";
  }
  // Ensure path exists (carve a simple winding route)
  let r = 0, c = 0;
  while (r < cols - 1 || c < cols - 1) {
    const idx = r * cols + c;
    cells[idx]!.type = idx === 0 ? "start" : "path";
    if (r < cols - 1 && c < cols - 1) {
      if (rng() < 0.5) r++; else c++;
    } else if (r < cols - 1) r++;
    else c++;
  }
  return cells;
}

export function initialState(seed: number, settings: ForestTrekSettings): ForestTrekState {
  const cols = parseInt(settings.size, 10);
  const grid = buildGrid(seed, cols);
  return {
    settings,
    grid,
    cols,
    playerPos: 0,
    moves: 0,
    won: false,
    gameOver: false,
    message: "Navigate to the end of the forest!",
  };
}

export function reducer(state: ForestTrekState, action: ForestTrekAction): ForestTrekState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (action.type === "move" && !state.gameOver) {
    const { cols, playerPos, grid } = state;
    const row = Math.floor(playerPos / cols);
    const col = playerPos % cols;
    let newRow = row, newCol = col;
    if (action.dir === "up") newRow--;
    else if (action.dir === "down") newRow++;
    else if (action.dir === "left") newCol--;
    else if (action.dir === "right") newCol++;
    if (newRow < 0 || newRow >= cols || newCol < 0 || newCol >= cols) return state;
    const newPos = newRow * cols + newCol;
    const cell = grid[newPos]!;
    if (cell.type === "tree") return { ...state, message: "A tree blocks your path!" };
    const newGrid = grid.map((c, i) => i === newPos ? { ...c, visited: true } : c);
    const won = cell.type === "end";
    const riverPenalty = cell.type === "river" ? 2 : 0;
    return {
      ...state,
      grid: newGrid,
      playerPos: newPos,
      moves: state.moves + 1 + riverPenalty,
      won,
      gameOver: won,
      message: won ? "You reached the end!" : cell.type === "river" ? "Crossed river (+2 moves)" : "Keep going!",
    };
  }
  return state;
}

export function isTerminal(state: ForestTrekState): { score: number } | null {
  if (!state.won) return null;
  const maxMoves = state.cols * state.cols * 2;
  const score = Math.max(10, 1000 - state.moves * Math.floor(1000 / maxMoves));
  return { score };
}
