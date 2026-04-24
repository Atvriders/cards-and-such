import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Ingredient = "fire" | "water" | "earth" | "air" | "arcane" | "shadow";
export type PotionType = "healing" | "strength" | "speed" | "invisibility" | "poison" | "mana";

export const INGREDIENT_LABELS: Record<Ingredient, string> = {
  fire: "Fire", water: "Water", earth: "Earth", air: "Air", arcane: "Arcane", shadow: "Shadow",
};
export const INGREDIENT_EMOJI: Record<Ingredient, string> = {
  fire: "🔥", water: "💧", earth: "🪨", air: "💨", arcane: "✨", shadow: "🌑",
};

export const RECIPES: Record<PotionType, { ingredients: Ingredient[]; reward: number; label: string; emoji: string }> = {
  healing:    { ingredients: ["water","earth","arcane"], reward: 25, label: "Healing Potion", emoji: "❤️" },
  strength:   { ingredients: ["fire","earth","fire"],    reward: 30, label: "Strength Brew",  emoji: "💪" },
  speed:      { ingredients: ["air","air","water"],      reward: 22, label: "Speed Elixir",   emoji: "⚡" },
  invisibility:{ ingredients: ["shadow","air","arcane"], reward: 40, label: "Invisibility",   emoji: "👁️" },
  poison:     { ingredients: ["shadow","earth","water"], reward: 20, label: "Poison Vial",    emoji: "☠️" },
  mana:       { ingredients: ["arcane","arcane","water"],reward: 35, label: "Mana Potion",    emoji: "🔮" },
};

export const ALL_INGREDIENTS: Ingredient[] = ["fire","water","earth","air","arcane","shadow"];

export const TOTAL_ORDERS = 8;

export interface Order {
  potion: PotionType;
  bonus: number; // extra if filled quickly
  turnsLeft: number;
}

export interface AlchemyShopState {
  rngSeed: number;
  coins: number;
  inventory: Record<Ingredient, number>;
  orders: readonly Order[];
  completedOrders: number;
  phase: "brew" | "done";
  log: readonly string[];
}

export type AlchemyShopAction =
  | { type: "buyIngredient"; ingredient: Ingredient; qty: number }
  | { type: "fulfillOrder"; orderIndex: number }
  | { type: "endTurn" };

function generateOrder(rng: () => number): Order {
  const potions = Object.keys(RECIPES) as PotionType[];
  const potion = potions[Math.floor(rng() * potions.length)]!;
  return { potion, bonus: Math.floor(rng() * 15) + 5, turnsLeft: 3 + Math.floor(rng() * 3) };
}

export function initialState(seed: number): AlchemyShopState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  const orders: Order[] = [generateOrder(rng2), generateOrder(rng2), generateOrder(rng2)];
  return {
    rngSeed: nextSeed,
    coins: 80,
    inventory: { fire: 0, water: 0, earth: 0, air: 0, arcane: 0, shadow: 0 },
    orders,
    completedOrders: 0,
    phase: "brew",
    log: [],
  };
}

export const INGREDIENT_COST = 8;

export function reducer(state: AlchemyShopState, action: AlchemyShopAction): AlchemyShopState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "buyIngredient": {
      const { ingredient, qty } = action;
      const cost = INGREDIENT_COST * qty;
      if (cost > state.coins) return state;
      return {
        ...state,
        coins: state.coins - cost,
        inventory: { ...state.inventory, [ingredient]: state.inventory[ingredient] + qty },
      };
    }

    case "fulfillOrder": {
      const { orderIndex } = action;
      const order = state.orders[orderIndex];
      if (!order) return state;
      const recipe = RECIPES[order.potion];
      // Check all ingredients available
      const needed: Partial<Record<Ingredient, number>> = {};
      for (const ing of recipe.ingredients) {
        needed[ing] = (needed[ing] ?? 0) + 1;
      }
      for (const [ing, qty] of Object.entries(needed) as [Ingredient, number][]) {
        if (state.inventory[ing] < qty) return state;
      }
      // Consume ingredients
      const newInventory = { ...state.inventory };
      for (const [ing, qty] of Object.entries(needed) as [Ingredient, number][]) {
        newInventory[ing] -= qty;
      }
      const earned = recipe.reward + (order.turnsLeft > 1 ? order.bonus : 0);
      const newOrders = state.orders.filter((_, i) => i !== orderIndex);
      const completedOrders = state.completedOrders + 1;
      const logEntry = `Fulfilled ${recipe.label} for ${earned} coins`;

      if (completedOrders >= TOTAL_ORDERS) {
        return {
          ...state,
          coins: state.coins + earned,
          inventory: newInventory,
          orders: newOrders,
          completedOrders,
          phase: "done",
          log: [...state.log, logEntry],
        };
      }

      // Generate new order
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const rng2 = mulberry32(nextSeed);
      const newOrder = generateOrder(rng2);
      return {
        ...state,
        rngSeed: nextSeed,
        coins: state.coins + earned,
        inventory: newInventory,
        orders: [...newOrders, newOrder],
        completedOrders,
        log: [...state.log, logEntry],
      };
    }

    case "endTurn": {
      // Tick timers on orders; expired orders removed (penalty)
      const newOrders = state.orders
        .map(o => ({ ...o, turnsLeft: o.turnsLeft - 1 }))
        .filter(o => o.turnsLeft > 0);

      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const rng2 = mulberry32(nextSeed);

      // Fill back to 3 orders
      const filled = [...newOrders];
      while (filled.length < 3) {
        filled.push(generateOrder(rng2));
      }

      const expired = state.orders.length - newOrders.length;
      const penalty = expired * 10;
      const logEntry = expired > 0 ? `${expired} order(s) expired! -${penalty} coins` : "Turn ended";
      return {
        ...state,
        rngSeed: nextSeed,
        coins: Math.max(0, state.coins - penalty),
        orders: filled,
        log: [...state.log, logEntry],
      };
    }
  }
}

export function isTerminal(state: AlchemyShopState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.coins / 300) * 100))) };
}
