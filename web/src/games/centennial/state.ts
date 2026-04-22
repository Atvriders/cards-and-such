import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Centennial: Roll 3 dice. Score 1–12 sequentially.
// Each turn, if any combination of the 3 dice sums to the next target, advance.
// First to reach 12 wins. Single-player vs bot (both advance on same roll set).

export interface CentennialSettings {
  mode: "solo" | "vs-bot";
}

export type CentPhase = "rolling" | "gameOver";

export interface CentennialState {
  settings: CentennialSettings;
  rngSeed: number;
  phase: CentPhase;
  playerTarget: number; // next number to reach (1..12)
  botTarget: number;
  lastRoll: number[] | null;
  lastBotRoll: number[] | null;
  playerAdvanced: boolean;
  botAdvanced: boolean;
  message: string;
  gameOver: boolean;
  winner: "player" | "bot" | "tie" | null;
}

export type CentennialAction =
  | { type: "roll" };

export function initialState(seed: number, settings: CentennialSettings): CentennialState {
  return {
    settings,
    rngSeed: seed,
    phase: "rolling",
    playerTarget: 1,
    botTarget: 1,
    lastRoll: null,
    lastBotRoll: null,
    playerAdvanced: false,
    botAdvanced: false,
    message: "Roll 3 dice. Make the sum 1 using any combination of dice.",
    gameOver: false,
    winner: null,
  };
}

/** Can we make 'target' from some subset (non-empty) of dice values? */
export function canMakeTarget(dice: number[], target: number): boolean {
  const n = dice.length;
  for (let mask = 1; mask < (1 << n); mask++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) sum += dice[i]!;
    }
    if (sum === target) return true;
  }
  return false;
}

function roll3(seed: number): { dice: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const dice = [
    Math.floor(rng() * 6) + 1,
    Math.floor(rng() * 6) + 1,
    Math.floor(rng() * 6) + 1,
  ];
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { dice, nextSeed };
}

export function reducer(state: CentennialState, action: CentennialAction): CentennialState {
  if (state.gameOver) return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "rolling") return state;

      const { dice: playerDice, nextSeed: s2 } = roll3(state.rngSeed);
      const playerAdvanced = state.playerTarget <= 12 && canMakeTarget(playerDice, state.playerTarget);
      const newPlayerTarget = playerAdvanced ? state.playerTarget + 1 : state.playerTarget;

      // Bot rolls separately
      const { dice: botDice, nextSeed: s3 } = roll3(s2);
      const botAdvanced = state.botTarget <= 12 && canMakeTarget(botDice, state.botTarget);
      const newBotTarget = botAdvanced ? state.botTarget + 1 : state.botTarget;

      const playerDone = newPlayerTarget > 12;
      const botDone = newBotTarget > 12;
      const gameOver = playerDone || botDone;

      let winner: "player" | "bot" | "tie" | null = null;
      if (gameOver) {
        if (playerDone && botDone) winner = "tie";
        else if (playerDone) winner = "player";
        else winner = "bot";
      }

      const playerMsg = playerAdvanced
        ? `You made ${state.playerTarget} — advance to target ${newPlayerTarget}!`
        : `You rolled [${playerDice.join(",")}], can't make ${state.playerTarget}.`;
      const botMsg = botAdvanced
        ? `Bot made ${state.botTarget} — advances to ${newBotTarget}.`
        : `Bot rolled [${botDice.join(",")}], misses ${state.botTarget}.`;

      return {
        ...state,
        rngSeed: s3,
        playerTarget: newPlayerTarget,
        botTarget: newBotTarget,
        lastRoll: playerDice,
        lastBotRoll: botDice,
        playerAdvanced,
        botAdvanced,
        phase: gameOver ? "gameOver" : "rolling",
        gameOver,
        winner,
        message: gameOver
          ? `${playerMsg} ${botMsg} ${winner === "player" ? "You win!" : winner === "bot" ? "Bot wins!" : "Tie!"}`
          : `${playerMsg} ${botMsg} Your next target: ${newPlayerTarget}${newPlayerTarget <= 12 ? "" : " — done!"}.`,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CentennialState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.winner === "player" ? 100 : state.winner === "tie" ? 50 : 0 };
}
