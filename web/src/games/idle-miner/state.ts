import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface IdleMinerSettings {
  depth: "10" | "25" | "50";
}

export interface IdleMinerState {
  settings: IdleMinerSettings;
  rngSeed: number;
  gold: number;
  depth: number; // current mine depth reached
  targetDepth: number;
  pickaxePower: number; // ore per dig
  autoMiners: number;
  ticks: number;
  digs: number;
  gameOver: boolean;
}

export type IdleMinerAction =
  | { type: "dig" }
  | { type: "hire" }
  | { type: "tick" };

export function initialState(seed: number, settings: IdleMinerSettings): IdleMinerState {
  return {
    settings,
    rngSeed: seed >>> 0,
    gold: 0,
    depth: 0,
    targetDepth: parseInt(settings.depth, 10),
    pickaxePower: 1,
    autoMiners: 0,
    ticks: 0,
    digs: 0,
    gameOver: false,
  };
}

function hireCost(autoMiners: number): number {
  return 15 * Math.pow(2, autoMiners);
}

export function reducer(state: IdleMinerState, action: IdleMinerAction): IdleMinerState {
  if (state.gameOver) return state;

  if (action.type === "dig") {
    const rng = mulberry32(state.rngSeed + state.digs);
    const bonus = rng() < 0.1 ? state.pickaxePower * 2 : 0; // 10% rich vein
    const earned = state.pickaxePower + bonus;
    const gold = state.gold + earned;
    const depth = Math.min(state.depth + 1, state.targetDepth);
    const gameOver = depth >= state.targetDepth;
    return {
      ...state,
      gold,
      depth,
      digs: state.digs + 1,
      gameOver,
    };
  }

  if (action.type === "hire") {
    const cost = hireCost(state.autoMiners);
    if (state.gold < cost) return state;
    return {
      ...state,
      gold: state.gold - cost,
      autoMiners: state.autoMiners + 1,
      pickaxePower: state.pickaxePower + 1,
    };
  }

  if (action.type === "tick") {
    if (state.autoMiners === 0) return { ...state, ticks: state.ticks + 1 };
    const earned = state.autoMiners;
    const gold = state.gold + earned;
    const depth = Math.min(state.depth + state.autoMiners, state.targetDepth);
    const gameOver = depth >= state.targetDepth;
    return {
      ...state,
      gold,
      depth,
      ticks: state.ticks + 1,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: IdleMinerState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.gold * 10 + state.depth * 5 };
}

export function getHireCost(state: IdleMinerState): number {
  return hireCost(state.autoMiners);
}
