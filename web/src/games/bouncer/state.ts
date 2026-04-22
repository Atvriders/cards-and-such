import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Bouncer ──────────────────────────────────────────────────────────────────
// Breakout-without-bricks: keep balls on screen, collect power-ups.

export interface BouncerSettings {
  difficulty: "easy" | "medium" | "hard";
  lives: "3" | "5" | "10";
}

export type PowerUpType = "multiball" | "slow" | "wide";

export interface Ball {
  id: number;
  x: number; // normalized [0,1]
  y: number;
  vx: number;
  vy: number;
}

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: PowerUpType;
  vy: number; // falling speed
}

export interface BouncerState {
  settings: BouncerSettings;
  paddleX: number;
  paddleWidth: number;
  balls: readonly Ball[];
  powerUps: readonly PowerUp[];
  score: number;
  lives: number;
  over: boolean;
  nextId: number;
  rngSeed: number;
  /** Bounces since last power-up spawn threshold */
  bounceCount: number;
  /** Last power-up spawn bounce count */
  lastPowerUpBounce: number;
  started: boolean;
  paused: boolean;
  /** slow-motion ticks remaining */
  slowTicks: number;
  /** wide paddle ticks remaining */
  wideTicks: number;
}

export type BouncerAction =
  | { type: "tick"; dt: number }
  | { type: "movePaddle"; x: number }
  | { type: "release" }
  | { type: "pause" }
  | { type: "resume" };

// ─── Constants ────────────────────────────────────────────────────────────────
const PADDLE_Y = 0.92;
const PADDLE_H = 0.02;
const BALL_R = 0.015;
const BALL_SPEED: Record<string, number> = {
  easy: 0.5,
  medium: 0.75,
  hard: 1.0,
};
const POWER_UP_EVERY = 10; // every N bounces
const POWER_UP_FALL_SPEED = 0.18;
const POWER_TYPES: PowerUpType[] = ["multiball", "slow", "wide"];
const WIDE_WIDTH = 0.28;
const NORMAL_WIDTH = 0.16;
const SLOW_FACTOR = 0.4;
const POWER_DURATION_TICKS = 300; // ~5 sec at 60fps

function rng2(seed: number): { val: number; next: number } {
  const rng = mulberry32(seed);
  const val = rng();
  const next = Math.floor(rng() * 2 ** 31);
  return { val, next };
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: BouncerSettings): BouncerState {
  const lives = parseInt(settings.lives, 10);
  const speed = BALL_SPEED[settings.difficulty] ?? 0.75;
  const initialBall: Ball = {
    id: 1,
    x: 0.5,
    y: PADDLE_Y - BALL_R - 0.01,
    vx: speed * 0.4,
    vy: -speed,
  };

  return {
    settings,
    paddleX: 0.5,
    paddleWidth: NORMAL_WIDTH,
    balls: [initialBall],
    powerUps: [],
    score: 0,
    lives,
    over: false,
    nextId: 2,
    rngSeed: seed,
    bounceCount: 0,
    lastPowerUpBounce: 0,
    started: false,
    paused: false,
    slowTicks: 0,
    wideTicks: 0,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: BouncerState, action: BouncerAction): BouncerState {
  if (state.over) return state;

  switch (action.type) {
    case "movePaddle": {
      const half = state.paddleWidth / 2;
      const newX = Math.max(half, Math.min(1 - half, action.x));
      if (!state.started) {
        // Move ball with paddle
        const balls = state.balls.map((b) => ({ ...b, x: newX }));
        return { ...state, paddleX: newX, balls };
      }
      return { ...state, paddleX: newX };
    }

    case "release": {
      if (state.started) return state;
      return { ...state, started: true };
    }

    case "pause":
      return { ...state, paused: true };

    case "resume":
      return { ...state, paused: false };

    case "tick": {
      if (!state.started || state.paused) return state;

      const { dt } = action;
      const slowMultiplier = state.slowTicks > 0 ? SLOW_FACTOR : 1.0;
      const effectiveDt = dt * slowMultiplier;

      let { paddleX, paddleWidth, score, lives, nextId, rngSeed, bounceCount, lastPowerUpBounce } =
        state;
      let slowTicks = Math.max(0, state.slowTicks - 1);
      let wideTicks = Math.max(0, state.wideTicks - 1);
      if (wideTicks === 0 && state.wideTicks > 0) paddleWidth = NORMAL_WIDTH;

      // ── Move balls ─────────────────────────────────────────────────────────
      let balls = state.balls as Ball[];
      let lostBalls = 0;

      balls = balls.map((ball) => {
        let { x, y, vx, vy } = ball;
        x += vx * effectiveDt;
        y += vy * effectiveDt;

        // Wall bounces
        if (x - BALL_R < 0) { x = BALL_R; vx = Math.abs(vx); }
        if (x + BALL_R > 1) { x = 1 - BALL_R; vx = -Math.abs(vx); }
        if (y - BALL_R < 0) { y = BALL_R; vy = Math.abs(vy); }

        return { ...ball, x, y, vx, vy };
      });

      // ── Paddle collision ───────────────────────────────────────────────────
      const paddleLeft = paddleX - paddleWidth / 2;
      const paddleRight = paddleX + paddleWidth / 2;

      balls = balls.map((ball) => {
        if (
          ball.vy > 0 &&
          ball.y + BALL_R >= PADDLE_Y &&
          ball.x >= paddleLeft &&
          ball.x <= paddleRight
        ) {
          const offset = (ball.x - paddleX) / (paddleWidth / 2);
          const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          let newVx = ball.vx + offset * speed * 0.4;
          let newVy = -Math.abs(ball.vy);
          const mag = Math.sqrt(newVx * newVx + newVy * newVy);
          newVx = (newVx / mag) * speed;
          newVy = (newVy / mag) * speed;

          bounceCount++;
          score++;

          return { ...ball, y: PADDLE_Y - BALL_R, vx: newVx, vy: newVy };
        }
        return ball;
      });

      // ── Check for lost balls ───────────────────────────────────────────────
      const survivingBalls: Ball[] = [];
      for (const ball of balls) {
        if (ball.y > 1.05) {
          lostBalls++;
        } else {
          survivingBalls.push(ball);
        }
      }

      if (lostBalls > 0 && survivingBalls.length === 0) {
        lives -= 1;
      }

      // Always continue with surviving balls; if lost all and no lives left, game over
      balls = survivingBalls;

      // Re-serve if all balls lost and still have lives
      if (balls.length === 0 && lives > 0) {
        const speed = BALL_SPEED[state.settings.difficulty] ?? 0.75;
        balls = [{
          id: nextId++,
          x: paddleX,
          y: PADDLE_Y - BALL_R - 0.01,
          vx: speed * 0.4,
          vy: -speed,
        }];
      }

      const over = lives <= 0 && balls.length === 0;

      // ── Spawn power-up every POWER_UP_EVERY bounces ────────────────────────
      let powerUps = state.powerUps as PowerUp[];

      if (bounceCount - lastPowerUpBounce >= POWER_UP_EVERY) {
        const r1 = rng2(rngSeed);
        rngSeed = r1.next;
        const r2 = rng2(rngSeed);
        rngSeed = r2.next;
        const type = POWER_TYPES[Math.floor(r1.val * POWER_TYPES.length)]!;
        powerUps = [
          ...powerUps,
          { id: nextId++, x: 0.2 + r2.val * 0.6, y: 0.0, type, vy: POWER_UP_FALL_SPEED },
        ];
        lastPowerUpBounce = bounceCount;
      }

      // ── Move power-ups ─────────────────────────────────────────────────────
      powerUps = powerUps.map((p) => ({ ...p, y: p.y + p.vy * effectiveDt }));

      // ── Collect power-ups ──────────────────────────────────────────────────
      const remainingPowerUps: PowerUp[] = [];
      for (const pu of powerUps) {
        if (pu.y > 1) continue; // off screen
        // Check paddle collision
        if (
          pu.y + 0.02 >= PADDLE_Y &&
          pu.x >= paddleLeft - 0.02 &&
          pu.x <= paddleRight + 0.02
        ) {
          // Apply power-up
          if (pu.type === "multiball") {
            const existingBall = balls[0];
            if (existingBall) {
              const spd = Math.sqrt(existingBall.vx ** 2 + existingBall.vy ** 2);
              balls = [
                ...balls,
                { id: nextId++, x: existingBall.x, y: existingBall.y, vx: -existingBall.vx * 0.9, vy: -spd * 0.9 },
              ];
            }
          } else if (pu.type === "slow") {
            slowTicks = POWER_DURATION_TICKS;
          } else if (pu.type === "wide") {
            wideTicks = POWER_DURATION_TICKS;
            paddleWidth = WIDE_WIDTH;
          }
        } else {
          remainingPowerUps.push(pu);
        }
      }

      return {
        ...state,
        balls,
        powerUps: remainingPowerUps,
        score,
        lives,
        over,
        nextId,
        rngSeed,
        bounceCount,
        lastPowerUpBounce,
        paddleX,
        paddleWidth,
        slowTicks,
        wideTicks,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: BouncerState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { PADDLE_Y, PADDLE_H, BALL_R };
