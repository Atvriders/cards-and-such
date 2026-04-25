// ─── Colored Tile Maze ────────────────────────────────────────────────────────
// Navigate a maze where colored tiles have effects: red bounces you back,
// blue slows (costs 2 moves), green is normal, yellow teleports to a random
// open tile. Reach the exit.

export interface ColoredTileMazeSettings {
  size: "small" | "medium";
}

export type Dir = "up" | "down" | "left" | "right";
export type TileColor = "normal" | "red" | "blue" | "yellow" | "wall" | "exit";

export interface ColoredTileMazeState {
  rows: number;
  cols: number;
  tiles: TileColor[];
  playerRow: number;
  playerCol: number;
  moves: number;
  won: boolean;
  lastEffect: string | null;
  rngState: number;
}

export type ColoredTileMazeAction = { type: "move"; dir: Dir };

// ─── RNG ──────────────────────────────────────────────────────────────────────
function mulberry32Step(seed: number): { val: number; next: number } {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const val = ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  return { val, next: (seed + 0x6d2b79f5) | 0 };
}

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

// Convert edge-wall maze to tile-wall representation
function mazeToTiles(
  rows: number, cols: number,
  hWalls: boolean[], vWalls: boolean[],
  rng: () => number,
  colorRng: () => number,
): TileColor[] {
  const outerRows = rows * 2 + 1;
  const outerCols = cols * 2 + 1;
  const tiles: TileColor[] = new Array(outerRows * outerCols).fill("wall" as TileColor);
  const idx = (r: number, c: number) => r * outerCols + c;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tr = r * 2 + 1;
      const tc = c * 2 + 1;
      // Assign color to open cell
      const rand = colorRng();
      let color: TileColor = "normal";
      if (rand < 0.12) color = "red";
      else if (rand < 0.22) color = "blue";
      else if (rand < 0.28) color = "yellow";
      tiles[idx(tr, tc)] = color;

      // Right passage
      if (c < cols - 1 && !vWalls[r * cols + c]) {
        tiles[idx(tr, tc + 1)] = "normal";
      }
      // Down passage
      if (r < rows - 1 && !hWalls[r * cols + c]) {
        tiles[idx(tr + 1, tc)] = "normal";
      }
    }
  }

  // Start is always normal
  tiles[idx(1, 1)] = "normal";
  // Exit
  tiles[idx(outerRows - 2, outerCols - 2)] = "exit";

  return tiles;
}

export function initialState(seed: number, settings: ColoredTileMazeSettings): ColoredTileMazeState {
  const dim = settings.size === "small" ? 5 : 7;
  const rows = dim;
  const cols = dim;
  const rng = mulberry32(seed);
  const colorRng = mulberry32(seed ^ 0x12345678);
  const { hWalls, vWalls } = generateMaze(rows, cols, seed);
  const tiles = mazeToTiles(rows, cols, hWalls, vWalls, rng, colorRng);
  const outerRows = rows * 2 + 1;
  const outerCols = cols * 2 + 1;

  return {
    rows: outerRows, cols: outerCols, tiles,
    playerRow: 1, playerCol: 1,
    moves: 0, won: false, lastEffect: null,
    rngState: seed ^ 0xabcdef,
  };
}

export function reducer(state: ColoredTileMazeState, action: ColoredTileMazeAction): ColoredTileMazeState {
  if (state.won) return state;

  if (action.type === "move") {
    const { playerRow: r, playerCol: c, rows, cols, tiles } = state;
    const idx = (row: number, col: number) => row * cols + col;
    const dr = action.dir === "up" ? -1 : action.dir === "down" ? 1 : 0;
    const dc = action.dir === "left" ? -1 : action.dir === "right" ? 1 : 0;
    const nr = r + dr;
    const nc = c + dc;

    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return state;
    const targetTile = tiles[idx(nr, nc)];
    if (targetTile === "wall") return state;

    // Apply tile effect
    let pr = nr, pc = nc;
    let moveCost = 1;
    let lastEffect: string | null = null;
    let rngState = state.rngState;

    if (targetTile === "exit") {
      return { ...state, playerRow: pr, playerCol: pc, moves: state.moves + 1, won: true, lastEffect: "Exit!" };
    } else if (targetTile === "red") {
      // Bounce back to original position
      pr = r;
      pc = c;
      lastEffect = "Bounced!";
    } else if (targetTile === "blue") {
      // Costs 2 moves
      moveCost = 2;
      lastEffect = "Slowed!";
    } else if (targetTile === "yellow") {
      // Teleport to random open tile
      const openTiles: Array<{ row: number; col: number }> = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const t = tiles[idx(row, col)];
          if (t !== "wall" && t !== "exit" && !(row === nr && col === nc)) {
            openTiles.push({ row, col });
          }
        }
      }
      if (openTiles.length > 0) {
        const step = mulberry32Step(rngState);
        rngState = step.next;
        const tIdx = Math.floor(step.val * openTiles.length);
        const dest = openTiles[tIdx] ?? openTiles[0]!;
        pr = dest.row;
        pc = dest.col;
        lastEffect = "Teleported!";
      }
    }

    return {
      ...state,
      playerRow: pr, playerCol: pc,
      moves: state.moves + moveCost,
      won: false, lastEffect, rngState,
    };
  }

  return state;
}

export function isTerminal(state: ColoredTileMazeState): { score: number } | null {
  if (state.won) {
    return { score: Math.max(100, 2000 - state.moves * 10) };
  }
  return null;
}
