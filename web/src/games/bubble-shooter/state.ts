import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type BubbleColor = 0 | 1 | 2 | 3 | 4;
export type Cell = BubbleColor | null;

export interface BubbleShooterState {
  settings: { colors: "3" | "4" | "5" };
  /** Grid: rows × COLS, index = row * COLS + col, null = empty */
  grid: readonly Cell[];
  rows: number;
  cols: number;
  /** Color of the current bubble in the shooter */
  currentBubble: BubbleColor;
  /** Aim angle in degrees (0 = straight up, -90 = left, 90 = right) */
  angle: number;
  /** Number of shots fired */
  shots: number;
  won: boolean;
  lost: boolean;
  rngSeed: number;
  rngCounter: number;
}

export type BubbleShooterAction =
  | { type: "aim"; angle: number }
  | { type: "shoot" };

const COLS = 9;
const INITIAL_ROWS = 6;
const DEAD_ZONE_ROW = 10; // if bubbles reach this row index, game over

function seededRng(seed: number, counter: number): () => number {
  return mulberry32(seed + counter * 999983);
}

function buildInitialGrid(
  seed: number,
  numColors: number,
): { grid: Cell[]; rows: number } {
  const rng = seededRng(seed, 0);
  const rows = INITIAL_ROWS;
  const grid: Cell[] = Array(rows * COLS).fill(null);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r * COLS + c] = Math.floor(rng() * numColors) as BubbleColor;
    }
  }
  return { grid, rows };
}

function nextBubble(seed: number, counter: number, numColors: number): BubbleColor {
  const rng = seededRng(seed, counter);
  return Math.floor(rng() * numColors) as BubbleColor;
}

export function initialState(
  seed: number,
  settings: { colors: "3" | "4" | "5" },
): BubbleShooterState {
  const numColors = parseInt(settings.colors, 10);
  const { grid, rows } = buildInitialGrid(seed, numColors);
  return {
    settings,
    grid,
    rows,
    cols: COLS,
    currentBubble: nextBubble(seed, 1, numColors),
    angle: 0,
    shots: 0,
    won: false,
    lost: false,
    rngSeed: seed,
    rngCounter: 2,
  };
}

/** Find landing cell for a bubble shot at given angle */
function findLanding(
  grid: readonly Cell[],
  rows: number,
  angle: number,
): { row: number; col: number } | null {
  // angle: 0=straight up, negative=left, positive=right
  // Shooter is conceptually at row=rows, center col
  const startCol = (COLS - 1) / 2;
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad); // upward = negative row

  let x = startCol + 0.5;
  let y = rows - 0.5; // start below grid

  const MAX_STEPS = 500;
  for (let step = 0; step < MAX_STEPS; step++) {
    x += dx * 0.2;
    y += dy * 0.2;

    // Bounce off walls
    if (x < 0) x = -x;
    if (x > COLS) x = 2 * COLS - x;

    // Hit top wall
    if (y < 0) {
      const col = Math.min(COLS - 1, Math.max(0, Math.floor(x)));
      return { row: 0, col };
    }

    const row = Math.floor(y);
    const col = Math.min(COLS - 1, Math.max(0, Math.floor(x)));

    if (row >= 0 && row < rows && grid[row * COLS + col] !== null) {
      // Hit something: back up one step to find empty cell
      const prevX = x - dx * 0.2;
      const prevY = y - dy * 0.2;
      const pr = Math.min(rows - 1, Math.max(0, Math.floor(prevY)));
      const pc = Math.min(COLS - 1, Math.max(0, Math.floor(prevX)));
      if (grid[pr * COLS + pc] === null) {
        return { row: pr, col: pc };
      }
      return { row, col: col > 0 ? col - 1 : col };
    }
  }
  return null;
}

/** BFS flood-fill to find connected cells of same color */
function findConnected(
  grid: readonly Cell[],
  startRow: number,
  startCol: number,
  color: BubbleColor,
  cols: number,
  rows: number,
): number[] {
  const visited = new Set<number>();
  const queue = [startRow * cols + startCol];
  visited.add(queue[0]!);

  while (queue.length > 0) {
    const idx = queue.shift()!;
    const r = Math.floor(idx / cols);
    const c = idx % cols;

    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as [number, number][]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const nIdx = nr * cols + nc;
      if (visited.has(nIdx)) continue;
      if (grid[nIdx] === color) {
        visited.add(nIdx);
        queue.push(nIdx);
      }
    }
  }
  return [...visited];
}

/** Find all cells connected to the top row (not floating) */
function findAnchored(grid: readonly Cell[], cols: number, rows: number): Set<number> {
  const anchored = new Set<number>();
  const queue: number[] = [];

  for (let c = 0; c < cols; c++) {
    if (grid[c] !== null) {
      anchored.add(c);
      queue.push(c);
    }
  }

  while (queue.length > 0) {
    const idx = queue.shift()!;
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as [number, number][]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const nIdx = nr * cols + nc;
      if (!anchored.has(nIdx) && grid[nIdx] !== null) {
        anchored.add(nIdx);
        queue.push(nIdx);
      }
    }
  }
  return anchored;
}

export function reducer(
  state: BubbleShooterState,
  action: BubbleShooterAction,
): BubbleShooterState {
  if (state.won || state.lost) return state;

  switch (action.type) {
    case "aim":
      return { ...state, angle: Math.max(-80, Math.min(80, action.angle)) };

    case "shoot": {
      const numColors = parseInt(state.settings.colors, 10);
      const landing = findLanding(state.grid, state.rows, state.angle);
      if (!landing) return state;

      const { row, col } = landing;
      if (row < 0 || row >= state.rows) return state;

      const newGrid = state.grid.slice() as Cell[];
      const color = state.currentBubble;
      newGrid[row * state.cols + col] = color;

      // Find connected same-color group
      const connected = findConnected(newGrid, row, col, color, state.cols, state.rows);

      if (connected.length >= 3) {
        // Pop them
        for (const idx of connected) newGrid[idx] = null;

        // Drop unanchored bubbles
        const anchored = findAnchored(newGrid, state.cols, state.rows);
        for (let i = 0; i < newGrid.length; i++) {
          if (newGrid[i] !== null && !anchored.has(i)) {
            newGrid[i] = null;
          }
        }
      }

      // Check win: no bubbles left
      const won = newGrid.every((c) => c === null);

      // Check loss: any bubble in dead zone row or beyond
      const lost = !won && newGrid.some((_c, i) => {
        const r = Math.floor(i / state.cols);
        return r >= DEAD_ZONE_ROW && newGrid[i] !== null;
      });

      const nextBubbleColor = nextBubble(state.rngSeed, state.rngCounter, numColors);

      return {
        ...state,
        grid: newGrid,
        currentBubble: nextBubbleColor,
        shots: state.shots + 1,
        won,
        lost,
        rngCounter: state.rngCounter + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: BubbleShooterState): { score: number } | null {
  if (state.won) {
    const score = Math.max(100, 2000 - state.shots * 20);
    return { score };
  }
  if (state.lost) return { score: 0 };
  return null;
}
