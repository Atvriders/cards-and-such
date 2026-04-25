import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type CellType = "empty" | "wall" | "treasure" | "trap" | "exit" | "start" | "monster" | "shrine";

export interface Cell {
  type: CellType;
  revealed: boolean;
  value?: number; // treasure value or trap damage
}

export type Direction = "up" | "down" | "left" | "right";

export interface TombOfKingsState {
  rngSeed: number;
  grid: readonly (readonly Cell[])[];
  rows: number;
  cols: number;
  playerRow: number;
  playerCol: number;
  playerHp: number;
  playerMaxHp: number;
  gold: number;
  moves: number;
  log: readonly string[];
  phase: "explore" | "done" | "dead";
}

export type TombOfKingsAction =
  | { type: "move"; dir: Direction };

const ROWS = 7;
const COLS = 7;

function buildGrid(rng: () => number): Cell[][] {
  // Create a 7x7 grid
  const grid: Cell[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ type: "empty" as CellType, revealed: false }))
  );

  // Place walls (random ~20% of cells)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (rng() < 0.18) grid[r]![c]!.type = "wall";
    }
  }

  // Ensure start and exit are clear
  grid[0]![0]!.type = "start";
  grid[0]![0]!.revealed = true;
  grid[ROWS - 1]![COLS - 1]!.type = "exit";

  // Place treasures (8 cells)
  let placed = 0;
  while (placed < 8) {
    const r = Math.floor(rng() * ROWS);
    const c = Math.floor(rng() * COLS);
    const cell = grid[r]![c]!;
    if (cell.type === "empty") {
      cell.type = "treasure";
      cell.value = Math.floor(rng() * 15) + 5;
      placed++;
    }
  }

  // Place traps (5 cells)
  placed = 0;
  while (placed < 5) {
    const r = Math.floor(rng() * ROWS);
    const c = Math.floor(rng() * COLS);
    const cell = grid[r]![c]!;
    if (cell.type === "empty") {
      cell.type = "trap";
      cell.value = Math.floor(rng() * 10) + 5;
      placed++;
    }
  }

  // Place monsters (4 cells)
  placed = 0;
  while (placed < 4) {
    const r = Math.floor(rng() * ROWS);
    const c = Math.floor(rng() * COLS);
    const cell = grid[r]![c]!;
    if (cell.type === "empty") {
      cell.type = "monster";
      cell.value = Math.floor(rng() * 12) + 8;
      placed++;
    }
  }

  // Place shrines (2 cells — heal player)
  placed = 0;
  while (placed < 2) {
    const r = Math.floor(rng() * ROWS);
    const c = Math.floor(rng() * COLS);
    const cell = grid[r]![c]!;
    if (cell.type === "empty") {
      cell.type = "shrine";
      cell.value = 15;
      placed++;
    }
  }

  return grid;
}

export function initialState(seed: number): TombOfKingsState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  const grid = buildGrid(rng2);

  return {
    rngSeed: nextSeed,
    grid,
    rows: ROWS,
    cols: COLS,
    playerRow: 0,
    playerCol: 0,
    playerHp: 40,
    playerMaxHp: 40,
    gold: 0,
    moves: 0,
    log: ["You enter the Tomb of Kings. Find the exit — collect treasure and avoid traps!"],
    phase: "explore",
  };
}

export function reducer(state: TombOfKingsState, action: TombOfKingsAction): TombOfKingsState {
  if (state.phase !== "explore") return state;

  switch (action.type) {
    case "move": {
      let newRow = state.playerRow;
      let newCol = state.playerCol;
      if (action.dir === "up")    newRow--;
      if (action.dir === "down")  newRow++;
      if (action.dir === "left")  newCol--;
      if (action.dir === "right") newCol++;

      // Bounds check
      if (newRow < 0 || newRow >= state.rows || newCol < 0 || newCol >= state.cols) return state;

      const targetCell = state.grid[newRow]![newCol]!;
      if (targetCell.type === "wall") return state;

      const logLines: string[] = [];
      let playerHp = state.playerHp;
      let gold = state.gold;

      // Reveal the cell
      const newGrid = state.grid.map((row, ri) =>
        row.map((cell, ci) => {
          if (ri === newRow && ci === newCol) return { ...cell, revealed: true };
          // Reveal adjacent cells too
          const dr = Math.abs(ri - newRow);
          const dc = Math.abs(ci - newCol);
          if (dr <= 1 && dc <= 1) return { ...cell, revealed: true };
          return cell;
        })
      );

      // Interact with cell
      let cellOverride: Partial<Cell> = {};
      switch (targetCell.type) {
        case "treasure": {
          const gain = targetCell.value ?? 10;
          gold += gain;
          logLines.push(`Found ${gain} gold!`);
          cellOverride = { type: "empty" };
          break;
        }
        case "trap": {
          const dmg = targetCell.value ?? 8;
          playerHp = Math.max(0, playerHp - dmg);
          logLines.push(`Trap! -${dmg} HP.`);
          cellOverride = { type: "empty" };
          break;
        }
        case "monster": {
          const dmg = targetCell.value ?? 10;
          playerHp = Math.max(0, playerHp - dmg);
          gold += 5;
          logLines.push(`Monster! -${dmg} HP, +5 gold.`);
          cellOverride = { type: "empty" };
          break;
        }
        case "shrine": {
          const heal = targetCell.value ?? 15;
          playerHp = Math.min(state.playerMaxHp, playerHp + heal);
          logLines.push(`Shrine! +${heal} HP.`);
          cellOverride = { type: "empty" };
          break;
        }
        case "exit": {
          logLines.push(`You escaped the tomb with ${gold} gold!`);
          break;
        }
      }

      // Apply cell override
      const finalGrid = newGrid.map((row, ri) =>
        row.map((cell, ci) => {
          if (ri === newRow && ci === newCol && Object.keys(cellOverride).length > 0) {
            return { ...cell, ...cellOverride, revealed: true };
          }
          return cell;
        })
      );

      if (playerHp <= 0) {
        return {
          ...state,
          grid: finalGrid,
          playerRow: newRow,
          playerCol: newCol,
          playerHp: 0,
          gold,
          moves: state.moves + 1,
          phase: "dead",
          log: [...state.log, ...logLines, "You perish in the tomb..."],
        };
      }

      const reachedExit = targetCell.type === "exit";
      return {
        ...state,
        grid: finalGrid,
        playerRow: newRow,
        playerCol: newCol,
        playerHp,
        gold,
        moves: state.moves + 1,
        phase: reachedExit ? "done" : "explore",
        log: [...state.log, ...logLines],
      };
    }
  }
}

export function isTerminal(state: TombOfKingsState): { score: number } | null {
  if (state.phase === "done") {
    // Score: gold collected + HP remaining bonus
    const goldScore = Math.min(60, Math.round((state.gold / 100) * 60));
    const hpScore = Math.round((state.playerHp / state.playerMaxHp) * 40);
    return { score: goldScore + hpScore };
  }
  if (state.phase === "dead") {
    return { score: Math.min(30, Math.round((state.gold / 100) * 30)) };
  }
  return null;
}
