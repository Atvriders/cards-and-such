import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AcrobatFlipSettings {
  flips: "5" | "8" | "12";
}

export type FlipPhase = "spinning" | "landed";
export type LandQuality = "perfect" | "good" | "ok" | "miss";

export interface AcrobatFlipState {
  settings: AcrobatFlipSettings;
  flipNum: number;
  totalFlips: number;
  angle: number;       // 0-359
  targetAngle: number; // best landing zone center
  quality: LandQuality | null;
  score: number;
  history: LandQuality[];
  gameOver: boolean;
  message: string;
  rngSeed: number;
}

export type AcrobatFlipAction =
  | { type: "land" }
  | { type: "nextFlip" }
  | { type: "restart" };

const QUALITY_POINTS: Record<LandQuality, number> = {
  perfect: 100,
  good: 60,
  ok: 30,
  miss: 0,
};

function getQuality(angle: number, target: number): LandQuality {
  const diff = Math.abs(((angle - target + 180) % 360) - 180);
  if (diff <= 10) return "perfect";
  if (diff <= 25) return "good";
  if (diff <= 45) return "ok";
  return "miss";
}

function nextTarget(rng: () => number): number {
  return Math.floor(rng() * 360);
}

export function initialState(seed: number, settings: AcrobatFlipSettings): AcrobatFlipState {
  const rng = mulberry32(seed);
  const target = nextTarget(rng);
  const startAngle = Math.floor(rng() * 360);
  return {
    settings,
    flipNum: 1,
    totalFlips: parseInt(settings.flips, 10),
    angle: startAngle,
    targetAngle: target,
    quality: null,
    score: 0,
    history: [],
    gameOver: false,
    message: "Press Land when the arrow points to the gold zone!",
    rngSeed: seed,
  };
}

export function reducer(state: AcrobatFlipState, action: AcrobatFlipAction): AcrobatFlipState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (action.type === "land" && !state.gameOver && state.quality === null) {
    const quality = getQuality(state.angle, state.targetAngle);
    const pts = QUALITY_POINTS[quality];
    return {
      ...state,
      quality,
      score: state.score + pts,
      history: [...state.history, quality],
      message: quality === "perfect" ? "PERFECT LANDING! +100" :
                quality === "good" ? "Good! +60" :
                quality === "ok" ? "Ok... +30" : "Missed! +0",
    };
  }
  if (action.type === "nextFlip" && state.quality !== null) {
    const newFlipNum = state.flipNum + 1;
    if (newFlipNum > state.totalFlips) {
      return { ...state, flipNum: newFlipNum, gameOver: true, message: `All flips done! Score: ${state.score}` };
    }
    const rng = mulberry32(state.rngSeed + newFlipNum * 41);
    const target = nextTarget(rng);
    const startAngle = Math.floor(rng() * 360);
    return {
      ...state,
      flipNum: newFlipNum,
      angle: startAngle,
      targetAngle: target,
      quality: null,
      message: "Press Land when the arrow points to the gold zone!",
    };
  }
  if (action.type === "nextFlip" && state.quality === null) {
    // advance angle by a tick
    const newAngle = (state.angle + 17) % 360;
    return { ...state, angle: newAngle };
  }
  return state;
}

export function isTerminal(state: AcrobatFlipState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.min(1000, state.score) };
}
