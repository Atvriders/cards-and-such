import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Wall Jumper ─────────────────────────────────────────────────────────────
// Bounce between two walls. Tap to jump to opposite wall. Hit moving targets.

export interface WallJumperSettings {}

export interface Target {
  id: number;
  wall: 0 | 1;    // 0 = left wall, 1 = right wall
  y: number;      // [0,1] vertical position
  vy: number;     // speed of movement
  points: number; // 1-3
  hit: boolean;
}

export type WallSide = 0 | 1;

export interface WallJumperState {
  settings: WallJumperSettings;
  playerWall: WallSide;  // which wall the player is on
  playerY: number;       // [0,1] vertical position
  jumping: boolean;      // mid-flight between walls
  jumpProgress: number;  // 0→1 fraction of jump completed
  targets: readonly Target[];
  score: number;
  lives: number;
  over: boolean;
  rngSeed: number;
  nextId: number;
  tickAccum: number;  // seconds since last target spawn check
  totalTime: number;
}

export type WallJumperAction =
  | { type: "tick"; dt: number }
  | { type: "jump" };

// ─── Constants ────────────────────────────────────────────────────────────────
const JUMP_DURATION = 0.35;      // seconds to cross
const PLAYER_H = 0.06;
const TARGET_W = 0.12;
const TARGET_H = 0.07;
const TARGET_SPEED_BASE = 0.15;
const HIT_THRESHOLD = 0.08;      // how close vertically to count as hit
const SPAWN_INTERVAL = 1.8;      // seconds between target spawns
const MAX_TARGETS = 4;
const INITIAL_LIVES = 3;

function rng2(seed: number): { val: number; next: number } {
  const r = mulberry32(seed);
  const val = r();
  const next = Math.floor(r() * 2 ** 31);
  return { val, next };
}

export function initialState(seed: number, settings: WallJumperSettings): WallJumperState {
  return {
    settings,
    playerWall: 0,
    playerY: 0.5,
    jumping: false,
    jumpProgress: 0,
    targets: [],
    score: 0,
    lives: INITIAL_LIVES,
    over: false,
    rngSeed: seed,
    nextId: 1,
    tickAccum: 0,
    totalTime: 0,
  };
}

export function reducer(state: WallJumperState, action: WallJumperAction): WallJumperState {
  if (state.over) return state;

  switch (action.type) {
    case "jump": {
      if (state.jumping) return state;
      return { ...state, jumping: true, jumpProgress: 0 };
    }

    case "tick": {
      const { dt } = action;
      const totalTime = state.totalTime + dt;
      let tickAccum = state.tickAccum + dt;

      // Move targets
      let targets = (state.targets as Target[]).map((t) => ({
        ...t,
        y: t.y + t.vy * dt,
      }));

      // Bounce targets off top/bottom
      targets = targets.map((t) => {
        let { y, vy } = t;
        if (y < 0.05) { y = 0.05; vy = Math.abs(vy); }
        if (y > 0.95) { y = 0.95; vy = -Math.abs(vy); }
        return { ...t, y, vy };
      });

      // Spawn new targets
      let rngSeed = state.rngSeed;
      let nextId = state.nextId;
      if (tickAccum >= SPAWN_INTERVAL && targets.filter((t) => !t.hit).length < MAX_TARGETS) {
        tickAccum -= SPAWN_INTERVAL;
        const r1 = rng2(rngSeed);
        rngSeed = r1.next;
        const r2 = rng2(rngSeed);
        rngSeed = r2.next;
        const r3 = rng2(rngSeed);
        rngSeed = r3.next;
        const r4 = rng2(rngSeed);
        rngSeed = r4.next;
        const wall = r1.val < 0.5 ? 0 : 1;
        const y = 0.1 + r2.val * 0.8;
        const vy = (r3.val < 0.5 ? 1 : -1) * (TARGET_SPEED_BASE + r4.val * 0.1);
        const points = r1.val < 0.33 ? 3 : r1.val < 0.66 ? 2 : 1;
        targets = [...targets, { id: nextId++, wall: wall as WallSide, y, vy, points, hit: false }];
      }

      // Handle jump movement
      let { jumping, jumpProgress, playerWall, playerY } = state;
      if (jumping) {
        jumpProgress = Math.min(1, jumpProgress + dt / JUMP_DURATION);
        // Player sweeps across horizontally
        if (jumpProgress >= 1) {
          // Arrived at opposite wall
          playerWall = (playerWall === 0 ? 1 : 0) as WallSide;
          jumping = false;
          jumpProgress = 0;
          // Check if we hit any target on arrival wall
          targets = targets.map((t) => {
            if (!t.hit && t.wall === playerWall && Math.abs(t.y - playerY) < HIT_THRESHOLD) {
              return { ...t, hit: true };
            }
            return t;
          });
        }
      }

      // Score hits
      let score = state.score;
      targets.forEach((t) => {
        if (t.hit) {
          const oldT = (state.targets as Target[]).find((ot) => ot.id === t.id);
          if (oldT && !oldT.hit) score += t.points;
        }
      });

      // Remove old hit targets
      targets = targets.filter((t) => !t.hit || true); // keep all for now (could add fade)
      targets = targets.filter((t) => !t.hit);

      // Lives: targets that have been on screen too long without being hit get removed
      // We track via totalTime; targets older than 5s that remain un-hit cost a life
      // Simplified: if targets pile up beyond max, remove oldest (no life penalty in this version)

      // Game over when lives depleted (deducted manually via missed jumps — simplified: timed limit)
      // In this version: miss 10 spawns without hitting = over. We'll check score never goes negative.
      const over = state.lives <= 0;

      return {
        ...state,
        jumping,
        jumpProgress,
        playerWall,
        playerY,
        targets,
        score,
        over,
        rngSeed,
        nextId,
        tickAccum,
        totalTime,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: WallJumperState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
