import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const COLS = 8;
export const ROWS = 10;

export type TileType = "rock" | "ore" | "gem" | "monster" | "lava" | "ladder" | "empty";

export interface Tile {
  type: TileType;
  revealed: boolean;
  value?: number;
  hp?: number;
  attack?: number;
}

export interface MineDelverState {
  rngSeed: number;
  grid: readonly (readonly Tile[])[];
  playerRow: number; // starts at 0 (top), digs down
  gold: number;
  playerHp: number;
  playerMaxHp: number;
  depth: number; // row reached
  phase: "digging" | "dead" | "escaped";
  log: readonly string[];
}

export type MineDelverAction =
  | { type: "dig"; col: number } // dig tile in the row below player
  | { type: "climbLadder" };

function buildGrid(rng: () => number): Tile[][] {
  return Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col): Tile => {
      const r = rng();
      if (col === COLS - 1 && row === ROWS - 1) return { type: "ladder", revealed: true };
      if (r < 0.08) return { type: "lava", revealed: false };
      if (r < 0.18) return { type: "monster", revealed: false, hp: 8 + row * 3, attack: 3 + row };
      if (r < 0.30) return { type: "gem", revealed: false, value: 10 + row * 5 };
      if (r < 0.50) return { type: "ore", revealed: false, value: 3 + row * 2 };
      return { type: "rock", revealed: false };
    })
  );
}

export function initialState(seed: number): MineDelverState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  const grid = buildGrid(rng2);
  // Reveal top row
  const topRow = grid[0]!.map(t => ({ ...t, revealed: true }));
  const newGrid = [topRow, ...grid.slice(1)];
  return {
    rngSeed: nextSeed,
    grid: newGrid,
    playerRow: -1, // above the grid (surface)
    gold: 0,
    playerHp: 25,
    playerMaxHp: 25,
    depth: 0,
    phase: "digging",
    log: ["Dig down into the mine! Avoid lava and monsters."],
  };
}

export function reducer(state: MineDelverState, action: MineDelverAction): MineDelverState {
  if (state.phase !== "digging") return state;

  if (action.type === "dig") {
    const targetRow = state.playerRow + 1;
    if (targetRow >= ROWS) return state;
    const { col } = action;
    if (col < 0 || col >= COLS) return state;
    const tile = state.grid[targetRow]?.[col];
    if (!tile) return state;

    const newGrid: Tile[][] = state.grid.map(row => [...row]);
    const logLines: string[] = [];
    let { gold, playerHp } = state;

    // Reveal current row fully
    if (targetRow < ROWS) {
      newGrid[targetRow] = newGrid[targetRow]!.map(t => ({ ...t, revealed: true }));
    }
    // Reveal next row hints
    if (targetRow + 1 < ROWS) {
      newGrid[targetRow + 1] = newGrid[targetRow + 1]!.map(t => ({ ...t, revealed: true }));
    }

    switch (tile.type) {
      case "ore":
        gold += tile.value ?? 3;
        logLines.push(`Mined ore: +${tile.value} gold`);
        break;
      case "gem":
        gold += tile.value ?? 10;
        logLines.push(`Found gem: +${tile.value} gold!`);
        break;
      case "monster": {
        const monAtk = tile.attack ?? 3;
        playerHp = Math.max(0, playerHp - monAtk);
        logLines.push(`Monster hit! -${monAtk} HP (now ${playerHp})`);
        newGrid[targetRow]![col] = { ...tile, type: "empty", revealed: true };
        break;
      }
      case "lava":
        playerHp = Math.max(0, playerHp - 10);
        logLines.push(`Lava! -10 HP (now ${playerHp})`);
        newGrid[targetRow]![col] = { ...tile, type: "empty", revealed: true };
        break;
      case "ladder":
        return {
          ...state,
          gold,
          playerHp,
          playerRow: targetRow,
          depth: Math.max(state.depth, targetRow),
          phase: "escaped",
          grid: newGrid,
          log: [...state.log, "Found the ladder! Escaped!"],
        };
      default:
        break;
    }

    if (playerHp <= 0) {
      return { ...state, gold, playerHp: 0, grid: newGrid, phase: "dead", log: [...state.log, ...logLines, "You perished in the mine!"] };
    }

    return {
      ...state,
      gold,
      playerHp,
      grid: newGrid,
      playerRow: targetRow,
      depth: Math.max(state.depth, targetRow),
      log: [...state.log, ...logLines],
    };
  }

  return state;
}

export function isTerminal(state: MineDelverState): { score: number } | null {
  if (state.phase === "escaped") return { score: 50 + state.gold + state.depth * 5 };
  if (state.phase === "dead") return { score: Math.max(0, state.gold + state.depth * 3) };
  return null;
}
