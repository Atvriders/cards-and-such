import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Constants ────────────────────────────────────────────────────────────────
export const COLS = 12;
export const ROWS = 10;

// ─── Types ────────────────────────────────────────────────────────────────────
export type CellType = "empty" | "block" | "wall" | "diamond";

export interface IceFoe {
  id: number;
  col: number;
  row: number;
  alive: boolean;
  frozen: boolean;
  frozenTimer: number;
}

export interface IceBlocksState {
  playerCol: number;
  playerRow: number;
  playerDir: "up" | "down" | "left" | "right";
  grid: readonly CellType[];
  foes: readonly IceFoe[];
  score: number;
  lives: number;
  lost: boolean;
  won: boolean;
  rngSeed: number;
}

export type IceBlocksAction =
  | { type: "move"; dir: "up" | "down" | "left" | "right" }
  | { type: "push" }
  | { type: "tick"; dt: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function idx(col: number, row: number): number {
  return row * COLS + col;
}

function inBounds(col: number, row: number): boolean {
  return col >= 0 && col < COLS && row >= 0 && row < ROWS;
}

function buildGrid(seed: number): CellType[] {
  const rng = mulberry32(seed);
  const grid: CellType[] = Array(COLS * ROWS).fill("empty");
  // Border walls
  for (let c = 0; c < COLS; c++) {
    grid[idx(c, 0)] = "wall";
    grid[idx(c, ROWS - 1)] = "wall";
  }
  for (let r = 0; r < ROWS; r++) {
    grid[idx(0, r)] = "wall";
    grid[idx(COLS - 1, r)] = "wall";
  }
  // Random blocks
  for (let r = 1; r < ROWS - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
      if (rng() < 0.25) grid[idx(c, r)] = "block";
    }
  }
  // Clear player start area
  for (let r = 1; r <= 2; r++) for (let c = 1; c <= 2; c++) grid[idx(c, r)] = "empty";
  // Place 3 diamonds
  let placed = 0;
  while (placed < 3) {
    const c = 1 + Math.floor(rng() * (COLS - 2));
    const r = 1 + Math.floor(rng() * (ROWS - 2));
    if (grid[idx(c, r)] === "empty" && !(c <= 2 && r <= 2)) {
      grid[idx(c, r)] = "diamond";
      placed++;
    }
  }
  return grid;
}

function buildFoes(seed: number): IceFoe[] {
  const rng = mulberry32(seed + 1000);
  const foes: IceFoe[] = [];
  for (let i = 0; i < 4; i++) {
    let col: number, row: number;
    do {
      col = 5 + Math.floor(rng() * (COLS - 6));
      row = 3 + Math.floor(rng() * (ROWS - 4));
    } while (col <= 2 && row <= 2);
    foes.push({ id: i, col, row, alive: true, frozen: false, frozenTimer: 0 });
  }
  return foes;
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number): IceBlocksState {
  return {
    playerCol: 1,
    playerRow: 1,
    playerDir: "right",
    grid: buildGrid(seed),
    foes: buildFoes(seed),
    score: 0,
    lives: 3,
    lost: false,
    won: false,
    rngSeed: seed,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: IceBlocksState, action: IceBlocksAction): IceBlocksState {
  switch (action.type) {
    case "move": {
      if (state.lost || state.won) return state;
      const { dir } = action;
      let nc = state.playerCol;
      let nr = state.playerRow;
      if (dir === "left") nc--;
      else if (dir === "right") nc++;
      else if (dir === "up") nr--;
      else if (dir === "down") nr++;

      if (!inBounds(nc, nr)) return { ...state, playerDir: dir };
      const cell = state.grid[idx(nc, nr)];
      if (cell === "wall" || cell === "block") return { ...state, playerDir: dir };

      // Collect diamond
      let grid = state.grid as CellType[];
      let score = state.score;
      if (cell === "diamond") {
        grid = [...grid];
        grid[idx(nc, nr)] = "empty";
        score += 500;
      }

      // Check foe collision
      const foeThere = state.foes.find((f) => f.alive && !f.frozen && f.col === nc && f.row === nr);
      if (foeThere) {
        const newLives = state.lives - 1;
        return {
          ...state,
          grid,
          score,
          lives: newLives,
          lost: newLives <= 0,
          playerCol: 1,
          playerRow: 1,
          playerDir: dir,
        };
      }

      const won: boolean = grid.every((c) => c !== "diamond");
      return { ...state, playerCol: nc, playerRow: nr, playerDir: dir, grid, score, won };
    }

    case "push": {
      if (state.lost || state.won) return state;
      const { playerCol, playerRow, playerDir } = state;
      let dc = 0, dr = 0;
      if (playerDir === "left") dc = -1;
      else if (playerDir === "right") dc = 1;
      else if (playerDir === "up") dr = -1;
      else if (playerDir === "down") dr = 1;

      const tc = playerCol + dc;
      const tr = playerRow + dr;

      if (!inBounds(tc, tr)) return state;

      const cell = state.grid[idx(tc, tr)];
      if (cell !== "block" && cell !== "wall") return state;

      // Push block in direction until it hits wall or edge
      let grid = [...state.grid] as CellType[];
      let foes = state.foes as IceFoe[];
      let score = state.score;

      if (cell === "block") {
        // Slide block
        let bc = tc + dc;
        let br = tr + dr;
        grid[idx(tc, tr)] = "empty";

        // Check for foes along the sliding path
        const hitFoeIds: number[] = [];
        while (inBounds(bc, br) && grid[idx(bc, br)] === "empty") {
          const foeHit = foes.find((f) => f.alive && f.col === bc && f.row === br);
          if (foeHit) hitFoeIds.push(foeHit.id);
          bc += dc;
          br += dr;
        }
        bc -= dc;
        br -= dr;

        if (hitFoeIds.length > 0) {
          foes = foes.map((f) =>
            hitFoeIds.includes(f.id)
              ? { ...f, frozen: true, frozenTimer: 5 }
              : f,
          );
          score += hitFoeIds.length * 400;
        } else {
          grid[idx(bc, br)] = "block";
        }
      } else if (cell === "wall") {
        // Stun nearby foes against wall
        const stunRadius = 2;
        const hitFoeIds = foes
          .filter(
            (f) =>
              f.alive &&
              !f.frozen &&
              Math.abs(f.col - tc) <= stunRadius &&
              Math.abs(f.row - tr) <= stunRadius,
          )
          .map((f) => f.id);
        foes = foes.map((f) =>
          hitFoeIds.includes(f.id) ? { ...f, frozen: true, frozenTimer: 3 } : f,
        );
        score += hitFoeIds.length * 200;
      }

      // Kill frozen foes (already frozen before this push)
      const prevFrozen = foes.filter((f) => f.alive && f.frozen).map((f) => f.id);
      foes = foes.map((f) =>
        prevFrozen.includes(f.id) ? { ...f, alive: false } : f,
      );

      const won: boolean = grid.every((c) => c !== "diamond") && foes.every((f) => !f.alive);
      return { ...state, grid, foes, score, won };
    }

    case "tick": {
      if (state.lost || state.won) return state;
      const { dt } = action;
      const rng = mulberry32(state.rngSeed);

      // Thaw frozen foes and move active foes
      let foes = state.foes.map((f) => {
        if (!f.alive) return f;
        if (f.frozen) {
          const t = f.frozenTimer - dt;
          return t <= 0 ? { ...f, frozen: false, frozenTimer: 0 } : { ...f, frozenTimer: t };
        }
        return f;
      }) as IceFoe[];

      // Move active foes randomly
      foes = foes.map((f) => {
        if (!f.alive || f.frozen || rng() > 0.03) return f;
        const dirs: Array<[number, number]> = [[-1,0],[1,0],[0,-1],[0,1]];
        const [dc, dr] = dirs[Math.floor(rng() * 4)]!;
        const nc = f.col + dc!;
        const nr = f.row + dr!;
        if (!inBounds(nc, nr)) return f;
        if (state.grid[idx(nc, nr)] === "wall" || state.grid[idx(nc, nr)] === "block") return f;
        return { ...f, col: nc, row: nr };
      });

      // Foe-player collision
      let { lives } = state;
      let lost: boolean = state.lost;
      for (const f of foes) {
        if (!f.alive || f.frozen) continue;
        if (f.col === state.playerCol && f.row === state.playerRow) {
          lives -= 1;
          lost = lives <= 0;
          break;
        }
      }

      return { ...state, foes, lives, lost: lost as boolean, rngSeed: state.rngSeed + 1 };
    }

    default:
      return state;
  }
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
export function isTerminal(state: IceBlocksState): { score: number } | null {
  if (state.won) return { score: state.score + state.lives * 500 };
  if (state.lost) return { score: state.score };
  return null;
}
