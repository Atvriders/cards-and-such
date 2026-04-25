import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface GoldRushIdleSettings {
  nuggets: "100" | "500" | "2500";
}

export interface GoldRushIdleState {
  settings: GoldRushIdleSettings;
  rngSeed: number;
  nuggets: number;
  panPower: number;
  prospectors: number;
  claims: number; // each claim adds multiplier
  pans: number;
  ticks: number;
  goal: number;
  gameOver: boolean;
}

export type GoldRushIdleAction =
  | { type: "pan" }
  | { type: "hireProspector" }
  | { type: "stakeClaim" }
  | { type: "tick" };

export function initialState(seed: number, settings: GoldRushIdleSettings): GoldRushIdleState {
  return {
    settings,
    rngSeed: seed >>> 0,
    nuggets: 0,
    panPower: 1,
    prospectors: 0,
    claims: 1,
    pans: 0,
    ticks: 0,
    goal: parseInt(settings.nuggets, 10),
    gameOver: false,
  };
}

export function prospectorCost(prospectors: number): number {
  return 20 * Math.pow(2, prospectors);
}

export function claimCost(claims: number): number {
  return 60 * Math.pow(2, claims - 1);
}

export function reducer(state: GoldRushIdleState, action: GoldRushIdleAction): GoldRushIdleState {
  if (state.gameOver) return state;

  if (action.type === "pan") {
    const rng = mulberry32(state.rngSeed + state.pans);
    const strike = rng() < 0.08 ? state.panPower * state.claims * 2 : 0;
    const gained = state.panPower * state.claims + strike;
    const nuggets = state.nuggets + gained;
    const gameOver = nuggets >= state.goal;
    return { ...state, nuggets, pans: state.pans + 1, gameOver };
  }

  if (action.type === "hireProspector") {
    const cost = prospectorCost(state.prospectors);
    if (state.nuggets < cost) return state;
    return {
      ...state,
      nuggets: state.nuggets - cost,
      prospectors: state.prospectors + 1,
      panPower: state.panPower + 1,
    };
  }

  if (action.type === "stakeClaim") {
    const cost = claimCost(state.claims);
    if (state.nuggets < cost) return state;
    return {
      ...state,
      nuggets: state.nuggets - cost,
      claims: state.claims + 1,
    };
  }

  if (action.type === "tick") {
    if (state.prospectors === 0) return { ...state, ticks: state.ticks + 1 };
    const gained = state.prospectors * state.claims;
    const nuggets = state.nuggets + gained;
    const gameOver = nuggets >= state.goal;
    return { ...state, nuggets, ticks: state.ticks + 1, gameOver };
  }

  return state;
}

export function isTerminal(state: GoldRushIdleState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.nuggets * 4 + state.prospectors * 30 + state.claims * 60 };
}
