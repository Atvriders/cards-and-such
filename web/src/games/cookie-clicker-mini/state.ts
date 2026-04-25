import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CookieClickerSettings {
  goal: "100" | "500" | "2000";
}

export interface CookieClickerState {
  settings: CookieClickerSettings;
  rngSeed: number;
  cookies: number;
  cps: number; // cookies per click from upgrades
  autoPerTick: number; // passive production
  upgrades: number; // number of upgrades purchased
  clicks: number;
  ticks: number;
  goal: number;
  gameOver: boolean;
}

export type CookieClickerAction =
  | { type: "click" }
  | { type: "upgrade" }
  | { type: "tick" };

export function initialState(seed: number, settings: CookieClickerSettings): CookieClickerState {
  return {
    settings,
    rngSeed: seed >>> 0,
    cookies: 0,
    cps: 1,
    autoPerTick: 0,
    upgrades: 0,
    clicks: 0,
    ticks: 0,
    goal: parseInt(settings.goal, 10),
    gameOver: false,
  };
}

function upgradeCost(currentUpgrades: number): number {
  return 10 * Math.pow(3, currentUpgrades);
}

export function reducer(state: CookieClickerState, action: CookieClickerAction): CookieClickerState {
  if (state.gameOver) return state;

  if (action.type === "click") {
    const gained = state.cps;
    const cookies = state.cookies + gained;
    const gameOver = cookies >= state.goal;
    // Use rng for slight variance: mulberry32 based small bonus
    const rng = mulberry32(state.rngSeed + state.clicks);
    const bonus = rng() < 0.05 ? gained : 0; // 5% double click
    return {
      ...state,
      cookies: cookies + bonus,
      clicks: state.clicks + 1,
      gameOver,
    };
  }

  if (action.type === "upgrade") {
    const cost = upgradeCost(state.upgrades);
    if (state.cookies < cost) return state;
    return {
      ...state,
      cookies: state.cookies - cost,
      cps: state.cps + 2,
      autoPerTick: state.autoPerTick + 1,
      upgrades: state.upgrades + 1,
    };
  }

  if (action.type === "tick") {
    if (state.autoPerTick === 0) return { ...state, ticks: state.ticks + 1 };
    const cookies = state.cookies + state.autoPerTick;
    const gameOver = cookies >= state.goal;
    return {
      ...state,
      cookies,
      ticks: state.ticks + 1,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: CookieClickerState): { score: number } | null {
  if (!state.gameOver) return null;
  // Score based on cookies earned relative to total clicks+ticks
  const total = state.clicks + state.ticks;
  return { score: Math.round(state.cookies + (total > 0 ? state.cookies / total * 100 : 0)) };
}

export function upgradeNextCost(state: CookieClickerState): number {
  return upgradeCost(state.upgrades);
}
