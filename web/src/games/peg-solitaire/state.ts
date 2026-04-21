import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PegSolitaireSettings {
  // No meaningful settings for the classic board, but we need the object
  variant: "english";
}

// The English cross board is 7×7, but only 33 cells are valid.
// Invalid cells: corners (rows 0-1, 5-6 and cols 0-1, 5-6)
// Valid cell: must have |row-3| + |col-3| <= 3 at the "diamond"... actually
// For English cross:
//   Valid if NOT in the 4 corner 2×2 blocks.
//   Corner blocks: rows 0-1 AND cols 0-1 / 5-6; rows 5-6 AND cols 0-1 / 5-6.

export type CellType = "valid" | "invalid";
export type PegState = "peg" | "empty";

export interface PegSolitaireState {
  settings: PegSolitaireSettings;
  cells: readonly PegState[]; // length 49 (7×7); only valid cells matter
  valid: readonly boolean[];  // length 49; true = this cell is part of the board
  selected: number | null;    // currently selected peg index
  won: boolean;
  movesMade: number;
}

export type PegSolitaireAction =
  | { type: "select"; index: number }
  | { type: "jump"; from: number; over: number; to: number };

// Build the valid mask for 7×7 English cross
function buildValid(): boolean[] {
  const v: boolean[] = new Array(49).fill(false);
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      // Invalid: corner 2×2 blocks
      const cornerRow = r < 2 || r > 4;
      const cornerCol = c < 2 || c > 4;
      if (cornerRow && cornerCol) continue;
      v[r * 7 + c] = true;
    }
  }
  return v;
}

const VALID = buildValid();
const CENTER = 3 * 7 + 3; // row 3, col 3

export function initialState(seed: number, settings: PegSolitaireSettings): PegSolitaireState {
  // seed not used for variations in classic mode, but we keep it for API compatibility
  void mulberry32(seed); // consume to keep API consistent

  const cells: PegState[] = new Array(49).fill("empty");
  // Fill all valid cells with pegs, except center
  for (let i = 0; i < 49; i++) {
    if (VALID[i] && i !== CENTER) cells[i] = "peg";
  }

  return {
    settings,
    cells,
    valid: VALID,
    selected: null,
    won: false,
    movesMade: 0,
  };
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

export function reducer(state: PegSolitaireState, action: PegSolitaireAction): PegSolitaireState {
  if (state.won) return state;

  switch (action.type) {
    case "select": {
      const { index } = action;
      if (!state.valid[index] || state.cells[index] !== "peg") {
        return { ...state, selected: null };
      }
      // If same peg selected, deselect
      if (state.selected === index) return { ...state, selected: null };
      // Check if this is a valid jump destination from selected
      if (state.selected !== null) {
        const legalJumps = getLegalJumps(state.cells, state.valid, state.selected);
        const jump = legalJumps.find((j) => j.to === index);
        if (jump) {
          // Execute the jump
          const newCells = state.cells.slice() as PegState[];
          newCells[state.selected] = "empty";
          newCells[jump.over] = "empty";
          newCells[index] = "peg";
          const pegsLeft = countPegs(newCells, state.valid);
          const won = pegsLeft === 1 && newCells[CENTER] === "peg";
          const noMoves = !won && !hasAnyMove(newCells, state.valid);
          return {
            ...state,
            cells: newCells,
            selected: won || noMoves ? null : null,
            movesMade: state.movesMade + 1,
            won,
          };
        }
      }
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

      return {
        ...state,
        cells: newCells,
        selected: null,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PegSolitaireState): { score: number } | null {
  const pegsLeft = countPegs(state.cells, state.valid);
  // Terminal if won OR no moves remain
  if (!state.won && hasAnyMove(state.cells, state.valid)) return null;
  // Score: more pegs removed = better. Perfect = 1000. Each peg remaining costs 150.
  return { score: Math.max(50, 1000 - (pegsLeft - 1) * 150) };
}
