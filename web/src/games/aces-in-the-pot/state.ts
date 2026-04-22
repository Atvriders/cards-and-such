import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Aces in the Pot: 2-player dice game.
// Each starts with 3 pennies. Per die: 1 → put penny in pot, 6 → pass penny left (to opponent).
// First to 0 pennies loses the round. Play 5 rounds.

export interface AcesSettings {
  rounds: "3" | "5" | "7";
}

export type AcesPhase = "rolling" | "roundOver" | "gameOver";
export type ActivePlayer = "player" | "bot";

export interface AcesState {
  settings: AcesSettings;
  rngSeed: number;
  phase: AcesPhase;
  round: number;
  maxRounds: number;
  playerPennies: number;
  botPennies: number;
  pot: number;
  activePlayer: ActivePlayer;
  playerWins: number;
  botWins: number;
  lastRoll: number[] | null;
  message: string;
  gameOver: boolean;
}

export type AcesAction =
  | { type: "roll" }
  | { type: "nextRound" };

export function initialState(seed: number, settings: AcesSettings): AcesState {
  return {
    settings,
    rngSeed: seed,
    phase: "rolling",
    round: 1,
    maxRounds: parseInt(settings.rounds, 10),
    playerPennies: 3,
    botPennies: 3,
    pot: 0,
    activePlayer: "player",
    playerWins: 0,
    botWins: 0,
    lastRoll: null,
    message: "Your turn. Roll the dice!",
    gameOver: false,
  };
}

export function applyDieResult(
  die: number,
  rollerPennies: number,
  otherPennies: number,
  pot: number
): { roller: number; other: number; pot: number } {
  if (die === 1 && rollerPennies > 0) {
    return { roller: rollerPennies - 1, other: otherPennies, pot: pot + 1 };
  }
  if (die === 6 && rollerPennies > 0) {
    return { roller: rollerPennies - 1, other: otherPennies + 1, pot };
  }
  return { roller: rollerPennies, other: otherPennies, pot };
}

export function reducer(state: AcesState, action: AcesAction): AcesState {
  if (state.gameOver) return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "rolling") return state;

      const rng = mulberry32(state.rngSeed);
      const d1 = Math.floor(rng() * 6) + 1;
      const d2 = Math.floor(rng() * 6) + 1;
      const nextSeed = Math.floor(rng() * 2 ** 31);

      let pp = state.playerPennies;
      let bp = state.botPennies;
      let pot = state.pot;
      const roll = [d1, d2];

      if (state.activePlayer === "player") {
        for (const die of [d1, d2]) {
          const res = applyDieResult(die, pp, bp, pot);
          pp = res.roller; bp = res.other; pot = res.pot;
        }

        if (pp === 0) {
          // Player loses round — automatically run bot's turn too then end round
          const rng2 = mulberry32(nextSeed);
          const bd1 = Math.floor(rng2() * 6) + 1;
          const bd2 = Math.floor(rng2() * 6) + 1;
          const nextSeed2 = Math.floor(rng2() * 2 ** 31);
          const newBotWins = state.botWins + 1;
          const isLastRound = state.round >= state.maxRounds;
          return {
            ...state,
            rngSeed: nextSeed2,
            playerPennies: pp,
            botPennies: bp,
            pot,
            lastRoll: roll,
            phase: "roundOver",
            botWins: newBotWins,
            message: `You rolled ${d1},${d2}. You're out of pennies! Bot wins this round. (Bot rolled ${bd1},${bd2} for reference.)`,
            gameOver: isLastRound,
          };
        }

        // Bot's turn — simulate immediately
        const rng2 = mulberry32(nextSeed);
        const bd1 = Math.floor(rng2() * 6) + 1;
        const bd2 = Math.floor(rng2() * 6) + 1;
        const nextSeed2 = Math.floor(rng2() * 2 ** 31);

        for (const die of [bd1, bd2]) {
          const res = applyDieResult(die, bp, pp, pot);
          bp = res.roller; pp = res.other; pot = res.pot;
        }

        if (bp === 0) {
          const newPlayerWins = state.playerWins + 1;
          const isLastRound = state.round >= state.maxRounds;
          return {
            ...state,
            rngSeed: nextSeed2,
            playerPennies: pp,
            botPennies: bp,
            pot,
            lastRoll: roll,
            phase: "roundOver",
            playerWins: newPlayerWins,
            message: `You rolled ${d1},${d2}. Bot rolled ${bd1},${bd2} and ran out of pennies. You win the round!`,
            gameOver: isLastRound,
          };
        }

        return {
          ...state,
          rngSeed: nextSeed2,
          playerPennies: pp,
          botPennies: bp,
          pot,
          lastRoll: roll,
          phase: "rolling",
          activePlayer: "player",
          message: `You rolled ${d1},${d2}. Bot rolled ${bd1},${bd2}. Pennies — You: ${pp}, Bot: ${bp}, Pot: ${pot}. Your turn again!`,
        };
      }

      return state;
    }

    case "nextRound": {
      if (state.phase !== "roundOver" || state.gameOver) return state;
      return {
        ...state,
        phase: "rolling",
        round: state.round + 1,
        playerPennies: 3,
        botPennies: 3,
        pot: 0,
        activePlayer: "player",
        lastRoll: null,
        message: "New round! Your turn. Roll the dice!",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: AcesState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.playerWins };
}
