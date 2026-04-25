import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PinballSettings {
  bumpers: "3" | "5" | "7";
}

export interface Bumper {
  x: number;
  y: number;
  radius: number;
  hits: number;
}

export interface PinballState {
  settings: PinballSettings;
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
  ballRadius: number;
  paddleX: number;
  paddleW: number;
  paddleH: number;
  fieldW: number;
  fieldH: number;
  bumpers: Bumper[];
  score: number;
  lives: number;
  over: boolean;
  ticks: number;
  rngSeed: number;
}

export type PinballAction =
  | { type: "tick" }
  | { type: "movePaddle"; x: number }
  | { type: "paddleLeft" }
  | { type: "paddleRight" };

const FIELD_W = 300;
const FIELD_H = 400;
const PADDLE_W = 80;
const PADDLE_H = 12;
const BALL_R = 8;
const BUMPER_R = 18;

function createBumpers(count: number, seed: number): { bumpers: Bumper[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const bumpers: Bumper[] = [];
  for (let i = 0; i < count; i++) {
    bumpers.push({
      x: BUMPER_R + rng() * (FIELD_W - BUMPER_R * 2),
      y: 60 + rng() * (FIELD_H * 0.45),
      radius: BUMPER_R,
      hits: 0,
    });
  }
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { bumpers, nextSeed };
}

export function initialState(seed: number, settings: PinballSettings): PinballState {
  const count = parseInt(settings.bumpers, 10);
  const { bumpers, nextSeed } = createBumpers(count, seed);
  return {
    settings,
    ballX: FIELD_W / 2,
    ballY: FIELD_H * 0.7,
    ballVX: 2.5,
    ballVY: -3.5,
    ballRadius: BALL_R,
    paddleX: (FIELD_W - PADDLE_W) / 2,
    paddleW: PADDLE_W,
    paddleH: PADDLE_H,
    fieldW: FIELD_W,
    fieldH: FIELD_H,
    bumpers,
    score: 0,
    lives: 3,
    over: false,
    ticks: 0,
    rngSeed: nextSeed,
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function reducer(state: PinballState, action: PinballAction): PinballState {
  if (state.over) return state;

  switch (action.type) {
    case "movePaddle":
      return { ...state, paddleX: clamp(action.x, 0, state.fieldW - state.paddleW) };

    case "paddleLeft":
      return { ...state, paddleX: clamp(state.paddleX - 20, 0, state.fieldW - state.paddleW) };

    case "paddleRight":
      return { ...state, paddleX: clamp(state.paddleX + 20, 0, state.fieldW - state.paddleW) };

    case "tick": {
      let { ballX, ballY, ballVX, ballVY, lives, score } = state;
      const bumpers = state.bumpers.map((b) => ({ ...b }));

      // Move
      ballX += ballVX;
      ballY += ballVY;

      // Wall bounce left/right
      if (ballX - BALL_R <= 0) { ballX = BALL_R; ballVX = Math.abs(ballVX); }
      if (ballX + BALL_R >= state.fieldW) { ballX = state.fieldW - BALL_R; ballVX = -Math.abs(ballVX); }

      // Ceiling bounce
      if (ballY - BALL_R <= 0) { ballY = BALL_R; ballVY = Math.abs(ballVY); }

      // Paddle collision
      const paddleTop = state.fieldH - state.paddleH - 10;
      const paddleLeft = state.paddleX;
      const paddleRight = state.paddleX + state.paddleW;
      if (
        ballY + BALL_R >= paddleTop &&
        ballY - BALL_R <= paddleTop + state.paddleH &&
        ballX >= paddleLeft &&
        ballX <= paddleRight &&
        ballVY > 0
      ) {
        ballVY = -Math.abs(ballVY);
        ballY = paddleTop - BALL_R;
        // Add angle based on hit position
        const relX = (ballX - (paddleLeft + state.paddleW / 2)) / (state.paddleW / 2);
        ballVX = relX * 4;
        score += 1;
      }

      // Bumper collisions
      for (const b of bumpers) {
        const dx = ballX - b.x;
        const dy = ballY - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BALL_R + b.radius) {
          // Reflect
          const nx = dx / dist;
          const ny = dy / dist;
          const dot = ballVX * nx + ballVY * ny;
          ballVX -= 2 * dot * nx;
          ballVY -= 2 * dot * ny;
          // Push out
          const overlap = BALL_R + b.radius - dist;
          ballX += nx * overlap;
          ballY += ny * overlap;
          // Speed boost
          const speed = Math.sqrt(ballVX * ballVX + ballVY * ballVY);
          if (speed < 5) { ballVX *= 1.1; ballVY *= 1.1; }
          b.hits++;
          score += 10;
        }
      }

      // Ball fell below paddle
      if (ballY - BALL_R > state.fieldH) {
        lives--;
        const rng = mulberry32(state.rngSeed);
        const nextSeed = Math.floor(rng() * 2 ** 31);
        if (lives <= 0) {
          return { ...state, ballX, ballY, ballVX, ballVY, bumpers, score, lives: 0, over: true, ticks: state.ticks + 1 };
        }
        return {
          ...state,
          ballX: state.fieldW / 2,
          ballY: state.fieldH * 0.7,
          ballVX: 2.5,
          ballVY: -3.5,
          bumpers,
          score,
          lives,
          rngSeed: nextSeed,
          ticks: state.ticks + 1,
        };
      }

      return { ...state, ballX, ballY, ballVX, ballVY, bumpers, score, ticks: state.ticks + 1 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PinballState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
