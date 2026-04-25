import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface IdleWizardSettings {
  spells: "10" | "25" | "50";
}

export interface IdleWizardState {
  settings: IdleWizardSettings;
  rngSeed: number;
  mana: number;
  spellsPower: number;
  apprentices: number;
  spellsCast: number;
  tomes: number; // multiply passive mana
  clicks: number;
  ticks: number;
  spellGoal: number;
  gameOver: boolean;
}

export type IdleWizardAction =
  | { type: "cast" }
  | { type: "hireApprentice" }
  | { type: "buyTome" }
  | { type: "tick" };

export function initialState(seed: number, settings: IdleWizardSettings): IdleWizardState {
  return {
    settings,
    rngSeed: seed >>> 0,
    mana: 0,
    spellsPower: 1,
    apprentices: 0,
    spellsCast: 0,
    tomes: 1,
    clicks: 0,
    ticks: 0,
    spellGoal: parseInt(settings.spells, 10),
    gameOver: false,
  };
}

export function apprenticeCost(apprentices: number): number {
  return 25 * Math.pow(2, apprentices);
}

export function tomeCost(tomes: number): number {
  return 60 * Math.pow(3, tomes - 1);
}

export function reducer(state: IdleWizardState, action: IdleWizardAction): IdleWizardState {
  if (state.gameOver) return state;

  if (action.type === "cast") {
    const rng = mulberry32(state.rngSeed + state.clicks);
    const crit = rng() < 0.1; // 10% critical spell
    const manaGained = state.spellsPower * state.tomes * (crit ? 2 : 1);
    const mana = state.mana + manaGained;
    const spellsCast = state.spellsCast + 1;
    const gameOver = spellsCast >= state.spellGoal;
    return { ...state, mana, spellsCast, clicks: state.clicks + 1, gameOver };
  }

  if (action.type === "hireApprentice") {
    const cost = apprenticeCost(state.apprentices);
    if (state.mana < cost) return state;
    return {
      ...state,
      mana: state.mana - cost,
      apprentices: state.apprentices + 1,
      spellsPower: state.spellsPower + 2,
    };
  }

  if (action.type === "buyTome") {
    const cost = tomeCost(state.tomes);
    if (state.mana < cost) return state;
    return {
      ...state,
      mana: state.mana - cost,
      tomes: state.tomes + 1,
    };
  }

  if (action.type === "tick") {
    if (state.apprentices === 0) return { ...state, ticks: state.ticks + 1 };
    const manaGained = state.apprentices * state.tomes;
    const mana = state.mana + manaGained;
    const spellsCast = state.spellsCast + state.apprentices;
    const gameOver = spellsCast >= state.spellGoal;
    return { ...state, mana, spellsCast, ticks: state.ticks + 1, gameOver };
  }

  return state;
}

export function isTerminal(state: IdleWizardState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.mana * 3 + state.tomes * 100 + state.apprentices * 50 };
}
