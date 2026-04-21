import type { Die, DieFace } from "../../engines/dice/index.js";
import { rollDice, rerollUnkept } from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ShipCaptainCrewSettings {
  rounds: "3" | "5" | "7" | "10";
}

// Phase: rolling (player's turn) | bot (bot's turn)
export type SCCPhase = "preRoll" | "rolling" | "roundOver";

export interface SCCRound {
  rollsUsed: number;
  // locked: has ship(6), captain(5), crew(4)
  hasShip: boolean;
  hasCaptain: boolean;
  hasCrew: boolean;
  dice: Die[];
  cargoScore: number; // finalised once 6+5+4 locked and no more rolls desired OR rolls exhausted
}

export interface ShipCaptainCrewState {
  settings: ShipCaptainCrewSettings;
  rngSeed: number;
  round: number;          // 1..maxRounds
  maxRounds: number;
  playerScores: number[];
  botScores: number[];
  phase: SCCPhase;
  current: SCCRound;
  botCurrent: SCCRound;
  roundResult: { player: number; bot: number } | null;
  gameOver: boolean;
}

export type SCCAction =
  | { type: "roll" }
  | { type: "bank" }    // bank cargo and pass turn to bot
  | { type: "nextRound" };

export function initialRound(): SCCRound {
  return {
    rollsUsed: 0,
    hasShip: false,
    hasCaptain: false,
    hasCrew: false,
    dice: Array.from({ length: 5 }, () => ({ value: 1 as DieFace, kept: false })),
    cargoScore: 0,
  };
}

export function initialState(seed: number, settings: ShipCaptainCrewSettings): ShipCaptainCrewState {
  return {
    settings,
    rngSeed: seed,
    round: 1,
    maxRounds: parseInt(settings.rounds, 10),
    playerScores: [],
    botScores: [],
    phase: "preRoll",
    current: initialRound(),
    botCurrent: initialRound(),
    roundResult: null,
    gameOver: false,
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

/** Process dice to lock Ship(6), Captain(5), Crew(4) in order and compute cargo. */
function processDice(dice: Die[], prev: Pick<SCCRound, "hasShip"|"hasCaptain"|"hasCrew">): SCCRound {
  let hasShip = prev.hasShip;
  let hasCaptain = prev.hasCaptain;
  let hasCrew = prev.hasCrew;

  // Collect values still in play (not yet locked)
  const remaining = dice.map((d, i) => ({ ...d, idx: i }));
  const newDice = dice.map((d) => ({ ...d }));

  // Lock ship first
  if (!hasShip) {
    const idx = remaining.findIndex((d) => d.value === 6);
    if (idx >= 0) {
      hasShip = true;
      newDice[remaining[idx]!.idx]!.kept = true;
      remaining.splice(idx, 1);
    }
  }
  if (hasShip && !hasCaptain) {
    const idx = remaining.findIndex((d) => d.value === 5);
    if (idx >= 0) {
      hasCaptain = true;
      newDice[remaining[idx]!.idx]!.kept = true;
      remaining.splice(idx, 1);
    }
  }
  if (hasShip && hasCaptain && !hasCrew) {
    const idx = remaining.findIndex((d) => d.value === 4);
    if (idx >= 0) {
      hasCrew = true;
      newDice[remaining[idx]!.idx]!.kept = true;
      remaining.splice(idx, 1);
    }
  }

  // Cargo = sum of the remaining (unlocked) dice, only if full crew
  const cargoScore =
    hasShip && hasCaptain && hasCrew
      ? remaining.reduce((s, d) => s + d.value, 0)
      : 0;

  return {
    rollsUsed: 0, // will be set by caller
    hasShip,
    hasCaptain,
    hasCrew,
    dice: newDice,
    cargoScore,
  };
}

/** Bot plays optimally: bank after first roll that gives a crew, otherwise roll up to 3 times. */
function simulateBot(seed: number): { score: number; nextSeed: number } {
  let { rng, nextSeed } = advanceSeed(seed);
  let round = initialRound();

  for (let roll = 1; roll <= 3; roll++) {
    const rawDice = roll === 1
      ? rollDice(5, rng)
      : rerollUnkept(round.dice, rng);

    const processed = processDice(rawDice, round);
    round = { ...processed, rollsUsed: roll };

    // Advance rng for next iteration
    const next = advanceSeed(nextSeed);
    rng = next.rng;
    nextSeed = next.nextSeed;

    if (round.hasShip && round.hasCaptain && round.hasCrew) {
      // Bot banks immediately on success
      break;
    }
  }

  const score = round.hasShip && round.hasCaptain && round.hasCrew ? round.cargoScore : 0;
  return { score, nextSeed };
}

export function reducer(state: ShipCaptainCrewState, action: SCCAction): ShipCaptainCrewState {
  if (state.gameOver) return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll" && state.phase !== "rolling") return state;
      if (state.current.rollsUsed >= 3) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const rawDice = state.current.rollsUsed === 0
        ? rollDice(5, rng)
        : rerollUnkept(state.current.dice, rng);

      const processed = processDice(rawDice, state.current);
      const newCurrent: SCCRound = { ...processed, rollsUsed: state.current.rollsUsed + 1 };

      return {
        ...state,
        rngSeed: nextSeed,
        current: newCurrent,
        phase: "rolling",
      };
    }

    case "bank": {
      // Player banks their cargo score (or 0 if no crew)
      if (state.phase !== "rolling") return state;

      const playerScore = state.current.hasShip && state.current.hasCaptain && state.current.hasCrew
        ? state.current.cargoScore
        : 0;

      // Bot plays its turn
      const { score: botScore, nextSeed } = simulateBot(state.rngSeed);

      const newPlayerScores = [...state.playerScores, playerScore];
      const newBotScores = [...state.botScores, botScore];
      const isLastRound = state.round >= state.maxRounds;

      return {
        ...state,
        rngSeed: nextSeed,
        playerScores: newPlayerScores,
        botScores: newBotScores,
        phase: "roundOver",
        roundResult: { player: playerScore, bot: botScore },
        gameOver: isLastRound,
      };
    }

    case "nextRound": {
      if (state.phase !== "roundOver" || state.gameOver) return state;
      return {
        ...state,
        round: state.round + 1,
        phase: "preRoll",
        current: initialRound(),
        botCurrent: initialRound(),
        roundResult: null,
      };
    }

    default:
      return state;
  }
}

export function totalScore(scores: number[]): number {
  return scores.reduce((s, n) => s + n, 0);
}

export function isTerminal(state: ShipCaptainCrewState): { score: number } | null {
  if (!state.gameOver) return null;
  const player = totalScore(state.playerScores);
  const bot = totalScore(state.botScores);
  // Score is player total; higher = better
  return { score: player * 10 + Math.max(0, player - bot) };
}
