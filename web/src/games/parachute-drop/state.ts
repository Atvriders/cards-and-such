import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ParachuteDropSettings {
  wind: "none" | "light" | "strong";
  lives: "3" | "5" | "7";
}

export interface Parachutist {
  id: number;
  x: number;
  y: number;
  vy: number;
  vx: number;
}

export interface ParachuteDropState {
  settings: ParachuteDropSettings;
  zone: number;       // 0..1, center of landing zone
  zoneW: number;      // width of landing zone
  parachutists: readonly Parachutist[];
  score: number;
  lives: number;
  over: boolean;
  elapsed: number;
  rngSeed: number;
  rngCounter: number;
  nextId: number;
}

export type ParachuteDropAction =
  | { type: "tick"; dt: number }
  | { type: "move"; x: number };

const BASE_VY = 0.12;
const SPAWN_INTERVAL = 1.6;

function windDrift(wind: ParachuteDropSettings["wind"]): number {
  return wind === "none" ? 0 : wind === "light" ? 0.04 : 0.09;
}

function rngAt(seed: number, counter: number): number {
  return mulberry32(seed + counter * 999983)();
}

export function initialState(seed: number, settings: ParachuteDropSettings): ParachuteDropState {
  return {
    settings,
    zone: 0.5,
    zoneW: 0.14,
    parachutists: [],
    score: 0,
    lives: parseInt(settings.lives, 10),
    over: false,
    elapsed: 0,
    rngSeed: seed,
    rngCounter: 0,
    nextId: 0,
  };
}

export function reducer(state: ParachuteDropState, action: ParachuteDropAction): ParachuteDropState {
  if (state.over) return state;

  switch (action.type) {
    case "move": {
      const x = Math.max(state.zoneW / 2, Math.min(1 - state.zoneW / 2, action.x));
      return { ...state, zone: x };
    }

    case "tick": {
      const { dt } = action;
      const drift = windDrift(state.settings.wind);
      const newElapsed = state.elapsed + dt;
      let counter = state.rngCounter;
      let nextId = state.nextId;
      let score = state.score;
      let lives = state.lives;

      // Move parachutists
      let ps: Parachutist[] = state.parachutists.map((p) => ({
        ...p,
        x: Math.max(0.01, Math.min(0.99, p.x + p.vx * dt)),
        y: p.y + p.vy * dt,
      }));

      // Spawn
      const prev = Math.floor(state.elapsed / SPAWN_INTERVAL);
      const curr = Math.floor(newElapsed / SPAWN_INTERVAL);
      if (curr > prev) {
        const x = 0.1 + rngAt(state.rngSeed, counter++) * 0.8;
        const windSign = rngAt(state.rngSeed, counter++) < 0.5 ? 1 : -1;
        const vx = drift * windSign * (0.5 + rngAt(state.rngSeed, counter++) * 0.5);
        ps.push({ id: nextId++, x, y: -0.05, vy: BASE_VY + rngAt(state.rngSeed, counter++) * 0.06, vx });
      }

      // Check landing (ground at y >= 0.88)
      const surviving: Parachutist[] = [];
      for (const p of ps) {
        if (p.y >= 0.88) {
          if (Math.abs(p.x - state.zone) < state.zoneW / 2) {
            score += 1;
          } else {
            lives -= 1;
          }
        } else {
          surviving.push(p);
        }
      }

      const over = lives <= 0;
      return { ...state, parachutists: surviving, score, lives, over, elapsed: newElapsed, rngCounter: counter, nextId };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ParachuteDropState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
