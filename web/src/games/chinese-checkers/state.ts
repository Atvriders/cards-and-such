// Chinese Checkers (2-player, triangular star board)
// Board: 6-pointed star. Each player has 10 pegs in one point.
// Goal: move all pegs to the opposite point.
// Moves: step to adjacent hexagonal neighbor OR chain-jump over any peg.
// Bot: greedy forward-progress heuristic.

// We represent the star using a rhombus/axial coordinate system.
// The standard Chinese Checkers board has 121 cells arranged in a star.
// We'll use the classic (row, col) triangular representation with 17 rows.

export type CellColor = "player" | "bot" | null;

export interface CCSettings {
  opponent: "easy" | "medium";
}

export interface CCState {
  settings: CCSettings;
  rngSeed: number;
  // Board as a 1D array mapped from star coordinates
  // We use the classic 17-row layout
  cells: CellColor[];
  turn: "player" | "bot";
  selected: number | null; // index of selected cell
  winner: "player" | "bot" | null;
}

export type CCAction =
  | { type: "select"; idx: number }
  | { type: "move"; to: number };

// ---- Star board layout ----
// Using the standard 17-row Chinese Checkers layout
// Row sizes: 1,2,3,4,13,12,11,10,9,10,11,12,13,4,3,2,1
// Total: 121 cells

const ROW_SIZES = [1, 2, 3, 4, 13, 12, 11, 10, 9, 10, 11, 12, 13, 4, 3, 2, 1];
const TOTAL_CELLS = ROW_SIZES.reduce((a, b) => a + b, 0); // 121

// Row offsets
const ROW_OFFSETS: number[] = [];
let offset = 0;
for (const sz of ROW_SIZES) {
  ROW_OFFSETS.push(offset);
  offset += sz;
}

function cellIndex(row: number, col: number): number {
  if (row < 0 || row >= 17) return -1;
  const o = ROW_OFFSETS[row]!;
  const sz = ROW_SIZES[row]!;
  if (col < 0 || col >= sz) return -1;
  return o + col;
}

function rowCol(idx: number): [number, number] {
  for (let r = 0; r < 17; r++) {
    const o = ROW_OFFSETS[r]!;
    const sz = ROW_SIZES[r]!;
    if (idx >= o && idx < o + sz) return [r, idx - o];
  }
  return [-1, -1];
}

// Neighbors for each cell.
// The layout uses a hex grid. Adjacency depends on which zone we're in.
// We compute neighbors row by row based on the star shape.
function computeNeighbors(): number[][] {
  const neighbors: number[][] = Array.from({ length: TOTAL_CELLS }, () => []);

  for (let r = 0; r < 17; r++) {
    const sz = ROW_SIZES[r]!;
    for (let c = 0; c < sz; c++) {
      const i = cellIndex(r, c);
      if (i < 0) continue;

      // We define adjacency based on the row structure.
      // For hex grids with the star shape, connectivity is complex.
      // We use offset coordinates where the "column offset" shifts between rows.

      // The star has different connectivity in the "wide" middle rows vs. the "point" rows.
      // Simplified: we treat rows as offset hex rows.

      // In rows 0-3 (top point) and 13-16 (bottom point): simple triangular
      // In rows 4-12 (central diamond): hex

      // Horizontal neighbors
      const left = cellIndex(r, c - 1);
      const right = cellIndex(r, c + 1);
      if (left >= 0) neighbors[i]!.push(left);
      if (right >= 0) neighbors[i]!.push(right);

      // Vertical neighbors depend on row size relationship
      const prevSz = r > 0 ? ROW_SIZES[r - 1]! : -1;
      const nextSz = r < 16 ? ROW_SIZES[r + 1]! : -1;

      if (r > 0 && prevSz >= 0) {
        const expanding = prevSz > sz; // prev row is wider
        const shrinking = prevSz < sz; // prev row is narrower

        if (expanding) {
          // Top row is wider: each cell connects to 2 in row above
          const above1 = cellIndex(r - 1, c);
          const above2 = cellIndex(r - 1, c + 1);
          if (above1 >= 0) neighbors[i]!.push(above1);
          if (above2 >= 0) neighbors[i]!.push(above2);
        } else if (shrinking) {
          // Top row is narrower
          const above1 = cellIndex(r - 1, c - 1);
          const above2 = cellIndex(r - 1, c);
          if (above1 >= 0) neighbors[i]!.push(above1);
          if (above2 >= 0) neighbors[i]!.push(above2);
        } else {
          // Same size
          const above = cellIndex(r - 1, c);
          if (above >= 0) neighbors[i]!.push(above);
        }
      }

      if (r < 16 && nextSz >= 0) {
        const expanding = nextSz > sz;
        const shrinking = nextSz < sz;

        if (expanding) {
          const below1 = cellIndex(r + 1, c);
          const below2 = cellIndex(r + 1, c + 1);
          if (below1 >= 0) neighbors[i]!.push(below1);
          if (below2 >= 0) neighbors[i]!.push(below2);
        } else if (shrinking) {
          const below1 = cellIndex(r + 1, c - 1);
          const below2 = cellIndex(r + 1, c);
          if (below1 >= 0) neighbors[i]!.push(below1);
          if (below2 >= 0) neighbors[i]!.push(below2);
        } else {
          const below = cellIndex(r + 1, c);
          if (below >= 0) neighbors[i]!.push(below);
        }
      }
    }
  }
  return neighbors;
}

export const NEIGHBORS = computeNeighbors();

// Player starts in top point (rows 0-3), goal is bottom point (rows 13-16)
// Bot starts in bottom point (rows 13-16), goal is top point (rows 0-3)

function getPlayerStartIndices(): number[] {
  const indices: number[] = [];
  for (let r = 0; r <= 3; r++) {
    const o = ROW_OFFSETS[r]!;
    const sz = ROW_SIZES[r]!;
    for (let c = 0; c < sz; c++) indices.push(o + c);
  }
  return indices;
}

function getBotStartIndices(): number[] {
  const indices: number[] = [];
  for (let r = 13; r <= 16; r++) {
    const o = ROW_OFFSETS[r]!;
    const sz = ROW_SIZES[r]!;
    for (let c = 0; c < sz; c++) indices.push(o + c);
  }
  return indices;
}

export const PLAYER_START = getPlayerStartIndices(); // 10 cells
export const BOT_START = getBotStartIndices();       // 10 cells
export const PLAYER_GOAL = BOT_START;
export const BOT_GOAL = PLAYER_START;

export function initialState(seed: number, settings: CCSettings): CCState {
  const cells: CellColor[] = new Array(TOTAL_CELLS).fill(null);
  for (const i of PLAYER_START) cells[i] = "player";
  for (const i of BOT_START) cells[i] = "bot";
  return {
    settings,
    rngSeed: seed,
    cells,
    turn: "player",
    selected: null,
    winner: null,
  };
}

// Get all reachable cells from a source via steps and chain jumps
export function getReachable(cells: CellColor[], from: number): number[] {
  const visited = new Set<number>();
  const reachable = new Set<number>();

  // Simple step to empty neighbor
  for (const n of NEIGHBORS[from] ?? []) {
    if (cells[n] === null) reachable.add(n);
  }

  // Chain jumps
  const jumpQueue: number[] = [from];
  visited.add(from);

  while (jumpQueue.length > 0) {
    const cur = jumpQueue.shift()!;
    for (const n of NEIGHBORS[cur] ?? []) {
      if (cells[n] !== null) {
        // Find the cell on the other side (same direction)
        const [r1, c1] = rowCol(cur);
        const [r2, c2] = rowCol(n);
        const dr = r2 - r1;
        const dc = c2 - c1;
        const landR = r2 + dr;
        const landC = c2 + dc;
        const landIdx = cellIndex(landR, landC);
        if (landIdx >= 0 && cells[landIdx] === null && !visited.has(landIdx)) {
          visited.add(landIdx);
          reachable.add(landIdx);
          jumpQueue.push(landIdx);
        }
      }
    }
  }

  return [...reachable];
}

function checkWinner(cells: CellColor[]): "player" | "bot" | null {
  const playerWon = PLAYER_GOAL.every((i) => cells[i] === "player");
  if (playerWon) return "player";
  const botWon = BOT_GOAL.every((i) => cells[i] === "bot");
  if (botWon) return "bot";
  return null;
}

// Progress heuristic: sum of distances to goal (lower = better)
function cellRowForColor(idx: number, color: "player" | "bot"): number {
  const [r] = rowCol(idx);
  // Player going from top (r=0) to bottom (r=16)
  // Bot going from bottom (r=16) to top (r=0)
  return color === "player" ? r : (16 - r);
}

function botGreedy(cells: CellColor[]): [number, number] | null {
  // Find bot's pegs
  const botPegs = cells.map((c, i) => (c === "bot" ? i : -1)).filter((i) => i >= 0);
  let bestMove: [number, number] | null = null;
  let bestScore = Infinity;

  for (const from of botPegs) {
    const reachable = getReachable(cells, from);
    for (const to of reachable) {
      // Score: reduce total distance to goal
      const fromDist = cellRowForColor(from, "bot");
      const toDist = cellRowForColor(to, "bot");
      const improvement = fromDist - toDist; // positive = moving toward goal
      const score = -improvement; // lower is better
      if (score < bestScore) {
        bestScore = score;
        bestMove = [from, to];
      }
    }
  }
  return bestMove;
}

export function reducer(state: CCState, action: CCAction): CCState {
  if (state.winner !== null) return state;

  if (action.type === "select") {
    if (state.turn !== "player") return state;
    const cell = state.cells[action.idx];
    if (cell !== "player") return state;
    return { ...state, selected: action.idx };
  }

  if (action.type === "move") {
    if (state.turn !== "player" || state.selected === null) return state;
    const reachable = getReachable(state.cells, state.selected);
    if (!reachable.includes(action.to)) return state;

    const newCells = [...state.cells];
    newCells[state.selected] = null;
    newCells[action.to] = "player";

    const winner = checkWinner(newCells);
    if (winner !== null) return { ...state, cells: newCells, selected: null, winner };

    // Bot turn
    let cells = newCells;
    const botMove = botGreedy(cells);
    if (botMove) {
      const [from, to] = botMove;
      cells = [...cells];
      cells[from] = null;
      cells[to] = "bot";
    }

    const finalWinner = checkWinner(cells);
    return { ...state, cells, turn: "player", selected: null, winner: finalWinner };
  }

  return state;
}

export function isTerminal(state: CCState): { score: number } | null {
  if (state.winner === null) return null;
  return state.winner === "player" ? { score: 100 } : { score: 0 };
}

export { TOTAL_CELLS, ROW_SIZES, ROW_OFFSETS, rowCol, cellIndex };
