import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_SEASONS = 4;
export const DAYS_PER_SEASON = 6;

export type Resource = "berries" | "mushrooms" | "roots" | "nuts";
export type Season = "spring" | "summer" | "autumn" | "winter";
export type Phase = "forage" | "camp" | "done";

const SEASON_ORDER: Season[] = ["spring", "summer", "autumn", "winter"];

export interface ForagerState {
  rngSeed: number;
  seasonIdx: number;
  day: number;
  phase: Phase;
  energy: number;
  food: number;
  cache: Record<Resource, number>;
  lastHaul: Record<Resource, number>;
  log: readonly string[];
}

export type ForagerAction =
  | { type: "forage"; resource: Resource }
  | { type: "rest" }
  | { type: "nextDay" };

export const RESOURCES: Record<Resource, { label: string; seasons: Season[]; baseYield: number; energyCost: number }> = {
  berries:   { label: "Berries",   seasons: ["spring", "summer"],         baseYield: 8,  energyCost: 2 },
  mushrooms: { label: "Mushrooms", seasons: ["summer", "autumn"],         baseYield: 5,  energyCost: 3 },
  roots:     { label: "Roots",     seasons: ["spring", "autumn", "winter"], baseYield: 4, energyCost: 4 },
  nuts:      { label: "Nuts",      seasons: ["autumn"],                   baseYield: 10, energyCost: 3 },
};

const EMPTY_CACHE: Record<Resource, number> = { berries: 0, mushrooms: 0, roots: 0, nuts: 0 };

export function initialState(seed: number): ForagerState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    seasonIdx: 0,
    day: 1,
    phase: "forage",
    energy: 10,
    food: 10,
    cache: { ...EMPTY_CACHE },
    lastHaul: { ...EMPTY_CACHE },
    log: [],
  };
}

export function reducer(state: ForagerState, action: ForagerAction): ForagerState {
  if (state.phase === "done") return state;
  const season: Season = SEASON_ORDER[state.seasonIdx] ?? "spring";

  switch (action.type) {
    case "forage": {
      if (state.phase !== "forage") return state;
      const info = RESOURCES[action.resource];
      if (state.energy < info.energyCost) return state;
      const inSeason = info.seasons.includes(season);
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const mult = inSeason ? 1.0 : 0.3;
      const yield_ = Math.max(0, Math.round(info.baseYield * mult * (0.6 + rng() * 0.8)));
      const newCache = { ...state.cache, [action.resource]: state.cache[action.resource] + yield_ };
      const newHaul = { ...EMPTY_CACHE, [action.resource]: yield_ };
      const log = `${season} day ${state.day}: Gathered ${yield_} ${info.label}${!inSeason ? " (off-season, low yield)" : ""}.`;
      return {
        ...state,
        rngSeed: nextSeed,
        energy: state.energy - info.energyCost,
        cache: newCache,
        lastHaul: newHaul,
        phase: "camp",
        log: [...state.log, log],
      };
    }

    case "rest": {
      if (state.phase !== "forage") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      return {
        ...state,
        rngSeed: nextSeed,
        energy: Math.min(10, state.energy + 4),
        lastHaul: { ...EMPTY_CACHE },
        phase: "camp",
        log: [...state.log, `${season} day ${state.day}: Rested. Energy restored.`],
      };
    }

    case "nextDay": {
      if (state.phase !== "camp") return state;
      // consume 1 food per day
      const newFood = state.food - 1 + Math.floor((state.cache.berries + state.cache.mushrooms + state.cache.roots + state.cache.nuts) / 10);
      const consumedCache: Record<Resource, number> = {
        berries: Math.max(0, state.cache.berries - 1),
        mushrooms: Math.max(0, state.cache.mushrooms - 1),
        roots: Math.max(0, state.cache.roots - 1),
        nuts: Math.max(0, state.cache.nuts - 1),
      };

      const isLastDay = state.day >= DAYS_PER_SEASON;
      const isLastSeason = state.seasonIdx >= TOTAL_SEASONS - 1;

      if (isLastDay && isLastSeason) {
        return { ...state, food: newFood, cache: consumedCache, phase: "done" };
      }
      if (isLastDay) {
        return {
          ...state,
          food: newFood,
          cache: consumedCache,
          seasonIdx: state.seasonIdx + 1,
          day: 1,
          energy: Math.min(10, state.energy + 3),
          phase: "forage",
        };
      }
      return {
        ...state,
        food: newFood,
        cache: consumedCache,
        day: state.day + 1,
        energy: Math.min(10, state.energy + 2),
        phase: "forage",
      };
    }
  }
}

export function isTerminal(state: ForagerState): { score: number } | null {
  if (state.phase !== "done") return null;
  const totalCache = Object.values(state.cache).reduce((a, b) => a + b, 0);
  return { score: Math.max(0, Math.min(100, Math.round((totalCache + state.food) / 1.5))) };
}
