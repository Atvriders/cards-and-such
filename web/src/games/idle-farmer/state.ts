import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface IdleFarmerSettings {
  goal: "500" | "2000" | "10000";
}

export interface IdleFarmerState {
  settings: IdleFarmerSettings;
  rngSeed: number;
  crops: number;
  harvestPower: number;
  autoFarmers: number;
  fields: number; // unlocked fields multiply passive rate
  upgrades: number;
  harvests: number;
  ticks: number;
  goal: number;
  gameOver: boolean;
}

export type IdleFarmerAction =
  | { type: "harvest" }
  | { type: "buyFarmer" }
  | { type: "buyField" }
  | { type: "tick" };

export function initialState(seed: number, settings: IdleFarmerSettings): IdleFarmerState {
  return {
    settings,
    rngSeed: seed >>> 0,
    crops: 0,
    harvestPower: 2,
    autoFarmers: 0,
    fields: 1,
    upgrades: 0,
    harvests: 0,
    ticks: 0,
    goal: parseInt(settings.goal, 10),
    gameOver: false,
  };
}

export function farmerCost(autoFarmers: number): number {
  return 20 * Math.pow(2, autoFarmers);
}

export function fieldCost(fields: number): number {
  return 50 * Math.pow(3, fields - 1);
}

export function reducer(state: IdleFarmerState, action: IdleFarmerAction): IdleFarmerState {
  if (state.gameOver) return state;

  if (action.type === "harvest") {
    const rng = mulberry32(state.rngSeed + state.harvests);
    const bonus = rng() < 0.08 ? state.harvestPower : 0; // 8% bumper crop
    const gained = state.harvestPower * state.fields + bonus;
    const crops = state.crops + gained;
    const gameOver = crops >= state.goal;
    return { ...state, crops, harvests: state.harvests + 1, gameOver };
  }

  if (action.type === "buyFarmer") {
    const cost = farmerCost(state.autoFarmers);
    if (state.crops < cost) return state;
    return {
      ...state,
      crops: state.crops - cost,
      autoFarmers: state.autoFarmers + 1,
      harvestPower: state.harvestPower + 1,
    };
  }

  if (action.type === "buyField") {
    const cost = fieldCost(state.fields);
    if (state.crops < cost) return state;
    return {
      ...state,
      crops: state.crops - cost,
      fields: state.fields + 1,
    };
  }

  if (action.type === "tick") {
    if (state.autoFarmers === 0) return { ...state, ticks: state.ticks + 1 };
    const earned = state.autoFarmers * state.fields;
    const crops = state.crops + earned;
    const gameOver = crops >= state.goal;
    return { ...state, crops, ticks: state.ticks + 1, gameOver };
  }

  return state;
}

export function isTerminal(state: IdleFarmerState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.crops * 5 + state.fields * 50 + state.autoFarmers * 20 };
}
