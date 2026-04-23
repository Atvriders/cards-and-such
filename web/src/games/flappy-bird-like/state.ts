import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Flappy Bird-like ─────────────────────────────────────────────────────────
// One-button bird navigating gaps between pipes. Gravity + jump. Endless scroll.

export interface FlappyBirdSettings {}

export interface Pipe {
  id: number;
  x: number;       // [0,1] horizontal position
  gapY: number;    // center of gap, normalized [0,1]
  passed: boolean;
}

export interface FlappyBirdState {
  settings: FlappyBirdSettings;
  birdY: number;    // [0,1] vertical position (0=top, 1=bottom)
  birdVy: number;   // velocity, positive = falling
  pipes: readonly Pipe[];
  score: number;
  over: boolean;
  rngSeed: number;
  nextId: number;
  nextPipeX: number; // x at which to spawn next pipe
}

export type FlappyBirdAction =
  | { type: "tick"; dt: number }
  | { type: "flap" };

// ─── Constants ────────────────────────────────────────────────────────────────
const GRAVITY = 2.4;
const FLAP_VY = -0.65;
const PIPE_SPEED = 0.25;
const PIPE_GAP = 0.22;       // normalized gap height
const PIPE_WIDTH = 0.075;
const BIRD_X = 0.18;
const BIRD_R = 0.025;
const PIPE_SPACING = 0.45;
const GAP_MARGIN = 0.15;

function rng2(seed: number): { val: number; next: number } {
  const r = mulberry32(seed);
  const val = r();
  const next = Math.floor(r() * 2 ** 31);
  return { val, next };
}

export function initialState(seed: number, settings: FlappyBirdSettings): FlappyBirdState {
  return {
    settings,
    birdY: 0.4,
    birdVy: 0,
    pipes: [],
    score: 0,
    over: false,
    rngSeed: seed,
    nextId: 1,
    nextPipeX: 1.0,
  };
}

export function reducer(state: FlappyBirdState, action: FlappyBirdAction): FlappyBirdState {
  if (state.over) return state;

  switch (action.type) {
    case "flap": {
      return { ...state, birdVy: FLAP_VY };
    }

    case "tick": {
      const { dt } = action;

      // Physics
      const birdVy = state.birdVy + GRAVITY * dt;
      const birdY = state.birdY + birdVy * dt;

      // Check ceiling/floor
      if (birdY < 0 || birdY > 1) {
        return { ...state, birdY: Math.max(0, Math.min(1, birdY)), birdVy, over: true };
      }

      // Move pipes
      let pipes = (state.pipes as Pipe[]).map((p) => ({ ...p, x: p.x - PIPE_SPEED * dt }));

      // Spawn new pipe
      let nextPipeX = state.nextPipeX - PIPE_SPEED * dt;
      let rngSeed = state.rngSeed;
      let nextId = state.nextId;

      if (nextPipeX <= 0.85) {
        const r = rng2(rngSeed);
        rngSeed = r.next;
        const gapY = GAP_MARGIN + r.val * (1 - 2 * GAP_MARGIN);
        pipes = [...pipes, { id: nextId++, x: 1.1, gapY, passed: false }];
        nextPipeX = PIPE_SPACING;
      }

      // Remove off-screen pipes
      pipes = pipes.filter((p) => p.x > -PIPE_WIDTH - 0.05);

      // Score: pipes passed
      let score = state.score;
      pipes = pipes.map((p) => {
        if (!p.passed && p.x + PIPE_WIDTH < BIRD_X) {
          score += 1;
          return { ...p, passed: true };
        }
        return p;
      });

      // Collision detection
      let over = false;
      const birdLeft = BIRD_X - BIRD_R;
      const birdRight = BIRD_X + BIRD_R;
      const birdTop = birdY - BIRD_R;
      const birdBot = birdY + BIRD_R;

      for (const p of pipes) {
        const pLeft = p.x;
        const pRight = p.x + PIPE_WIDTH;
        // Overlap in X
        if (birdRight > pLeft && birdLeft < pRight) {
          const gapTop = p.gapY - PIPE_GAP / 2;
          const gapBot = p.gapY + PIPE_GAP / 2;
          // Collision if bird is outside the gap
          if (birdTop < gapTop || birdBot > gapBot) {
            over = true;
            break;
          }
        }
      }

      return { ...state, birdY, birdVy, pipes, score, over, rngSeed, nextId, nextPipeX };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FlappyBirdState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
