import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Constants ────────────────────────────────────────────────────────────────
// Isometric pyramid with LEVELS rows: row 0 has 1 cube, row N-1 has N cubes
export const LEVELS = 7;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Cube {
  row: number;
  col: number; // 0..row
  color: number; // 0 = unvisited, 1 = visited (target), 2 = extra hop
}

export interface FoeEnemy {
  id: number;
  row: number;
  col: number;
  alive: boolean;
}

export type QDir = "dl" | "dr" | "ul" | "ur"; // diagonal directions

export interface QJumpState {
  playerRow: number;
  playerCol: number;
  cubes: readonly Cube[];
  enemies: readonly FoeEnemy[];
  score: number;
  lives: number;
  lost: boolean;
  won: boolean;
  rngSeed: number;
}

export type QJumpAction =
  | { type: "jump"; dir: QDir }
  | { type: "tick"; dt: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildCubes(): Cube[] {
  const cubes: Cube[] = [];
  for (let row = 0; row < LEVELS; row++) {
    for (let col = 0; col <= row; col++) {
      cubes.push({ row, col, color: 0 });
    }
  }
  return cubes;
}

function getCube(cubes: readonly Cube[], row: number, col: number): Cube | undefined {
  return cubes.find((c) => c.row === row && c.col === col);
}

function buildEnemies(seed: number): FoeEnemy[] {
  const rng = mulberry32(seed);
  return Array.from({ length: 3 }, (_, i) => ({
    id: i,
    row: 0,
    col: 0,
    alive: true,
  }));
  void rng;
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number): QJumpState {
  const cubes = buildCubes();
  // Mark starting position as visited
  const startCubes = cubes.map((c) =>
    c.row === 0 && c.col === 0 ? { ...c, color: 1 } : c,
  );
  return {
    playerRow: 0,
    playerCol: 0,
    cubes: startCubes,
    enemies: buildEnemies(seed),
    score: 0,
    lives: 3,
    lost: false,
    won: false,
    rngSeed: seed,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: QJumpState, action: QJumpAction): QJumpState {
  switch (action.type) {
    case "jump": {
      if (state.lost || state.won) return state;
      const { dir } = action;
      let { playerRow, playerCol } = state;

      // Compute new position based on isometric direction
      if (dir === "dl") { playerRow += 1; /* col stays */ }
      else if (dir === "dr") { playerRow += 1; playerCol += 1; }
      else if (dir === "ul") { playerRow -= 1; playerCol -= 1; }
      else if (dir === "ur") { playerRow -= 1; /* col stays */ }

      // Bounds check
      if (playerRow < 0 || playerRow >= LEVELS || playerCol < 0 || playerCol > playerRow) {
        // Fell off: lose a life
        const newLives = state.lives - 1;
        return {
          ...state,
          lives: newLives,
          lost: newLives <= 0,
          playerRow: 0,
          playerCol: 0,
        };
      }

      // Color the cube
      let cubes = state.cubes as Cube[];
      let score = state.score;
      cubes = cubes.map((c) => {
        if (c.row === playerRow && c.col === playerCol) {
          if (c.color === 0) {
            score += 25;
            return { ...c, color: 1 };
          }
        }
        return c;
      });

      // Win if all cubes colored
      const won: boolean = cubes.every((c) => c.color >= 1);

      // Check enemy collision
      let lives = state.lives;
      let lost: boolean = state.lost;
      for (const e of state.enemies) {
        if (!e.alive) continue;
        if (e.row === playerRow && e.col === playerCol) {
          lives -= 1;
          if (lives <= 0) lost = true;
          // Reset player to top
          return {
            ...state,
            cubes,
            score,
            lives,
            lost,
            playerRow: 0,
            playerCol: 0,
          };
        }
      }

      return { ...state, playerRow, playerCol, cubes, score, won: won as boolean, lives, lost: lost as boolean };
    }

    case "tick": {
      if (state.lost || state.won) return state;
      const rng = mulberry32(state.rngSeed);

      // Move enemies
      const dirs: QDir[] = ["dl", "dr", "ul", "ur"];
      let enemies = state.enemies as FoeEnemy[];
      enemies = enemies.map((e) => {
        if (!e.alive || rng() > 0.03) return e;
        const dir = dirs[Math.floor(rng() * 4)]!;
        let nr = e.row;
        let nc = e.col;
        if (dir === "dl") nr += 1;
        else if (dir === "dr") { nr += 1; nc += 1; }
        else if (dir === "ul") { nr -= 1; nc -= 1; }
        else if (dir === "ur") nr -= 1;
        if (nr < 0 || nr >= LEVELS || nc < 0 || nc > nr) {
          return { ...e, row: 0, col: 0 }; // wrap to top
        }
        return { ...e, row: nr, col: nc };
      });

      // Enemy on player?
      let lives = state.lives;
      let lost: boolean = state.lost;
      for (const e of enemies) {
        if (!e.alive) continue;
        if (e.row === state.playerRow && e.col === state.playerCol) {
          lives -= 1;
          if (lives <= 0) lost = true;
          break;
        }
      }

      return { ...state, enemies, lives, lost: lost as boolean, rngSeed: state.rngSeed + 1 };
    }

    default:
      return state;
  }
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
export function isTerminal(state: QJumpState): { score: number } | null {
  if (state.won) return { score: state.score + state.lives * 200 };
  if (state.lost) return { score: state.score };
  return null;
}
