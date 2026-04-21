import type { Die, DieFace } from "../../engines/dice/index.js";
import {
  rollDice,
  scoreFarkleSelection,
  hasFarkleScoringOption,
} from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TenThousandSettings {
  target: "5000" | "10000" | "15000";
  startingBuy: "0" | "500" | "1000";
  botStrategy: "cautious" | "normal" | "aggressive";
}

export type TenThousandPhase = "preRoll" | "rolled" | "farkled" | "won";

export interface TenThousandTurn {
  diceRemaining: number;
  setAside: DieFace[];
  turnScore: number;
  phase: TenThousandPhase;
}

export interface TenThousandState {
  settings: TenThousandSettings;
  rngSeed: number;
  bankedScore: number;
  botBankedScore: number;
  turnsTaken: number;
  currentTurn: TenThousandTurn;
  lastRoll: Die[];
  won: boolean;
  botWon: boolean;
  playerWon: boolean;
  // Bot summary for last bot turn
  lastBotTurnScore: number;
}

export type TenThousandAction =
  | { type: "roll" }
  | { type: "setAside"; indices: number[] }
  | { type: "bank" }
  | { type: "nextTurn" };

export function initialState(seed: number, settings: TenThousandSettings): TenThousandState {
  return {
    settings,
    rngSeed: seed,
    bankedScore: 0,
    botBankedScore: 0,
    turnsTaken: 0,
    currentTurn: {
      diceRemaining: 6,
      setAside: [],
      turnScore: 0,
      phase: "preRoll",
    },
    lastRoll: [],
    won: false,
    botWon: false,
    playerWon: false,
    lastBotTurnScore: 0,
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

/** Bot plays a full turn. Returns score banked and next seed. */
function simulateBotTurn(
  seed: number,
  botBanked: number,
  target: number,
  startingBuy: number,
  bankThreshold: number,
): { score: number; nextSeed: number } {
  let { rng, nextSeed } = advanceSeed(seed);
  let diceRemaining = 6;
  let turnScore = 0;
  let farkled = false;

  for (;;) {
    const dice = rollDice(diceRemaining, rng);
    const next = advanceSeed(nextSeed);
    rng = next.rng;
    nextSeed = next.nextSeed;

    if (!hasFarkleScoringOption(dice)) {
      farkled = true;
      break;
    }

    // Bot greedily scores all scoring dice
    // Pick all individually scoring dice greedily
    const values = dice.map((d) => d.value);
    const scored = scoreFarkleSelection(values);
    if (scored > 0) {
      // All dice score
      turnScore += scored;
      diceRemaining = 0;
    } else {
      // Score individually
      let scored2 = 0;
      const kept: DieFace[] = [];
      let remaining = diceRemaining;
      for (const v of values) {
        const pts = scoreFarkleSelection([v]);
        if (pts > 0) {
          kept.push(v);
          scored2 += pts;
          remaining--;
        }
      }
      turnScore += scored2;
      diceRemaining = remaining;
    }

    // Hot dice
    if (diceRemaining === 0) diceRemaining = 6;

    // Decide whether to bank
    const projectedTotal = botBanked + turnScore;
    const needsStartingBuy = botBanked === 0 && startingBuy > 0;
    const canBank = !needsStartingBuy || turnScore >= startingBuy;
    if (canBank && (turnScore >= bankThreshold || projectedTotal >= target)) {
      break;
    }
  }

  return { score: farkled ? 0 : turnScore, nextSeed };
}

export function reducer(state: TenThousandState, action: TenThousandAction): TenThousandState {
  if (state.won) return state;

  switch (action.type) {
    case "roll": {
      if (state.currentTurn.phase !== "preRoll") return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const newRoll = rollDice(state.currentTurn.diceRemaining, rng);

      if (!hasFarkleScoringOption(newRoll)) {
        return {
          ...state,
          rngSeed: nextSeed,
          lastRoll: newRoll,
          currentTurn: { ...state.currentTurn, phase: "farkled" },
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        lastRoll: newRoll,
        currentTurn: { ...state.currentTurn, phase: "rolled" },
      };
    }

    case "setAside": {
      if (state.currentTurn.phase !== "rolled") return state;
      if (action.indices.length === 0) return state;

      const roll = state.lastRoll;
      if (action.indices.some((i) => i < 0 || i >= roll.length)) return state;
      if (new Set(action.indices).size !== action.indices.length) return state;

      const selectedValues = action.indices.map((i) => roll[i]!.value);
      const points = scoreFarkleSelection(selectedValues);
      if (points === 0) return state;

      const remaining = roll.length - action.indices.length;
      const newDiceRemaining = remaining === 0 ? 6 : remaining;
      const newSetAside = [...state.currentTurn.setAside, ...selectedValues];
      const newTurnScore = state.currentTurn.turnScore + points;

      return {
        ...state,
        currentTurn: {
          diceRemaining: newDiceRemaining,
          setAside: newSetAside,
          turnScore: newTurnScore,
          phase: "preRoll",
        },
      };
    }

    case "bank": {
      if (state.currentTurn.phase !== "preRoll") return state;
      if (state.currentTurn.turnScore === 0) return state;

      const startingBuy = parseInt(state.settings.startingBuy, 10);
      const needsStartingBuy = state.bankedScore === 0 && startingBuy > 0;
      if (needsStartingBuy && state.currentTurn.turnScore < startingBuy) return state;

      const newBanked = state.bankedScore + state.currentTurn.turnScore;
      const target = parseInt(state.settings.target, 10);
      const playerWon = newBanked >= target;

      // Bot plays its turn
      const bankThreshold = state.settings.botStrategy === "cautious" ? 300
        : state.settings.botStrategy === "aggressive" ? 700 : 500;
      const { score: botTurnScore, nextSeed } = simulateBotTurn(
        state.rngSeed,
        state.botBankedScore,
        target,
        startingBuy,
        bankThreshold,
      );
      const newBotBanked = state.botBankedScore + botTurnScore;
      const botWon = newBotBanked >= target;

      return {
        ...state,
        rngSeed: nextSeed,
        bankedScore: newBanked,
        botBankedScore: newBotBanked,
        turnsTaken: state.turnsTaken + 1,
        won: playerWon || botWon,
        playerWon,
        botWon,
        lastBotTurnScore: botTurnScore,
        currentTurn: {
          diceRemaining: 6,
          setAside: [],
          turnScore: 0,
          phase: "preRoll",
        },
        lastRoll: [],
      };
    }

    case "nextTurn": {
      if (state.currentTurn.phase !== "farkled") return state;

      // Bot plays its turn after farkle
      const startingBuy = parseInt(state.settings.startingBuy, 10);
      const bankThreshold = state.settings.botStrategy === "cautious" ? 300
        : state.settings.botStrategy === "aggressive" ? 700 : 500;
      const target = parseInt(state.settings.target, 10);
      const { score: botTurnScore, nextSeed } = simulateBotTurn(
        state.rngSeed,
        state.botBankedScore,
        target,
        startingBuy,
        bankThreshold,
      );
      const newBotBanked = state.botBankedScore + botTurnScore;
      const botWon = newBotBanked >= target;

      return {
        ...state,
        rngSeed: nextSeed,
        botBankedScore: newBotBanked,
        turnsTaken: state.turnsTaken + 1,
        won: botWon,
        botWon,
        playerWon: false,
        lastBotTurnScore: botTurnScore,
        currentTurn: {
          diceRemaining: 6,
          setAside: [],
          turnScore: 0,
          phase: "preRoll",
        },
        lastRoll: [],
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TenThousandState): { score: number } | null {
  if (!state.won) return null;
  // Score based on whether player won and their score
  return {
    score: state.playerWon
      ? state.bankedScore + Math.max(0, 500 - state.turnsTaken * 10)
      : Math.max(0, state.bankedScore - 100),
  };
}
