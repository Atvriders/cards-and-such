import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_DAYS = 30;

export type Meal = "burger" | "pizza" | "salad" | "pasta";
export type Phase = "plan" | "results" | "done";

export interface RestaurantState {
  rngSeed: number;
  day: number;
  cash: number;
  phase: Phase;
  staff: number;          // 1-5 staff members (each costs $20/day)
  menuPrice: number;      // price per meal in dollars (5-30)
  marketing: number;      // marketing spend per day (0-50)
  featuredMeal: Meal;
  lastCustomers: number;
  lastRevenue: number;
  lastCosts: number;
  lastProfit: number;
  reputation: number;     // 0-100, affects base demand
  log: readonly string[];
}

export type RestaurantAction =
  | { type: "setStaff"; value: number }
  | { type: "setPrice"; value: number }
  | { type: "setMarketing"; value: number }
  | { type: "setMeal"; value: Meal }
  | { type: "openDay" }
  | { type: "nextDay" };

export const MEALS: Record<Meal, { label: string; costMult: number; popularityMult: number }> = {
  burger: { label: "Burger", costMult: 1.0, popularityMult: 1.2 },
  pizza:  { label: "Pizza",  costMult: 0.9, popularityMult: 1.1 },
  salad:  { label: "Salad",  costMult: 0.7, popularityMult: 0.8 },
  pasta:  { label: "Pasta",  costMult: 0.85, popularityMult: 1.0 },
};

export function initialState(seed: number): RestaurantState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    day: 1,
    cash: 500,
    phase: "plan",
    staff: 2,
    menuPrice: 12,
    marketing: 10,
    featuredMeal: "burger",
    lastCustomers: 0,
    lastRevenue: 0,
    lastCosts: 0,
    lastProfit: 0,
    reputation: 50,
    log: [],
  };
}

export function calcCustomers(
  staff: number,
  price: number,
  marketing: number,
  reputation: number,
  meal: Meal,
  rng: () => number,
): number {
  const mealPop = MEALS[meal].popularityMult;
  const baseDemand = 10 + (reputation / 100) * 30 + (marketing / 50) * 15;
  const capacityFromStaff = staff * 8;
  const priceEffect = Math.max(0, 1 - (price - 5) / 50);
  const want = Math.round(baseDemand * priceEffect * mealPop * (0.7 + rng() * 0.6));
  return Math.min(capacityFromStaff, Math.max(0, want));
}

export function reducer(state: RestaurantState, action: RestaurantAction): RestaurantState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "setStaff":
      if (state.phase !== "plan") return state;
      return { ...state, staff: Math.max(1, Math.min(5, action.value)) };
    case "setPrice":
      if (state.phase !== "plan") return state;
      return { ...state, menuPrice: Math.max(5, Math.min(30, action.value)) };
    case "setMarketing":
      if (state.phase !== "plan") return state;
      return { ...state, marketing: Math.max(0, Math.min(50, action.value)) };
    case "setMeal":
      if (state.phase !== "plan") return state;
      return { ...state, featuredMeal: action.value };

    case "openDay": {
      if (state.phase !== "plan") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const customers = calcCustomers(state.staff, state.menuPrice, state.marketing, state.reputation, state.featuredMeal, rng);
      const revenue = customers * state.menuPrice;
      const mealCostMult = MEALS[state.featuredMeal].costMult;
      const ingredientCost = customers * state.menuPrice * 0.3 * mealCostMult;
      const staffCost = state.staff * 20;
      const costs = Math.round(ingredientCost + staffCost + state.marketing);
      const profit = revenue - costs;
      // Reputation adjusts based on service quality and profit
      const repDelta = customers >= state.staff * 6 ? 2 : -1;
      const newRep = Math.max(0, Math.min(100, state.reputation + repDelta));
      const log = `Day ${state.day}: ${customers} customers @ $${state.menuPrice} → +$${revenue} -$${costs} = ${profit >= 0 ? "+" : ""}$${profit}`;
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "results",
        cash: state.cash + profit,
        lastCustomers: customers,
        lastRevenue: revenue,
        lastCosts: costs,
        lastProfit: profit,
        reputation: newRep,
        log: [...state.log, log],
      };
    }

    case "nextDay": {
      if (state.phase !== "results") return state;
      if (state.day >= TOTAL_DAYS) return { ...state, phase: "done" };
      return { ...state, day: state.day + 1, phase: "plan" };
    }
  }
}

export function isTerminal(state: RestaurantState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 3000) * 100))) };
}
