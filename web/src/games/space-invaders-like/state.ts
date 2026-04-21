// ─── Space Invaders-like state ────────────────────────────────────────────────
// Grid of aliens at top. Player ship at bottom. Aliens march left-right, descend.

export interface SpaceInvadersSettings {
  difficulty: "easy" | "medium" | "hard";
}

export const ALIEN_COLS = 11;
export const ALIEN_ROWS = 5;
export const TOTAL_ALIENS = ALIEN_COLS * ALIEN_ROWS;

// Normalized coords [0, 1]
export const PLAYER_Y = 0.92;
export const PLAYER_HALF = 0.045; // half-width

// Alien formation starts at these normalized offsets
const ALIEN_MARGIN_X = 0.05;
const ALIEN_SPACING_X = (1 - ALIEN_MARGIN_X * 2) / (ALIEN_COLS - 1);
const ALIEN_START_Y = 0.08;
const ALIEN_SPACING_Y = 0.06;

// Points per row (top rows are worth more)
const ALIEN_POINTS = [30, 20, 20, 10, 10];

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vy: number; // negative = going up (player bullet), positive = going down (alien bomb)
}

export interface SpaceInvadersState {
  settings: SpaceInvadersSettings;
  // Alien grid alive[row][col]
  aliens: readonly (readonly boolean[])[];
  // Formation offset
  formationX: number; // added to each alien's base X
  formationY: number; // added to each alien's base Y
  formationDir: 1 | -1; // 1 = right, -1 = left
  // Player
  playerX: number;
  // Bullets
  bullets: readonly Bullet[];
  score: number;
  lives: number;
  level: number;
  over: boolean;
  won: boolean;
  nextId: number;
  // Tick tracking for bomb drops
  tickCount: number;
  // Alien march speed (ticks per step)
  alienMarchTicks: number;
  marchTickCounter: number;
}

export type SpaceInvadersAction =
  | { type: "tick" }
  | { type: "move"; dir: -1 | 1 }
  | { type: "fire" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildAliens(): boolean[][] {
  return Array.from({ length: ALIEN_ROWS }, () => Array(ALIEN_COLS).fill(true));
}

function alienX(col: number, formationX: number): number {
  return ALIEN_MARGIN_X + col * ALIEN_SPACING_X + formationX;
}

function alienY(row: number, formationY: number): number {
  return ALIEN_START_Y + row * ALIEN_SPACING_Y + formationY;
}

function alienCount(aliens: readonly (readonly boolean[])[]): number {
  return aliens.flat().filter(Boolean).length;
}

const DESCENT_AMOUNT: Record<string, number> = { easy: 0.015, medium: 0.025, hard: 0.04 };
const MARCH_TICKS: Record<string, number> = { easy: 20, medium: 14, hard: 9 };
const BOMB_FREQ: Record<string, number> = { easy: 80, medium: 50, hard: 30 };

function lcg(seed: number): number {
  return (seed * 1664525 + 1013904223) >>> 0;
}

// ─── Initial state ─────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: SpaceInvadersSettings): SpaceInvadersState {
  void seed;
  const marchTicks = MARCH_TICKS[settings.difficulty] ?? 14;
  return {
    settings,
    aliens: buildAliens(),
    formationX: 0,
    formationY: 0,
    formationDir: 1,
    playerX: 0.5,
    bullets: [],
    score: 0,
    lives: 3,
    level: 1,
    over: false,
    won: false,
    nextId: 1,
    tickCount: 0,
    alienMarchTicks: marchTicks,
    marchTickCounter: 0,
  };
}

const PLAYER_BULLET_SPEED = -0.018; // per tick
const ALIEN_BULLET_SPEED = 0.012;
const ALIEN_RADIUS = 0.025;
const BULLET_RADIUS = 0.008;

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: SpaceInvadersState, action: SpaceInvadersAction): SpaceInvadersState {
  if (state.over || state.won) return state;

  switch (action.type) {
    case "move": {
      const newX = Math.max(PLAYER_HALF, Math.min(1 - PLAYER_HALF, state.playerX + action.dir * 0.025));
      return { ...state, playerX: newX };
    }

    case "fire": {
      // Only 1 player bullet at a time
      if (state.bullets.some((b) => b.vy < 0)) return state;
      const bullet: Bullet = {
        id: state.nextId,
        x: state.playerX,
        y: PLAYER_Y - 0.05,
        vy: PLAYER_BULLET_SPEED,
      };
      return { ...state, bullets: [...state.bullets, bullet], nextId: state.nextId + 1 };
    }

    case "tick": {
      let {
        aliens,
        formationX,
        formationY,
        formationDir,
        playerX,
        bullets,
        score,
        lives,
        nextId,
        tickCount,
        marchTickCounter,
        alienMarchTicks,
        level,
      } = state;

      tickCount += 1;

      // ── Move bullets ───────────────────────────────────────────────────────
      let newBullets: Bullet[] = bullets
        .map((b) => ({ ...b, y: b.y + b.vy }))
        .filter((b) => b.y > 0 && b.y < 1);

      // ── March aliens ───────────────────────────────────────────────────────
      marchTickCounter += 1;
      let descended = false;
      if (marchTickCounter >= alienMarchTicks) {
        marchTickCounter = 0;
        const stepX = 0.022;
        const newFormX = formationX + formationDir * stepX;

        // Check if any alive alien would go out of bounds
        let needsTurn = false;
        for (let r = 0; r < ALIEN_ROWS; r++) {
          for (let c = 0; c < ALIEN_COLS; c++) {
            if (!aliens[r]![c]) continue;
            const ax = alienX(c, newFormX);
            if (ax < 0.03 || ax > 0.97) { needsTurn = true; break; }
          }
          if (needsTurn) break;
        }

        if (needsTurn) {
          formationDir = (formationDir === 1 ? -1 : 1) as 1 | -1;
          const descent = DESCENT_AMOUNT[state.settings.difficulty] ?? 0.025;
          formationY += descent;
          descended = true;
        } else {
          formationX = newFormX;
        }
      }

      // ── Alien bombs ────────────────────────────────────────────────────────
      const bombFreq = BOMB_FREQ[state.settings.difficulty] ?? 50;
      if (tickCount % bombFreq === 0) {
        // Pick a random alive alien in the bottom-most row of each column
        const seed = tickCount * 7 + level * 13;
        let s = lcg(seed);
        const aliveCols: number[] = [];
        for (let c = 0; c < ALIEN_COLS; c++) {
          for (let r = ALIEN_ROWS - 1; r >= 0; r--) {
            if (aliens[r]![c]) { aliveCols.push(c); break; }
          }
        }
        if (aliveCols.length > 0) {
          s = lcg(s);
          const col = aliveCols[s % aliveCols.length]!;
          // Find the bottom alien in that col
          for (let r = ALIEN_ROWS - 1; r >= 0; r--) {
            if (aliens[r]![col]) {
              const bomb: Bullet = {
                id: nextId++,
                x: alienX(col, formationX),
                y: alienY(r, formationY) + ALIEN_RADIUS,
                vy: ALIEN_BULLET_SPEED,
              };
              newBullets = [...newBullets, bomb];
              break;
            }
          }
        }
      }

      // ── Bullet-alien collision ─────────────────────────────────────────────
      const hitBullets = new Set<number>();
      const newAliens: boolean[][] = aliens.map((row) => [...row]);

      for (const bullet of newBullets) {
        if (bullet.vy >= 0) continue; // only player bullets
        for (let r = 0; r < ALIEN_ROWS; r++) {
          for (let c = 0; c < ALIEN_COLS; c++) {
            if (!newAliens[r]![c]) continue;
            const ax = alienX(c, formationX);
            const ay = alienY(r, formationY);
            const dx = Math.abs(bullet.x - ax);
            const dy = Math.abs(bullet.y - ay);
            if (dx < ALIEN_RADIUS + BULLET_RADIUS && dy < ALIEN_RADIUS + BULLET_RADIUS) {
              newAliens[r]![c] = false;
              hitBullets.add(bullet.id);
              score += ALIEN_POINTS[r] ?? 10;
            }
          }
        }
      }

      // ── Alien bomb hits player ─────────────────────────────────────────────
      let hitByBomb = false;
      for (const bullet of newBullets) {
        if (bullet.vy <= 0) continue;
        if (bullet.y >= PLAYER_Y - 0.04 && Math.abs(bullet.x - playerX) < PLAYER_HALF + BULLET_RADIUS) {
          hitBullets.add(bullet.id);
          hitByBomb = true;
        }
      }

      newBullets = newBullets.filter((b) => !hitBullets.has(b.id));

      if (hitByBomb) {
        lives -= 1;
        if (lives <= 0) {
          return { ...state, aliens: newAliens, bullets: newBullets, score, lives: 0, over: true, tickCount };
        }
      }

      // ── Check if aliens reached bottom ────────────────────────────────────
      for (let r = 0; r < ALIEN_ROWS; r++) {
        for (let c = 0; c < ALIEN_COLS; c++) {
          if (!newAliens[r]![c]) continue;
          const ay = alienY(r, formationY);
          if (ay >= PLAYER_Y - 0.05) {
            return { ...state, aliens: newAliens, bullets: newBullets, score, lives, over: true, tickCount };
          }
        }
      }

      // ── Win check ─────────────────────────────────────────────────────────
      const remaining = alienCount(newAliens);
      if (remaining === 0) {
        const newLevel = level + 1;
        const newMarchTicks = Math.max(3, alienMarchTicks - 3);
        // Next wave
        return {
          ...state,
          aliens: buildAliens(),
          formationX: 0,
          formationY: 0,
          formationDir: 1,
          bullets: [],
          score: score + 500,
          lives,
          level: newLevel,
          over: false,
          won: false,
          nextId,
          tickCount,
          alienMarchTicks: newMarchTicks,
          marchTickCounter: 0,
        };
      }

      return {
        ...state,
        aliens: newAliens,
        formationX,
        formationY,
        formationDir,
        playerX,
        bullets: newBullets,
        score,
        lives,
        nextId,
        tickCount,
        marchTickCounter,
        alienMarchTicks,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SpaceInvadersState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

// Helper for rendering
export { alienX, alienY, ALIEN_RADIUS };
