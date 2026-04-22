// ─── Maze Chase ───────────────────────────────────────────────────────────────
// Pac-Man-like. Collect all dots, avoid enemies.

export type MazeChaseDifficulty = "1" | "2" | "3";
export type MazeChaseEnemySpeed = "slow" | "medium" | "fast";

export interface MazeChaseSettings {
  enemies: "1" | "2" | "3";
  enemySpeed: "slow" | "medium" | "fast";
}

// ─── Maze layout ──────────────────────────────────────────────────────────────
// '#' = wall, '.' = dot, ' ' = empty, 'P' = player start, 'E' = enemy start
export const MAZE_ROWS = 15;
export const MAZE_COLS = 15;

export const MAZE_TEMPLATE: string[] = [
  "###############",
  "#P....#....E..#",
  "#.###.#.###.#.#",
  "#.#...........#",
  "#.#.###.###.#.#",
  "#...#.....#...#",
  "###.#.###.#.###",
  "#...........E.#",
  "###.#.###.#.###",
  "#...#.....#...#",
  "#.#.###.###.#.#",
  "#.#...........#",
  "#.###.#.###.#.#",
  "#E....#.......#",
  "###############",
];

export interface Pos {
  row: number;
  col: number;
}

export interface Enemy {
  id: number;
  row: number;
  col: number;
  /** ticks until next move */
  moveCooldown: number;
}

export type Dir = "up" | "down" | "left" | "right";

export interface MazeChaseState {
  settings: MazeChaseSettings;
  /** Flat array of cell chars (after removing player/enemy markers) */
  cells: readonly string[];
  playerRow: number;
  playerCol: number;
  nextDir: Dir | null;
  currentDir: Dir | null;
  enemies: readonly Enemy[];
  dotsRemaining: number;
  score: number;
  over: boolean;
  won: boolean;
  /** Ticks since last player move */
  playerMoveCooldown: number;
}

export type MazeChaseAction =
  | { type: "tick" }
  | { type: "turn"; dir: Dir };

// ─── Constants ────────────────────────────────────────────────────────────────
const PLAYER_MOVE_TICKS = 6; // ticks per player step
const ENEMY_SPEED_TICKS: Record<MazeChaseEnemySpeed, number> = {
  slow: 14,
  medium: 9,
  fast: 5,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function cellIdx(row: number, col: number): number {
  return row * MAZE_COLS + col;
}

function isWall(cells: readonly string[], row: number, col: number): boolean {
  if (row < 0 || row >= MAZE_ROWS || col < 0 || col >= MAZE_COLS) return true;
  return cells[cellIdx(row, col)] === "#";
}

function applyDir(row: number, col: number, dir: Dir): Pos {
  if (dir === "up") return { row: row - 1, col };
  if (dir === "down") return { row: row + 1, col };
  if (dir === "left") return { row, col: col - 1 };
  return { row, col: col + 1 };
}

const ALL_DIRS: Dir[] = ["up", "down", "left", "right"];

function manhattanDist(ar: number, ac: number, br: number, bc: number): number {
  return Math.abs(ar - br) + Math.abs(ac - bc);
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: MazeChaseSettings): MazeChaseState {
  const numEnemies = parseInt(settings.enemies, 10);
  const cells: string[] = [];
  let playerRow = 1;
  let playerCol = 1;
  let dotsRemaining = 0;
  const enemyStarts: Pos[] = [];

  for (let r = 0; r < MAZE_ROWS; r++) {
    const row = MAZE_TEMPLATE[r]!;
    for (let c = 0; c < MAZE_COLS; c++) {
      const ch = row[c]!;
      if (ch === "P") {
        playerRow = r;
        playerCol = c;
        cells.push(".");
        dotsRemaining++;
      } else if (ch === "E") {
        enemyStarts.push({ row: r, col: c });
        cells.push(" ");
      } else if (ch === ".") {
        cells.push(".");
        dotsRemaining++;
      } else {
        cells.push(ch);
      }
    }
  }

  // Use only the requested number of enemies
  const usedEnemyStarts = enemyStarts.slice(0, numEnemies);
  const enemies: Enemy[] = usedEnemyStarts.map((pos, i) => ({
    id: i,
    row: pos.row,
    col: pos.col,
    moveCooldown: ENEMY_SPEED_TICKS[settings.enemySpeed] + i * 3, // stagger starts
  }));

  return {
    settings,
    cells,
    playerRow,
    playerCol,
    nextDir: null,
    currentDir: null,
    enemies,
    dotsRemaining,
    score: 0,
    over: false,
    won: false,
    playerMoveCooldown: 0,
  };
}

// ─── Enemy AI: simple bias toward player ──────────────────────────────────────
function moveEnemy(
  enemy: Enemy,
  playerRow: number,
  playerCol: number,
  cells: readonly string[],
  seed: number,
): { enemy: Enemy; nextSeed: number } {
  // Try to move toward player; if blocked, pick any open direction
  const dirs = ALL_DIRS.slice().sort(
    (a, b) =>
      manhattanDist(...Object.values(applyDir(enemy.row, enemy.col, a)) as [number, number], playerRow, playerCol) -
      manhattanDist(...Object.values(applyDir(enemy.row, enemy.col, b)) as [number, number], playerRow, playerCol),
  );

  // Prefer best direction, but add some randomness (25% chance of random pick)
  let chosen: Dir | null = null;
  // Simple LCG
  const randVal = ((seed * 1664525 + 1013904223) >>> 0) / 0xffffffff;
  const nextSeed = (seed * 1664525 + 1013904223) >>> 0;

  if (randVal < 0.25) {
    // Random open direction
    for (const d of [dirs[1], dirs[2], dirs[3], dirs[0]] as Dir[]) {
      const np = applyDir(enemy.row, enemy.col, d);
      if (!isWall(cells, np.row, np.col)) {
        chosen = d;
        break;
      }
    }
  }

  if (!chosen) {
    for (const d of dirs) {
      const np = applyDir(enemy.row, enemy.col, d);
      if (!isWall(cells, np.row, np.col)) {
        chosen = d;
        break;
      }
    }
  }

  if (!chosen) return { enemy, nextSeed };

  const np = applyDir(enemy.row, enemy.col, chosen);
  return {
    enemy: { ...enemy, row: np.row, col: np.col },
    nextSeed,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: MazeChaseState, action: MazeChaseAction): MazeChaseState {
  if (state.over || state.won) return state;

  switch (action.type) {
    case "turn":
      return { ...state, nextDir: action.dir };

    case "tick": {
      let { cells, playerRow, playerCol, currentDir, nextDir, enemies, dotsRemaining, score } =
        state;
      let playerMoveCooldown = state.playerMoveCooldown;

      // ── Player move ────────────────────────────────────────────────────────
      playerMoveCooldown = Math.max(0, playerMoveCooldown - 1);

      if (playerMoveCooldown === 0) {
        // Try nextDir first, then currentDir
        let moved = false;
        for (const dir of [nextDir, currentDir].filter(Boolean) as Dir[]) {
          const np = applyDir(playerRow, playerCol, dir);
          if (!isWall(cells, np.row, np.col)) {
            playerRow = np.row;
            playerCol = np.col;
            currentDir = dir;
            playerMoveCooldown = PLAYER_MOVE_TICKS;
            moved = true;
            break;
          }
        }
        if (!moved) {
          playerMoveCooldown = 2; // brief cooldown when blocked
        }
      }

      // ── Collect dot ────────────────────────────────────────────────────────
      let newCells = cells as string[];
      const idx = cellIdx(playerRow, playerCol);
      if (newCells[idx] === ".") {
        newCells = [...newCells];
        newCells[idx] = " ";
        dotsRemaining--;
        score += 10;
      }

      // ── Move enemies ───────────────────────────────────────────────────────
      let seed = 0x12345678 ^ (playerRow * 31 + playerCol);
      const newEnemies = enemies.map((enemy) => {
        const cooldown = enemy.moveCooldown - 1;
        if (cooldown <= 0) {
          const speedTicks = ENEMY_SPEED_TICKS[state.settings.enemySpeed];
          const result = moveEnemy(enemy, playerRow, playerCol, newCells, seed);
          seed = result.nextSeed;
          return { ...result.enemy, moveCooldown: speedTicks };
        }
        return { ...enemy, moveCooldown: cooldown };
      });

      // ── Collision with enemy ───────────────────────────────────────────────
      const caught = newEnemies.some((e) => e.row === playerRow && e.col === playerCol);
      if (caught) {
        return {
          ...state,
          cells: newCells,
          playerRow,
          playerCol,
          currentDir,
          enemies: newEnemies,
          dotsRemaining,
          score,
          over: true,
          playerMoveCooldown,
        };
      }

      // ── Win check ──────────────────────────────────────────────────────────
      const won = dotsRemaining <= 0;

      return {
        ...state,
        cells: newCells,
        playerRow,
        playerCol,
        currentDir,
        nextDir,
        enemies: newEnemies,
        dotsRemaining,
        score,
        over: false,
        won,
        playerMoveCooldown,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: MazeChaseState): { score: number } | null {
  if (state.over) return { score: state.score };
  if (state.won) return { score: state.score + 500 };
  return null;
}
