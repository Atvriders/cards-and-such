// ─── Teleport Maze ────────────────────────────────────────────────────────────
// A standard maze with teleporter pads. Step on a pad to instantly jump to its
// partner pad on the other side of the maze.

export interface TeleportMazeSettings {
  teleporters: "2" | "3" | "4";
}

export type Dir = "up" | "down" | "left" | "right";

export interface TeleportPad {
  id: number;
  row: number;
  col: number;
  partnerId: number;
}

export interface TeleportMazeState {
  rows: number;
  cols: number;
  hWalls: boolean[];
  vWalls: boolean[];
  pads: TeleportPad[];
  playerRow: number;
  playerCol: number;
  moves: number;
  won: boolean;
  lastTeleport: number | null; // pad id just used, to avoid instant re-teleport
}

export type TeleportMazeAction = { type: "move"; dir: Dir };

// ─── RNG ──────────────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

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

export function initialState(seed: number, settings: TeleportMazeSettings): TeleportMazeState {
  const rng = mulberry32(seed ^ 0xcafebabe);
  const rows = 11;
  const cols = 11;
  const numPairs = parseInt(settings.teleporters, 10);
  const { hWalls, vWalls } = generateMaze(rows, cols, seed);

  const forbidden = new Set(["0,0", `${rows - 1},${cols - 1}`]);
  const pads: TeleportPad[] = [];
  let padId = 0;
  let attempts = 0;

  while (pads.length < numPairs * 2 && attempts < 2000) {
    attempts++;
    const r = 1 + Math.floor(rng() * (rows - 2));
    const c = 1 + Math.floor(rng() * (cols - 2));
    const key = `${r},${c}`;
    if (!forbidden.has(key)) {
      forbidden.add(key);
      pads.push({ id: padId, row: r, col: c, partnerId: padId + (pads.length % 2 === 0 ? 1 : -1) });
      padId++;
    }
  }

  // Fix partner IDs: pairs are (0,1), (2,3), (4,5)...
  for (let i = 0; i < pads.length; i += 2) {
    const a = pads[i];
    const b = pads[i + 1];
    if (a && b) {
      a.partnerId = i + 1;
      b.partnerId = i;
    }
  }

  return {
    rows, cols, hWalls, vWalls, pads,
    playerRow: 0, playerCol: 0,
    moves: 0, won: false, lastTeleport: null,
  };
}

function canMove(state: TeleportMazeState, dir: Dir): boolean {
  const { playerRow: r, playerCol: c, rows, cols, hWalls, vWalls } = state;
  const idx = (row: number, col: number) => row * cols + col;
  if (dir === "up") return r > 0 && !hWalls[idx(r - 1, c)];
  if (dir === "down") return r < rows - 1 && !hWalls[idx(r, c)];
  if (dir === "left") return c > 0 && !vWalls[idx(r, c - 1)];
  if (dir === "right") return c < cols - 1 && !vWalls[idx(r, c)];
  return false;
}

export function reducer(state: TeleportMazeState, action: TeleportMazeAction): TeleportMazeState {
  if (state.won) return state;
  if (action.type === "move") {
    if (!canMove(state, action.dir)) return state;
    const dr = action.dir === "up" ? -1 : action.dir === "down" ? 1 : 0;
    const dc = action.dir === "left" ? -1 : action.dir === "right" ? 1 : 0;
    let nr = state.playerRow + dr;
    let nc = state.playerCol + dc;
    let lastTeleport: number | null = null;

    // Check for teleporter
    const pad = state.pads.find((p) => p.row === nr && p.col === nc);
    if (pad && pad.id !== state.lastTeleport) {
      const partner = state.pads.find((p) => p.id === pad.partnerId);
      if (partner) {
        nr = partner.row;
        nc = partner.col;
        lastTeleport = partner.id;
      }
    }

    const won = nr === state.rows - 1 && nc === state.cols - 1;
    return {
      ...state,
      playerRow: nr, playerCol: nc,
      moves: state.moves + 1,
      won, lastTeleport,
    };
  }
  return state;
}

export function isTerminal(state: TeleportMazeState): { score: number } | null {
  if (state.won) {
    const score = Math.max(100, 1500 - state.moves * 5);
    return { score };
  }
  return null;
}
