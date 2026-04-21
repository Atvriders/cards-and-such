import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Layout constants ─────────────────────────────────────────────────────────
export const PADDLE_Y = 0.94;
export const PADDLE_HEIGHT = 0.02;
export const BALL_RADIUS = 0.015;
export const BRICK_AREA_Y_TOP = 0.08;
export const BRICK_AREA_Y_BOTTOM = 0.45;
export const BRICK_COLS = 10;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Brick {
  row: number;
  col: number;
  alive: boolean;
  color: string;
}

export interface BreakoutState {
  settings: { difficulty: "easy" | "medium" | "hard"; rows: "3" | "5" | "7" };
  speed: number;
  paddleX: number;
  paddleWidth: number;
  ballX: number;
  ballY: number;
  ballVx: number;
  ballVy: number;
  bricks: readonly Brick[];
  rowsCount: number;
  colsCount: number;
  score: number;
  lives: number;
  started: boolean;
  paused: boolean;
  lost: boolean;
  won: boolean;
  /** Stored seed for release RNG */
  rngSeed: number;
}

export type BreakoutAction =
  | { type: "tick"; dt: number }
  | { type: "move-paddle"; x: number }
  | { type: "release" }
  | { type: "pause" }
  | { type: "resume" };

// ─── Initial state ────────────────────────────────────────────────────────────
const palette = ["#e04040", "#e8a040", "#e8e040", "#40c060", "#40a0e0", "#8040e0", "#e040c0"];

export function initialState(
  seed: number,
  s: { difficulty: "easy" | "medium" | "hard"; rows: "3" | "5" | "7" },
): BreakoutState {
  const rowsCount = Number(s.rows);
  const colsCount = BRICK_COLS;
  const bricks: Brick[] = [];
  for (let r = 0; r < rowsCount; r++) {
    for (let c = 0; c < colsCount; c++) {
      bricks.push({ row: r, col: c, alive: true, color: palette[r % palette.length]! });
    }
  }
  const speed = s.difficulty === "easy" ? 0.6 : s.difficulty === "hard" ? 1.15 : 0.85;
  const paddleX = 0.5;
  const paddleWidth = 0.18;
  return {
    settings: s,
    speed,
    paddleX,
    paddleWidth,
    ballX: paddleX,
    ballY: PADDLE_Y - BALL_RADIUS - 0.005,
    ballVx: 0,
    ballVy: 0,
    bricks,
    rowsCount,
    colsCount,
    score: 0,
    lives: 3,
    started: false,
    paused: false,
    lost: false,
    won: false,
    rngSeed: seed,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: BreakoutState, action: BreakoutAction): BreakoutState {
  switch (action.type) {
    case "move-paddle": {
      const half = state.paddleWidth / 2;
      const newX = Math.max(half, Math.min(1 - half, action.x));
      if (!state.started) {
        return {
          ...state,
          paddleX: newX,
          ballX: newX,
          ballY: PADDLE_Y - BALL_RADIUS - 0.005,
        };
      }
      return { ...state, paddleX: newX };
    }

    case "release": {
      if (state.started || state.lost || state.won) return state;
      const rng = mulberry32(state.rngSeed);
      // Consume one value for direction offset (0..1)
      const rand = rng();
      // vx has small lateral variance; vy is always upward
      const vx = state.speed * (0.2 + 0.6 * rand) * (rand > 0.5 ? 1 : -1);
      const vy = -state.speed;
      return { ...state, started: true, ballVx: vx, ballVy: vy };
    }

    case "pause":
      return { ...state, paused: true };

    case "resume":
      return { ...state, paused: false };

    case "tick": {
      if (!state.started || state.paused || state.lost || state.won) return state;

      const { dt } = action;
      const { speed, paddleX, paddleWidth } = state;

      let { ballX, ballY, ballVx, ballVy } = state;

      // Advance
      let newX = ballX + ballVx * dt;
      let newY = ballY + ballVy * dt;

      // ── Wall collisions ──────────────────────────────────────────────────
      if (newX - BALL_RADIUS < 0) {
        newX = BALL_RADIUS;
        ballVx = Math.abs(ballVx);
      } else if (newX + BALL_RADIUS > 1) {
        newX = 1 - BALL_RADIUS;
        ballVx = -Math.abs(ballVx);
      }

      if (newY - BALL_RADIUS < 0) {
        newY = BALL_RADIUS;
        ballVy = Math.abs(ballVy);
      }

      // ── Paddle collision ─────────────────────────────────────────────────
      const paddleLeft = paddleX - paddleWidth / 2;
      const paddleRight = paddleX + paddleWidth / 2;

      if (
        ballVy > 0 &&
        newY + BALL_RADIUS >= PADDLE_Y &&
        newX >= paddleLeft &&
        newX <= paddleRight
      ) {
        newY = PADDLE_Y - BALL_RADIUS;
        ballVy = -Math.abs(ballVy);
        // English: offset in [-1, 1]
        const offset = (newX - paddleX) / (paddleWidth / 2);
        ballVx += offset * speed * 0.5;
        // Renormalize to preserve speed
        const mag = Math.sqrt(ballVx * ballVx + ballVy * ballVy);
        ballVx = (ballVx / mag) * speed;
        ballVy = (ballVy / mag) * speed;
      }

      // ── Brick collisions ─────────────────────────────────────────────────
      let bricks = state.bricks as Brick[];
      let score = state.score;
      let hitBrick = false;

      const brickWidth = 1 / BRICK_COLS;
      const brickHeight = (BRICK_AREA_Y_BOTTOM - BRICK_AREA_Y_TOP) / state.rowsCount;

      for (let i = 0; i < bricks.length && !hitBrick; i++) {
        const brick = bricks[i]!;
        if (!brick.alive) continue;

        const bLeft = brick.col * brickWidth;
        const bRight = bLeft + brickWidth;
        const bTop = BRICK_AREA_Y_TOP + brick.row * brickHeight;
        const bBottom = bTop + brickHeight;

        // AABB check with ball radius
        if (
          newX + BALL_RADIUS > bLeft &&
          newX - BALL_RADIUS < bRight &&
          newY + BALL_RADIUS > bTop &&
          newY - BALL_RADIUS < bBottom
        ) {
          // Determine collision axis using previous ball position
          const prevX = ballX;
          const prevY = ballY;

          // Overlap distances along each axis
          const overlapLeft = newX + BALL_RADIUS - bLeft;
          const overlapRight = bRight - (newX - BALL_RADIUS);
          const overlapTop = newY + BALL_RADIUS - bTop;
          const overlapBottom = bBottom - (newY - BALL_RADIUS);

          const minOverlapX = Math.min(overlapLeft, overlapRight);
          const minOverlapY = Math.min(overlapTop, overlapBottom);

          // Use previous position to disambiguate
          const cameFromLeft = prevX + BALL_RADIUS <= bLeft;
          const cameFromRight = prevX - BALL_RADIUS >= bRight;
          const cameFromTop = prevY + BALL_RADIUS <= bTop;
          const cameFromBottom = prevY - BALL_RADIUS >= bBottom;

          const hitSide = cameFromLeft || cameFromRight;
          const hitTopBottom = cameFromTop || cameFromBottom;

          if (hitSide && !hitTopBottom) {
            ballVx = -ballVx;
          } else if (hitTopBottom && !hitSide) {
            ballVy = -ballVy;
          } else if (minOverlapX < minOverlapY) {
            // Less penetration horizontally — side hit
            ballVx = -ballVx;
          } else {
            ballVy = -ballVy;
          }

          // Kill brick
          bricks = bricks.map((b, idx) => (idx === i ? { ...b, alive: false } : b));
          score += 10;
          hitBrick = true;
        }
      }

      // ── Ball fell below playfield ────────────────────────────────────────
      if (newY > 1) {
        const newLives = state.lives - 1;
        if (newLives <= 0) {
          return {
            ...state,
            bricks,
            score,
            lives: 0,
            lost: true,
            ballX: state.paddleX,
            ballY: PADDLE_Y - BALL_RADIUS - 0.005,
            ballVx: 0,
            ballVy: 0,
            started: false,
          };
        }
        return {
          ...state,
          bricks,
          score,
          lives: newLives,
          ballX: state.paddleX,
          ballY: PADDLE_Y - BALL_RADIUS - 0.005,
          ballVx: 0,
          ballVy: 0,
          started: false,
        };
      }

      // ── Win check ────────────────────────────────────────────────────────
      const won = bricks.every((b) => !b.alive);

      return {
        ...state,
        bricks,
        score,
        ballX: newX,
        ballY: newY,
        ballVx,
        ballVy,
        won,
      };
    }

    default:
      return state;
  }
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
export function isTerminal(state: BreakoutState): { score: number } | null {
  if (state.won) return { score: state.score + state.lives * 100 };
  if (state.lost) return { score: state.score };
  return null;
}
