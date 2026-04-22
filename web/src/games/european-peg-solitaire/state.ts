import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// European Peg Solitaire — 37-cell board (cross + 4 corner cells)
// The board is 7×7. Valid cells: all cells in rows 1-5 cols 1-5,
// plus the 4 extra corner extensions:
//   (0,2),(0,3),(0,4), (6,2),(6,3),(6,4),
//   (2,0),(3,0),(4,0), (2,6),(3,6),(4,6)
// That gives 37 cells total.

export interface EuroPegSettings {
  variant: "european";
}

export type PegState = "peg" | "empty";

export interface EuroPegSolitaireState {
  settings: EuroPegSettings;
  cells: readonly PegState[];
  valid: readonly boolean[];
  selected: number | null;
  won: boolean;
  movesMade: number;
}

export type EuroPegAction =
  | { type: "select"; index: number }
  | { type: "jump"; from: number; over: number; to: number };

function buildValid(): boolean[] {
  const v: boolean[] = new Array(49).fill(false);
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      // Inner 5×5 cross (rows 1-5, cols 1-5)
      if (r >= 1 && r <= 5 && c >= 1 && c <= 5) {
        v[r * 7 + c] = true;
        continue;
      }
      // Extra corner extensions
      if ((r === 0 || r === 6) && c >= 2 && c <= 4) { v[r * 7 + c] = true; continue; }
      if ((c === 0 || c === 6) && r >= 2 && r <= 4) { v[r * 7 + c] = true; continue; }
    }
  }
  return v;
}

const VALID = buildValid();
const CENTER = 3 * 7 + 3; // row 3, col 3

export function initialState(seed: number, settings: EuroPegSettings): EuroPegSolitaireState {
  void mulberry32(seed);
  const cells: PegState[] = new Array(49).fill("empty");
  for (let i = 0; i < 49; i++) {
    if (VALID[i] && i !== CENTER) cells[i] = "peg";
  }
  return { settings, cells, valid: VALID, selected: null, won: false, movesMade: 0 };
}

export function getLegalJumps(
  cells: readonly PegState[],
  valid: readonly boolean[],
  from: number,
): { over: number; to: number }[] {
  const size = 7;
  const row = Math.floor(from / size);
  const col = from % size;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const jumps: { over: number; to: number }[] = [];
  for (const [dr, dc] of dirs) {
    const mr = row + dr!;
    const mc = col + dc!;
    const tr = row + 2 * dr!;
    const tc = col + 2 * dc!;
    if (mr < 0 || mr >= size || mc < 0 || mc >= size) continue;
    if (tr < 0 || tr >= size || tc < 0 || tc >= size) continue;
    const over = mr * size + mc;
    const to = tr * size + tc;
    if (!valid[over] || !valid[to]) continue;
    if (cells[from] === "peg" && cells[over] === "peg" && cells[to] === "empty") {
      jumps.push({ over, to });
    }
  }
  return jumps;
}

export function hasAnyMove(cells: readonly PegState[], valid: readonly boolean[]): boolean {
  for (let i = 0; i < 49; i++) {
    if (cells[i] === "peg" && valid[i]) {
      if (getLegalJumps(cells, valid, i).length > 0) return true;
    }
  }
  return false;
}

export function countPegs(cells: readonly PegState[], valid: readonly boolean[]): number {
  let count = 0;
  for (let i = 0; i < 49; i++) if (cells[i] === "peg" && valid[i]) count++;
  return count;
}

export function reducer(state: EuroPegSolitaireState, action: EuroPegAction): EuroPegSolitaireState {
  if (state.won) return state;

  switch (action.type) {
    case "select": {
      const { index } = action;
      if (!state.valid[index]) return { ...state, selected: null };
      if (state.cells[index] !== "peg") {
        // Maybe a jump destination
        if (state.selected !== null) {
          const legalJumps = getLegalJumps(state.cells, state.valid, state.selected);
          const jump = legalJumps.find((j) => j.to === index);
          if (jump) {
            const newCells = state.cells.slice() as PegState[];
            newCells[state.selected] = "empty";
            newCells[jump.over] = "empty";
            newCells[index] = "peg";
            const pegsLeft = countPegs(newCells, state.valid);
            const won = pegsLeft === 1 && newCells[CENTER] === "peg";
            return { ...state, cells: newCells, selected: null, movesMade: state.movesMade + 1, won };
          }
        }
        return { ...state, selected: null };
      }
      if (state.selected === index) return { ...state, selected: null };
      return { ...state, selected: index };
    }

    case "jump": {
      const { from, over, to } = action;
      const legalJumps = getLegalJumps(state.cells, state.valid, from);
      if (!legalJumps.some((j) => j.over === over && j.to === to)) return state;
      const newCells = state.cells.slice() as PegState[];
      newCells[from] = "empty";
      newCells[over] = "empty";
      newCells[to] = "peg";
      const pegsLeft = countPegs(newCells, state.valid);
      const won = pegsLeft === 1 && newCells[CENTER] === "peg";
      return { ...state, cells: newCells, selected: null, movesMade: state.movesMade + 1, won };
    }

    default:
      return state;
  }
}

export function isTerminal(state: EuroPegSolitaireState): { score: number } | null {
  const pegsLeft = countPegs(state.cells, state.valid);
  if (!state.won && hasAnyMove(state.cells, state.valid)) return null;
  return { score: Math.max(50, 1000 - (pegsLeft - 1) * 130) };
}
