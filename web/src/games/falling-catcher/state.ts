import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type ItemKind = "coin" | "star" | "bomb";

export interface FallingItem {
  id: number;
  kind: ItemKind;
  x: number;   // 0-1 normalized
  y: number;   // 0-1 normalized
  speed: number; // 0-1/s
}

export interface FallingCatcherState {
  settings: { difficulty: "easy" | "medium" | "hard" };
  basket: number; // 0-1 horizontal position
  items: readonly FallingItem[];
  score: number;
  lives: number;
  elapsed: number;
  ended: boolean;
  rngSeed: number;
  rngCounter: number;
  nextId: number;
}

export type FallingCatcherAction =
  | { type: "tick"; dt: number }
  | { type: "move"; x: number } // normalized 0-1
  | { type: "keyMove"; dir: "left" | "right" };

const BASKET_WIDTH = 0.14;
const BASKET_Y = 0.88;
const DURATION = 60;

const DIFFICULTY_CFG = {
  easy:   { spawnInterval: 1.0, baseSpeed: 0.18, bombChance: 0.1 },
  medium: { spawnInterval: 0.7, baseSpeed: 0.28, bombChance: 0.2 },
  hard:   { spawnInterval: 0.45, baseSpeed: 0.42, bombChance: 0.35 },
};

function rngAt(seed: number, counter: number): number {
  const rng = mulberry32(seed + counter * 1000003);
  return rng();
}

export function initialState(
  seed: number,
  settings: { difficulty: "easy" | "medium" | "hard" },
): FallingCatcherState {
  return {
    settings,
    basket: 0.5,
    items: [],
    score: 0,
    lives: 3,
    elapsed: 0,
    ended: false,
    rngSeed: seed,
    rngCounter: 0,
    nextId: 0,
  };
}

export function reducer(state: FallingCatcherState, action: FallingCatcherAction): FallingCatcherState {
  if (state.ended && action.type !== "tick") return state;

  switch (action.type) {
    case "move":
      return { ...state, basket: Math.max(0, Math.min(1, action.x)) };

    case "keyMove": {
      const dx = action.dir === "left" ? -0.05 : 0.05;
      return { ...state, basket: Math.max(0, Math.min(1, state.basket + dx)) };
    }

    case "tick": {
      if (state.ended) return state;
      const cfg = DIFFICULTY_CFG[state.settings.difficulty];
      const newElapsed = state.elapsed + action.dt;
      const timeEnded = newElapsed >= DURATION;

      // Move items down
      let movedItems = state.items.map((it) => ({ ...it, y: it.y + it.speed * action.dt }));

      // Detect catches/misses
      let score = state.score;
      let lives = state.lives;
      const remaining: FallingItem[] = [];

      for (const item of movedItems) {
        if (item.y >= BASKET_Y) {
          // Check if basket catches it
          const basketLeft = state.basket - BASKET_WIDTH / 2;
          const basketRight = state.basket + BASKET_WIDTH / 2;
          if (item.x >= basketLeft && item.x <= basketRight) {
            // Caught
            if (item.kind === "bomb") {
              lives = Math.max(0, lives - 1);
            } else {
              score += item.kind === "star" ? 3 : 1;
            }
          } else {
            // Missed — bombs that miss don't penalize
            if (item.kind !== "bomb") {
              // missed a good item — no penalty in this game
            }
          }
          // Item gone (off screen)
        } else {
          remaining.push(item);
        }
      }

      movedItems = remaining;

      const ended = timeEnded || lives <= 0;

      // Spawn new items
      let counter = state.rngCounter;
      let nextId = state.nextId;
      const prevSpawns = Math.floor(state.elapsed / cfg.spawnInterval);
      const newSpawns = Math.floor(newElapsed / cfg.spawnInterval);
      const toSpawn = ended ? 0 : newSpawns - prevSpawns;

      for (let i = 0; i < toSpawn; i++) {
        const x = 0.05 + rngAt(state.rngSeed, counter++) * 0.9;
        const bombRoll = rngAt(state.rngSeed, counter++);
        const kindRoll = rngAt(state.rngSeed, counter++);
        const kind: ItemKind = bombRoll < cfg.bombChance ? "bomb" : kindRoll < 0.3 ? "star" : "coin";
        const speed = cfg.baseSpeed + rngAt(state.rngSeed, counter++) * 0.1;
        movedItems.push({ id: nextId++, kind, x, y: 0, speed });
      }

      return {
        ...state,
        items: movedItems,
        score,
        lives,
        elapsed: timeEnded ? DURATION : newElapsed,
        ended,
        rngCounter: counter,
        nextId,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FallingCatcherState): { score: number } | null {
  if (!state.ended) return null;
  return { score: state.score };
}
