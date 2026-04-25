import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface IdleBlacksmithSettings {
  goal: "200" | "1000" | "5000";
}

export interface IdleBlacksmithState {
  settings: IdleBlacksmithSettings;
  rngSeed: number;
  iron: number;
  forgePower: number;
  helpers: number;
  anvils: number; // each anvil adds a passive forge per tick
  forges: number;
  ticks: number;
  goal: number;
  gameOver: boolean;
}

export type IdleBlacksmithAction =
  | { type: "forge" }
  | { type: "hireHelper" }
  | { type: "buyAnvil" }
  | { type: "tick" };

export function initialState(seed: number, settings: IdleBlacksmithSettings): IdleBlacksmithState {
  return {
    settings,
    rngSeed: seed >>> 0,
    iron: 0,
    forgePower: 2,
    helpers: 0,
    anvils: 0,
    forges: 0,
    ticks: 0,
    goal: parseInt(settings.goal, 10),
    gameOver: false,
  };
}

export function helperCost(helpers: number): number {
  return 18 * Math.pow(2, helpers);
}

export function anvilCost(anvils: number): number {
  return 80 * Math.pow(2, anvils);
}

export function reducer(state: IdleBlacksmithState, action: IdleBlacksmithAction): IdleBlacksmithState {
  if (state.gameOver) return state;

  if (action.type === "forge") {
    const rng = mulberry32(state.rngSeed + state.forges);
    const masterwork = rng() < 0.06 ? state.forgePower * 2 : 0;
    const gained = state.forgePower + masterwork;
    const iron = state.iron + gained;
    const gameOver = iron >= state.goal;
    return { ...state, iron, forges: state.forges + 1, gameOver };
  }

  if (action.type === "hireHelper") {
    const cost = helperCost(state.helpers);
    if (state.iron < cost) return state;
    return {
      ...state,
      iron: state.iron - cost,
      helpers: state.helpers + 1,
      forgePower: state.forgePower + 2,
    };
  }

  if (action.type === "buyAnvil") {
    const cost = anvilCost(state.anvils);
    if (state.iron < cost) return state;
    return {
      ...state,
      iron: state.iron - cost,
      anvils: state.anvils + 1,
    };
  }

  if (action.type === "tick") {
    const passive = state.helpers + state.anvils * 2;
    if (passive === 0) return { ...state, ticks: state.ticks + 1 };
    const iron = state.iron + passive;
    const gameOver = iron >= state.goal;
    return { ...state, iron, ticks: state.ticks + 1, gameOver };
  }

  return state;
}

export function isTerminal(state: IdleBlacksmithState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.iron * 4 + state.helpers * 30 + state.anvils * 60 };
}
