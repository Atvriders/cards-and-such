import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CoinCollectorSettings {
  gridSize: "5" | "7" | "9";
  turnLimit: "20" | "30" | "40";
}

export type CellContent = null | 1 | 5 | 10 | 25; // null=empty, numbers=coin value

export interface CoinCollectorState {
  settings: CoinCollectorSettings;
  rngSeed: number;
  gridSize: number;
  grid: CellContent[];
  playerRow: number;
  playerCol: number;
  turnsLeft: number;
  score: number;
  totalCoins: number;
  coinsCollected: number;
  gameOver: boolean;
  won: boolean;
}

export type Dir = "up" | "down" | "left" | "right";
export type CoinCollectorAction = { type: "move"; dir: Dir } | { type: "restart" };

const COIN_VALUES: CellContent[] = [1, 1, 1, 5, 5, 10, 25];

function buildGrid(size: number, rng: () => number): CellContent[] {
  const total = size * size;
  const grid: CellContent[] = new Array(total).fill(null);
  const coinCount = Math.floor(total * 0.45);
  let placed = 0;
  const indices = Array.from({ length: total }, (_, i) => i);
  // Shuffle indices
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = indices[i]!;
    indices[i] = indices[j]!;
    indices[j] = tmp;
  }
  // Skip first cell (player start = top-left)
  for (let k = 0; k < indices.length && placed < coinCount; k++) {
    const idx = indices[k]!;
    if (idx === 0) continue; // skip player start
    const val = COIN_VALUES[Math.floor(rng() * COIN_VALUES.length)]!;
    grid[idx] = val;
    placed++;
  }
  return grid;
}

export function initialState(seed: number, settings: CoinCollectorSettings): CoinCollectorState {
  const rng = mulberry32(seed >>> 0);
  const gridSize = parseInt(settings.gridSize, 10);
  const turnLimit = parseInt(settings.turnLimit, 10);
  const grid = buildGrid(gridSize, rng);
  const totalCoins = grid.filter(c => c !== null).length;
  return {
    settings,
    rngSeed: seed >>> 0,
    gridSize,
    grid,
    playerRow: 0,
    playerCol: 0,
    turnsLeft: turnLimit,
    score: 0,
    totalCoins,
    coinsCollected: 0,
    gameOver: false,
    won: false,
  };
}

export function reducer(state: CoinCollectorState, action: CoinCollectorAction): CoinCollectorState {
  if (action.type === "restart") {
    return initialState(state.rngSeed + 1, state.settings);
  }
  if (state.gameOver) return state;
  if (action.type !== "move") return state;

  const { dir } = action;
  const { gridSize, playerRow: row, playerCol: col } = state;
  let newRow = row;
  let newCol = col;
  if (dir === "up") newRow = Math.max(0, row - 1);
  else if (dir === "down") newRow = Math.min(gridSize - 1, row + 1);
  else if (dir === "left") newCol = Math.max(0, col - 1);
  else if (dir === "right") newCol = Math.min(gridSize - 1, col + 1);

  if (newRow === row && newCol === col) return state; // wall

  const idx = newRow * gridSize + newCol;
  const cellVal = state.grid[idx] ?? null;
  const newGrid = [...state.grid];
  let scoreGain = 0;
  let coinsCollected = state.coinsCollected;
  if (cellVal !== null) {
    scoreGain = cellVal as number;
    newGrid[idx] = null;
    coinsCollected++;
  }

  const turnsLeft = state.turnsLeft - 1;
  const won = coinsCollected >= state.totalCoins;
  const gameOver = turnsLeft <= 0 || won;

  return {
    ...state,
    grid: newGrid,
    playerRow: newRow,
    playerCol: newCol,
    turnsLeft,
    score: state.score + scoreGain,
    coinsCollected,
    gameOver,
    won,
  };
}

export function isTerminal(state: CoinCollectorState): { score: number } | null {
  if (!state.gameOver) return null;
  const bonus = state.won ? 100 : 0;
  return { score: state.score + bonus };
}
