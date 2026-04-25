import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DragonEggHatchSettings {
  eggs: "3" | "5" | "7";
}

// Each egg has a hatch window (tick range) during which it should be tapped
export interface Egg {
  id: number;
  hatchStart: number; // tick when golden glow starts
  hatchEnd: number;   // tick when window closes
  hatched: boolean;
  missed: boolean;
  tapped: boolean;
  points: number;
}

export interface DragonEggHatchState {
  settings: DragonEggHuntSettings;
  eggs: Egg[];
  tick: number;        // game clock (advances via "tick" action)
  score: number;
  over: boolean;
  activeEggIndex: number; // which egg is currently "in play"
}

// Alias for backward compat in tests
export type DragonEggHuntSettings = DragonEggHatchSettings;

export type DragonEggHatchAction =
  | { type: "tick" }
  | { type: "tap"; eggId: number };

function makeEggs(seed: number, count: number): Egg[] {
  const rng = mulberry32(seed);
  const eggs: Egg[] = [];
  let cursor = 10;
  for (let i = 0; i < count; i++) {
    const windowSize = Math.floor(rng() * 10) + 8; // 8-17 ticks
    const gap = Math.floor(rng() * 8) + 6;         // 6-13 ticks gap
    eggs.push({
      id: i,
      hatchStart: cursor,
      hatchEnd: cursor + windowSize,
      hatched: false,
      missed: false,
      tapped: false,
      points: 100 + Math.floor(rng() * 200),
    });
    cursor += windowSize + gap;
  }
  return eggs;
}

export function initialState(seed: number, settings: DragonEggHatchSettings): DragonEggHatchState {
  const numEggs = parseInt(settings.eggs, 10);
  return {
    settings,
    eggs: makeEggs(seed, numEggs),
    tick: 0,
    score: 0,
    over: false,
    activeEggIndex: 0,
  };
}

export function reducer(state: DragonEggHatchState, action: DragonEggHatchAction): DragonEggHatchState {
  if (state.over) return state;

  if (action.type === "tick") {
    const tick = state.tick + 1;
    const eggs = state.eggs.map((egg) => {
      if (!egg.tapped && !egg.missed && tick > egg.hatchEnd) {
        return { ...egg, missed: true };
      }
      return egg;
    });
    const allDone = eggs.every(e => e.tapped || e.missed);
    return { ...state, tick, eggs, over: allDone };
  }

  if (action.type === "tap") {
    const eggs = state.eggs.map((egg) => {
      if (egg.id !== action.eggId || egg.tapped || egg.missed) return egg;
      const inWindow = state.tick >= egg.hatchStart && state.tick <= egg.hatchEnd;
      const timingBonus = inWindow
        ? Math.round(egg.points * (1 - (state.tick - egg.hatchStart) / (egg.hatchEnd - egg.hatchStart)))
        : 0;
      return { ...egg, tapped: true, hatched: inWindow, points: inWindow ? egg.points + timingBonus : 0 };
    });
    const score = eggs.reduce((s, e) => s + (e.hatched ? e.points : 0), 0);
    const allDone = eggs.every(e => e.tapped || e.missed);
    return { ...state, eggs, score, over: allDone };
  }

  return state;
}

export function isTerminal(state: DragonEggHatchState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
