import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Fly {
  id: number;
  x: number;   // 0-1
  y: number;   // 0-1
  vx: number;  // velocity 0-1 per second
  vy: number;
}

export interface Tongue {
  tx: number;  // 0-1 normalized target position
  ty: number;
  progress: number; // 0 = retracted, 1 = fully extended
  retracting: boolean;
}

export interface FrogCatcherState {
  settings: { duration: "30" | "60" | "120"; flySpeed: "slow" | "medium" | "fast" };
  frog: { x: number; y: number }; // fixed on lily pad
  flies: readonly Fly[];
  tongue: Tongue | null;
  score: number;
  elapsed: number;
  ended: boolean;
  rngSeed: number;
  rngCounter: number;
  nextId: number;
}

export type FrogCatcherAction =
  | { type: "tick"; dt: number }
  | { type: "extend"; tx: number; ty: number }; // normalized 0-1

const MAX_FLIES = 5;
const SPAWN_INTERVAL = 1.2;
const TONGUE_SPEED = 2.5; // extend/retract per second (in 0-1 arena units... we use 0.8 as max length)
const HIT_RADIUS = 0.06;

const FLY_SPEED = { slow: 0.08, medium: 0.16, fast: 0.28 };

function rngAt(seed: number, counter: number): number {
  const rng = mulberry32(seed + counter * 1000003);
  return rng();
}

export function initialState(
  seed: number,
  settings: { duration: "30" | "60" | "120"; flySpeed: "slow" | "medium" | "fast" },
): FrogCatcherState {
  return {
    settings,
    frog: { x: 0.5, y: 0.82 },
    flies: [],
    tongue: null,
    score: 0,
    elapsed: 0,
    ended: false,
    rngSeed: seed,
    rngCounter: 0,
    nextId: 0,
  };
}

export function reducer(state: FrogCatcherState, action: FrogCatcherAction): FrogCatcherState {
  if (state.ended && action.type !== "tick") return state;

  switch (action.type) {
    case "tick": {
      const duration = parseInt(state.settings.duration, 10);
      const newElapsed = state.elapsed + action.dt;
      if (state.ended) return state;
      const ended = newElapsed >= duration;
      const speed = FLY_SPEED[state.settings.flySpeed];

      // Move flies, bounce off walls
      const movedFlies = state.flies.map((f) => {
        let nx = f.x + f.vx * action.dt;
        let ny = f.y + f.vy * action.dt;
        let nvx = f.vx;
        let nvy = f.vy;
        if (nx < 0.02 || nx > 0.98) { nvx = -nvx; nx = Math.max(0.02, Math.min(0.98, nx)); }
        if (ny < 0.02 || ny > 0.72) { nvy = -nvy; ny = Math.max(0.02, Math.min(0.72, ny)); }
        return { ...f, x: nx, y: ny, vx: nvx, vy: nvy };
      });

      // Spawn flies
      let counter = state.rngCounter;
      let nextId = state.nextId;
      const prevSpawns = Math.floor(state.elapsed / SPAWN_INTERVAL);
      const newSpawns = Math.floor(newElapsed / SPAWN_INTERVAL);
      const toSpawn = ended ? 0 : Math.min(newSpawns - prevSpawns, MAX_FLIES - movedFlies.length);
      const spawnedFlies = [...movedFlies];
      for (let i = 0; i < toSpawn && spawnedFlies.length < MAX_FLIES; i++) {
        const x = 0.05 + rngAt(state.rngSeed, counter++) * 0.9;
        const y = 0.05 + rngAt(state.rngSeed, counter++) * 0.65;
        const angle = rngAt(state.rngSeed, counter++) * Math.PI * 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        spawnedFlies.push({ id: nextId++, x, y, vx, vy });
      }

      // Animate tongue
      let tongue = state.tongue;
      let score = state.score;
      let flies = spawnedFlies;

      if (tongue) {
        if (!tongue.retracting) {
          const newProg = Math.min(1, tongue.progress + TONGUE_SPEED * action.dt);
          // Check hit at current tip
          const tipX = state.frog.x + (tongue.tx - state.frog.x) * newProg;
          const tipY = state.frog.y + (tongue.ty - state.frog.y) * newProg;
          let hit = false;
          const remaining = flies.filter((f) => {
            const dx = f.x - tipX;
            const dy = f.y - tipY;
            if (Math.sqrt(dx * dx + dy * dy) < HIT_RADIUS) { hit = true; return false; }
            return true;
          });
          if (hit) { score++; flies = remaining; tongue = null; }
          else tongue = newProg >= 1 ? { ...tongue, progress: 1, retracting: true } : { ...tongue, progress: newProg };
        } else {
          const newProg = Math.max(0, tongue.progress - TONGUE_SPEED * action.dt);
          tongue = newProg <= 0 ? null : { ...tongue, progress: newProg };
        }
      }

      return {
        ...state,
        flies,
        tongue,
        score,
        elapsed: ended ? duration : newElapsed,
        ended,
        rngCounter: counter,
        nextId,
      };
    }

    case "extend": {
      if (state.ended || state.tongue !== null) return state;
      return {
        ...state,
        tongue: { tx: action.tx, ty: action.ty, progress: 0, retracting: false },
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FrogCatcherState): { score: number } | null {
  if (!state.ended) return null;
  return { score: state.score };
}
