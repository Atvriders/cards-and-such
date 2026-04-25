import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface IdleBakerSettings {
  goal: "300" | "1500" | "8000";
}

export interface IdleBakerState {
  settings: IdleBakerSettings;
  rngSeed: number;
  pastries: number;
  bakePower: number;
  ovens: number;
  assistants: number;
  bakes: number;
  ticks: number;
  goal: number;
  gameOver: boolean;
}

export type IdleBakerAction =
  | { type: "bake" }
  | { type: "buyOven" }
  | { type: "hireAssistant" }
  | { type: "tick" };

export function initialState(seed: number, settings: IdleBakerSettings): IdleBakerState {
  return {
    settings,
    rngSeed: seed >>> 0,
    pastries: 0,
    bakePower: 1,
    ovens: 1,
    assistants: 0,
    bakes: 0,
    ticks: 0,
    goal: parseInt(settings.goal, 10),
    gameOver: false,
  };
}

export function ovenCost(ovens: number): number {
  return 35 * Math.pow(2, ovens - 1);
}

export function assistantCost(assistants: number): number {
  return 22 * Math.pow(2, assistants);
}

export function reducer(state: IdleBakerState, action: IdleBakerAction): IdleBakerState {
  if (state.gameOver) return state;

  if (action.type === "bake") {
    const rng = mulberry32(state.rngSeed + state.bakes);
    const perfect = rng() < 0.07 ? state.bakePower * state.ovens : 0;
    const gained = state.bakePower * state.ovens + perfect;
    const pastries = state.pastries + gained;
    const gameOver = pastries >= state.goal;
    return { ...state, pastries, bakes: state.bakes + 1, gameOver };
  }

  if (action.type === "buyOven") {
    const cost = ovenCost(state.ovens);
    if (state.pastries < cost) return state;
    return {
      ...state,
      pastries: state.pastries - cost,
      ovens: state.ovens + 1,
    };
  }

  if (action.type === "hireAssistant") {
    const cost = assistantCost(state.assistants);
    if (state.pastries < cost) return state;
    return {
      ...state,
      pastries: state.pastries - cost,
      assistants: state.assistants + 1,
      bakePower: state.bakePower + 1,
    };
  }

  if (action.type === "tick") {
    const passive = state.assistants * state.ovens;
    if (passive === 0) return { ...state, ticks: state.ticks + 1 };
    const pastries = state.pastries + passive;
    const gameOver = pastries >= state.goal;
    return { ...state, pastries, ticks: state.ticks + 1, gameOver };
  }

  return state;
}

export function isTerminal(state: IdleBakerState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.pastries * 3 + state.ovens * 50 + state.assistants * 30 };
}
