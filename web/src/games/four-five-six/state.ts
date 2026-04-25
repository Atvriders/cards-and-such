import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Four-Five-Six (also called 4-5-6 or Cee-lo): Roll 3 dice.
// 4-5-6 = instant win. 1-2-3 = instant lose.
// Triples = special: triple 1s lose, any other triple wins (triple-1 might be called "raflles").
// Pair + point: pair sets aside, single die is your "point" (4,5,6 beat opponent; 1,2,3 lose).
// Simplified single-player: beat a dealer's point.

export interface FourFiveSixSettings {
  rounds: "5" | "10" | "20";
}

export type FfsResult = "win" | "lose" | "push" | "pending";

export type FfsPhase = "preRoll" | "rolled" | "dealerRolling" | "roundDone" | "gameDone";

export interface FourFiveSixState {
  settings: FourFiveSixSettings;
  rngSeed: number;
  playerDice: number[];
  dealerDice: number[];
  playerPoint: number | null;
  dealerPoint: number | null;
  playerSpecial: string | null; // "win" | "lose" | null
  dealerSpecial: string | null;
  roundResult: FfsResult;
  roundsPlayed: number;
  totalRounds: number;
  wins: number;
  phase: FfsPhase;
}

export type FourFiveSixAction =
  | { type: "roll" }
  | { type: "rollDealer" }
  | { type: "nextRound" };

function rollThree(rng: () => number): number[] {
  return [
    Math.floor(rng() * 6) + 1,
    Math.floor(rng() * 6) + 1,
    Math.floor(rng() * 6) + 1,
  ];
}

function interpretDice(dice: number[]): { special: string | null; point: number | null } {
  const sorted = [...dice].sort((a, b) => a - b);
  // 4-5-6
  if (sorted[0] === 4 && sorted[1] === 5 && sorted[2] === 6) return { special: "win", point: null };
  // 1-2-3
  if (sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3) return { special: "lose", point: null };
  // Triples
  if (sorted[0] === sorted[1] && sorted[1] === sorted[2]) {
    if (sorted[0] === 1) return { special: "lose", point: null }; // triple 1s
    return { special: "win", point: null }; // any other triple wins
  }
  // Pair + point
  const counts: Record<number, number> = {};
  for (const d of dice) counts[d] = (counts[d] ?? 0) + 1;
  for (const [face, count] of Object.entries(counts)) {
    if (count === 2) {
      const point = dice.find((d) => d !== parseInt(face));
      return { special: null, point: point ?? null };
    }
  }
  // No valid result — re-roll needed (return null point and no special)
  return { special: null, point: null };
}

export function initialState(seed: number, settings: FourFiveSixSettings): FourFiveSixState {
  return {
    settings,
    rngSeed: seed,
    playerDice: [],
    dealerDice: [],
    playerPoint: null,
    dealerPoint: null,
    playerSpecial: null,
    dealerSpecial: null,
    roundResult: "pending",
    roundsPlayed: 0,
    totalRounds: parseInt(settings.rounds, 10),
    wins: 0,
    phase: "preRoll",
  };
}

function advanceSeed(seed: number): { rng: () => number; newSeed: number } {
  const rng = mulberry32(seed);
  const newSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), newSeed };
}

export function reducer(state: FourFiveSixState, action: FourFiveSixAction): FourFiveSixState {
  if (state.phase === "gameDone") return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll") return state;

      const { rng, newSeed } = advanceSeed(state.rngSeed);
      const dice = rollThree(rng);
      const { special, point } = interpretDice(dice);

      if (special === "win") {
        return {
          ...state,
          rngSeed: newSeed,
          playerDice: dice,
          playerSpecial: special,
          playerPoint: null,
          roundResult: "win",
          wins: state.wins + 1,
          roundsPlayed: state.roundsPlayed + 1,
          phase: state.roundsPlayed + 1 >= state.totalRounds ? "gameDone" : "roundDone",
        };
      }

      if (special === "lose") {
        return {
          ...state,
          rngSeed: newSeed,
          playerDice: dice,
          playerSpecial: special,
          playerPoint: null,
          roundResult: "lose",
          roundsPlayed: state.roundsPlayed + 1,
          phase: state.roundsPlayed + 1 >= state.totalRounds ? "gameDone" : "roundDone",
        };
      }

      if (point === null) {
        // Invalid dice (no pair), must re-roll
        return { ...state, rngSeed: newSeed, playerDice: dice };
      }

      // Has a point — go to dealer roll
      return {
        ...state,
        rngSeed: newSeed,
        playerDice: dice,
        playerPoint: point,
        playerSpecial: null,
        phase: "dealerRolling",
      };
    }

    case "rollDealer": {
      if (state.phase !== "dealerRolling") return state;

      const { rng, newSeed } = advanceSeed(state.rngSeed);
      const dice = rollThree(rng);
      const { special, point } = interpretDice(dice);

      if (special === "win") {
        return {
          ...state,
          rngSeed: newSeed,
          dealerDice: dice,
          dealerSpecial: special,
          dealerPoint: null,
          roundResult: "lose",
          roundsPlayed: state.roundsPlayed + 1,
          phase: state.roundsPlayed + 1 >= state.totalRounds ? "gameDone" : "roundDone",
        };
      }

      if (special === "lose") {
        return {
          ...state,
          rngSeed: newSeed,
          dealerDice: dice,
          dealerSpecial: special,
          dealerPoint: null,
          roundResult: "win",
          wins: state.wins + 1,
          roundsPlayed: state.roundsPlayed + 1,
          phase: state.roundsPlayed + 1 >= state.totalRounds ? "gameDone" : "roundDone",
        };
      }

      if (point === null) {
        // Dealer must re-roll
        return { ...state, rngSeed: newSeed, dealerDice: dice };
      }

      const playerPoint = state.playerPoint!;
      let result: FfsResult;
      if (playerPoint > point) result = "win";
      else if (playerPoint < point) result = "lose";
      else result = "push";

      return {
        ...state,
        rngSeed: newSeed,
        dealerDice: dice,
        dealerPoint: point,
        dealerSpecial: null,
        roundResult: result,
        wins: result === "win" ? state.wins + 1 : state.wins,
        roundsPlayed: state.roundsPlayed + 1,
        phase: state.roundsPlayed + 1 >= state.totalRounds ? "gameDone" : "roundDone",
      };
    }

    case "nextRound": {
      if (state.phase !== "roundDone") return state;
      return {
        ...state,
        playerDice: [],
        dealerDice: [],
        playerPoint: null,
        dealerPoint: null,
        playerSpecial: null,
        dealerSpecial: null,
        roundResult: "pending",
        phase: "preRoll",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FourFiveSixState): { score: number } | null {
  if (state.phase !== "gameDone") return null;
  return { score: Math.round((state.wins / state.totalRounds) * 1000) };
}
