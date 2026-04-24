import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Constants ────────────────────────────────────────────────────────────────
export const COLS = 16;
export const ROWS = 12;
export const CELL = 1 / COLS; // normalized cell size

// ─── Types ────────────────────────────────────────────────────────────────────
export type Dir = "up" | "down" | "left" | "right";

export interface Enemy {
  id: number;
  col: number;
  row: number;
  alive: boolean;
  pumpCount: number; // 0..3 — 3 means pop!
  pumpCooldown: number; // time before pump deflates
}

export interface TunnelDigState {
  playerCol: number;
  playerRow: number;
  playerDir: Dir;
  dug: readonly boolean[]; // COLS*ROWS grid — true = tunnel dug through
  enemies: readonly Enemy[];
  score: number;
  lives: number;
  lost: boolean;
  won: boolean;
  pumping: boolean; // player is holding pump
  pumpTarget: number | null; // enemy id being pumped
  rngSeed: number;
}

export type TunnelDigAction =
  | { type: "move"; dir: Dir }
  | { type: "pump-start" }
  | { type: "pump-stop" }
  | { type: "tick"; dt: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function idx(col: number, row: number): number {
  return row * COLS + col;
}

function buildEnemies(seed: number): Enemy[] {
  const rng = mulberry32(seed);
  const enemies: Enemy[] = [];
  for (let i = 0; i < 6; i++) {
    enemies.push({
      id: i,
      col: 2 + Math.floor(rng() * (COLS - 4)),
      row: 1 + Math.floor(rng() * (ROWS - 2)),
      alive: true,
      pumpCount: 0,
      pumpCooldown: 0,
    });
  }
  return enemies;
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number): TunnelDigState {
  const dug = Array(COLS * ROWS).fill(false) as boolean[];
  // Player starts at top-left open area
  dug[idx(1, 1)] = true;
  return {
    playerCol: 1,
    playerRow: 1,
    playerDir: "right",
    dug,
    enemies: buildEnemies(seed),
    score: 0,
    lives: 3,
    lost: false,
    won: false,
    pumping: false,
    pumpTarget: null,
    rngSeed: seed,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: TunnelDigState, action: TunnelDigAction): TunnelDigState {
  switch (action.type) {
    case "move": {
      if (state.lost || state.won) return state;
      const { dir } = action;
      let { playerCol, playerRow } = state;
      if (dir === "left") playerCol = Math.max(0, playerCol - 1);
      else if (dir === "right") playerCol = Math.min(COLS - 1, playerCol + 1);
      else if (dir === "up") playerRow = Math.max(0, playerRow - 1);
      else if (dir === "down") playerRow = Math.min(ROWS - 1, playerRow + 1);

      const dug = [...state.dug] as boolean[];
      dug[idx(playerCol, playerRow)] = true;

      return { ...state, playerCol, playerRow, playerDir: dir, dug };
    }

    case "pump-start": {
      if (state.lost || state.won || state.pumping) return state;
      // Find enemy in the direction player is facing
      const { playerCol, playerRow, playerDir } = state;
      let tc = playerCol;
      let tr = playerRow;
      if (playerDir === "left") tc -= 1;
      else if (playerDir === "right") tc += 1;
      else if (playerDir === "up") tr -= 1;
      else if (playerDir === "down") tr += 1;

      const target = state.enemies.find(
        (e) => e.alive && e.col === tc && e.row === tr,
      );
      return { ...state, pumping: true, pumpTarget: target?.id ?? null };
    }

    case "pump-stop":
      return { ...state, pumping: false, pumpTarget: null };

    case "tick": {
      if (state.lost || state.won) return state;
      const { dt } = action;
      const rng = mulberry32(state.rngSeed);

      let { score, lives } = state;
      let lost: boolean = state.lost;
      let won: boolean = state.won;

      // Pump active enemy
      let enemies = state.enemies as Enemy[];
      if (state.pumping && state.pumpTarget !== null) {
        enemies = enemies.map((e) => {
          if (!e.alive || e.id !== state.pumpTarget) return e;
          const newPump = e.pumpCount + 1;
          if (newPump >= 3) {
            score += 200;
            return { ...e, alive: false };
          }
          return { ...e, pumpCount: newPump, pumpCooldown: 2 };
        });
      }

      // Deflate pumped enemies over time
      enemies = enemies.map((e) => {
        if (!e.alive || e.pumpCount === 0) return e;
        const cd = e.pumpCooldown - dt;
        if (cd <= 0) return { ...e, pumpCount: Math.max(0, e.pumpCount - 1), pumpCooldown: 2 };
        return { ...e, pumpCooldown: cd };
      });

      // Enemies move randomly through tunnels
      enemies = enemies.map((e) => {
        if (!e.alive) return e;
        if (rng() < 0.02) {
          const dirs: Dir[] = ["up", "down", "left", "right"];
          const dir = dirs[Math.floor(rng() * 4)]!;
          let nc = e.col;
          let nr = e.row;
          if (dir === "left") nc = Math.max(0, nc - 1);
          else if (dir === "right") nc = Math.min(COLS - 1, nc + 1);
          else if (dir === "up") nr = Math.max(0, nr - 1);
          else if (dir === "down") nr = Math.min(ROWS - 1, nr + 1);
          // Only move through dug cells
          if (state.dug[idx(nc, nr)]) {
            return { ...e, col: nc, row: nr };
          }
        }
        return e;
      });

      // Check player-enemy collision
      for (const e of enemies) {
        if (!e.alive) continue;
        if (e.col === state.playerCol && e.row === state.playerRow && e.pumpCount === 0) {
          lives -= 1;
          if (lives <= 0) lost = true;
          break;
        }
      }

      const allDead = enemies.every((e) => !e.alive);
      if (allDead) won = true;

      return {
        ...state,
        enemies,
        score,
        lives,
        lost: lost as boolean,
        won: won as boolean,
        rngSeed: state.rngSeed + 1,
      };
    }

    default:
      return state;
  }
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
export function isTerminal(state: TunnelDigState): { score: number } | null {
  if (state.won) return { score: state.score + state.lives * 500 };
  if (state.lost) return { score: state.score };
  return null;
}
