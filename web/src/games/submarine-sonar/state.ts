import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SubmarineSonarSettings {
  gridSize: "6" | "8" | "10";
}

export type CellState = "unknown" | "miss" | "hit" | "sunk";

export interface SubmarineSonarState {
  settings: SubmarineSonarSettings;
  rngSeed: number;
  size: number;
  /** Positions of submarine segments (row * size + col) */
  subCells: number[];
  /** Length of submarine */
  subLength: number;
  grid: CellState[];
  pings: number;
  hitsFound: number;
  gameOver: boolean;
  won: boolean;
}

export type SubmarineSonarAction =
  | { type: "ping"; cell: number }
  | { type: "restart" };

function placeSubmarine(size: number, length: number, rng: () => number): number[] {
  const horizontal = rng() < 0.5;
  if (horizontal) {
    const row = Math.floor(rng() * size);
    const col = Math.floor(rng() * (size - length + 1));
    return Array.from({ length }, (_, i) => row * size + col + i);
  } else {
    const row = Math.floor(rng() * (size - length + 1));
    const col = Math.floor(rng() * size);
    return Array.from({ length }, (_, i) => (row + i) * size + col);
  }
}

export function initialState(seed: number, settings: SubmarineSonarSettings): SubmarineSonarState {
  const size = parseInt(settings.gridSize, 10);
  const rng = mulberry32(seed);
  const subLength = size >= 10 ? 5 : size >= 8 ? 4 : 3;
  const subCells = placeSubmarine(size, subLength, rng);
  return {
    settings,
    rngSeed: seed,
    size,
    subCells,
    subLength,
    grid: Array(size * size).fill("unknown"),
    pings: 0,
    hitsFound: 0,
    gameOver: false,
    won: false,
  };
}

export function reducer(state: SubmarineSonarState, action: SubmarineSonarAction): SubmarineSonarState {
  if (action.type === "restart") {
    return initialState(state.rngSeed + 1, state.settings);
  }

  if (action.type === "ping") {
    if (state.gameOver) return state;
    const { cell } = action;
    if (state.grid[cell] !== "unknown") return state;

    const isHit = state.subCells.includes(cell);
    const newGrid = [...state.grid];
    newGrid[cell] = isHit ? "hit" : "miss";

    const hitsFound = state.hitsFound + (isHit ? 1 : 0);
    const won = hitsFound >= state.subLength;

    // If won, mark all hits as sunk
    if (won) {
      for (const c of state.subCells) {
        newGrid[c] = "sunk";
      }
    }

    return {
      ...state,
      grid: newGrid,
      pings: state.pings + 1,
      hitsFound,
      gameOver: won,
      won,
    };
  }

  return state;
}

export function isTerminal(state: SubmarineSonarState): { score: number } | null {
  if (!state.gameOver) return null;
  // Score: fewer pings = better. Max 100 if sunk in exactly subLength pings.
  const score = Math.max(0, 100 - Math.max(0, state.pings - state.subLength) * 5);
  return { score };
}
