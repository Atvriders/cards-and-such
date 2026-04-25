import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Flavor = "vanilla" | "chocolate" | "strawberry" | "mint" | "caramel";
export type Weather = "sunny" | "cloudy" | "hot" | "rainy";
export type Phase = "plan" | "results" | "done";

export interface IceCreamState {
  rngSeed: number;
  day: number;
  totalDays: number;
  cash: number;
  weather: Weather;
  nextWeather: Weather;
  phase: Phase;
  scoops: Record<Flavor, number>;  // how many scoops to prepare
  price: Record<Flavor, number>;   // price per scoop
  sold: Record<Flavor, number>;
  lastRevenue: number;
  lastCost: number;
  lastProfit: number;
  cones: number;         // cone inventory
  toppingsLevel: number; // 0-3 upgrades
  log: readonly string[];
}

const FLAVORS: Flavor[] = ["vanilla", "chocolate", "strawberry", "mint", "caramel"];

const FLAVOR_INFO: Record<Flavor, { cost: number; baseDemand: number; maxPrice: number }> = {
  vanilla:    { cost: 0.5, baseDemand: 30, maxPrice: 6 },
  chocolate:  { cost: 0.7, baseDemand: 28, maxPrice: 7 },
  strawberry: { cost: 0.8, baseDemand: 22, maxPrice: 7 },
  mint:       { cost: 0.6, baseDemand: 18, maxPrice: 8 },
  caramel:    { cost: 0.9, baseDemand: 15, maxPrice: 9 },
};

const WEATHER_MULTIPLIER: Record<Weather, number> = {
  sunny: 1.2, hot: 1.5, cloudy: 0.9, rainy: 0.5,
};

const WEATHERS: Weather[] = ["sunny", "cloudy", "hot", "rainy"];

function randomWeather(rng: () => number): Weather {
  const weights = [40, 25, 20, 15];
  const roll = rng() * 100;
  let acc = 0;
  for (let i = 0; i < WEATHERS.length; i++) {
    acc += weights[i] ?? 0;
    const w = WEATHERS[i];
    if (roll < acc && w !== undefined) return w;
  }
  return "sunny";
}

function makeDefaultScoops(): Record<Flavor, number> {
  return { vanilla: 20, chocolate: 15, strawberry: 10, mint: 8, caramel: 5 };
}
function makeDefaultPrice(): Record<Flavor, number> {
  return { vanilla: 3, chocolate: 3, strawberry: 4, mint: 4, caramel: 5 };
}
function makeSold(): Record<Flavor, number> {
  return { vanilla: 0, chocolate: 0, strawberry: 0, mint: 0, caramel: 0 };
}

export function initialState(seed: number): IceCreamState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  const weather = randomWeather(rng);
  const nextWeather = randomWeather(rng2);
  return {
    rngSeed: nextSeed,
    day: 1,
    totalDays: 20,
    cash: 150,
    weather,
    nextWeather,
    phase: "plan",
    scoops: makeDefaultScoops(),
    price: makeDefaultPrice(),
    sold: makeSold(),
    lastRevenue: 0,
    lastCost: 0,
    lastProfit: 0,
    cones: 100,
    toppingsLevel: 0,
    log: [],
  };
}

export type IceCreamAction =
  | { type: "setScoops"; flavor: Flavor; value: number }
  | { type: "setPrice"; flavor: Flavor; value: number }
  | { type: "buyToppings" }
  | { type: "openStand" }
  | { type: "nextDay" };

export function reducer(state: IceCreamState, action: IceCreamAction): IceCreamState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "setScoops":
      if (state.phase !== "plan") return state;
      return { ...state, scoops: { ...state.scoops, [action.flavor]: Math.max(0, Math.min(40, action.value)) } };
    case "setPrice":
      if (state.phase !== "plan") return state;
      return { ...state, price: { ...state.price, [action.flavor]: Math.max(1, Math.min(FLAVOR_INFO[action.flavor].maxPrice, action.value)) } };
    case "buyToppings":
      if (state.phase !== "plan" || state.toppingsLevel >= 3 || state.cash < 40) return state;
      return { ...state, toppingsLevel: state.toppingsLevel + 1, cash: state.cash - 40 };

    case "openStand": {
      if (state.phase !== "plan") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const rng2 = mulberry32(nextSeed);
      const weatherMult = WEATHER_MULTIPLIER[state.weather];
      const toppingBoost = 1 + state.toppingsLevel * 0.1;
      const sold: Record<Flavor, number> = makeSold();
      let revenue = 0;
      let cost = 0;
      for (const flavor of FLAVORS) {
        const info = FLAVOR_INFO[flavor];
        const priceEffect = Math.max(0.1, 1.5 - state.price[flavor] / info.maxPrice);
        const demand = info.baseDemand * priceEffect * weatherMult * toppingBoost;
        const noise = 0.6 + rng() * 0.8;
        const s = Math.min(state.scoops[flavor], Math.max(0, Math.round(demand * noise)));
        sold[flavor] = s;
        revenue += s * state.price[flavor];
        cost += state.scoops[flavor] * info.cost;
      }
      const profit = Math.round(revenue - cost);
      const nextWeather = randomWeather(rng2);
      const log = `Day ${state.day} (${state.weather}): $${revenue} revenue, profit $${profit >= 0 ? "+" : ""}${profit}`;
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "results",
        sold,
        lastRevenue: Math.round(revenue),
        lastCost: Math.round(cost),
        lastProfit: profit,
        cash: state.cash + profit,
        nextWeather,
        log: [...state.log, log],
      };
    }

    case "nextDay": {
      if (state.phase !== "results") return state;
      if (state.day >= state.totalDays) return { ...state, phase: "done" };
      return { ...state, day: state.day + 1, phase: "plan", weather: state.nextWeather };
    }
  }
}

export function isTerminal(state: IceCreamState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 800) * 100))) };
}
