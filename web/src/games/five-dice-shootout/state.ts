import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Five Dice Shootout: Player and bot each roll 5 dice. Highest sum wins the round. Best of 5.

export interface FiveDiceSettings {
  bestOf: "3" | "5" | "7";
}

export type FDSPhase = "rolling" | "roundOver" | "gameOver";

export interface FDSRound {
  playerDice: number[];
  botDice: number[];
  playerSum: number;
  botSum: number;
  winner: "player" | "bot" | "tie";
}

export interface FiveDiceState {
  settings: FiveDiceSettings;
  rngSeed: number;
  phase: FDSPhase;
  round: number;
  maxRounds: number;
  playerWins: number;
  botWins: number;
  ties: number;
  rounds: FDSRound[];
  message: string;
  gameOver: boolean;
  finalWinner: "player" | "bot" | "tie" | null;
}

export type FiveDiceAction =
  | { type: "roll" }
  | { type: "nextRound" };

export function initialState(seed: number, settings: FiveDiceSettings): FiveDiceState {
  return {
    settings,
    rngSeed: seed,
    phase: "rolling",
    round: 1,
    maxRounds: parseInt(settings.bestOf, 10),
    playerWins: 0,
    botWins: 0,
    ties: 0,
    rounds: [],
    message: "Roll your 5 dice!",
    gameOver: false,
    finalWinner: null,
  };
}

function roll5(seed: number): { dice: number[]; sum: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const dice = Array.from({ length: 5 }, () => Math.floor(rng() * 6) + 1);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { dice, sum: dice.reduce((s, d) => s + d, 0), nextSeed };
}

export function reducer(state: FiveDiceState, action: FiveDiceAction): FiveDiceState {
  if (state.gameOver) return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "rolling") return state;

      const { dice: playerDice, sum: playerSum, nextSeed: s2 } = roll5(state.rngSeed);
      const { dice: botDice, sum: botSum, nextSeed: s3 } = roll5(s2);

      const roundWinner: "player" | "bot" | "tie" =
        playerSum > botSum ? "player" : botSum > playerSum ? "bot" : "tie";

      const newPlayerWins = state.playerWins + (roundWinner === "player" ? 1 : 0);
      const newBotWins = state.botWins + (roundWinner === "bot" ? 1 : 0);
      const newTies = state.ties + (roundWinner === "tie" ? 1 : 0);

      const newRound: FDSRound = { playerDice, botDice, playerSum, botSum, winner: roundWinner };
      const newRounds = [...state.rounds, newRound];
      const isLastRound = state.round >= state.maxRounds;

      let finalWinner: "player" | "bot" | "tie" | null = null;
      if (isLastRound) {
        finalWinner = newPlayerWins > newBotWins ? "player" : newBotWins > newPlayerWins ? "bot" : "tie";
      }

      const roundMsg = roundWinner === "tie"
        ? `Tie! Both scored ${playerSum}.`
        : `${roundWinner === "player" ? "You" : "Bot"} win! ${playerSum} vs ${botSum}.`;

      return {
        ...state,
        rngSeed: s3,
        phase: isLastRound ? "gameOver" : "roundOver",
        round: state.round,
        playerWins: newPlayerWins,
        botWins: newBotWins,
        ties: newTies,
        rounds: newRounds,
        gameOver: isLastRound,
        finalWinner,
        message: `Round ${state.round}: You [${playerDice.join(",")}]=${playerSum} vs Bot [${botDice.join(",")}]=${botSum}. ${roundMsg}`,
      };
    }

    case "nextRound": {
      if (state.phase !== "roundOver") return state;
      return {
        ...state,
        phase: "rolling",
        round: state.round + 1,
        message: `Round ${state.round + 1}. Roll your 5 dice!`,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FiveDiceState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.finalWinner === "player" ? 100 : state.finalWinner === "tie" ? 50 : 0 };
}
