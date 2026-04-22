import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Chicago Dice: 11 rounds (one per target number 2..12)
// Each round: roll 2 dice. If they sum to the target, score that many points.
// Play vs bot. After 11 rounds, highest total wins.

export interface ChicagoSettings {
  rounds: "11";
}

export type Phase = "roll" | "result" | "gameOver";

export interface ChicagoRound {
  target: number;  // 2..12
  playerRoll: [number, number] | null;
  botRoll: [number, number] | null;
  playerScored: boolean;
  botScored: boolean;
}

export interface ChicagoState {
  settings: ChicagoSettings;
  rngSeed: number;
  roundIndex: number; // 0..10
  phase: Phase;
  rounds: ChicagoRound[];
  playerTotal: number;
  botTotal: number;
  winner: "player" | "bot" | "tie" | null;
  message: string;
}

export type ChicagoAction =
  | { type: "roll" };

export function initialState(seed: number, settings: ChicagoSettings): ChicagoState {
  const rounds: ChicagoRound[] = [];
  for (let t = 2; t <= 12; t++) {
    rounds.push({ target: t, playerRoll: null, botRoll: null, playerScored: false, botScored: false });
  }
  return {
    settings,
    rngSeed: seed,
    roundIndex: 0,
    phase: "roll",
    rounds,
    playerTotal: 0,
    botTotal: 0,
    winner: null,
    message: "Round 1 — Target: 2. Roll the dice!",
  };
}

function rollTwo(seed: number): { a: number; b: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const a = Math.floor(rng() * 6) + 1;
  const b = Math.floor(rng() * 6) + 1;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { a, b, nextSeed };
}

export function reducer(state: ChicagoState, action: ChicagoAction): ChicagoState {
  if (state.winner !== null) return state;

  switch (action.type) {
    case "roll": {
      // In "result" phase, treat this as "next round roll"
      if (state.phase === "result") {
        return reducer({ ...state, phase: "roll" }, action);
      }
      if (state.phase !== "roll") return state;

      const round = state.rounds[state.roundIndex]!;
      const target = round.target;

      // Roll for player
      const { a: pa, b: pb, nextSeed: seed2 } = rollTwo(state.rngSeed);
      // Roll for bot
      const { a: ba, b: bb, nextSeed: seed3 } = rollTwo(seed2);

      const playerSum = pa + pb;
      const botSum = ba + bb;
      const playerScored = playerSum === target;
      const botScored = botSum === target;

      const playerPoints = playerScored ? target : 0;
      const botPoints = botScored ? target : 0;

      const newRounds = state.rounds.map((r, i) =>
        i === state.roundIndex
          ? { ...r, playerRoll: [pa, pb] as [number, number], botRoll: [ba, bb] as [number, number], playerScored, botScored }
          : r
      );

      const newPlayerTotal = state.playerTotal + playerPoints;
      const newBotTotal = state.botTotal + botPoints;

      const isLast = state.roundIndex === 10;
      let winner: "player" | "bot" | "tie" | null = null;
      let phase: Phase = "result";

      if (isLast) {
        phase = "gameOver";
        if (newPlayerTotal > newBotTotal) winner = "player";
        else if (newBotTotal > newPlayerTotal) winner = "bot";
        else winner = "tie";
      }

      const parts: string[] = [];
      parts.push(`Target: ${target}. You rolled ${pa}+${pb}=${playerSum} — ${playerScored ? `+${target} pts!` : "no score"}.`);
      parts.push(`Bot rolled ${ba}+${bb}=${botSum} — ${botScored ? `+${target} pts!` : "no score"}.`);

      return {
        ...state,
        rngSeed: seed3,
        rounds: newRounds,
        roundIndex: isLast ? state.roundIndex : state.roundIndex + 1,
        phase,
        playerTotal: newPlayerTotal,
        botTotal: newBotTotal,
        winner,
        message: parts.join(" ") + (isLast ? ` Final: You ${newPlayerTotal} — Bot ${newBotTotal}.` : ""),
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ChicagoState): { score: number } | null {
  if (!state.winner) return null;
  return { score: state.playerTotal };
}
