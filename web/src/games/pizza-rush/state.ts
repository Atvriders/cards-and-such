import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PizzaRushSettings {
  speed: "slow" | "normal" | "fast";
}

export type Topping = "sauce" | "cheese" | "pepperoni" | "mushroom" | "olive";

export interface Order {
  id: number;
  toppings: Topping[];
  timeLeft: number;
  timeLimit: number;
  completed: boolean;
  failed: boolean;
}

export interface PizzaRushState {
  settings: PizzaRushSettings;
  rng: () => number;
  orders: Order[];
  currentPizza: Topping[];
  nextOrderId: number;
  ordersCompleted: number;
  ordersFailed: number;
  score: number;
  tick: number;
  maxTicks: number;
  over: boolean;
  log: string;
}

export type PizzaRushAction =
  | { type: "add-topping"; topping: Topping }
  | { type: "submit" }
  | { type: "clear" }
  | { type: "tick" };

const ALL_TOPPINGS: Topping[] = ["sauce", "cheese", "pepperoni", "mushroom", "olive"];

function speedToInterval(speed: string): number {
  if (speed === "slow") return 4;
  if (speed === "fast") return 2;
  return 3;
}

function generateOrder(rng: () => number, id: number, speed: string): Order {
  const numToppings = 1 + Math.floor(rng() * 3); // 1-3
  const toppings: Topping[] = [];
  for (let i = 0; i < numToppings; i++) {
    toppings.push(ALL_TOPPINGS[Math.floor(rng() * ALL_TOPPINGS.length)]!);
  }
  const limit = speedToInterval(speed) * 5;
  return { id, toppings, timeLeft: limit, timeLimit: limit, completed: false, failed: false };
}

export function initialState(seed: number, settings: PizzaRushSettings): PizzaRushState {
  const rng = mulberry32(seed);
  const order1 = generateOrder(rng, 1, settings.speed);
  return {
    settings,
    rng,
    orders: [order1],
    currentPizza: [],
    nextOrderId: 2,
    ordersCompleted: 0,
    ordersFailed: 0,
    score: 0,
    tick: 0,
    maxTicks: 60,
    over: false,
    log: "Pizza Rush! Add toppings matching the order, then Submit!",
  };
}

function toppingsMatch(a: Topping[], b: Topping[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((t, i) => t === sb[i]);
}

export function reducer(state: PizzaRushState, action: PizzaRushAction): PizzaRushState {
  if (state.over) return state;

  if (action.type === "add-topping") {
    if (state.currentPizza.length >= 5) return { ...state, log: "Pizza is full! Submit or clear." };
    return { ...state, currentPizza: [...state.currentPizza, action.topping] };
  }

  if (action.type === "clear") {
    return { ...state, currentPizza: [], log: "Cleared! Start fresh." };
  }

  if (action.type === "submit") {
    const activeOrder = state.orders.find(o => !o.completed && !o.failed);
    if (!activeOrder) return { ...state, log: "No active orders." };
    if (toppingsMatch(state.currentPizza, activeOrder.toppings)) {
      const bonus = Math.ceil(activeOrder.timeLeft / activeOrder.timeLimit * 50);
      const orders = state.orders.map(o =>
        o.id === activeOrder.id ? { ...o, completed: true } : o
      );
      return {
        ...state,
        orders,
        currentPizza: [],
        ordersCompleted: state.ordersCompleted + 1,
        score: state.score + 100 + bonus,
        log: `Order #${activeOrder.id} complete! +${100 + bonus} pts (speed bonus: ${bonus}).`,
      };
    } else {
      return { ...state, log: `Wrong toppings! Order needs: ${activeOrder.toppings.join(", ")}.` };
    }
  }

  if (action.type === "tick") {
    const tick = state.tick + 1;
    const over = tick >= state.maxTicks;

    // Decrement timers, fail expired orders
    let ordersFailed = state.ordersFailed;
    const orders = state.orders.map(o => {
      if (o.completed || o.failed) return o;
      const timeLeft = o.timeLeft - 1;
      if (timeLeft <= 0) {
        ordersFailed++;
        return { ...o, timeLeft: 0, failed: true };
      }
      return { ...o, timeLeft };
    });

    // Spawn a new order every 8 ticks if queue is < 3
    let nextOrderId = state.nextOrderId;
    let updatedOrders = orders;
    const activeCount = orders.filter(o => !o.completed && !o.failed).length;
    if (tick % 8 === 0 && activeCount < 3 && !over) {
      const newOrder = generateOrder(state.rng, nextOrderId, state.settings.speed);
      updatedOrders = [...orders, newOrder];
      nextOrderId++;
    }

    const score = over
      ? state.score + state.ordersCompleted * 20 - ordersFailed * 30
      : state.score;

    const log = over
      ? `Time's up! Completed: ${state.ordersCompleted}, Failed: ${ordersFailed}.`
      : ordersFailed > state.ordersFailed
      ? `Order expired! Don't fall behind!`
      : state.log;

    return {
      ...state,
      tick,
      over,
      orders: updatedOrders,
      ordersFailed,
      nextOrderId,
      score: Math.max(0, score),
      log,
    };
  }

  return state;
}

export function isTerminal(state: PizzaRushState): { score: number } | null {
  if (state.over) return { score: Math.max(0, state.score) };
  return null;
}
