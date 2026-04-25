import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DesertTrekSettings {
  size: "5" | "6" | "7";
}

export type DesertCell = "sand" | "dune" | "oasis" | "quicksand" | "start" | "end";

export interface DesertTrekState {
  settings: DesertTrekSettings;
  grid: DesertCell[];
  cols: number;
  playerPos: number;
  moves: number;
  water: number;
  maxWater: number;
  won: boolean;
  gameOver: boolean;
  message: string;
}

export type DesertTrekAction =
  | { type: "move"; dir: "up" | "down" | "left" | "right" }
  | { type: "restart" };

function buildDesert(seed: number, cols: number): DesertCell[] {
  const rng = mulberry32(seed);
  const total = cols * cols;
  const grid: DesertCell[] = Array.from({ length: total }, () => {
    const r = rng();
    if (r < 0.18) return "dune";
    if (r < 0.28) return "quicksand";
    if (r < 0.36) return "oasis";
    return "sand";
  });
  grid[0] = "start";
  grid[total - 1] = "end";
  // Guarantee path
  let r = 0, c = 0;
  while (r < cols - 1 || c < cols - 1) {
    const idx = r * cols + c;
    if (grid[idx] !== "start" && grid[idx] !== "end") grid[idx] = "sand";
    if (r < cols - 1 && c < cols - 1) {
      if (rng() < 0.5) r++; else c++;
    } else if (r < cols - 1) r++;
    else c++;
  }
  return grid;
}

const MAX_WATER = 10;

export function initialState(seed: number, settings: DesertTrekSettings): DesertTrekState {
  const cols = parseInt(settings.size, 10);
  const grid = buildDesert(seed, cols);
  return {
    settings,
    grid,
    cols,
    playerPos: 0,
    moves: 0,
    water: MAX_WATER,
    maxWater: MAX_WATER,
    won: false,
    gameOver: false,
    message: "Cross the desert to the finish!",
  };
}

export function reducer(state: DesertTrekState, action: DesertTrekAction): DesertTrekState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (action.type === "move" && !state.gameOver) {
    const { cols, playerPos, grid } = state;
    const row = Math.floor(playerPos / cols);
    const col = playerPos % cols;
    let nr = row, nc = col;
    if (action.dir === "up") nr--;
    else if (action.dir === "down") nr++;
    else if (action.dir === "left") nc--;
    else if (action.dir === "right") nc++;
    if (nr < 0 || nr >= cols || nc < 0 || nc >= cols) return state;
    const newPos = nr * cols + nc;
    const cell = grid[newPos]!;
    if (cell === "dune") return { ...state, message: "A dune blocks your path!" };
    let water = state.water;
    let extraMoves = 0;
    if (cell === "quicksand") { water -= 2; extraMoves = 2; }
    else { water -= 1; }
    if (water <= 0) {
      return { ...state, playerPos: newPos, water: 0, gameOver: true, message: "You ran out of water!" };
    }
    const oasisBonus = cell === "oasis" ? Math.min(3, state.maxWater - water) : 0;
    water = Math.min(state.maxWater, water + oasisBonus);
    const won = cell === "end";
    return {
      ...state,
      playerPos: newPos,
      moves: state.moves + 1 + extraMoves,
      water,
      won,
      gameOver: won || water <= 0,
      message: won ? "You reached the oasis camp!" :
        cell === "quicksand" ? "Quicksand! (-2 water, +2 moves)" :
        cell === "oasis" ? `Oasis! (+${oasisBonus} water)` :
        `Water: ${water}/${state.maxWater}`,
    };
  }
  return state;
}

export function isTerminal(state: DesertTrekState): { score: number } | null {
  if (!state.gameOver) return null;
  if (!state.won) return { score: 0 };
  const waterBonus = state.water * 30;
  const moveBonus = Math.max(0, 500 - state.moves * 10);
  return { score: Math.min(1000, waterBonus + moveBonus + 200) };
}
