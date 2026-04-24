import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const GRID_SIZE = 10;

export type CellType = "floor" | "wall" | "enemy" | "exit" | "potion" | "gold";

export interface Cell {
  type: CellType;
  hp?: number; // enemy hp
  attack?: number; // enemy attack
  name?: string;
  value?: number; // gold amount
}

export type Dir = "up" | "down" | "left" | "right";

export interface GridRogueState {
  rngSeed: number;
  grid: readonly (readonly Cell[])[];
  playerX: number;
  playerY: number;
  playerHp: number;
  playerMaxHp: number;
  playerAtk: number;
  gold: number;
  floor: number;
  log: readonly string[];
  phase: "playing" | "dead" | "won";
}

export type GridRogueAction = { type: "move"; dir: Dir };

const ENEMY_DEFS = [
  { name: "Rat",     hp: 6,  attack: 2 },
  { name: "Goblin",  hp: 12, attack: 3 },
  { name: "Orc",     hp: 18, attack: 5 },
  { name: "Troll",   hp: 28, attack: 7 },
  { name: "Dragon",  hp: 40, attack: 10 },
];

function buildGrid(rng: () => number, floorNum: number): Cell[][] {
  const grid: Cell[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, (): Cell => ({ type: "floor" }))
  );

  // Add walls
  const wallCount = 12 + floorNum * 2;
  for (let w = 0; w < wallCount; w++) {
    const x = Math.floor(rng() * GRID_SIZE);
    const y = Math.floor(rng() * GRID_SIZE);
    if (x === 0 && y === 0) continue;
    if (x === GRID_SIZE - 1 && y === GRID_SIZE - 1) continue;
    grid[y]![x] = { type: "wall" };
  }

  // Ensure exit
  grid[GRID_SIZE - 1]![GRID_SIZE - 1] = { type: "exit" };

  // Add enemies
  const tier = Math.min(floorNum - 1, ENEMY_DEFS.length - 1);
  const enemyCount = 3 + floorNum;
  for (let e = 0; e < enemyCount; e++) {
    let ex: number, ey: number;
    do {
      ex = Math.floor(rng() * GRID_SIZE);
      ey = Math.floor(rng() * GRID_SIZE);
    } while ((ex === 0 && ey === 0) || grid[ey]![ex]!.type !== "floor");
    const def = ENEMY_DEFS[Math.min(tier + Math.floor(rng() * 2), ENEMY_DEFS.length - 1)]!;
    grid[ey]![ex] = { type: "enemy", hp: def.hp, attack: def.attack, name: def.name };
  }

  // Add potions
  for (let p = 0; p < 3; p++) {
    let px: number, py: number;
    do {
      px = Math.floor(rng() * GRID_SIZE);
      py = Math.floor(rng() * GRID_SIZE);
    } while ((px === 0 && py === 0) || grid[py]![px]!.type !== "floor");
    grid[py]![px] = { type: "potion", value: 10 + Math.floor(rng() * 11) };
  }

  // Add gold
  for (let g = 0; g < 4; g++) {
    let gx: number, gy: number;
    do {
      gx = Math.floor(rng() * GRID_SIZE);
      gy = Math.floor(rng() * GRID_SIZE);
    } while ((gx === 0 && gy === 0) || grid[gy]![gx]!.type !== "floor");
    grid[gy]![gx] = { type: "gold", value: 5 + Math.floor(rng() * 16) };
  }

  return grid;
}

export function initialState(seed: number): GridRogueState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  const grid = buildGrid(rng2, 1);
  return {
    rngSeed: nextSeed,
    grid,
    playerX: 0,
    playerY: 0,
    playerHp: 30,
    playerMaxHp: 30,
    playerAtk: 8,
    gold: 0,
    floor: 1,
    log: ["Welcome to the dungeon! Reach the exit (X)."],
    phase: "playing",
  };
}

export function reducer(state: GridRogueState, action: GridRogueAction): GridRogueState {
  if (state.phase !== "playing") return state;

  const { dir } = action;
  let { playerX: px, playerY: py } = state;
  const dx = dir === "right" ? 1 : dir === "left" ? -1 : 0;
  const dy = dir === "down" ? 1 : dir === "up" ? -1 : 0;
  const nx = px + dx;
  const ny = py + dy;

  if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return state;

  const targetCell = state.grid[ny]![nx]!;
  if (targetCell.type === "wall") return state;

  const newGrid: Cell[][] = state.grid.map(row => [...row]);
  const logLines: string[] = [];
  let { playerHp, gold, rngSeed } = state;

  if (targetCell.type === "enemy") {
    const rng = mulberry32(rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    rngSeed = nextSeed;
    const enemyAtk = targetCell.attack!;
    const playerAtk = state.playerAtk + Math.floor(rng() * 4) - 1;
    const newEnemyHp = (targetCell.hp ?? 0) - playerAtk;
    if (newEnemyHp <= 0) {
      newGrid[ny]![nx] = { type: "floor" };
      logLines.push(`Slew ${targetCell.name}! (+${Math.floor(playerAtk)} dmg)`);
      px = nx; py = ny;
    } else {
      const dmg = Math.max(1, enemyAtk - Math.floor(rng() * 3));
      playerHp = Math.max(0, playerHp - dmg);
      newGrid[ny]![nx] = { ...targetCell, hp: newEnemyHp };
      logLines.push(`Hit ${targetCell.name} for ${playerAtk} (hp ${newEnemyHp}). Took ${dmg} dmg.`);
      // stay in place for now (attack in place)
      px = nx; py = ny;
    }
    if (playerHp <= 0) {
      return { ...state, rngSeed, playerHp: 0, grid: newGrid, playerX: px, playerY: py, log: [...state.log, ...logLines, "You died!"], phase: "dead" };
    }
    return { ...state, rngSeed, playerHp, grid: newGrid, playerX: px, playerY: py, log: [...state.log, ...logLines] };
  }

  if (targetCell.type === "potion") {
    const heal = targetCell.value ?? 10;
    playerHp = Math.min(state.playerMaxHp, playerHp + heal);
    newGrid[ny]![nx] = { type: "floor" };
    logLines.push(`Drank potion: +${heal} HP`);
    px = nx; py = ny;
    return { ...state, playerHp, grid: newGrid, playerX: px, playerY: py, log: [...state.log, ...logLines] };
  }

  if (targetCell.type === "gold") {
    gold += targetCell.value ?? 5;
    newGrid[ny]![nx] = { type: "floor" };
    logLines.push(`Collected ${targetCell.value} gold!`);
    px = nx; py = ny;
    return { ...state, gold, grid: newGrid, playerX: px, playerY: py, log: [...state.log, ...logLines] };
  }

  if (targetCell.type === "exit") {
    const nextFloor = state.floor + 1;
    if (nextFloor > 5) {
      return { ...state, playerX: nx, playerY: ny, phase: "won", log: [...state.log, "You escaped the dungeon! Victory!"] };
    }
    const rng = mulberry32(rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const rng2 = mulberry32(nextSeed);
    const newGridNext = buildGrid(rng2, nextFloor);
    return {
      ...state,
      rngSeed: nextSeed,
      grid: newGridNext,
      playerX: 0,
      playerY: 0,
      floor: nextFloor,
      playerHp: Math.min(state.playerMaxHp, playerHp + 5),
      log: [...state.log, `Floor ${nextFloor}! +5 HP`],
      phase: "playing",
    };
  }

  // plain floor
  px = nx; py = ny;
  return { ...state, playerX: px, playerY: py };
}

export function isTerminal(state: GridRogueState): { score: number } | null {
  if (state.phase === "won") return { score: 100 + state.gold };
  if (state.phase === "dead") return { score: Math.max(0, (state.floor - 1) * 15 + state.gold) };
  return null;
}
