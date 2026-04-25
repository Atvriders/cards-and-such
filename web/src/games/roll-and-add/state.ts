import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Roll and Add: roll dice and decide whether to add them to your running total or bank.
// Get as close to the target without going over.

export interface RollAndAddSettings {
  target: "21" | "31" | "51";
}

export interface RollAndAddState {
  settings: RollAndAddSettings;
  rngSeed: number;
  target: number;
  running: number;   // current total this round
  banked: number;    // banked score across rounds
  dice: number[];    // current roll
  numDice: number;   // how many dice to roll (1..4)
  round: number;
  maxRounds: number;
  over: boolean;
  bust: boolean;
  bankedThisRound: boolean;
  lastMessage: string;
}

export type RollAndAddAction =
  | { type: "roll" }
  | { type: "bank" }
  | { type: "addDie" }
  | { type: "removeDie" };

function rollDice(seed: number, count: number): { dice: number[]; nextSeed: number } {
  const r = mulberry32(seed);
  const dice: number[] = [];
  for (let i = 0; i < count; i++) {
    dice.push(Math.floor(r() * 6) + 1);
  }
  const nextSeed = Math.floor(r() * 2 ** 31);
  return { dice, nextSeed };
}

export function initialState(seed: number, settings: RollAndAddSettings): RollAndAddState {
  const target = parseInt(settings.target, 10);
  return {
    settings,
    rngSeed: seed,
    target,
    running: 0,
    banked: 0,
    dice: [],
    numDice: 1,
    round: 1,
    maxRounds: 5,
    over: false,
    bust: false,
    bankedThisRound: false,
    lastMessage: `Get close to ${target} without going over!`,
  };
}

export function reducer(state: RollAndAddState, action: RollAndAddAction): RollAndAddState {
  if (state.over) return state;

  switch (action.type) {
    case "addDie": {
      if (state.numDice >= 4) return state;
      return { ...state, numDice: state.numDice + 1 };
    }

    case "removeDie": {
      if (state.numDice <= 1) return state;
      return { ...state, numDice: state.numDice - 1 };
    }

    case "roll": {
      if (state.bust || state.bankedThisRound) return state;
      const { dice, nextSeed } = rollDice(state.rngSeed, state.numDice);
      const sum = dice.reduce((a, b) => a + b, 0);
      const newRunning = state.running + sum;
      const bust = newRunning > state.target;
      let message = `Rolled ${dice.join("+")}=${sum}. Total: ${newRunning}.`;
      if (bust) message += " BUST!";

      return {
        ...state,
        rngSeed: nextSeed,
        dice,
        running: newRunning,
        bust,
        lastMessage: message,
      };
    }

    case "bank": {
      if (state.bankedThisRound) return state;
      if (!state.bust && state.running === 0) return state;

      // Score: 100 if exactly on target, else max(0, 100 - distance*5)
      const dist = Math.abs(state.target - state.running);
      const roundScore = state.running === state.target
        ? 200
        : Math.max(0, 100 - dist * 4);
      const newBanked = state.banked + roundScore;
      const nextRound = state.round + 1;
      const over = nextRound > state.maxRounds;

      return {
        ...state,
        banked: newBanked,
        bankedThisRound: false,
        bust: false,
        running: 0,
        dice: [],
        numDice: 1,
        round: nextRound,
        over,
        lastMessage: `Banked! +${roundScore} pts (total: ${state.running}/${state.target})`,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: RollAndAddState): { score: number } | null {
  if (state.over) return { score: state.banked };
  return null;
}
