import { Grid } from "../../engines/grid/index.js";
import { minimax } from "../../engines/grid/minimax.js";
import type { Coord } from "../../engines/grid/index.js";

// 7 rows × 9 cols grid. Ball starts at center (row 3, col 4).
// Player 1 (W, human) scores by landing ball in row 0 or beyond.
// Player 2 (B, bot) scores by landing ball in row 6 or beyond.
// On a turn: either place a man on any empty non-ball cell,
// OR jump the ball over one or more adjacent lines of men (removing them).

export type Cell = "man" | "ball" | null;

export interface PhutballSettings {
  opponent: "bot" | "hot-seat";
}

export type PhutballTurn = "W" | "B";

export interface PhutballState {
  settings: PhutballSettings;
  rngSeed: number;
  grid: Grid<Cell>;
  turn: PhutballTurn;
  ballPos: Coord;
  winner: "W" | "B" | null;
  // mid-jump state: if not null, we're in the middle of a jump sequence
  jumpInProgress: boolean;
}

export type PhutballAction =
  | { type: "placeman"; at: Coord }
  | { type: "jump"; direction: [number, number] }
  | { type: "endJump" }; // finalize a multi-jump sequence

export function initialState(seed: number, settings: PhutballSettings): PhutballState {
  const ROWS = 7, COLS = 9;
  const ballRow = 3, ballCol = 4;
  const cells: Cell[] = new Array(ROWS * COLS).fill(null);
  cells[ballRow * COLS + ballCol] = "ball";
  return {
    settings,
    rngSeed: seed,
    grid: new Grid<Cell>(ROWS, COLS, cells),
    turn: "W",
    ballPos: { row: ballRow, col: ballCol },
    winner: null,
    jumpInProgress: false,
  };
}

const DIRS8: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

/** Check if a jump in direction [dr, dc] is possible from current ball position */
export function canJump(grid: Grid<Cell>, ballPos: Coord, dr: number, dc: number): boolean {
  // Must have at least 1 man in that direction
  let r = ballPos.row + dr;
  let c = ballPos.col + dc;
  let foundMan = false;
  while (grid.inBounds({ row: r, col: c })) {
    const v = grid.get({ row: r, col: c });
    if (v === "man") { foundMan = true; r += dr; c += dc; }
    else break;
  }
  return foundMan;
}

/** Perform a jump: ball flies over all men in direction until empty/OOB, removing them */
function performJump(state: PhutballState, dr: number, dc: number): { state: PhutballState; scored: boolean } {
  let grid = state.grid;
  const bp = state.ballPos;
  let r = bp.row + dr, c = bp.col + dc;
  let lastManR = -1, lastManC = -1;

  // Find consecutive men
  while (grid.inBounds({ row: r, col: c }) && grid.get({ row: r, col: c }) === "man") {
    lastManR = r; lastManC = c;
    r += dr; c += dc;
  }
  if (lastManR === -1) return { state, scored: false }; // no men to jump

  // New ball position is after the last man
  const newBallRow = lastManR + dr;
  const newBallCol = lastManC + dc;

  // Remove men
  let r2 = bp.row + dr, c2 = bp.col + dc;
  while (r2 !== newBallRow || c2 !== newBallCol) {
    if (grid.inBounds({ row: r2, col: c2 }) && grid.get({ row: r2, col: c2 }) === "man") {
      grid = grid.set({ row: r2, col: c2 }, null);
    }
    r2 += dr; c2 += dc;
  }

  // Move ball
  grid = grid.set(bp, null);
  const newBallPos = { row: newBallRow, col: newBallCol };

  // Check if landed off the board or in scoring zone
  const scored = !grid.inBounds(newBallPos) ||
    (state.turn === "W" && newBallPos.row <= 0) ||
    (state.turn === "B" && newBallPos.row >= grid.rows - 1);

  if (!grid.inBounds(newBallPos)) {
    // Ball went off-board
    return {
      state: { ...state, grid, ballPos: newBallPos, winner: state.turn },
      scored: true,
    };
  }

  grid = grid.set(newBallPos, "ball");

  const winner: "W" | "B" | null = scored ? state.turn : null;

  return {
    state: { ...state, grid, ballPos: newBallPos, winner },
    scored,
  };
}

function evaluate(state: PhutballState): number {
  // Bot is B (maximizer). B wants ball to go to high rows, W wants low rows.
  const { row } = state.ballPos;
  return row; // B (bottom) wants high row, W (top) wants low row
}

function botMove(state: PhutballState): PhutballState {
  // Generate all possible single-move actions for bot
  const jumpActions: PhutballAction[] = DIRS8
    .filter(([dr, dc]) => canJump(state.grid, state.ballPos, dr, dc))
    .map(([dr, dc]) => ({ type: "jump" as const, direction: [dr, dc] as [number, number] }));

  const placeActions: PhutballAction[] = [...state.grid.coords()]
    .filter(c => state.grid.get(c) === null)
    .slice(0, 10)
    .map(c => ({ type: "placeman" as const, at: c }));

  const allActions = [...jumpActions, ...placeActions];

  type BotAction = { type: "jump"; direction: [number, number] } | { type: "placeman"; at: Coord };
  const result = minimax<PhutballState, BotAction>(state, {
    depth: 2,
    moves: (s): BotAction[] => {
      const js: BotAction[] = DIRS8
        .filter(([dr, dc]) => canJump(s.grid, s.ballPos, dr, dc))
        .map(([dr, dc]) => ({ type: "jump" as const, direction: [dr, dc] as [number, number] }));
      const ps: BotAction[] = [...s.grid.coords()]
        .filter(c => s.grid.get(c) === null)
        .slice(0, 8)
        .map(c => ({ type: "placeman" as const, at: c }));
      return [...js, ...ps];
    },
    apply: (s, a) => {
      const next = applyAction(s, a as PhutballAction);
      // End any jump sequences automatically
      const endTurn: PhutballTurn = next.turn === "W" ? "B" : "W";
      if (next.jumpInProgress) return { ...next, jumpInProgress: false, turn: endTurn };
      return next;
    },
    isTerminal: (s) => s.winner !== null,
    evaluate: (s) => {
      if (s.winner === "B") return 100000;
      if (s.winner === "W") return -100000;
      return evaluate(s);
    },
    maximizing: (s) => s.turn === "B",
  });

  if (!result.move && allActions.length > 0) {
    return applyAction(state, allActions[0]!);
  }
  if (!result.move) return state;
  const next = applyAction(state, result.move);
  if (next.jumpInProgress) return { ...next, jumpInProgress: false, turn: "W" };
  return next;
}

function applyAction(state: PhutballState, action: PhutballAction): PhutballState {
  if (action.type === "placeman") {
    if (state.jumpInProgress) return state; // can't place during jump
    const at = action.at;
    if (!state.grid.inBounds(at)) return state;
    if (state.grid.get(at) !== null) return state;
    const newGrid = state.grid.set(at, "man");
    const nextTurn: PhutballTurn = state.turn === "W" ? "B" : "W";
    return { ...state, grid: newGrid, turn: nextTurn };
  }

  if (action.type === "jump") {
    const [dr, dc] = action.direction;
    if (!canJump(state.grid, state.ballPos, dr, dc)) return state;
    const { state: newState, scored } = performJump(state, dr, dc);
    if (scored || newState.winner) return { ...newState, jumpInProgress: false };
    // Can continue jumping
    return { ...newState, jumpInProgress: true };
  }

  if (action.type === "endJump") {
    if (!state.jumpInProgress) return state;
    const nextTurn: PhutballTurn = state.turn === "W" ? "B" : "W";
    return { ...state, jumpInProgress: false, turn: nextTurn };
  }

  return state;
}

export function reducer(state: PhutballState, action: PhutballAction): PhutballState {
  if (state.winner) return state;

  // Human is W
  if (state.settings.opponent !== "hot-seat" && state.turn === "B" && !state.jumpInProgress) {
    return state; // bot's turn, shouldn't receive player input
  }

  const next = applyAction(state, action);

  // After end-jump or place, check if bot should play
  if (!next.winner && !next.jumpInProgress && state.settings.opponent === "bot" && next.turn === "B") {
    return botMove(next);
  }

  return next;
}

export function isTerminal(state: PhutballState): { score: number } | null {
  if (!state.winner) return null;
  return { score: state.winner === "W" ? 100 : 0 };
}
