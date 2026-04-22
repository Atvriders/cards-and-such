import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Beat That!: Roll N dice, arrange them to form the highest number.
// Opponent rolls and auto-arranges optimal. Higher number wins the round.
// Best of rounds wins.

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export interface BeatThatSettings {
  rounds: "3" | "5" | "10";
  dice: "2" | "3" | "4";
}

export type Phase =
  | "playerRoll"      // waiting for player to roll
  | "playerArrange"   // player arranges dice to form number
  | "botResult"       // show bot roll + result
  | "roundOver"       // show round summary
  | "gameOver";       // final result

export interface BeatThatState {
  settings: BeatThatSettings;
  rngSeed: number;
  numDice: number;
  totalRounds: number;
  currentRound: number;
  playerWins: number;
  botWins: number;
  phase: Phase;
  playerDice: DieFace[];
  /** Player's chosen arrangement (digit order) */
  playerArrangement: DieFace[];
  /** Player's number from their arrangement */
  playerNumber: number;
  botDice: DieFace[];
  botNumber: number;
  winner: "player" | "bot" | null;
  roundMessage: string;
  message: string;
}

export type BeatThatAction =
  | { type: "roll" }
  | { type: "arrange"; order: DieFace[] } // player submits arrangement
  | { type: "nextRound" };

function rollN(n: number, rng: () => number): DieFace[] {
  return Array.from({ length: n }, () => (Math.floor(rng() * 6) + 1) as DieFace);
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;
  return { rng: mulberry32(seed), nextSeed };
}

/** Convert digit array to integer (e.g. [6,4,2] → 642) */
function digitsToNumber(digits: DieFace[]): number {
  return parseInt(digits.join(""), 10);
}

/** Best arrangement: sort descending for max number */
function bestArrangement(dice: DieFace[]): DieFace[] {
  return [...dice].sort((a, b) => b - a);
}

/** Validate that arrangement is a permutation of playerDice */
function isPermutation(arr: DieFace[], ref: DieFace[]): boolean {
  if (arr.length !== ref.length) return false;
  const sorted = (x: DieFace[]) => [...x].sort().join(",");
  return sorted(arr) === sorted(ref);
}

export function initialState(seed: number, settings: BeatThatSettings): BeatThatState {
  const numDice = parseInt(settings.dice, 10);
  const totalRounds = parseInt(settings.rounds, 10);
  return {
    settings,
    rngSeed: seed >>> 0,
    numDice,
    totalRounds,
    currentRound: 1,
    playerWins: 0,
    botWins: 0,
    phase: "playerRoll",
    playerDice: [],
    playerArrangement: [],
    playerNumber: 0,
    botDice: [],
    botNumber: 0,
    winner: null,
    roundMessage: "",
    message: `Round 1 of ${totalRounds} — roll your dice!`,
  };
}

export function reducer(state: BeatThatState, action: BeatThatAction): BeatThatState {
  if (state.winner !== null) return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "playerRoll") return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const playerDice = rollN(state.numDice, rng);

      return {
        ...state,
        rngSeed: nextSeed,
        playerDice,
        playerArrangement: [],
        playerNumber: 0,
        phase: "playerArrange",
        message: "Arrange your dice to form the highest number! Drag or click to reorder.",
      };
    }

    case "arrange": {
      if (state.phase !== "playerArrange") return state;
      const { order } = action;

      if (!isPermutation(order, state.playerDice)) return state;

      const playerNumber = digitsToNumber(order);

      // Bot rolls
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const botDice = rollN(state.numDice, rng);
      const botBest = bestArrangement(botDice);
      const botNumber = digitsToNumber(botBest);

      const roundWinner = playerNumber > botNumber ? "player" : playerNumber < botNumber ? "bot" : "tie";

      let playerWins = state.playerWins;
      let botWins = state.botWins;

      let roundMessage = "";
      if (roundWinner === "player") {
        playerWins++;
        roundMessage = `Round ${state.currentRound}: You win! ${playerNumber} > ${botNumber}`;
      } else if (roundWinner === "bot") {
        botWins++;
        roundMessage = `Round ${state.currentRound}: Bot wins! ${botNumber} > ${playerNumber}`;
      } else {
        roundMessage = `Round ${state.currentRound}: Tie! Both got ${playerNumber}`;
      }

      const totalRounds = state.totalRounds;
      const isLastRound = state.currentRound >= totalRounds;
      const winner: "player" | "bot" | null = isLastRound
        ? playerWins > botWins ? "player" : botWins > playerWins ? "bot" : null
        : null;

      return {
        ...state,
        rngSeed: nextSeed,
        playerArrangement: order,
        playerNumber,
        botDice,
        botNumber,
        playerWins,
        botWins,
        phase: isLastRound ? "gameOver" : "roundOver",
        winner,
        roundMessage,
        message: isLastRound
          ? winner === "player"
            ? `You win the match ${playerWins}-${botWins}!`
            : winner === "bot"
            ? `Bot wins the match ${botWins}-${playerWins}!`
            : `Draw! ${playerWins}-${botWins} each.`
          : `${roundMessage} — Score: You ${playerWins} - Bot ${botWins}`,
      };
    }

    case "nextRound": {
      if (state.phase !== "roundOver") return state;
      const nextRound = state.currentRound + 1;
      return {
        ...state,
        currentRound: nextRound,
        phase: "playerRoll",
        playerDice: [],
        playerArrangement: [],
        playerNumber: 0,
        botDice: [],
        botNumber: 0,
        roundMessage: "",
        message: `Round ${nextRound} of ${state.totalRounds} — roll!`,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: BeatThatState): { score: number } | null {
  if (state.phase !== "gameOver") return null;
  if (state.winner === "player") return { score: state.playerWins * 100 };
  if (state.winner === "bot") return { score: 0 };
  // Draw
  return { score: state.playerWins * 50 };
}
