import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Seesaw Balance: drop weighted balls onto the seesaw to keep it level.

export interface SeesawBalanceSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface Ball {
  id: number;
  weight: number; // 1..5
  side: "left" | "right";
}

export interface SeesawBalanceState {
  settings: SeesawBalanceSettings;
  rngSeed: number;
  angle: number;      // degrees, negative = left tilt, positive = right tilt
  angularVelocity: number;
  leftWeight: number;
  rightWeight: number;
  score: number;
  round: number;
  maxRounds: number;
  pendingBall: Ball | null;
  placed: readonly Ball[];
  over: boolean;
  message: string;
}

export type SeesawBalanceAction =
  | { type: "tick"; dt: number }
  | { type: "placeLeft" }
  | { type: "placeRight" }
  | { type: "next" };

const MAX_ANGLE = 45;
const TILT_LOSS = 35;
const GRAVITY_FACTOR: Record<string, number> = { easy: 0.3, medium: 0.6, hard: 1.0 };

function nextRng(seed: number): { val: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const val = rng();
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { val, nextSeed };
}

function makeBall(seed: number, id: number): { ball: Ball; nextSeed: number } {
  const r1 = nextRng(seed);
  const weight = Math.floor(r1.val * 5) + 1;
  const r2 = nextRng(r1.nextSeed);
  const side = r2.val < 0.5 ? "left" : "right";
  return { ball: { id, weight, side }, nextSeed: r2.nextSeed };
}

export function initialState(seed: number, settings: SeesawBalanceSettings): SeesawBalanceState {
  const { ball: firstBall, nextSeed } = makeBall(seed, 1);
  return {
    settings,
    rngSeed: nextSeed,
    angle: 0,
    angularVelocity: 0,
    leftWeight: 0,
    rightWeight: 0,
    score: 0,
    round: 1,
    maxRounds: 10,
    pendingBall: firstBall,
    placed: [],
    over: false,
    message: "",
  };
}

export function reducer(state: SeesawBalanceState, action: SeesawBalanceAction): SeesawBalanceState {
  if (state.over) return state;

  switch (action.type) {
    case "placeLeft":
    case "placeRight": {
      if (!state.pendingBall) return state;
      const side: "left" | "right" = action.type === "placeLeft" ? "left" : "right";
      const ball: Ball = { ...state.pendingBall, side };
      const leftWeight = state.leftWeight + (side === "left" ? ball.weight : 0);
      const rightWeight = state.rightWeight + (side === "right" ? ball.weight : 0);
      const placed = [...state.placed, ball];

      // Score based on how balanced it is
      const diff = Math.abs(leftWeight - rightWeight);
      const roundScore = Math.max(0, 10 - diff * 2);

      return {
        ...state,
        leftWeight,
        rightWeight,
        placed,
        pendingBall: null,
        score: state.score + roundScore,
        message: diff === 0 ? "Perfect balance!" : diff <= 2 ? "Close!" : "Off balance",
      };
    }

    case "next": {
      if (state.pendingBall) return state;
      const nextRound = state.round + 1;
      if (nextRound > state.maxRounds) {
        return { ...state, over: true };
      }
      const { ball, nextSeed } = makeBall(state.rngSeed, nextRound);
      return {
        ...state,
        rngSeed: nextSeed,
        round: nextRound,
        pendingBall: ball,
        message: "",
      };
    }

    case "tick": {
      const { dt } = action;
      const grav = GRAVITY_FACTOR[state.settings.difficulty] ?? 0.6;
      const netTorque = (state.rightWeight - state.leftWeight) * grav;
      let av = state.angularVelocity + netTorque * dt * 30;
      av *= 0.95; // damping
      let angle = state.angle + av * dt * 60;
      angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, angle));

      if (Math.abs(angle) >= TILT_LOSS) {
        return { ...state, angle, angularVelocity: av, over: true };
      }
      return { ...state, angle, angularVelocity: av };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SeesawBalanceState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
