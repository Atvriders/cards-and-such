import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type FishSpecies = "clownfish" | "guppy" | "angelfish" | "tetra" | "betta";

export interface AquariumFish {
  species: FishSpecies;
  count: number;
  health: number;    // 0–100
  age: number;       // in days
}

export interface AquariumState {
  rngSeed: number;
  day: number;
  totalDays: number;
  water: number;       // 0–100 cleanliness
  food: number;        // 0–100 food level
  temperature: number; // 18–30 Celsius, ideal 24
  fish: AquariumFish[];
  score: number;
  phase: "playing" | "done";
  events: readonly string[];
}

const SPECIES_LIST: FishSpecies[] = ["clownfish", "guppy", "angelfish", "tetra", "betta"];

const SPECIES_INFO: Record<FishSpecies, { emoji: string; idealTemp: number; foodRate: number }> = {
  clownfish: { emoji: "🐠", idealTemp: 26, foodRate: 1.2 },
  guppy:     { emoji: "🐟", idealTemp: 24, foodRate: 0.8 },
  angelfish: { emoji: "🐡", idealTemp: 25, foodRate: 1.0 },
  tetra:     { emoji: "🐟", idealTemp: 24, foodRate: 0.7 },
  betta:     { emoji: "🐠", idealTemp: 27, foodRate: 1.1 },
};

function makeFish(): AquariumFish[] {
  return SPECIES_LIST.map(s => ({ species: s, count: 2, health: 80, age: 0 }));
}

export function initialState(seed: number): AquariumState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    day: 1,
    totalDays: 15,
    water: 80,
    food: 60,
    temperature: 24,
    fish: makeFish(),
    score: 0,
    phase: "playing",
    events: [],
  };
}

export type AquariumAction =
  | { type: "cleanWater" }
  | { type: "addFood"; amount: number }
  | { type: "adjustTemp"; delta: number }
  | { type: "addFish"; species: FishSpecies }
  | { type: "nextDay" };

export function reducer(state: AquariumState, action: AquariumAction): AquariumState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "cleanWater":
      return { ...state, water: Math.min(100, state.water + 30) };
    case "addFood":
      return { ...state, food: Math.min(100, state.food + action.amount) };
    case "adjustTemp":
      return { ...state, temperature: Math.max(18, Math.min(30, state.temperature + action.delta)) };
    case "addFish": {
      const newFish = state.fish.map(f =>
        f.species === action.species ? { ...f, count: Math.min(10, f.count + 1) } : f
      );
      return { ...state, fish: newFish };
    }

    case "nextDay": {
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);

      // environmental decay
      const newWater = Math.max(0, state.water - 10 - state.fish.reduce((s, f) => s + f.count, 0) * 0.5);
      const totalFoodRate = state.fish.reduce((s, f) => s + f.count * SPECIES_INFO[f.species].foodRate, 0);
      const newFood = Math.max(0, state.food - totalFoodRate);

      // fish health
      const events: string[] = [];
      const newFish = state.fish.map(f => {
        if (f.count === 0) return { ...f, age: f.age + 1 };
        const tempDiff = Math.abs(state.temperature - SPECIES_INFO[f.species].idealTemp);
        const tempPenalty = tempDiff * 3;
        const foodPenalty = newFood < 20 ? 15 : newFood < 40 ? 5 : 0;
        const waterPenalty = newWater < 20 ? 20 : newWater < 40 ? 8 : 0;
        const healthChange = -tempPenalty - foodPenalty - waterPenalty + 5;
        const newHealth = Math.max(0, Math.min(100, f.health + healthChange));
        let count = f.count;
        if (newHealth < 20 && rng() > 0.5) {
          count = Math.max(0, count - 1);
          events.push(`A ${f.species} died!`);
        }
        return { ...f, health: newHealth, count, age: f.age + 1 };
      });

      const totalFish = newFish.reduce((s, f) => s + f.count, 0);
      const avgHealth = totalFish > 0
        ? newFish.reduce((s, f) => s + f.health * f.count, 0) / totalFish
        : 0;
      const dayScore = Math.round(avgHealth / 10) * totalFish;
      const newDay = state.day + 1;
      const phase = newDay > state.totalDays ? "done" : "playing";

      return {
        ...state,
        rngSeed: nextSeed,
        day: newDay,
        water: newWater,
        food: newFood,
        fish: newFish,
        score: state.score + dayScore,
        events: events.length > 0 ? [...events] : state.events,
        phase,
      };
    }
  }
}

export function isTerminal(state: AquariumState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.min(100, Math.round(state.score / 30)) };
}
