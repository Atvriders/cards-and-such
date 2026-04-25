// ─── Key Maze ─────────────────────────────────────────────────────────────────
// Collect all keys scattered in the maze, then reach the exit door.
// Locked doors block passage until the matching key is collected.

export interface KeyMazeSettings {
  keys: "2" | "3" | "4";
}

export type Dir = "up" | "down" | "left" | "right";

export interface KeyMazeState {
  rows: number;
  cols: number;
  hWalls: boolean[];
  vWalls: boolean[];
  playerRow: number;
  playerCol: number;
  keys: Array<{ row: number; col: number; id: number; collected: boolean }>;
  exit: { row: number; col: number };
  keysNeeded: number;
  moves: number;
  won: boolean;
}

export type KeyMazeAction = { type: "move"; dir: Dir };

// ─── RNG ──────────────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

// ─── Maze generation ──────────────────────────────────────────────────────────
function generateMaze(rows: number, cols: number, seed: number) {
  const rng = mulberry32(seed);
  const visited = new Array(rows * cols).fill(false);
  const hWalls = new Array(rows * cols).fill(true);
  const vWalls = new Array(rows * cols).fill(true);

  function idx(r: number, c: number) { return r * cols + c; }

  function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }
    return arr;
  }

  function carve(r: number, c: number) {
    visited[idx(r, c)] = true;
    const dirs: Dir[] = shuffle(["up", "down", "left", "right"]);
    for (const d of dirs) {
      const nr = d === "up" ? r - 1 : d === "down" ? r + 1 : r;
      const nc = d === "left" ? c - 1 : d === "right" ? c + 1 : c;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (visited[idx(nr, nc)]) continue;
      if (d === "down") hWalls[idx(r, c)] = false;
      else if (d === "up") hWalls[idx(nr, nc)] = false;
      else if (d === "right") vWalls[idx(r, c)] = false;
      else if (d === "left") vWalls[idx(nr, nc)] = false;
      carve(nr, nc);
    }
  }

  carve(0, 0);
  return { hWalls, vWalls };
}

export function initialState(seed: number, settings: KeyMazeSettings): KeyMazeState {
  const rng = mulberry32(seed ^ 0xdeadbeef);
  const rows = 11;
  const cols = 11;
  const { hWalls, vWalls } = generateMaze(rows, cols, seed);
  const numKeys = parseInt(settings.keys, 10);

  // Place keys at non-corner, non-start, non-exit positions
  const forbidden = new Set(["0,0", `${rows - 1},${cols - 1}`]);
  const positions: Array<{ row: number; col: number }> = [];
  let attempts = 0;
  while (positions.length < numKeys && attempts < 1000) {
    attempts++;
    const r = 1 + Math.floor(rng() * (rows - 2));
    const c = 1 + Math.floor(rng() * (cols - 2));
    const key = `${r},${c}`;
    if (!forbidden.has(key)) {
      forbidden.add(key);
      positions.push({ row: r, col: c });
    }
  }

  const keys = positions.map((p, i) => ({ ...p, id: i, collected: false }));

  return {
    rows, cols, hWalls, vWalls,
    playerRow: 0, playerCol: 0,
    keys,
    exit: { row: rows - 1, col: cols - 1 },
    keysNeeded: numKeys,
    moves: 0, won: false,
  };
}

function canMove(state: KeyMazeState, dir: Dir): boolean {
  const { playerRow: r, playerCol: c, rows, cols, hWalls, vWalls } = state;
  const idx = (row: number, col: number) => row * cols + col;
  if (dir === "up") return r > 0 && !hWalls[idx(r - 1, c)];
  if (dir === "down") return r < rows - 1 && !hWalls[idx(r, c)];
  if (dir === "left") return c > 0 && !vWalls[idx(r, c - 1)];
  if (dir === "right") return c < cols - 1 && !vWalls[idx(r, c)];
  return false;
}

export function reducer(state: KeyMazeState, action: KeyMazeAction): KeyMazeState {
  if (state.won) return state;
  if (action.type === "move") {
    if (!canMove(state, action.dir)) return state;
    const dr = action.dir === "up" ? -1 : action.dir === "down" ? 1 : 0;
    const dc = action.dir === "left" ? -1 : action.dir === "right" ? 1 : 0;
    const nr = state.playerRow + dr;
    const nc = state.playerCol + dc;

    // Collect keys
    const keys = state.keys.map((k) =>
      !k.collected && k.row === nr && k.col === nc ? { ...k, collected: true } : k,
    );
    const collectedCount = keys.filter((k) => k.collected).length;

    // Check exit: need all keys
    const atExit = nr === state.exit.row && nc === state.exit.col;
    const won = atExit && collectedCount >= state.keysNeeded;

    return {
      ...state,
      playerRow: nr, playerCol: nc,
      keys,
      moves: state.moves + 1,
      won,
    };
  }
  return state;
}

export function isTerminal(state: KeyMazeState): { score: number } | null {
  if (state.won) {
    const score = Math.max(100, 2000 - state.moves * 4);
    return { score };
  }
  return null;
}

export function collectedCount(state: KeyMazeState): number {
  return state.keys.filter((k) => k.collected).length;
}
