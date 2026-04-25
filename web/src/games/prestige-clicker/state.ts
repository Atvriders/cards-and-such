// Prestige Clicker: reach the prestige goal, then prestige to multiply future runs

export interface PrestigeClickerSettings {
  prestigeGoal: "1000" | "5000" | "25000";
}

export interface PrestigeClickerState {
  settings: PrestigeClickerSettings;
  rngSeed: number;
  points: number;
  clickPower: number;
  autoClickers: number;
  prestiges: number; // each prestige multiplies click power
  prestigeGoal: number;
  totalEarned: number;
  clicks: number;
  ticks: number;
  gameOver: boolean;
}

export type PrestigeClickerAction =
  | { type: "click" }
  | { type: "buyAutoClicker" }
  | { type: "prestige" }
  | { type: "tick" };

export function initialState(seed: number, settings: PrestigeClickerSettings): PrestigeClickerState {
  return {
    settings,
    rngSeed: seed >>> 0,
    points: 0,
    clickPower: 1,
    autoClickers: 0,
    prestiges: 0,
    prestigeGoal: parseInt(settings.prestigeGoal, 10),
    totalEarned: 0,
    clicks: 0,
    ticks: 0,
    gameOver: false,
  };
}

export function autoClickerCost(autoClickers: number): number {
  return 25 * Math.pow(2, autoClickers);
}

export function prestigeMultiplier(prestiges: number): number {
  return Math.pow(2, prestiges);
}

export function reducer(state: PrestigeClickerState, action: PrestigeClickerAction): PrestigeClickerState {
  if (state.gameOver) return state;

  if (action.type === "click") {
    const gained = state.clickPower * prestigeMultiplier(state.prestiges);
    const points = state.points + gained;
    const totalEarned = state.totalEarned + gained;
    // Win after 3 prestiges
    const gameOver = state.prestiges >= 3 && points >= state.prestigeGoal;
    return { ...state, points, totalEarned, clicks: state.clicks + 1, gameOver };
  }

  if (action.type === "buyAutoClicker") {
    const cost = autoClickerCost(state.autoClickers);
    if (state.points < cost) return state;
    return {
      ...state,
      points: state.points - cost,
      autoClickers: state.autoClickers + 1,
    };
  }

  if (action.type === "prestige") {
    // Can only prestige if at goal and haven't won yet
    if (state.points < state.prestigeGoal) return state;
    const newPrestiges = state.prestiges + 1;
    const gameOver = newPrestiges >= 3 && state.points >= state.prestigeGoal;
    return {
      ...state,
      points: 0,
      clickPower: state.clickPower + 2,
      autoClickers: 0,
      prestiges: newPrestiges,
      gameOver,
    };
  }

  if (action.type === "tick") {
    if (state.autoClickers === 0) return { ...state, ticks: state.ticks + 1 };
    const gained = state.autoClickers * prestigeMultiplier(state.prestiges);
    const points = state.points + gained;
    const totalEarned = state.totalEarned + gained;
    const gameOver = state.prestiges >= 3 && points >= state.prestigeGoal;
    return { ...state, points, totalEarned, ticks: state.ticks + 1, gameOver };
  }

  return state;
}

export function isTerminal(state: PrestigeClickerState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.round(state.totalEarned / 10 + state.prestiges * 500) };
}
