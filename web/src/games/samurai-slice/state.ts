import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SamuraiSliceSettings {
  speed: "slow" | "medium" | "fast";
  duration: "30" | "60" | "90";
}

export interface Target {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: "fruit" | "bomb";
  radius: number;
  sliced: boolean;
}

export interface SamuraiSliceState {
  settings: SamuraiSliceSettings;
  targets: readonly Target[];
  score: number;
  lives: number;
  elapsed: number;
  over: boolean;
  rngSeed: number;
  rngCounter: number;
  nextId: number;
}

export type SamuraiSliceAction =
  | { type: "tick"; dt: number }
  | { type: "slice"; x: number; y: number };

const GRAVITY = 0.7;
const BOMB_CHANCE = 0.18;

function speedFactor(s: SamuraiSliceSettings["speed"]): number {
  return s === "slow" ? 0.75 : s === "fast" ? 1.35 : 1.0;
}

function rngAt(seed: number, counter: number): number {
  return mulberry32(seed + counter * 1000033)();
}

const FRUITS = ["🍎", "🍊", "🍋", "🍉", "🍇", "🍓"];

export function initialState(seed: number, settings: SamuraiSliceSettings): SamuraiSliceState {
  return {
    settings,
    targets: [],
    score: 0,
    lives: 3,
    elapsed: 0,
    over: false,
    rngSeed: seed,
    rngCounter: 0,
    nextId: 0,
  };
}

export function reducer(state: SamuraiSliceState, action: SamuraiSliceAction): SamuraiSliceState {
  if (state.over) return state;

  switch (action.type) {
    case "slice": {
      const { x, y } = action;
      let score = state.score;
      let lives = state.lives;
      const targets = state.targets.map((t) => {
        if (t.sliced) return t;
        const dx = t.x - x;
        const dy = t.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < t.radius + 0.04) {
          if (t.kind === "bomb") {
            lives -= 1;
            return { ...t, sliced: true };
          } else {
            score += 1;
            return { ...t, sliced: true };
          }
        }
        return t;
      });
      return { ...state, targets, score, lives, over: lives <= 0 };
    }

    case "tick": {
      const { dt } = action;
      const sf = speedFactor(state.settings.speed);
      const duration = parseInt(state.settings.duration, 10);
      const newElapsed = state.elapsed + dt;
      let counter = state.rngCounter;
      let nextId = state.nextId;
      let lives = state.lives;
      const score = state.score;

      // Move targets
      let targets: Target[] = state.targets.map((t) => ({
        ...t,
        x: t.x + t.vx * dt,
        y: t.y + t.vy * dt + 0.5 * GRAVITY * dt * dt * sf,
        vy: t.vy + GRAVITY * dt * sf,
      }));

      // Fruit that falls off bottom without being sliced = lose life
      const surviving: Target[] = [];
      for (const t of targets) {
        if (t.y > 1.1) {
          if (!t.sliced && t.kind === "fruit") lives -= 1;
        } else {
          surviving.push(t);
        }
      }
      targets = surviving.filter((t) => !t.sliced || t.y < 1.1);

      // Spawn new targets
      const spawnInterval = (1.2 - state.elapsed * 0.003) / sf;
      const prevTick = Math.floor(state.elapsed / Math.max(0.3, spawnInterval));
      const currTick = Math.floor(newElapsed / Math.max(0.3, spawnInterval));
      if (currTick > prevTick && newElapsed < duration) {
        const isBomb = rngAt(state.rngSeed, counter++) < BOMB_CHANCE;
        const x = 0.1 + rngAt(state.rngSeed, counter++) * 0.8;
        const vx = (rngAt(state.rngSeed, counter++) - 0.5) * 0.6 * sf;
        const vy = -(0.6 + rngAt(state.rngSeed, counter++) * 0.5) * sf;
        targets.push({
          id: nextId++,
          x,
          y: 1.05,
          vx,
          vy,
          kind: isBomb ? "bomb" : "fruit",
          radius: 0.045,
          sliced: false,
        });
      }

      const over = lives <= 0 || newElapsed >= duration;
      return {
        ...state,
        targets,
        score,
        lives,
        elapsed: newElapsed,
        over,
        rngCounter: counter,
        nextId,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SamuraiSliceState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

// Export fruit list for display
export { FRUITS };
