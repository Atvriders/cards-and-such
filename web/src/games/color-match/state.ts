import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ColorMatchState {
  settings: { duration: "30" | "60"; speed: "slow" | "medium" | "fast" };
  targetColor: string;
  currentColor: string;
  colorIndex: number; // index into color sequence
  elapsed: number;
  colorElapsed: number; // time on current color
  score: number;
  misses: number;
  ended: boolean;
  rngSeed: number;
  rngCounter: number;
}

export type ColorMatchAction =
  | { type: "tick"; dt: number }
  | { type: "tap" };

const COLORS = [
  "#e53e3e", // red
  "#3182ce", // blue
  "#38a169", // green
  "#d69e2e", // yellow
  "#805ad5", // purple
  "#dd6b20", // orange
  "#319795", // teal
  "#e91e63", // pink
];

const SPEED_INTERVAL = {
  slow: 1.5,
  medium: 0.8,
  fast: 0.4,
};

function rngAt(seed: number, counter: number): number {
  const rng = mulberry32(seed + counter * 1000003);
  return rng();
}

function pickColor(seed: number, counter: number, exclude?: string): string {
  let color: string;
  let tries = 0;
  do {
    const idx = Math.floor(rngAt(seed, counter + tries) * COLORS.length);
    color = COLORS[idx]!;
    tries++;
  } while (color === exclude && tries < 5);
  return color;
}

export function initialState(
  seed: number,
  settings: { duration: "30" | "60"; speed: "slow" | "medium" | "fast" },
): ColorMatchState {
  const rng = mulberry32(seed);
  const targetIdx = Math.floor(rng() * COLORS.length);
  const currentIdx = Math.floor(rng() * COLORS.length);
  return {
    settings,
    targetColor: COLORS[targetIdx]!,
    currentColor: COLORS[currentIdx]!,
    colorIndex: 0,
    elapsed: 0,
    colorElapsed: 0,
    score: 0,
    misses: 0,
    ended: false,
    rngSeed: seed,
    rngCounter: 2,
  };
}

export function reducer(state: ColorMatchState, action: ColorMatchAction): ColorMatchState {
  if (state.ended) return state;

  switch (action.type) {
    case "tick": {
      const duration = parseInt(state.settings.duration, 10);
      const interval = SPEED_INTERVAL[state.settings.speed];
      const newElapsed = state.elapsed + action.dt;
      if (newElapsed >= duration) {
        return { ...state, elapsed: duration, ended: true };
      }

      let colorElapsed = state.colorElapsed + action.dt;
      let colorIndex = state.colorIndex;
      let counter = state.rngCounter;
      let currentColor = state.currentColor;

      if (colorElapsed >= interval) {
        colorElapsed -= interval;
        colorIndex++;
        counter++;
        currentColor = pickColor(state.rngSeed, counter);
      }

      return {
        ...state,
        elapsed: newElapsed,
        colorElapsed,
        colorIndex,
        currentColor,
        rngCounter: counter,
      };
    }

    case "tap": {
      if (state.ended) return state;
      if (state.currentColor === state.targetColor) {
        return { ...state, score: state.score + 1 };
      } else {
        return { ...state, score: Math.max(0, state.score - 1), misses: state.misses + 1 };
      }
    }

    default:
      return state;
  }
}

export function isTerminal(state: ColorMatchState): { score: number } | null {
  if (!state.ended) return null;
  return { score: state.score };
}
