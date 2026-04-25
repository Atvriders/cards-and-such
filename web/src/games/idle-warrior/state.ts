import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface IdleWarriorSettings {
  enemies: "20" | "50" | "100";
}

export interface IdleWarriorState {
  settings: IdleWarriorSettings;
  rngSeed: number;
  gold: number;
  attackPower: number;
  soldiers: number;
  enemiesDefeated: number;
  targetEnemies: number;
  strikes: number;
  ticks: number;
  gameOver: boolean;
}

export type IdleWarriorAction =
  | { type: "strike" }
  | { type: "recruit" }
  | { type: "train" }
  | { type: "tick" };

export function initialState(seed: number, settings: IdleWarriorSettings): IdleWarriorState {
  return {
    settings,
    rngSeed: seed >>> 0,
    gold: 0,
    attackPower: 1,
    soldiers: 0,
    enemiesDefeated: 0,
    targetEnemies: parseInt(settings.enemies, 10),
    strikes: 0,
    ticks: 0,
    gameOver: false,
  };
}

export function recruitCost(soldiers: number): number {
  return 30 * Math.pow(2, soldiers);
}

export function trainCost(attackPower: number): number {
  return 10 * Math.pow(2, attackPower - 1);
}

export function reducer(state: IdleWarriorState, action: IdleWarriorAction): IdleWarriorState {
  if (state.gameOver) return state;

  if (action.type === "strike") {
    const rng = mulberry32(state.rngSeed + state.strikes);
    const crit = rng() < 0.15;
    const dmg = state.attackPower * (crit ? 3 : 1);
    const gold = state.gold + dmg;
    const enemiesDefeated = Math.min(state.enemiesDefeated + dmg, state.targetEnemies);
    const gameOver = enemiesDefeated >= state.targetEnemies;
    return { ...state, gold, enemiesDefeated, strikes: state.strikes + 1, gameOver };
  }

  if (action.type === "recruit") {
    const cost = recruitCost(state.soldiers);
    if (state.gold < cost) return state;
    return {
      ...state,
      gold: state.gold - cost,
      soldiers: state.soldiers + 1,
    };
  }

  if (action.type === "train") {
    const cost = trainCost(state.attackPower);
    if (state.gold < cost) return state;
    return {
      ...state,
      gold: state.gold - cost,
      attackPower: state.attackPower + 1,
    };
  }

  if (action.type === "tick") {
    if (state.soldiers === 0) return { ...state, ticks: state.ticks + 1 };
    const dmg = state.soldiers * state.attackPower;
    const gold = state.gold + dmg;
    const enemiesDefeated = Math.min(state.enemiesDefeated + state.soldiers, state.targetEnemies);
    const gameOver = enemiesDefeated >= state.targetEnemies;
    return { ...state, gold, enemiesDefeated, ticks: state.ticks + 1, gameOver };
  }

  return state;
}

export function isTerminal(state: IdleWarriorState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.gold * 5 + state.soldiers * 40 + state.attackPower * 20 };
}
