import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Trampoline Bounce: keep the jumper airborne by timing trampoline bounces.

export interface TrampolineBounceSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface TrampolineBounceState {
  settings: TrampolineBounceSettings;
  rngSeed: number;
  jumperY: number;     // 0 = top, 1 = trampoline level
  jumperVy: number;    // velocity, positive = falling
  score: number;       // number of successful bounces
  lives: number;
  bounceWindowOpen: boolean; // true when jumper is near trampoline
  missedBounce: boolean;
  over: boolean;
  highestY: number;    // track peak for height bonus
}

export type TrampolineBounceAction =
  | { type: "tick"; dt: number }
  | { type: "bounce" }
  | { type: "start" };

const GRAVITY: Record<string, number> = { easy: 1.2, medium: 1.8, hard: 2.6 };
const BOUNCE_POWER: Record<string, number> = { easy: 1.8, medium: 2.0, hard: 2.4 };
const TRAMPOLINE_Y = 0.9;
const WINDOW_SIZE = 0.12;

export function initialState(seed: number, settings: TrampolineBounceSettings): TrampolineBounceState {
  return {
    settings,
    rngSeed: seed,
    jumperY: TRAMPOLINE_Y,
    jumperVy: 0,
    score: 0,
    lives: 3,
    bounceWindowOpen: false,
    missedBounce: false,
    over: false,
    highestY: TRAMPOLINE_Y,
  };
}

export function reducer(state: TrampolineBounceState, action: TrampolineBounceAction): TrampolineBounceState {
  if (state.over) return state;

  switch (action.type) {
    case "start": {
      if (state.jumperVy !== 0) return state;
      const power = BOUNCE_POWER[state.settings.difficulty] ?? 2.0;
      return { ...state, jumperVy: -power, missedBounce: false };
    }

    case "bounce": {
      if (!state.bounceWindowOpen) {
        // Early/late press - miss
        const newLives = state.lives - 1;
        return { ...state, lives: newLives, over: newLives <= 0, missedBounce: true };
      }
      const power = BOUNCE_POWER[state.settings.difficulty] ?? 2.0;
      // Bonus power based on score
      const bonusPower = Math.min(0.5, state.score * 0.02);
      return {
        ...state,
        jumperVy: -(power + bonusPower),
        score: state.score + 1,
        bounceWindowOpen: false,
        missedBounce: false,
      };
    }

    case "tick": {
      const { dt } = action;
      const grav = GRAVITY[state.settings.difficulty] ?? 1.8;
      let { jumperY, jumperVy, lives, score, rngSeed, highestY } = state;

      jumperVy += grav * dt;
      jumperY += jumperVy * dt;

      // Track peak height
      if (jumperY < highestY) highestY = jumperY;

      // Near trampoline?
      const bounceWindowOpen = jumperY >= TRAMPOLINE_Y - WINDOW_SIZE && jumperVy > 0;

      // Jumper hits floor below trampoline = fail
      if (jumperY >= TRAMPOLINE_Y + 0.05 && jumperVy > 0) {
        lives -= 1;
        if (lives <= 0) {
          return { ...state, over: true, lives: 0, jumperY: TRAMPOLINE_Y };
        }
        // Re-serve
        const r = mulberry32(rngSeed);
        rngSeed = Math.floor(r() * 2 ** 31);
        return {
          ...state,
          jumperY: TRAMPOLINE_Y,
          jumperVy: 0,
          lives,
          rngSeed,
          bounceWindowOpen: false,
          highestY: TRAMPOLINE_Y,
        };
      }

      return { ...state, jumperY, jumperVy, bounceWindowOpen, lives, score, rngSeed, highestY };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TrampolineBounceState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { TRAMPOLINE_Y, WINDOW_SIZE };
