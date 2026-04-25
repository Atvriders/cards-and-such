import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AntFarmSettings {
  difficulty: "easy" | "normal" | "hard";
}

export type AntRole = "worker" | "soldier" | "nurse";

export interface AntFarmState {
  settings: AntFarmSettings;
  rng: () => number;
  turn: number;
  maxTurns: number;
  food: number;
  population: number;
  workers: number;
  soldiers: number;
  nurses: number;
  tunnels: number;
  threats: number;
  score: number;
  over: boolean;
  log: string;
}

export type AntFarmAction =
  | { type: "recruit"; role: AntRole }
  | { type: "dig" }
  | { type: "end-turn" };

function diffMult(d: string): number {
  return d === "easy" ? 1.3 : d === "hard" ? 0.7 : 1.0;
}

export function initialState(seed: number, settings: AntFarmSettings): AntFarmState {
  void mulberry32(seed);
  return {
    settings,
    rng: mulberry32(seed + 1),
    turn: 1,
    maxTurns: 20,
    food: 20,
    population: 10,
    workers: 5,
    soldiers: 2,
    nurses: 3,
    tunnels: 1,
    threats: 0,
    score: 0,
    over: false,
    log: "Your ant colony awakens! Assign roles, dig tunnels, and survive 20 turns.",
  };
}

export function reducer(state: AntFarmState, action: AntFarmAction): AntFarmState {
  if (state.over) return state;

  if (action.type === "recruit") {
    if (state.food < 3) return { ...state, log: "Not enough food to recruit (cost: 3 food)." };
    const role = action.role;
    return {
      ...state,
      food: state.food - 3,
      population: state.population + 1,
      workers: role === "worker" ? state.workers + 1 : state.workers,
      soldiers: role === "soldier" ? state.soldiers + 1 : state.soldiers,
      nurses: role === "nurse" ? state.nurses + 1 : state.nurses,
      log: `Recruited a new ${role}!`,
    };
  }

  if (action.type === "dig") {
    if (state.food < 5) return { ...state, log: "Not enough food to dig (cost: 5 food)." };
    return {
      ...state,
      food: state.food - 5,
      tunnels: state.tunnels + 1,
      log: `Tunnel dug! Tunnels: ${state.tunnels + 1}. Tunnels boost worker efficiency.`,
    };
  }

  if (action.type === "end-turn") {
    const mult = diffMult(state.settings.difficulty);
    // Production
    const foodGained = Math.round(state.workers * 3 * mult + state.tunnels * 1);
    // Consumption
    const foodConsumed = Math.ceil(state.population * 0.8);
    // Nurse effect: heal / grow
    const growth = state.nurses > 2 ? Math.floor(state.nurses / 3) : 0;
    // Threat event
    const threatRoll = state.rng();
    const newThreat = threatRoll < 0.3 ? Math.floor(threatRoll * 10 + 1) : 0;
    const survived = state.soldiers >= newThreat;
    const casualties = survived ? 0 : Math.floor((newThreat - state.soldiers) / 2) + 1;

    const newFood = state.food + foodGained - foodConsumed;
    const newPop = Math.max(0, state.population + growth - casualties);
    const workers = Math.max(0, state.workers - Math.floor(casualties * 0.4));
    const soldiers = Math.max(0, state.soldiers - Math.floor(casualties * 0.3));
    const nurses = Math.max(0, state.nurses - Math.floor(casualties * 0.3));
    const threats = state.threats + (newThreat > 0 ? 1 : 0);
    const turn = state.turn + 1;
    const died = newFood <= 0 || newPop <= 0;
    const finished = turn > state.maxTurns;
    const over = died || finished;
    const score = over
      ? Math.round(newPop * 50 + state.tunnels * 30 + Math.max(0, newFood) * 2)
      : 0;

    let log = "";
    if (newThreat > 0) {
      log += survived
        ? `Threat repelled! (threat ${newThreat}, soldiers ${state.soldiers}). `
        : `Threat too strong! ${casualties} ants lost. `;
    }
    if (died) log += newFood <= 0 ? "Colony starved!" : "Colony wiped out!";
    else if (finished) log += `Colony survived ${state.maxTurns} turns!`;
    else log += `Turn ${turn}: food ${Math.round(newFood)}, pop ${newPop}.`;

    return {
      ...state,
      turn,
      food: Math.max(0, newFood),
      population: newPop,
      workers,
      soldiers,
      nurses,
      threats,
      score,
      over,
      log,
    };
  }

  return state;
}

export function isTerminal(state: AntFarmState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
