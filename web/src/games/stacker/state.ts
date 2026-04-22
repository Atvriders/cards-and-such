export type Phase = "moving" | "dropped" | "gameover";

export interface StackerRow {
  x: number;   // left edge (0..COLS-1 units)
  width: number; // in units (1..COLS)
}

export const COLS = 10; // grid columns
const INITIAL_WIDTH = 6;
const MIN_SPEED = 1.5;  // cols/sec at start
const SPEED_INC = 0.25; // extra cols/sec per row stacked

export interface StackerState {
  phase: Phase;
  stack: readonly StackerRow[]; // bottom to top
  moving: StackerRow;           // the currently sliding block
  movingX: number;              // current position (continuous)
  movingDir: 1 | -1;           // moving direction
  elapsed: number;
  score: number;
}

export type StackerAction =
  | { type: "tick"; dt: number }
  | { type: "drop" };

function clampRow(x: number, width: number): { x: number; width: number } {
  const l = Math.max(0, x);
  const r = Math.min(COLS, x + width);
  return { x: l, width: Math.max(0, r - l) };
}

export function initialState(): StackerState {
  const row: StackerRow = { x: (COLS - INITIAL_WIDTH) / 2, width: INITIAL_WIDTH };
  return {
    phase: "moving",
    stack: [row], // first row is the base platform
    moving: { x: 0, width: INITIAL_WIDTH },
    movingX: 0,
    movingDir: 1,
    elapsed: 0,
    score: 0,
  };
}

export function reducer(state: StackerState, action: StackerAction): StackerState {
  if (state.phase === "gameover") return state;

  switch (action.type) {
    case "tick": {
      if (state.phase !== "moving") return state;
      const speed = MIN_SPEED + state.stack.length * SPEED_INC;
      let newX = state.movingX + state.movingDir * speed * action.dt;
      let dir = state.movingDir;
      // Bounce off walls
      if (newX < 0) { newX = 0; dir = 1; }
      if (newX + state.moving.width > COLS) { newX = COLS - state.moving.width; dir = -1; }
      return {
        ...state,
        movingX: newX,
        movingDir: dir,
        elapsed: state.elapsed + action.dt,
      };
    }

    case "drop": {
      if (state.phase !== "moving") return state;
      const top = state.stack[state.stack.length - 1]!;
      const movingSnapped: StackerRow = { x: state.movingX, width: state.moving.width };

      // Compute overlap with the top row
      const overlapL = Math.max(top.x, movingSnapped.x);
      const overlapR = Math.min(top.x + top.width, movingSnapped.x + movingSnapped.width);
      const overlapWidth = overlapR - overlapL;

      if (overlapWidth <= 0) {
        // Completely missed
        return { ...state, phase: "gameover" };
      }

      const newRow: StackerRow = { x: overlapL, width: overlapWidth };
      const newStack = [...state.stack, newRow];
      const newScore = state.score + Math.ceil(overlapWidth);

      // Next moving block same width as new top
      const nextMoving: StackerRow = { x: 0, width: overlapWidth };

      return {
        ...state,
        stack: newStack,
        moving: nextMoving,
        movingX: 0,
        movingDir: 1,
        phase: "moving",
        score: newScore,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: StackerState): { score: number } | null {
  if (state.phase !== "gameover") return null;
  return { score: state.score };
}
