import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface GemClickerSettings {
  goal: "250" | "1000" | "5000";
}

export interface GemClickerState {
  settings: GemClickerSettings;
  rngSeed: number;
  gems: number;
  clickPower: number;
  miners: number;
  refineries: number; // multiply passive output
  clicks: number;
  ticks: number;
  goal: number;
  gameOver: boolean;
}

export type GemClickerAction =
  | { type: "click" }
  | { type: "hireMiner" }
  | { type: "buildRefinery" }
  | { type: "tick" };

export function initialState(seed: number, settings: GemClickerSettings): GemClickerState {
  return {
    settings,
    rngSeed: seed >>> 0,
    gems: 0,
    clickPower: 1,
    miners: 0,
    refineries: 1,
    clicks: 0,
    ticks: 0,
    goal: parseInt(settings.goal, 10),
    gameOver: false,
  };
}

export function minerCost(miners: number): number {
  return 15 * Math.pow(2, miners);
}

export function refineryCost(refineries: number): number {
  return 75 * Math.pow(3, refineries - 1);
}

export function reducer(state: GemClickerState, action: GemClickerAction): GemClickerState {
  if (state.gameOver) return state;

  if (action.type === "click") {
    const rng = mulberry32(state.rngSeed + state.clicks);
    const jackpot = rng() < 0.05 ? state.clickPower * 4 : 0;
    const gained = state.clickPower * state.refineries + jackpot;
    const gems = state.gems + gained;
    const gameOver = gems >= state.goal;
    return { ...state, gems, clicks: state.clicks + 1, gameOver };
  }

  if (action.type === "hireMiner") {
    const cost = minerCost(state.miners);
    if (state.gems < cost) return state;
    return {
      ...state,
      gems: state.gems - cost,
      miners: state.miners + 1,
      clickPower: state.clickPower + 1,
    };
  }

  if (action.type === "buildRefinery") {
    const cost = refineryCost(state.refineries);
    if (state.gems < cost) return state;
    return {
      ...state,
      gems: state.gems - cost,
      refineries: state.refineries + 1,
    };
  }

  if (action.type === "tick") {
    if (state.miners === 0) return { ...state, ticks: state.ticks + 1 };
    const gained = state.miners * state.refineries;
    const gems = state.gems + gained;
    const gameOver = gems >= state.goal;
    return { ...state, gems, ticks: state.ticks + 1, gameOver };
  }

  return state;
}

export function isTerminal(state: GemClickerState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.gems * 4 + state.miners * 25 + state.refineries * 75 };
}
