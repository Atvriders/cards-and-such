import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BattleshipSoloSettings {
  gridSize: number;
}

export type CellState = "unknown" | "miss" | "hit" | "sunk";

export interface Ship {
  cells: readonly number[]; // flat indices
  hits: readonly boolean[];
}

export interface BattleshipSoloState {
  settings: BattleshipSoloSettings;
  grid: number; // grid dimension
  cells: readonly CellState[];
  ships: readonly Ship[];
  shotsLeft: number;
  shotsMax: number;
  won: boolean;
  lost: boolean;
  movesMade: number;
}

export type BattleshipSoloAction = { type: "shoot"; index: number };

function placeShips(rng: () => number, grid: number): Ship[] {
  const shipLengths = grid === 8 ? [4, 3, 3, 2] : [5, 4, 3, 3, 2, 2];
  const occupied = new Set<number>();
  const ships: Ship[] = [];

  for (const len of shipLengths) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 1000) {
      attempts++;
      const horiz = rng() > 0.5;
      const maxR = horiz ? grid : grid - len;
      const maxC = horiz ? grid - len : grid;
      const startR = Math.floor(rng() * maxR);
      const startC = Math.floor(rng() * maxC);
      const cells: number[] = [];
      for (let i = 0; i < len; i++) {
        cells.push(horiz ? startR * grid + startC + i : (startR + i) * grid + startC);
      }
      // Check cells + neighbors
      const conflict = cells.some((cell) => {
        const r = Math.floor(cell / grid);
        const c = cell % grid;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < grid && nc >= 0 && nc < grid && occupied.has(nr * grid + nc)) return true;
          }
        }
        return false;
      });
      if (!conflict) {
        cells.forEach((c) => occupied.add(c));
        ships.push({ cells, hits: new Array<boolean>(len).fill(false) });
        placed = true;
      }
    }
  }
  return ships;
}

export function initialState(seed: number, settings: BattleshipSoloSettings): BattleshipSoloState {
  const rng = mulberry32(seed);
  const grid = settings.gridSize;
  const ships = placeShips(rng, grid);
  const shotsMax = grid === 8 ? 35 : 50;
  return {
    settings,
    grid,
    cells: new Array<CellState>(grid * grid).fill("unknown"),
    ships,
    shotsLeft: shotsMax,
    shotsMax,
    won: false,
    lost: false,
    movesMade: 0,
  };
}

export function reducer(state: BattleshipSoloState, action: BattleshipSoloAction): BattleshipSoloState {
  if (state.won || state.lost) return state;
  if (action.type !== "shoot") return state;
  const { index } = action;
  if (index < 0 || index >= state.cells.length) return state;
  if (state.cells[index] !== "unknown") return state;

  const newCells = state.cells.slice() as CellState[];
  const newShips = state.ships.map((s) => ({ ...s, hits: s.hits.slice() as boolean[] }));

  let hit = false;
  for (const ship of newShips) {
    const ci = ship.cells.indexOf(index);
    if (ci !== -1) {
      (ship.hits as boolean[])[ci] = true;
      hit = true;
    }
  }

  // Mark cells: if all ship cells hit → sunk
  for (const ship of newShips) {
    const allHit = ship.hits.every(Boolean);
    for (const cell of ship.cells) {
      if (allHit) {
        newCells[cell] = "sunk";
      } else if ((ship.hits as boolean[])[ship.cells.indexOf(cell)]) {
        newCells[cell] = "hit";
      }
    }
  }
  if (!hit) newCells[index] = "miss";

  const shotsLeft = state.shotsLeft - 1;
  const allSunk = newShips.every((s) => s.hits.every(Boolean));
  const won = allSunk;
  const lost = !won && shotsLeft === 0;

  return {
    ...state,
    cells: newCells,
    ships: newShips,
    shotsLeft,
    won,
    lost,
    movesMade: state.movesMade + 1,
  };
}

export function isTerminal(state: BattleshipSoloState): { score: number } | null {
  if (state.won) return { score: Math.max(100, 1000 - state.movesMade * 10) };
  if (state.lost) return { score: 0 };
  return null;
}
