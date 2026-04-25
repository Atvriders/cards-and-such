import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface JungleExplorerSettings {
  size: "5" | "7" | "9";
}

export type CellType = "empty" | "treasure" | "trap" | "camp" | "beast" | "river";

export interface Cell {
  type: CellType;
  revealed: boolean;
}

export interface JungleExplorerState {
  settings: JungleExplorerSettings;
  rngSeed: number;
  gridSize: number;
  grid: Cell[];
  playerPos: number;
  hp: number;
  treasure: number;
  totalTreasure: number;
  moves: number;
  maxMoves: number;
  log: string[];
  phase: "playing" | "gameover";
  score: number;
}

export type JungleExplorerAction =
  | { type: "move"; dir: "up" | "down" | "left" | "right" }
  | { type: "restart" };

function buildGrid(seed: number, size: number): Cell[] {
  const rng = mulberry32(seed);
  const total = size * size;
  const cells: Cell[] = Array.from({ length: total }, () => ({ type: "empty" as CellType, revealed: false }));
  // Start cell revealed
  cells[Math.floor(total / 2)]!.revealed = true;
  cells[Math.floor(total / 2)]!.type = "camp";

  const positions = Array.from({ length: total }, (_, i) => i).filter(i => i !== Math.floor(total / 2));
  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j]!, positions[i]!];
  }

  const treasureCount = Math.floor(total * 0.15) + 1;
  const trapCount = Math.floor(total * 0.12) + 1;
  const beastCount = Math.floor(total * 0.1) + 1;
  const riverCount = Math.floor(total * 0.08) + 1;

  let idx = 0;
  for (let t = 0; t < treasureCount && idx < positions.length; t++, idx++) cells[positions[idx]!]!.type = "treasure";
  for (let t = 0; t < trapCount && idx < positions.length; t++, idx++) cells[positions[idx]!]!.type = "trap";
  for (let t = 0; t < beastCount && idx < positions.length; t++, idx++) cells[positions[idx]!]!.type = "beast";
  for (let t = 0; t < riverCount && idx < positions.length; t++, idx++) cells[positions[idx]!]!.type = "river";

  return cells;
}

export function initialState(seed: number, settings: JungleExplorerSettings): JungleExplorerState {
  const gridSize = parseInt(settings.size, 10);
  const grid = buildGrid(seed, gridSize);
  const playerPos = Math.floor((gridSize * gridSize) / 2);
  const totalTreasure = grid.filter(c => c.type === "treasure").length;
  return {
    settings,
    rngSeed: seed,
    gridSize,
    grid,
    playerPos,
    hp: 5,
    treasure: 0,
    totalTreasure,
    moves: 0,
    maxMoves: gridSize * gridSize * 2,
    log: ["Expedition start! Find all treasure and survive."],
    phase: "playing",
    score: 0,
  };
}

export function reducer(state: JungleExplorerState, action: JungleExplorerAction): JungleExplorerState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.phase === "gameover") return state;

  const { dir } = action as { type: "move"; dir: "up" | "down" | "left" | "right" };
  const { gridSize, playerPos } = state;
  const row = Math.floor(playerPos / gridSize);
  const col = playerPos % gridSize;

  let newRow = row, newCol = col;
  if (dir === "up") newRow--;
  if (dir === "down") newRow++;
  if (dir === "left") newCol--;
  if (dir === "right") newCol++;

  if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize) return state;

  const newPos = newRow * gridSize + newCol;
  const cell = state.grid[newPos]!;
  const newGrid = state.grid.map((c, i) => i === newPos ? { ...c, revealed: true } : c);

  let { hp, treasure } = state;
  const newLog = [...state.log];

  if (cell.type === "treasure") {
    treasure++;
    newLog.push("Found treasure! +1");
    newGrid[newPos]!.type = "empty";
  } else if (cell.type === "trap") {
    hp--;
    newLog.push("Trap! -1 hp");
    newGrid[newPos]!.type = "empty";
  } else if (cell.type === "beast") {
    hp -= 2;
    newLog.push("Wild beast! -2 hp");
    newGrid[newPos]!.type = "empty";
  } else if (cell.type === "river") {
    newLog.push("Crossed a river. Safe passage.");
  } else if (cell.type === "camp") {
    hp = Math.min(5, hp + 1);
    newLog.push("Base camp! Rested. +1 hp");
  } else {
    newLog.push("Dense jungle. Nothing here.");
  }

  const moves = state.moves + 1;
  const outOfMoves = moves >= state.maxMoves;
  const dead = hp <= 0;
  const won = treasure >= state.totalTreasure;
  const gameOver = dead || outOfMoves || won;

  const finalScore = gameOver ? Math.min(100, Math.max(0, Math.round((treasure / state.totalTreasure) * 70 + hp * 6))) : 0;

  return {
    ...state,
    grid: newGrid,
    playerPos: newPos,
    hp,
    treasure,
    moves,
    log: newLog.slice(-5),
    phase: gameOver ? "gameover" : "playing",
    score: finalScore,
  };
}

export function isTerminal(state: JungleExplorerState): { score: number } | null {
  if (state.phase !== "gameover") return null;
  return { score: state.score };
}
