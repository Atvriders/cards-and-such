import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pop the Pig — countdown dice game
// A burger counter starts at a random value (10-20).
// Players take turns rolling a d4 (1-4 burgers).
// The player who reduces the counter to 0 or below LOSES (they fed the pig too much).

export interface PopPigSettings {
  opponents: "1" | "2" | "3";
}

export interface PopPigState {
  settings: PopPigSettings;
  rngSeed: number;
  burgersLeft: number;
  startBurgers: number;
  numPlayers: number;
  turn: number;
  lastRoll: number | null;
  loser: number | null; // who popped the pig
  message: string;
}

export type PopPigAction = { type: "roll" };

function numPlayers(s: PopPigSettings): number {
  return 1 + parseInt(s.opponents);
}

export function initialState(seed: number, settings: PopPigSettings): PopPigState {
  const rng = mulberry32(seed);
  const burgers = 10 + Math.floor(rng() * 11); // 10-20
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const np = numPlayers(settings);
  return {
    settings,
    rngSeed: nextSeed,
    burgersLeft: burgers,
    startBurgers: burgers,
    numPlayers: np,
    turn: 0,
    lastRoll: null,
    loser: null,
    message: `The pig is hungry! ${burgers} burgers until it pops. Don't be the one to feed it the last one!`,
  };
}

function rollD4(seed: number): { value: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const value = Math.floor(rng() * 4) + 1;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { value, nextSeed };
}

function advanceBots(state: PopPigState): PopPigState {
  let s = state;
  let iter = 0;
  while (s.loser === null && s.turn !== 0 && iter++ < 500) {
    const { value, nextSeed } = rollD4(s.rngSeed);
    const player = s.turn;
    const newBurgers = s.burgersLeft - value;
    const popped = newBurgers <= 0;
    const nt = (s.turn + 1) % s.numPlayers;
    s = {
      ...s,
      rngSeed: nextSeed,
      burgersLeft: Math.max(0, newBurgers),
      lastRoll: value,
      turn: popped ? s.turn : nt,
      loser: popped ? player : null,
      message: popped
        ? `Bot ${player} rolled ${value} — POP! Bot ${player} loses!`
        : `Bot ${player} fed ${value} burger${value > 1 ? "s" : ""}. ${Math.max(0, newBurgers)} left.`,
    };
    if (popped) break;
  }
  return s;
}

export function reducer(state: PopPigState, action: PopPigAction): PopPigState {
  if (state.loser !== null) return state;
  if (action.type !== "roll") return state;
  if (state.turn !== 0) return state;

  const { value, nextSeed } = rollD4(state.rngSeed);
  const newBurgers = state.burgersLeft - value;
  const popped = newBurgers <= 0;

  if (popped) {
    return {
      ...state,
      rngSeed: nextSeed,
      burgersLeft: 0,
      lastRoll: value,
      loser: 0,
      message: `You rolled ${value} — POP! The pig exploded! You lose!`,
    };
  }

  const nt = 1 % state.numPlayers;
  const next: PopPigState = {
    ...state,
    rngSeed: nextSeed,
    burgersLeft: newBurgers,
    lastRoll: value,
    turn: nt,
    message: `You fed ${value} burger${value > 1 ? "s" : ""}! ${newBurgers} left.`,
  };
  return advanceBots(next);
}

export function isTerminal(state: PopPigState): { score: number } | null {
  if (state.loser === null) return null;
  return { score: state.loser === 0 ? 0 : 100 };
}
