import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CrapsSettings {
  rounds: "5" | "10" | "20";
  betSize: "10" | "25" | "100";
}

export type CrapsPhase = "come-out" | "point" | "settled";

export interface CrapsState {
  settings: CrapsSettings;
  rngSeed: number;
  bankroll: number;
  roundsPlayed: number;
  phase: CrapsPhase;
  point: number | null; // null during come-out
  lastRoll: [number, number] | null;
  lastResult: string;
}

export type CrapsAction = { type: "roll" };

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function rollDice(rng: () => number): [number, number] {
  return [
    Math.floor(rng() * 6) + 1,
    Math.floor(rng() * 6) + 1,
  ];
}

export function initialState(seed: number, settings: CrapsSettings): CrapsState {
  return {
    settings,
    rngSeed: seed,
    bankroll: 1000,
    roundsPlayed: 0,
    phase: "come-out",
    point: null,
    lastRoll: null,
    lastResult: "",
  };
}

export function reducer(state: CrapsState, action: CrapsAction): CrapsState {
  if (action.type !== "roll") return state;

  const maxRounds = parseInt(state.settings.rounds, 10);
  const betSize = parseInt(state.settings.betSize, 10);

  if (state.roundsPlayed >= maxRounds) return state;
  if (state.bankroll < betSize) return state;

  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  const dice = rollDice(rng);
  const total = dice[0] + dice[1];

  // Come-out roll
  if (state.phase === "come-out" || state.phase === "settled") {
    const bankroll = state.bankroll - betSize;

    if (total === 7 || total === 11) {
      // Pass line wins
      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: bankroll + betSize * 2,
        roundsPlayed: state.roundsPlayed + 1,
        phase: "settled",
        point: null,
        lastRoll: dice,
        lastResult: `Rolled ${total} (${dice[0]}, ${dice[1]}) — Natural! Pass wins! +$${betSize}`,
      };
    } else if (total === 2 || total === 3 || total === 12) {
      // Craps — pass line loses
      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: Math.max(0, bankroll),
        roundsPlayed: state.roundsPlayed + 1,
        phase: "settled",
        point: null,
        lastRoll: dice,
        lastResult: `Rolled ${total} (${dice[0]}, ${dice[1]}) — Craps! Pass loses. -$${betSize}`,
      };
    } else {
      // Point established
      return {
        ...state,
        rngSeed: nextSeed,
        bankroll,
        phase: "point",
        point: total,
        lastRoll: dice,
        lastResult: `Rolled ${total} (${dice[0]}, ${dice[1]}) — Point is ${total}. Roll again!`,
      };
    }
  }

  // Point phase — keep rolling until point or 7
  if (state.phase === "point") {
    if (total === state.point) {
      // Made the point — Pass wins
      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: state.bankroll + betSize,
        roundsPlayed: state.roundsPlayed + 1,
        phase: "settled",
        point: null,
        lastRoll: dice,
        lastResult: `Rolled ${total} (${dice[0]}, ${dice[1]}) — Made the point! Pass wins! +$${betSize}`,
      };
    } else if (total === 7) {
      // Seven out — Pass loses (bet already deducted)
      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: Math.max(0, state.bankroll),
        roundsPlayed: state.roundsPlayed + 1,
        phase: "settled",
        point: null,
        lastRoll: dice,
        lastResult: `Rolled 7 (${dice[0]}, ${dice[1]}) — Seven out! Pass loses. -$${parseInt(state.settings.betSize, 10)}`,
      };
    } else {
      // No outcome yet — keep rolling
      return {
        ...state,
        rngSeed: nextSeed,
        lastRoll: dice,
        lastResult: `Rolled ${total} (${dice[0]}, ${dice[1]}) — Waiting for ${state.point} or 7...`,
      };
    }
  }

  return state;
}

export function isTerminal(state: CrapsState): { score: number } | null {
  const maxRounds = parseInt(state.settings.rounds, 10);
  if (
    state.phase === "settled" &&
    (state.roundsPlayed >= maxRounds || state.bankroll <= 0)
  ) {
    return { score: state.bankroll };
  }
  return null;
}
