import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface LeafBlowerSettings {
  difficulty: "easy" | "normal" | "hard";
}

export interface Leaf {
  id: number;
  x: number;      // 0–100 (percent)
  y: number;      // 0–100 (percent)
  speed: number;  // pixels/tick as percent of screen height per second
  size: number;   // 1=small 2=medium 3=large
  caught: boolean;
  fallen: boolean;
  emoji: string;
}

export interface LeafBlowerState {
  settings: LeafBlowerSettings;
  rngSeed: number;
  leaves: Leaf[];
  nextId: number;
  score: number;
  combo: number;
  maxCombo: number;
  missed: number;
  timeLeft: number;       // milliseconds remaining
  lastTickTime: number;   // ms timestamp of last tick
  gameOver: boolean;
  totalCaught: number;
}

export type LeafBlowerAction =
  | { type: "catch"; id: number }
  | { type: "tick"; deltaMs: number }
  | { type: "restart" };

const LEAF_EMOJIS = ["🍂", "🍁", "🌿", "🍃", "🌾"];

const SPEED_BY_DIFF: Record<string, { base: number; var: number; spawnRate: number }> = {
  easy:   { base: 8, var: 4, spawnRate: 0.8 },
  normal: { base: 12, var: 6, spawnRate: 1.2 },
  hard:   { base: 18, var: 8, spawnRate: 1.8 },
};

function makeLeaf(id: number, rng: () => number, diff: string): Leaf {
  const cfg = SPEED_BY_DIFF[diff] ?? SPEED_BY_DIFF["normal"]!;
  return {
    id,
    x: rng() * 90 + 5,
    y: -5,
    speed: cfg.base + rng() * cfg.var,
    size: Math.ceil(rng() * 3) as 1 | 2 | 3,
    caught: false,
    fallen: false,
    emoji: LEAF_EMOJIS[Math.floor(rng() * LEAF_EMOJIS.length)]!,
  };
}

export function initialState(seed: number, settings: LeafBlowerSettings): LeafBlowerState {
  return {
    settings,
    rngSeed: seed >>> 0,
    leaves: [],
    nextId: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    missed: 0,
    timeLeft: 60000,
    lastTickTime: 0,
    gameOver: false,
    totalCaught: 0,
  };
}

export function reducer(state: LeafBlowerState, action: LeafBlowerAction): LeafBlowerState {
  if (action.type === "restart") {
    return initialState(state.rngSeed + 1, state.settings);
  }

  if (state.gameOver) return state;

  if (action.type === "catch") {
    const leaf = state.leaves.find(l => l.id === action.id);
    if (!leaf || leaf.caught || leaf.fallen) return state;
    const combo = state.combo + 1;
    const maxCombo = Math.max(state.maxCombo, combo);
    const pts = leaf.size * 10 * Math.max(1, Math.floor(combo / 3) + 1);
    const newLeaves = state.leaves.map(l =>
      l.id === action.id ? { ...l, caught: true } : l
    );
    return {
      ...state,
      leaves: newLeaves,
      score: state.score + pts,
      combo,
      maxCombo,
      totalCaught: state.totalCaught + 1,
    };
  }

  if (action.type === "tick") {
    const dt = Math.min(action.deltaMs, 200) / 1000; // seconds, capped at 200ms
    const timeLeft = Math.max(0, state.timeLeft - action.deltaMs);
    const gameOver = timeLeft <= 0;
    const cfg = SPEED_BY_DIFF[state.settings.difficulty] ?? SPEED_BY_DIFF["normal"]!;

    // Advance leaves
    let missed = state.missed;
    let combo = state.combo;
    const newLeaves: Leaf[] = state.leaves
      .filter(l => !l.caught)
      .map(l => {
        const newY = l.y + l.speed * dt;
        if (newY >= 105 && !l.fallen) {
          missed++;
          combo = 0;
          return { ...l, y: newY, fallen: true };
        }
        return { ...l, y: newY };
      })
      .filter(l => l.y < 120);

    // Spawn new leaves
    let { rngSeed, nextId } = state;
    const rng = mulberry32(rngSeed);
    const spawnProb = cfg.spawnRate * dt;
    let spawned: Leaf[] = [];
    if (rng() < spawnProb) {
      const rng2 = mulberry32((rngSeed + 1) >>> 0);
      spawned = [makeLeaf(nextId, rng2, state.settings.difficulty)];
      nextId++;
      rngSeed = ((rngSeed + 12345) * 1664525 + 1013904223) >>> 0;
    } else {
      rngSeed = (rngSeed + 1) >>> 0;
    }

    return {
      ...state,
      leaves: [...newLeaves, ...spawned],
      nextId,
      rngSeed,
      missed,
      combo,
      maxCombo: Math.max(state.maxCombo, combo),
      timeLeft,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: LeafBlowerState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.score };
}
