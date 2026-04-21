import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dots and Boxes
// Board: dots (rows+1) x (cols+1)
// Edges:
//   Horizontal: h[row][col] — between dot(row,col) and dot(row,col+1), rows=0..rows, cols=0..cols-1
//   Vertical:   v[row][col] — between dot(row,col) and dot(row+1,col), rows=0..rows-1, cols=0..cols
// Boxes: boxes[row][col] — 0-based, 0..rows-1 x 0..cols-1

export interface DotsAndBoxesSettings {
  boardSize: "3" | "5" | "7";
}

export interface DotsAndBoxesState {
  settings: DotsAndBoxesSettings;
  rows: number; // number of boxes rows
  cols: number; // number of boxes cols
  // Flattened: h[row * cols + col] for horizontal edges (rows+1 rows, cols per row)
  hEdges: readonly boolean[];
  // Flattened: v[row * (cols+1) + col] for vertical edges (rows rows, cols+1 per row)
  vEdges: readonly boolean[];
  // boxes[row * cols + col] = 0 | 1 | null
  boxes: ReadonlyArray<0 | 1 | null>;
  turn: 0 | 1;
  scores: [number, number];
  winner: 0 | 1 | "draw" | null;
  rngSeed: number;
}

export type EdgeType = "h" | "v";

export type DotsAndBoxesAction = {
  type: "drawEdge";
  edge: EdgeType;
  row: number;
  col: number;
};

function hIdx(state: DotsAndBoxesState, row: number, col: number): number {
  return row * state.cols + col;
}

function vIdx(state: DotsAndBoxesState, row: number, col: number): number {
  return row * (state.cols + 1) + col;
}

// Returns how many sides a box at (boxRow, boxCol) has drawn
function boxSides(state: { rows: number; cols: number; hEdges: readonly boolean[]; vEdges: readonly boolean[] }, boxRow: number, boxCol: number): number {
  const hI = (r: number, c: number) => r * state.cols + c;
  const vI = (r: number, c: number) => r * (state.cols + 1) + c;
  let count = 0;
  if (state.hEdges[hI(boxRow, boxCol)]) count++;     // top
  if (state.hEdges[hI(boxRow + 1, boxCol)]) count++; // bottom
  if (state.vEdges[vI(boxRow, boxCol)]) count++;      // left
  if (state.vEdges[vI(boxRow, boxCol + 1)]) count++;  // right
  return count;
}

// After drawing an edge, check which boxes got completed and return them
function completedBoxes(
  state: DotsAndBoxesState,
  edge: EdgeType,
  row: number,
  col: number,
): Array<[number, number]> {
  const completed: Array<[number, number]> = [];
  const newH = [...state.hEdges];
  const newV = [...state.vEdges];
  if (edge === "h") newH[hIdx(state, row, col)] = true;
  else newV[vIdx(state, row, col)] = true;
  const tempState = { rows: state.rows, cols: state.cols, hEdges: newH, vEdges: newV };

  // Horizontal edge at (row, col): affects boxes at row-1 and row
  // Vertical edge at (row, col): affects boxes at col-1 and col
  const candidates: Array<[number, number]> = [];
  if (edge === "h") {
    if (row > 0) candidates.push([row - 1, col]);
    if (row < state.rows) candidates.push([row, col]);
  } else {
    if (col > 0) candidates.push([row, col - 1]);
    if (col < state.cols) candidates.push([row, col]);
  }

  for (const [br, bc] of candidates) {
    if (br >= 0 && br < state.rows && bc >= 0 && bc < state.cols && boxSides(tempState, br, bc) === 4) {
      completed.push([br, bc]);
    }
  }
  return completed;
}

export function initialState(seed: number, settings: DotsAndBoxesSettings): DotsAndBoxesState {
  const size = parseInt(settings.boardSize, 10);
  const rows = size - 1; // dot grid NxN → (N-1)x(N-1) boxes
  const cols = size - 1;
  return {
    settings,
    rows,
    cols,
    hEdges: new Array((rows + 1) * cols).fill(false) as boolean[],
    vEdges: new Array(rows * (cols + 1)).fill(false) as boolean[],
    boxes: new Array(rows * cols).fill(null) as Array<null>,
    turn: 0,
    scores: [0, 0],
    winner: null,
    rngSeed: seed,
  };
}

function applyEdge(state: DotsAndBoxesState, edge: EdgeType, row: number, col: number, seat: 0 | 1): DotsAndBoxesState {
  // Validate
  if (edge === "h") {
    if (row < 0 || row > state.rows || col < 0 || col >= state.cols) return state;
    if (state.hEdges[hIdx(state, row, col)]) return state;
  } else {
    if (row < 0 || row >= state.rows || col < 0 || col > state.cols) return state;
    if (state.vEdges[vIdx(state, row, col)]) return state;
  }

  const newH = [...state.hEdges];
  const newV = [...state.vEdges];
  if (edge === "h") newH[hIdx(state, row, col)] = true;
  else newV[vIdx(state, row, col)] = true;

  const completed = completedBoxes(state, edge, row, col);
  const newBoxes = [...state.boxes] as Array<0 | 1 | null>;
  for (const [br, bc] of completed) {
    newBoxes[br * state.cols + bc] = seat;
  }

  const scored = completed.length;
  const newScores: [number, number] = [state.scores[0], state.scores[1]];
  newScores[seat] += scored;

  const totalBoxes = state.rows * state.cols;
  const filledBoxes = newBoxes.filter((b) => b !== null).length;
  let winner: 0 | 1 | "draw" | null = null;

  if (filledBoxes === totalBoxes) {
    if (newScores[0] > newScores[1]) winner = 0;
    else if (newScores[1] > newScores[0]) winner = 1;
    else winner = "draw";
  }

  // Extra turn if you scored
  const opp = (seat === 0 ? 1 : 0) as 0 | 1;
  const nextTurn = scored > 0 ? seat : opp;

  return {
    ...state,
    hEdges: newH,
    vEdges: newV,
    boxes: newBoxes,
    scores: newScores,
    turn: nextTurn,
    winner,
  };
}

// Bot heuristic: avoid giving opponent a chain, prefer "safe" moves (adding to 0 or 1-sided boxes)
function getBotMove(state: DotsAndBoxesState, rng: () => number): { edge: EdgeType; row: number; col: number } | null {
  // First: check if any move completes a box (free score)
  const allMoves = getAllMoves(state);
  if (allMoves.length === 0) return null;

  // Score-taking moves
  const scoringMoves = allMoves.filter((m) => completedBoxes(state, m.edge, m.row, m.col).length > 0);
  if (scoringMoves.length > 0) {
    return scoringMoves[Math.floor(rng() * scoringMoves.length)]!;
  }

  // Safe moves: don't create 3-sided boxes (would gift opponent)
  const safeMoves = allMoves.filter((m) => !createsThreeSided(state, m.edge, m.row, m.col));
  if (safeMoves.length > 0) {
    return safeMoves[Math.floor(rng() * safeMoves.length)]!;
  }

  // Forced: pick the move that gifts fewest boxes
  return allMoves[Math.floor(rng() * allMoves.length)]!;
}

function getAllMoves(state: DotsAndBoxesState): Array<{ edge: EdgeType; row: number; col: number }> {
  const moves: Array<{ edge: EdgeType; row: number; col: number }> = [];
  for (let r = 0; r <= state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (!state.hEdges[hIdx(state, r, c)]) moves.push({ edge: "h", row: r, col: c });
    }
  }
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c <= state.cols; c++) {
      if (!state.vEdges[vIdx(state, r, c)]) moves.push({ edge: "v", row: r, col: c });
    }
  }
  return moves;
}

function createsThreeSided(state: DotsAndBoxesState, edge: EdgeType, row: number, col: number): boolean {
  const newH = [...state.hEdges];
  const newV = [...state.vEdges];
  if (edge === "h") newH[hIdx(state, row, col)] = true;
  else newV[vIdx(state, row, col)] = true;
  const temp = { rows: state.rows, cols: state.cols, hEdges: newH, vEdges: newV };

  const candidates: Array<[number, number]> = [];
  if (edge === "h") {
    if (row > 0) candidates.push([row - 1, col]);
    if (row < state.rows) candidates.push([row, col]);
  } else {
    if (col > 0) candidates.push([row, col - 1]);
    if (col < state.cols) candidates.push([row, col]);
  }

  return candidates.some(([br, bc]) =>
    br >= 0 && br < state.rows && bc >= 0 && bc < state.cols && boxSides(temp, br, bc) === 3
  );
}

export function reducer(state: DotsAndBoxesState, action: DotsAndBoxesAction): DotsAndBoxesState {
  if (action.type !== "drawEdge") return state;
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state;

  let next = applyEdge(state, action.edge, action.row, action.col, 0);
  if (next === state) return state;

  const rng = mulberry32(next.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  next = { ...next, rngSeed: nextSeed };

  // Bot moves
  let limit = 200;
  while (next.winner === null && next.turn === 1 && limit-- > 0) {
    const rng2 = mulberry32(next.rngSeed);
    void rng2(); // advance seed
    const botRng = mulberry32(next.rngSeed + 1);
    const botMove = getBotMove(next, botRng);
    if (!botMove) break;
    const rng3 = mulberry32(next.rngSeed);
    const ns = Math.floor(rng3() * 2 ** 31);
    next = { ...applyEdge(next, botMove.edge, botMove.row, botMove.col, 1), rngSeed: ns };
  }

  return next;
}

export function isTerminal(state: DotsAndBoxesState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  if (state.winner === "draw") return { score: 50 };
  return { score: 0 };
}

export { boxSides, getAllMoves, hIdx, vIdx };
