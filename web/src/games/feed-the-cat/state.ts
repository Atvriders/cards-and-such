import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Feed the Cat: tap falling food items before they hit the ground

export type FoodType = "fish" | "milk" | "treat" | "kibble";

export interface FoodItem {
  id: number;
  type: FoodType;
  x: number;
  y: number;
  speed: number;
  points: number;
  caught: boolean;
  missed: boolean;
}

export interface FeedTheCatState {
  rngSeed: number;
  tick: number;
  maxTicks: number;
  hunger: number;
  score: number;
  items: FoodItem[];
  nextId: number;
  phase: "playing" | "done";
  catMood: "happy" | "okay" | "sad";
  spawnCooldown: number;
}

const FOOD_INFO: Record<FoodType, { points: number; speed: number; hungerRestore: number }> = {
  fish:   { points: 10, speed: 1.8, hungerRestore: 20 },
  milk:   { points: 5,  speed: 1.2, hungerRestore: 15 },
  treat:  { points: 20, speed: 2.5, hungerRestore: 10 },
  kibble: { points: 8,  speed: 1.5, hungerRestore: 12 },
};

const FOOD_TYPES: FoodType[] = ["fish", "milk", "treat", "kibble"];

function pickFoodType(rng: () => number): FoodType {
  return FOOD_TYPES[Math.floor(rng() * 4) % 4] ?? "fish";
}

export function initialState(seed: number): FeedTheCatState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    tick: 0,
    maxTicks: 300,
    hunger: 70,
    score: 0,
    items: [],
    nextId: 0,
    phase: "playing",
    catMood: "happy",
    spawnCooldown: 0,
  };
}

export type FeedAction =
  | { type: "tick" }
  | { type: "catch"; id: number };

export function reducer(state: FeedTheCatState, action: FeedAction): FeedTheCatState {
  if (state.phase === "done") return state;

  if (action.type === "catch") {
    const item = state.items.find(i => i.id === action.id && !i.caught && !i.missed);
    if (!item) return state;
    const info = FOOD_INFO[item.type];
    const newHunger = Math.min(100, state.hunger + info.hungerRestore);
    const newItems = state.items.map(i => i.id === action.id ? { ...i, caught: true } : i);
    return {
      ...state,
      items: newItems,
      score: state.score + info.points,
      hunger: newHunger,
      catMood: newHunger >= 60 ? "happy" : newHunger >= 30 ? "okay" : "sad",
    };
  }

  // tick
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const newTick = state.tick + 1;

  // move items down, detect misses
  let missCount = 0;
  const movedItems = state.items
    .filter(i => !i.caught)
    .map(item => {
      if (item.missed) return item;
      const newY = item.y + item.speed;
      if (newY >= 100) {
        missCount++;
        return { ...item, y: 100, missed: true };
      }
      return { ...item, y: newY };
    })
    .filter(i => !(i.missed));

  // spawn new food
  let spawnCd = state.spawnCooldown - 1;
  let nid = state.nextId;
  const spawnItems: FoodItem[] = [];
  if (spawnCd <= 0) {
    const rng2 = mulberry32(nextSeed);
    const type = pickFoodType(rng2);
    const info = FOOD_INFO[type];
    spawnItems.push({
      id: nid++,
      type,
      x: 10 + Math.floor(rng2() * 80),
      y: 0,
      speed: info.speed + rng2() * 0.5,
      points: info.points,
      caught: false,
      missed: false,
    });
    spawnCd = 12 + Math.floor(rng2() * 8);
  }

  const freshItems = [...movedItems, ...spawnItems];
  const newHunger = Math.max(0, state.hunger - missCount * 8 - 0.2);
  const phase = (newTick >= state.maxTicks || newHunger <= 0) ? "done" : "playing";

  return {
    ...state,
    rngSeed: nextSeed,
    tick: newTick,
    hunger: newHunger,
    items: freshItems,
    nextId: nid,
    spawnCooldown: spawnCd,
    catMood: newHunger >= 60 ? "happy" : newHunger >= 30 ? "okay" : "sad",
    phase,
  };
}

export function isTerminal(state: FeedTheCatState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.min(100, Math.round(state.score / 5)) };
}
