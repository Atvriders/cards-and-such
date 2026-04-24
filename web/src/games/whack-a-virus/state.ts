import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Virus {
  id: number;
  slot: number;   // 0..8 grid slot
  spawnTime: number;  // game elapsed when spawned
  duration: number;   // seconds it stays visible
  type: "normal" | "fast" | "bonus";
  whacked: boolean;
}

export interface WhackVirusState {
  settings: { slots: "9" | "16"; speed: "normal" | "fast" };
  viruses: Virus[];
  score: number;
  lives: number;
  elapsed: number;
  duration: number; // total game seconds
  over: boolean;
  rng: () => number;
  rngSeed: number;
  nextId: number;
  spawnTimer: number;
  slotCount: number;
}

export type WhackVirusAction =
  | { type: "tick"; dt: number }
  | { type: "whack"; id: number };

export function initialState(seed: number, s: { slots: "9" | "16"; speed: "normal" | "fast" }): WhackVirusState {
  const rng = mulberry32(seed);
  const slotCount = Number(s.slots);
  const spawnInterval = s.speed === "fast" ? 0.6 : 0.9;
  return {
    settings: s,
    viruses: [],
    score: 0,
    lives: 5,
    elapsed: 0,
    duration: 60,
    over: false,
    rng,
    rngSeed: seed,
    nextId: 0,
    spawnTimer: 0,
    slotCount,
  };
}

export function reducer(state: WhackVirusState, action: WhackVirusAction): WhackVirusState {
  switch (action.type) {
    case "whack": {
      if (state.over) return state;
      const virus = state.viruses.find((v) => v.id === action.id && !v.whacked);
      if (!virus) return state;
      const points = virus.type === "bonus" ? 30 : virus.type === "fast" ? 15 : 10;
      const viruses = state.viruses.map((v) => v.id === action.id ? { ...v, whacked: true } : v);
      return { ...state, viruses, score: state.score + points };
    }

    case "tick": {
      if (state.over) return state;
      const { dt } = action;
      const elapsed = state.elapsed + dt;

      // Remove expired viruses that weren't whacked → lose life
      let lives = state.lives;
      const viruses = state.viruses.filter((v) => {
        if (!v.whacked && elapsed > v.spawnTime + v.duration) {
          lives = Math.max(0, lives - 1);
          return false;
        }
        if (v.whacked && elapsed > v.spawnTime + v.duration + 0.2) return false; // clear whacked after brief delay
        return true;
      });

      // Spawn new viruses
      let { spawnTimer, nextId } = state;
      spawnTimer += dt;
      const spawnInterval = state.settings.speed === "fast" ? 0.6 : 0.9;
      const newViruses = [...viruses];

      if (spawnTimer >= spawnInterval) {
        spawnTimer -= spawnInterval;
        // Find empty slots
        const occupied = new Set(viruses.map((v) => v.slot));
        const free = Array.from({ length: state.slotCount }, (_, i) => i).filter((i) => !occupied.has(i));
        if (free.length > 0) {
          const slot = free[Math.floor(state.rng() * free.length)]!;
          const typeRoll = state.rng();
          const type: "normal" | "fast" | "bonus" = typeRoll < 0.1 ? "bonus" : typeRoll < 0.25 ? "fast" : "normal";
          const duration = type === "fast" ? 1.0 : type === "bonus" ? 2.5 : 1.8;
          newViruses.push({ id: nextId++, slot, spawnTime: elapsed, duration, type, whacked: false });
        }
      }

      const over = lives <= 0 || elapsed >= state.duration;
      return { ...state, viruses: newViruses, lives, elapsed, spawnTimer, nextId, over };
    }

    default:
      return state;
  }
}

export function isTerminal(state: WhackVirusState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
