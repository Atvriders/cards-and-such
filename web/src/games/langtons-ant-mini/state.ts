export const SIZE = 12;

// Langton's ant: ant on grid, on white cell turn right; on black turn left, flip color, move forward.
export type Dir = 0 | 1 | 2 | 3; // 0=N, 1=E, 2=S, 3=W

export interface AntSettings { dummy: boolean; }
export interface AntState {
  grid: number[]; // 0 white, 1 black
  ax: number;
  ay: number;
  dir: Dir;
  steps: number;
  flipped: number;
  phase: "running" | "done";
}
export type AntAction = { type: "step" } | { type: "reset" } | { type: "finish" };

export function initialState(_seed: number, _s: AntSettings): AntState {
  const grid = new Array(SIZE * SIZE).fill(0);
  return { grid, ax: Math.floor(SIZE / 2), ay: Math.floor(SIZE / 2), dir: 0, steps: 0, flipped: 0, phase: "running" };
}

export function step(state: AntState): AntState {
  if (state.phase === "done") return state;
  const idx = state.ay * SIZE + state.ax;
  const cur = state.grid[idx]!;
  // White (0) -> turn right; Black (1) -> turn left
  const turn = cur === 0 ? 1 : -1;
  const newDir = (((state.dir + turn) % 4) + 4) % 4 as Dir;
  // Flip color
  const grid = state.grid.slice();
  grid[idx] = cur === 0 ? 1 : 0;
  // Move forward
  let nx = state.ax, ny = state.ay;
  if (newDir === 0) ny -= 1;
  else if (newDir === 1) nx += 1;
  else if (newDir === 2) ny += 1;
  else nx -= 1;
  // Wrap on edges
  nx = ((nx % SIZE) + SIZE) % SIZE;
  ny = ((ny % SIZE) + SIZE) % SIZE;
  return { ...state, grid, ax: nx, ay: ny, dir: newDir, steps: state.steps + 1, flipped: state.flipped + 1 };
}

export function reducer(state: AntState, action: AntAction): AntState {
  if (action.type === "step") return step(state);
  if (action.type === "reset") return initialState(0, { dummy: false });
  if (action.type === "finish") return { ...state, phase: "done" };
  return state;
}

export function score(s: AntState): number { return s.flipped; }
export function isTerminal(s: AntState): { score: number } | null { return s.phase === "done" ? { score: score(s) } : null; }
