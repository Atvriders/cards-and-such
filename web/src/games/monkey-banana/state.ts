import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Monkey Banana: Bananas fall from random x positions. Click them before they fall off screen.
// Missed bananas cost 1 life (3 lives). 30 second game. Each banana caught = 10 pts.
// Faster bananas worth more.

export interface MonkeyBananaSettings {
  duration: "20" | "30" | "45";
}

export interface Banana {
  id: number;
  x: number;      // 0-100
  y: number;      // 0-100 (increases over time)
  speed: number;  // points/tick
  points: number;
}

export interface MonkeyBananaState {
  bananas: Banana[];
  score: number;
  caught: number;
  missed: number;
  lives: number;
  timeLeft: number;
  nextId: number;
  phase: "playing" | "gameover";
  rngSeed: number;
}

export type MonkeyBananaAction =
  | { type: "catch"; id: number }
  | { type: "tick" }
  | { type: "spawn" };

export function initialState(seed: number, settings: MonkeyBananaSettings): MonkeyBananaState {
  const rng = mulberry32(seed);
  const first: Banana = { id: 0, x: Math.floor(rng() * 85) + 5, y: 5, speed: 8, points: 10 };
  return { bananas: [first], score: 0, caught: 0, missed: 0, lives: 3, timeLeft: parseInt(settings.duration, 10), nextId: 1, phase: "playing", rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: MonkeyBananaState, action: MonkeyBananaAction): MonkeyBananaState {
  if (state.phase === "gameover") return state;
  if (action.type === "catch") {
    const banana = state.bananas.find(b => b.id === action.id);
    if (!banana) return state;
    return { ...state, bananas: state.bananas.filter(b => b.id !== action.id), score: state.score + banana.points, caught: state.caught + 1 };
  }
  if (action.type === "spawn") {
    const rng = mulberry32(state.rngSeed);
    const speed = Math.floor(rng() * 8) + 5;
    const pts = speed >= 10 ? 20 : 10;
    const newBanana: Banana = { id: state.nextId, x: Math.floor(rng() * 85) + 5, y: 5, speed: pts, points: pts };
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, bananas: [...state.bananas.slice(-5), newBanana], nextId: state.nextId + 1, rngSeed: nextSeed };
  }
  if (action.type === "tick") {
    // Move bananas down, remove fallen ones
    const moved = state.bananas.map(b => ({ ...b, y: b.y + b.speed }));
    const fallen = moved.filter(b => b.y >= 100);
    const remaining = moved.filter(b => b.y < 100);
    const newMissed = state.missed + fallen.length;
    const newLives = state.lives - fallen.length;
    const newTime = state.timeLeft - 1;
    if (newLives <= 0 || newTime <= 0) {
      return { ...state, bananas: remaining, missed: newMissed, lives: Math.max(0, newLives), timeLeft: Math.max(0, newTime), phase: "gameover" };
    }
    return { ...state, bananas: remaining, missed: newMissed, lives: newLives, timeLeft: newTime };
  }
  return state;
}

export function isTerminal(state: MonkeyBananaState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
