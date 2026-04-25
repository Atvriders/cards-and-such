import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FishFeederSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface Fish {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;   // 0.02 .. 0.12 (normalized)
  isPlayer: false;
}

export interface PlayerFish {
  x: number;
  y: number;
  size: number;
  isPlayer: true;
}

export interface FishFeederState {
  settings: FishFeederSettings;
  player: PlayerFish;
  fishes: readonly Fish[];
  score: number;
  over: boolean;
  elapsed: number;
  rngSeed: number;
  rngCounter: number;
  nextId: number;
}

export type FishFeederAction =
  | { type: "tick"; dt: number }
  | { type: "move"; x: number; y: number };

const MAX_FISH = 12;

function difficultyScale(d: FishFeederSettings["difficulty"]): number {
  return d === "easy" ? 0.7 : d === "hard" ? 1.4 : 1.0;
}

function rngAt(seed: number, counter: number): number {
  return mulberry32(seed + counter * 1000003)();
}

function spawnFish(seed: number, counter: number, playerSize: number, scale: number): { fish: Fish; counter: number } {
  const id = counter;
  const x = rngAt(seed, counter++) < 0.5 ? -0.06 : 1.06;
  const y = 0.1 + rngAt(seed, counter++) * 0.8;
  const vx = (0.08 + rngAt(seed, counter++) * 0.12) * scale * (x < 0.5 ? 1 : -1);
  const vy = (rngAt(seed, counter++) - 0.5) * 0.06 * scale;
  const sizeRaw = 0.025 + rngAt(seed, counter++) * 0.1;
  // Make sure some are smaller and some larger than player
  const size = sizeRaw;
  return { fish: { id, x, y, vx, vy, size, isPlayer: false }, counter };
}

export function initialState(seed: number, settings: FishFeederSettings): FishFeederState {
  const scale = difficultyScale(settings.difficulty);
  let counter = 0;
  const fishes: Fish[] = [];
  for (let i = 0; i < 6; i++) {
    const result = spawnFish(seed, counter, 0.045, scale);
    fishes.push(result.fish);
    counter = result.counter;
  }
  return {
    settings,
    player: { x: 0.5, y: 0.5, size: 0.045, isPlayer: true },
    fishes,
    score: 0,
    over: false,
    elapsed: 0,
    rngSeed: seed,
    rngCounter: counter,
    nextId: fishes.length,
  };
}

export function reducer(state: FishFeederState, action: FishFeederAction): FishFeederState {
  if (state.over) return state;

  switch (action.type) {
    case "move": {
      const x = Math.max(0.01, Math.min(0.99, action.x));
      const y = Math.max(0.01, Math.min(0.99, action.y));
      return { ...state, player: { ...state.player, x, y } };
    }

    case "tick": {
      const { dt } = action;
      const scale = difficultyScale(state.settings.difficulty);
      const newElapsed = state.elapsed + dt;
      let counter = state.rngCounter;
      let nextId = state.nextId;
      let score = state.score;
      let playerSize = state.player.size;
      let over = false;

      // Move fishes
      let fishes: Fish[] = state.fishes.map((f) => ({
        ...f,
        x: f.x + f.vx * dt,
        y: Math.max(0.02, Math.min(0.98, f.y + f.vy * dt)),
      }));

      // Remove off-screen
      fishes = fishes.filter((f) => f.x > -0.12 && f.x < 1.12);

      // Collision detection
      const player = state.player;
      const survivors: Fish[] = [];
      for (const f of fishes) {
        const dx = f.x - player.x;
        const dy = f.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const combinedR = (f.size + player.size) * 0.5;
        if (dist < combinedR * 0.75) {
          if (f.size < playerSize) {
            // Eat it
            score += Math.max(1, Math.floor(f.size * 100));
            playerSize = Math.min(0.18, playerSize + f.size * 0.08);
          } else {
            // Bigger fish eats us
            over = true;
            survivors.push(f);
          }
        } else {
          survivors.push(f);
        }
      }

      // Spawn more fish if needed
      while (survivors.length < MAX_FISH) {
        const result = spawnFish(state.rngSeed, counter, playerSize, scale);
        survivors.push(result.fish);
        counter = result.counter;
        nextId = Math.max(nextId, result.fish.id + 1);
      }

      return {
        ...state,
        player: { ...player, size: playerSize },
        fishes: survivors,
        score,
        over,
        elapsed: newElapsed,
        rngCounter: counter,
        nextId,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FishFeederState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
