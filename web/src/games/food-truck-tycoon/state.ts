import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FoodTruckTycoonSettings {
  days: "5" | "7" | "10";
}

export type FoodItem = "burger" | "taco" | "pizza" | "salad" | "soda";

export interface MenuItem {
  item: FoodItem;
  price: number;
  cost: number;
  stock: number;
}

export interface Customer {
  wants: FoodItem;
  budget: number;
}

export interface FoodTruckTycoonState {
  settings: FoodTruckTycoonSettings;
  rngSeed: number;
  day: number;
  totalDays: number;
  money: number;
  menu: MenuItem[];
  customers: Customer[];
  servedToday: number;
  revenue: number;
  profit: number;
  totalProfit: number;
  phase: "prep" | "serving" | "report";
  log: string[];
  gameOver: boolean;
}

export type FoodTruckTycoonAction =
  | { type: "restock"; item: FoodItem; qty: number }
  | { type: "setPrice"; item: FoodItem; price: number }
  | { type: "openForBusiness" }
  | { type: "nextDay" }
  | { type: "restart" };

const FOOD_COSTS: Record<FoodItem, number> = {
  burger: 3,
  taco: 2,
  pizza: 4,
  salad: 2,
  soda: 1,
};

const FOOD_ITEMS: FoodItem[] = ["burger", "taco", "pizza", "salad", "soda"];

function defaultMenu(): MenuItem[] {
  return FOOD_ITEMS.map(item => ({
    item,
    price: FOOD_COSTS[item]! * 2,
    cost: FOOD_COSTS[item]!,
    stock: 5,
  }));
}

function generateCustomers(seed: number, day: number, count: number): Customer[] {
  const rng = mulberry32(seed + day * 37);
  return Array.from({ length: count }, () => {
    const item = FOOD_ITEMS[Math.floor(rng() * FOOD_ITEMS.length)]!;
    const budget = 3 + Math.floor(rng() * 10);
    return { wants: item, budget };
  });
}

export function initialState(seed: number, settings: FoodTruckTycoonSettings): FoodTruckTycoonState {
  const totalDays = parseInt(settings.days, 10);
  const customers = generateCustomers(seed, 1, 8 + Math.floor(totalDays));
  return {
    settings,
    rngSeed: seed,
    day: 1,
    totalDays,
    money: 30,
    menu: defaultMenu(),
    customers,
    servedToday: 0,
    revenue: 0,
    profit: 0,
    totalProfit: 0,
    phase: "prep",
    log: ["Day 1: Set prices and restock, then open for business!"],
    gameOver: false,
  };
}

export function reducer(state: FoodTruckTycoonState, action: FoodTruckTycoonAction): FoodTruckTycoonState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.gameOver) return state;

  if (action.type === "restock") {
    const { item, qty } = action;
    const menuItem = state.menu.find(m => m.item === item);
    if (!menuItem) return state;
    const totalCost = menuItem.cost * qty;
    if (state.money < totalCost) return state;
    return {
      ...state,
      money: state.money - totalCost,
      menu: state.menu.map(m => m.item === item ? { ...m, stock: m.stock + qty } : m),
    };
  }

  if (action.type === "setPrice") {
    const { item, price } = action;
    if (price < 1 || price > 20) return state;
    return {
      ...state,
      menu: state.menu.map(m => m.item === item ? { ...m, price } : m),
    };
  }

  if (action.type === "openForBusiness") {
    if (state.phase !== "prep") return state;
    // Simulate serving customers
    let revenue = 0;
    let served = 0;
    const menuMap = new Map(state.menu.map(m => [m.item, { ...m }]));
    const log: string[] = [];

    for (const customer of state.customers) {
      const item = menuMap.get(customer.wants);
      if (!item || item.stock <= 0) {
        log.push(`Customer wanted ${customer.wants} — out of stock!`);
        continue;
      }
      if (customer.budget < item.price) {
        log.push(`Customer wanted ${customer.wants} at $${item.price} — too pricey!`);
        continue;
      }
      item.stock--;
      revenue += item.price;
      served++;
      log.push(`Sold ${customer.wants} for $${item.price}`);
    }

    const totalCostOfGoodsSold = state.menu.reduce((sum, m) => {
      const orig = state.menu.find(x => x.item === m.item)!;
      const sold = orig.stock - (menuMap.get(m.item)?.stock ?? orig.stock);
      return sum + sold * m.cost;
    }, 0);

    const profit = revenue - totalCostOfGoodsSold;
    const newMoney = state.money + revenue;
    const updatedMenu = state.menu.map(m => ({
      ...m,
      stock: menuMap.get(m.item)?.stock ?? m.stock,
    }));

    return {
      ...state,
      money: newMoney,
      menu: updatedMenu,
      servedToday: served,
      revenue,
      profit,
      totalProfit: state.totalProfit + profit,
      phase: "report",
      log: [...state.log, ...log.slice(0, 5), `Day ${state.day}: Served ${served}, Revenue $${revenue}, Profit $${profit}`].slice(-8),
    };
  }

  if (action.type === "nextDay") {
    if (state.phase !== "report") return state;
    const nextDay = state.day + 1;
    if (nextDay > state.totalDays) {
      return { ...state, phase: "report", gameOver: true };
    }
    const newCustomers = generateCustomers(state.rngSeed, nextDay, 8 + nextDay);
    return {
      ...state,
      day: nextDay,
      customers: newCustomers,
      servedToday: 0,
      revenue: 0,
      profit: 0,
      phase: "prep",
      log: [...state.log, `Day ${nextDay}: New customers arriving — prepare!`].slice(-8),
    };
  }

  return state;
}

export function isTerminal(state: FoodTruckTycoonState): { score: number } | null {
  if (!state.gameOver) return null;
  // Score based on total profit: $100 profit = 100 score (capped)
  return { score: Math.min(100, Math.max(0, state.totalProfit)) };
}
