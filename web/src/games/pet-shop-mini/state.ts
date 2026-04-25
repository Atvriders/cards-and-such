import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type PetType = "puppy" | "kitten" | "bunny" | "parrot" | "hamster";
export type Phase = "plan" | "results" | "done";

export interface Pet {
  type: PetType;
  name: string;
  cost: number;       // purchase cost
  baseDemand: number; // 1–10
  maxPrice: number;
  stock: number;
  price: number;
  happy: number;      // 0-100, affects demand
}

export interface PetShopState {
  rngSeed: number;
  day: number;
  totalDays: number;
  cash: number;
  phase: Phase;
  pets: Pet[];
  lastSold: Record<PetType, number>;
  lastRevenue: number;
  lastProfit: number;
  adBudget: number; // daily marketing boost
  log: readonly string[];
}

const PET_DEFS: Record<PetType, { name: string; cost: number; baseDemand: number; maxPrice: number }> = {
  puppy:   { name: "Puppy",   cost: 40, baseDemand: 8, maxPrice: 150 },
  kitten:  { name: "Kitten",  cost: 25, baseDemand: 7, maxPrice: 120 },
  bunny:   { name: "Bunny",   cost: 10, baseDemand: 5, maxPrice: 60  },
  parrot:  { name: "Parrot",  cost: 30, baseDemand: 4, maxPrice: 100 },
  hamster: { name: "Hamster", cost: 8,  baseDemand: 6, maxPrice: 40  },
};

const PET_TYPES: PetType[] = ["puppy", "kitten", "bunny", "parrot", "hamster"];

function makePets(): Pet[] {
  return PET_TYPES.map(type => {
    const def = PET_DEFS[type];
    return {
      type, name: def.name, cost: def.cost, baseDemand: def.baseDemand,
      maxPrice: def.maxPrice, stock: 2, price: Math.round(def.maxPrice * 0.6),
      happy: 70,
    };
  });
}

export function initialState(seed: number): PetShopState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    day: 1,
    totalDays: 20,
    cash: 300,
    phase: "plan",
    pets: makePets(),
    lastSold: { puppy: 0, kitten: 0, bunny: 0, parrot: 0, hamster: 0 },
    lastRevenue: 0,
    lastProfit: 0,
    adBudget: 0,
    log: [],
  };
}

export type PetAction =
  | { type: "setStock"; petType: PetType; delta: number }
  | { type: "setPrice"; petType: PetType; delta: number }
  | { type: "setHappy"; petType: PetType; delta: number }
  | { type: "setAdBudget"; value: number }
  | { type: "openDay" }
  | { type: "nextDay" };

export function reducer(state: PetShopState, action: PetAction): PetShopState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "setStock": {
      if (state.phase !== "plan") return state;
      const newPets = state.pets.map(p => {
        if (p.type !== action.petType) return p;
        const newStock = Math.max(0, Math.min(10, p.stock + action.delta));
        const stockCost = action.delta > 0 ? action.delta * p.cost : 0;
        if (stockCost > state.cash) return p;
        return { ...p, stock: newStock };
      });
      const bought = newPets.find(p => p.type === action.petType)!.stock
        - state.pets.find(p => p.type === action.petType)!.stock;
      const cashSpent = bought > 0 ? bought * PET_DEFS[action.petType].cost : 0;
      return { ...state, pets: newPets, cash: state.cash - cashSpent };
    }
    case "setPrice": {
      if (state.phase !== "plan") return state;
      const newPets = state.pets.map(p => {
        if (p.type !== action.petType) return p;
        return { ...p, price: Math.max(p.cost, Math.min(p.maxPrice, p.price + action.delta)) };
      });
      return { ...state, pets: newPets };
    }
    case "setHappy": {
      if (state.phase !== "plan") return state;
      const newPets = state.pets.map(p => {
        if (p.type !== action.petType) return p;
        const cost = action.delta > 0 ? action.delta * 2 : 0;
        if (cost > state.cash) return p;
        return { ...p, happy: Math.max(0, Math.min(100, p.happy + action.delta)) };
      });
      const delta = action.delta > 0 ? action.delta * 2 : 0;
      return { ...state, pets: newPets, cash: Math.max(0, state.cash - delta) };
    }
    case "setAdBudget":
      if (state.phase !== "plan") return state;
      return { ...state, adBudget: Math.max(0, Math.min(50, action.value)) };

    case "openDay": {
      if (state.phase !== "plan") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const soldMap: Record<PetType, number> = { puppy: 0, kitten: 0, bunny: 0, parrot: 0, hamster: 0 };
      let revenue = 0;
      let totalCost = 0;
      const newPets = state.pets.map(pet => {
        if (pet.stock === 0) return pet;
        const priceRatio = 1 - (pet.price - pet.cost) / (pet.maxPrice - pet.cost);
        const happyBoost = pet.happy / 100;
        const adBoost = 1 + state.adBudget / 100;
        const demand = pet.baseDemand * priceRatio * happyBoost * adBoost;
        const noise = 0.6 + rng() * 0.8;
        const sold = Math.min(pet.stock, Math.max(0, Math.round(demand * noise)));
        soldMap[pet.type] = sold;
        revenue += sold * pet.price;
        totalCost += sold * pet.cost;
        return { ...pet, stock: pet.stock - sold, happy: Math.max(0, pet.happy - 5) };
      });
      const adCost = state.adBudget;
      const profit = revenue - totalCost - adCost;
      const log = `Day ${state.day}: Revenue $${revenue}, Profit $${profit >= 0 ? "+" : ""}${profit}`;
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "results",
        pets: newPets,
        cash: state.cash + profit,
        lastSold: soldMap,
        lastRevenue: revenue,
        lastProfit: profit,
        log: [...state.log, log],
      };
    }

    case "nextDay": {
      if (state.phase !== "results") return state;
      if (state.day >= state.totalDays) return { ...state, phase: "done" };
      return { ...state, day: state.day + 1, phase: "plan", adBudget: 0 };
    }
  }
}

export function isTerminal(state: PetShopState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 1000) * 100))) };
}
