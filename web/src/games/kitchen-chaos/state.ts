import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KitchenChaosSettings {
  difficulty: "easy" | "normal" | "hard";
}

export type Ingredient = "tomato" | "cheese" | "lettuce" | "bread" | "meat";

export interface Order {
  id: number;
  ingredients: Ingredient[];
  assembled: Ingredient[];
  timeLeft: number;   // ticks remaining
  complete: boolean;
  failed: boolean;
}

export interface KitchenChaosState {
  settings: KitchenChaosSettings;
  rngSeed: number;
  orders: Order[];
  activeOrderId: number | null;
  nextOrderId: number;
  tick: number;
  maxTick: number;
  score: number;
  completed: number;
  failed: number;
  gameOver: boolean;
}

export type KitchenChaosAction =
  | { type: "select-order"; id: number }
  | { type: "add-ingredient"; ingredient: Ingredient }
  | { type: "serve" }
  | { type: "tick" };

const ALL_INGREDIENTS: Ingredient[] = ["tomato", "cheese", "lettuce", "bread", "meat"];
const RECIPES: Ingredient[][] = [
  ["bread", "meat", "cheese"],
  ["bread", "lettuce", "tomato"],
  ["bread", "meat", "lettuce", "tomato"],
  ["bread", "cheese", "tomato"],
];

function makeOrder(rng: () => number, id: number, timeLimit: number): Order {
  const recipe = RECIPES[Math.floor(rng() * RECIPES.length)]!;
  return {
    id,
    ingredients: [...recipe],
    assembled: [],
    timeLeft: timeLimit,
    complete: false,
    failed: false,
  };
}

export function initialState(seed: number, settings: KitchenChaosSettings): KitchenChaosState {
  const rng = mulberry32(seed);
  const timeLimit = settings.difficulty === "easy" ? 20 : settings.difficulty === "normal" ? 15 : 10;
  const maxTick = settings.difficulty === "easy" ? 100 : settings.difficulty === "normal" ? 80 : 60;
  const orders: Order[] = [makeOrder(rng, 1, timeLimit), makeOrder(rng, 2, timeLimit)];
  const newSeed = (seed ^ 0xcafebabe) >>> 0;
  return {
    settings,
    rngSeed: newSeed,
    orders,
    activeOrderId: null,
    nextOrderId: 3,
    tick: 0,
    maxTick,
    score: 0,
    completed: 0,
    failed: 0,
    gameOver: false,
  };
}

export function reducer(state: KitchenChaosState, action: KitchenChaosAction): KitchenChaosState {
  if (state.gameOver) return state;

  if (action.type === "select-order") {
    return { ...state, activeOrderId: action.id };
  }

  if (action.type === "add-ingredient") {
    if (state.activeOrderId === null) return state;
    const orders = state.orders.map(o => {
      if (o.id !== state.activeOrderId || o.complete || o.failed) return o;
      return { ...o, assembled: [...o.assembled, action.ingredient] };
    });
    return { ...state, orders };
  }

  if (action.type === "serve") {
    if (state.activeOrderId === null) return state;
    const order = state.orders.find(o => o.id === state.activeOrderId);
    if (!order || order.complete || order.failed) return state;

    const correct =
      order.assembled.length === order.ingredients.length &&
      order.ingredients.every((ing, i) => order.assembled[i] === ing);

    const points = correct ? Math.max(0, order.timeLeft * 10) : 0;
    const orders = state.orders.map(o =>
      o.id === state.activeOrderId ? { ...o, complete: true, failed: !correct } : o
    );

    return {
      ...state,
      orders,
      activeOrderId: null,
      score: state.score + points,
      completed: correct ? state.completed + 1 : state.completed,
      failed: correct ? state.failed : state.failed + 1,
    };
  }

  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const timeLimit = state.settings.difficulty === "easy" ? 20 : state.settings.difficulty === "normal" ? 15 : 10;

    let newFailed = state.failed;
    let orders = state.orders.map(o => {
      if (o.complete || o.failed) return o;
      const timeLeft = o.timeLeft - 1;
      const justFailed = timeLeft <= 0;
      if (justFailed) newFailed++;
      return { ...o, timeLeft: Math.max(0, timeLeft), failed: justFailed };
    });

    // Remove done/failed orders and add new ones to keep 2 active
    const active = orders.filter(o => !o.complete && !o.failed);
    const done = orders.filter(o => o.complete || o.failed);
    let nextOrderId = state.nextOrderId;
    while (active.length < 2) {
      active.push(makeOrder(rng, nextOrderId++, timeLimit));
    }
    orders = [...done, ...active];

    const newSeed = (state.rngSeed + 0x1337) >>> 0;
    const newTick = state.tick + 1;
    const gameOver = newTick >= state.maxTick;

    return {
      ...state,
      rngSeed: newSeed,
      orders,
      tick: newTick,
      failed: newFailed,
      nextOrderId,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: KitchenChaosState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.score };
}
