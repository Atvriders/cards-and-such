import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BaristaRushSettings {
  speed: "slow" | "normal" | "fast";
}

export type DrinkSize = "S" | "M" | "L";
export type DrinkType = "espresso" | "latte" | "cappuccino" | "americano";
export type Extra = "sugar" | "milk" | "decaf" | null;

export interface DrinkOrder {
  id: number;
  size: DrinkSize;
  type: DrinkType;
  extra: Extra;
  timeLeft: number;
  done: boolean;
  failed: boolean;
}

export interface BaristaRushState {
  settings: BaristaRushSettings;
  rngSeed: number;
  queue: DrinkOrder[];
  current: Partial<DrinkOrder>;   // what player is building
  nextId: number;
  tick: number;
  maxTick: number;
  score: number;
  served: number;
  failed: number;
  gameOver: boolean;
}

export type BaristaRushAction =
  | { type: "set-size"; size: DrinkSize }
  | { type: "set-type"; drink: DrinkType }
  | { type: "set-extra"; extra: Extra }
  | { type: "serve" }
  | { type: "tick" };

const SIZES: DrinkSize[] = ["S", "M", "L"];
const TYPES: DrinkType[] = ["espresso", "latte", "cappuccino", "americano"];
const EXTRAS: Extra[] = ["sugar", "milk", "decaf", null];

function makeOrder(rng: () => number, id: number, timeLimit: number): DrinkOrder {
  return {
    id,
    size: SIZES[Math.floor(rng() * 3)]!,
    type: TYPES[Math.floor(rng() * 4)]!,
    extra: EXTRAS[Math.floor(rng() * 4)]!,
    timeLeft: timeLimit,
    done: false,
    failed: false,
  };
}

export function initialState(seed: number, settings: BaristaRushSettings): BaristaRushState {
  const rng = mulberry32(seed);
  const timeLimit = settings.speed === "slow" ? 25 : settings.speed === "normal" ? 18 : 12;
  const maxTick = settings.speed === "slow" ? 120 : settings.speed === "normal" ? 90 : 60;

  const queue: DrinkOrder[] = [makeOrder(rng, 1, timeLimit), makeOrder(rng, 2, timeLimit), makeOrder(rng, 3, timeLimit)];
  const newSeed = (seed ^ 0xbabe1234) >>> 0;
  return {
    settings,
    rngSeed: newSeed,
    queue,
    current: {},
    nextId: 4,
    tick: 0,
    maxTick,
    score: 0,
    served: 0,
    failed: 0,
    gameOver: false,
  };
}

export function reducer(state: BaristaRushState, action: BaristaRushAction): BaristaRushState {
  if (state.gameOver) return state;

  if (action.type === "set-size") {
    return { ...state, current: { ...state.current, size: action.size } };
  }
  if (action.type === "set-type") {
    return { ...state, current: { ...state.current, type: action.drink } };
  }
  if (action.type === "set-extra") {
    return { ...state, current: { ...state.current, extra: action.extra } };
  }

  if (action.type === "serve") {
    const { size, type, extra } = state.current;
    if (!size || !type) return state; // must have at least size and type

    // Find matching order in queue (top of queue = first pending)
    const pending = state.queue.filter(o => !o.done && !o.failed);
    if (pending.length === 0) return state;

    const target = pending[0]!;
    const extraMatch = extra === undefined ? target.extra === null : extra === target.extra;
    const correct = size === target.size && type === target.type && extraMatch;
    const points = correct ? Math.max(10, target.timeLeft * 5) : 0;

    const queue = state.queue.map(o =>
      o.id === target.id ? { ...o, done: true, failed: !correct } : o
    );

    return {
      ...state,
      queue,
      current: {},
      score: state.score + points,
      served: correct ? state.served + 1 : state.served,
      failed: correct ? state.failed : state.failed + 1,
    };
  }

  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const timeLimit = state.settings.speed === "slow" ? 25 : state.settings.speed === "normal" ? 18 : 12;

    let extraFailed = 0;
    let queue = state.queue.map(o => {
      if (o.done || o.failed) return o;
      const timeLeft = o.timeLeft - 1;
      if (timeLeft <= 0) { extraFailed++; return { ...o, timeLeft: 0, failed: true }; }
      return { ...o, timeLeft };
    });

    // Keep queue at 3 active orders
    const active = queue.filter(o => !o.done && !o.failed);
    const done = queue.filter(o => o.done || o.failed);
    let nextId = state.nextId;
    while (active.length < 3) {
      active.push(makeOrder(rng, nextId++, timeLimit));
    }
    queue = [...done, ...active];

    const newSeed = (state.rngSeed + 0x5678) >>> 0;
    const newTick = state.tick + 1;
    const gameOver = newTick >= state.maxTick;

    return {
      ...state,
      rngSeed: newSeed,
      queue,
      tick: newTick,
      failed: state.failed + extraFailed,
      nextId,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: BaristaRushState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.score };
}
