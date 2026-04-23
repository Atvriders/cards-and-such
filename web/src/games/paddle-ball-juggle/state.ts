import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Paddle Ball Juggle ───────────────────────────────────────────────────────
// Horizontal paddle at bottom. Keep multiple balls in the air. Power-ups spawn.

export interface PaddleBallSettings {}

export interface Ball {
  id: number;
  x: number;   // [0,1]
  y: number;   // [0,1] 0=top, 1=bottom
  vx: number;
  vy: number;
  r: number;
  active: boolean;
}

export type PowerUpKind = "wide" | "multiball" | "slow";

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  kind: PowerUpKind;
  vy: number;
}

export interface PaddleBallState {
  settings: PaddleBallSettings;
  paddleX: number;    // center [0,1]
  paddleW: number;    // width [0,1]
  balls: readonly Ball[];
  powerUps: readonly PowerUp[];
  lives: number;
  score: number;
  over: boolean;
  rngSeed: number;
  nextId: number;
  slowTimer: number;  // seconds of slow left
  bounceCount: number;
  powerUpTimer: number;
}

export type PaddleBallAction =
  | { type: "tick"; dt: number }
  | { type: "movePaddle"; x: number }   // x center [0,1]
  | { type: "tapLeft" }
  | { type: "tapRight" };

// ─── Constants ────────────────────────────────────────────────────────────────
const PADDLE_H = 0.025;
const PADDLE_BOTTOM = 0.92;
const BALL_R = 0.022;
const BALL_SPEED = 0.55;
const PADDLE_SPEED_KEY = 0.7;
const POWERUP_INTERVAL = 8;
const POWERUP_VY = 0.12;

function rng2(seed: number): { val: number; next: number } {
  const r = mulberry32(seed);
  const val = r();
  const next = Math.floor(r() * 2 ** 31);
  return { val, next };
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

export function initialState(seed: number, settings: PaddleBallSettings): PaddleBallState {
  const r = rng2(seed);
  const initAngle = -Math.PI * 0.5 + (r.val - 0.5) * 0.8; // roughly upward
  const vx = BALL_SPEED * Math.cos(initAngle);
  const vy = BALL_SPEED * Math.sin(initAngle);
  return {
    settings,
    paddleX: 0.5,
    paddleW: 0.2,
    balls: [{ id: 1, x: 0.5, y: 0.8, vx, vy, r: BALL_R, active: true }],
    powerUps: [],
    lives: 3,
    score: 0,
    over: false,
    rngSeed: r.next,
    nextId: 2,
    slowTimer: 0,
    bounceCount: 0,
    powerUpTimer: POWERUP_INTERVAL,
  };
}

export function reducer(state: PaddleBallState, action: PaddleBallAction): PaddleBallState {
  if (state.over) return state;

  switch (action.type) {
    case "movePaddle": {
      const hw = state.paddleW / 2;
      return { ...state, paddleX: clamp(action.x, hw, 1 - hw) };
    }

    case "tapLeft":
      return { ...state, paddleX: clamp(state.paddleX - PADDLE_SPEED_KEY * 0.05, state.paddleW / 2, 1 - state.paddleW / 2) };

    case "tapRight":
      return { ...state, paddleX: clamp(state.paddleX + PADDLE_SPEED_KEY * 0.05, state.paddleW / 2, 1 - state.paddleW / 2) };

    case "tick": {
      const { dt } = action;
      const speed = state.slowTimer > 0 ? 0.5 : 1.0;
      const slowTimer = Math.max(0, state.slowTimer - dt);

      // Move balls
      let balls = (state.balls as Ball[]).filter((b) => b.active);
      let lives = state.lives;
      let score = state.score;
      let bounceCount = state.bounceCount;
      let rngSeed = state.rngSeed;
      let nextId = state.nextId;
      let paddleW = state.paddleW;

      balls = balls.map((b) => {
        let { x, y, vx, vy } = b;
        x += vx * dt * speed;
        y += vy * dt * speed;

        // Wall bounces
        if (x - b.r < 0) { x = b.r; vx = Math.abs(vx); }
        if (x + b.r > 1) { x = 1 - b.r; vx = -Math.abs(vx); }
        if (y - b.r < 0) { y = b.r; vy = Math.abs(vy); }

        return { ...b, x, y, vx, vy };
      });

      // Paddle bounce
      const pLeft = state.paddleX - state.paddleW / 2;
      const pRight = state.paddleX + state.paddleW / 2;
      const pTop = PADDLE_BOTTOM - PADDLE_H;
      balls = balls.map((b) => {
        let { x, y, vx, vy } = b;
        if (
          vy > 0 &&
          y + b.r >= pTop &&
          y - b.r < PADDLE_BOTTOM &&
          x + b.r > pLeft &&
          x - b.r < pRight
        ) {
          vy = -Math.abs(vy);
          y = pTop - b.r;
          // Angle based on where ball hits paddle
          const rel = (x - state.paddleX) / (state.paddleW / 2); // [-1, 1]
          vx = rel * BALL_SPEED * 0.8;
          vy = -Math.sqrt(Math.max(0.1, BALL_SPEED * BALL_SPEED - vx * vx));
          score += 1;
          bounceCount += 1;
        }
        return { ...b, x, y, vx, vy };
      });

      // Remove balls that fell off screen
      const lost = balls.filter((b) => b.y > 1 + b.r);
      lives -= lost.length;
      balls = balls.filter((b) => b.y <= 1 + b.r);

      // Spawn new ball if we have none left but still have lives
      if (balls.length === 0 && lives > 0) {
        const r1 = rng2(rngSeed);
        rngSeed = r1.next;
        const angle = -Math.PI * 0.5 + (r1.val - 0.5) * 0.6;
        const vx = BALL_SPEED * Math.cos(angle);
        const vy = BALL_SPEED * Math.sin(angle);
        balls = [{ id: nextId++, x: state.paddleX, y: PADDLE_BOTTOM - 0.05, vx, vy, r: BALL_R, active: true }];
      }

      // Power-up timer
      let powerUpTimer = state.powerUpTimer - dt;
      let powerUps = (state.powerUps as PowerUp[]).map((p) => ({ ...p, y: p.y + p.vy * dt }));
      powerUps = powerUps.filter((p) => p.y < 1.1);

      if (powerUpTimer <= 0) {
        const r1 = rng2(rngSeed);
        rngSeed = r1.next;
        const r2 = rng2(rngSeed);
        rngSeed = r2.next;
        const kinds: PowerUpKind[] = ["wide", "multiball", "slow"];
        const kind: PowerUpKind = kinds[Math.floor(r1.val * 3) % 3] as PowerUpKind;
        powerUps = [...powerUps, { id: nextId++, x: r2.val, y: 0, kind, vy: POWERUP_VY }];
        powerUpTimer = POWERUP_INTERVAL;
      }

      // Check power-up catches
      powerUps = powerUps.filter((p) => {
        const atPaddle = p.y + 0.02 >= PADDLE_BOTTOM - PADDLE_H && p.y < PADDLE_BOTTOM + 0.02
          && p.x > pLeft && p.x < pRight;
        if (atPaddle) {
          if (p.kind === "wide") { paddleW = Math.min(0.45, paddleW + 0.08); }
          if (p.kind === "slow") { /* slowTimer handled separately */ }
          if (p.kind === "multiball") {
            const r1 = rng2(rngSeed);
            rngSeed = r1.next;
            const angle = -Math.PI * 0.5 + (r1.val - 0.5) * 0.9;
            const vx = BALL_SPEED * Math.cos(angle);
            const vy = BALL_SPEED * Math.sin(angle);
            balls = [...balls, { id: nextId++, x: state.paddleX, y: PADDLE_BOTTOM - 0.05, vx, vy, r: BALL_R, active: true }];
          }
          score += 5;
          return false;
        }
        return true;
      });

      const newSlowTimer = powerUps.some((p) => p.kind === "slow" && p.y > 0.9)
        ? slowTimer
        : slowTimer;

      const over = lives <= 0;

      return {
        ...state,
        balls,
        powerUps,
        lives,
        score,
        over,
        rngSeed,
        nextId,
        slowTimer: newSlowTimer,
        bounceCount,
        paddleW,
        powerUpTimer,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PaddleBallState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
