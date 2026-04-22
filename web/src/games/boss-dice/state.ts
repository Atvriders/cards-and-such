import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { Die, DieFace } from "../../engines/dice/index.js";
import { rollDice, rerollUnkept } from "../../engines/dice/index.js";

// Boss Dice: Ship Captain Crew variant.
// Roll 5 dice up to 3 times. Must lock 6, 5, 4 in order.
// Cargo = sum of remaining 2 dice (when 6+5+4 locked).
// Multi-round: play N rounds, total cargo wins.

export interface BossDiceSettings {
  rounds: "3" | "5" | "7";
}

export type BossPhase = "preRoll" | "rolling" | "roundOver" | "gameOver";

export interface BossRound {
  rollsUsed: number;
  has6: boolean;
  has5: boolean;
  has4: boolean;
  dice: Die[];
  cargo: number;
}

export interface BossDiceState {
  settings: BossDiceSettings;
  rngSeed: number;
  phase: BossPhase;
  round: number;
  maxRounds: number;
  playerScores: number[];
  botScores: number[];
  current: BossRound;
  roundResult: { player: number; bot: number } | null;
  message: string;
  gameOver: boolean;
}

export type BossDiceAction =
  | { type: "roll" }
  | { type: "bank" }
  | { type: "nextRound" };

export function initialRound(): BossRound {
  return {
    rollsUsed: 0,
    has6: false,
    has5: false,
    has4: false,
    dice: Array.from({ length: 5 }, () => ({ value: 1 as DieFace, kept: false })),
    cargo: 0,
  };
}

export function initialState(seed: number, settings: BossDiceSettings): BossDiceState {
  return {
    settings,
    rngSeed: seed,
    phase: "preRoll",
    round: 1,
    maxRounds: parseInt(settings.rounds, 10),
    playerScores: [],
    botScores: [],
    current: initialRound(),
    roundResult: null,
    message: "Roll to start! Lock 6, 5, 4 in order. Cargo = sum of remaining dice.",
    gameOver: false,
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function processBoss(dice: Die[], prev: Pick<BossRound, "has6" | "has5" | "has4">): Omit<BossRound, "rollsUsed"> {
  let has6 = prev.has6;
  let has5 = prev.has5;
  let has4 = prev.has4;
  const newDice = dice.map((d) => ({ ...d }));
  const remaining = dice.map((d, i) => ({ ...d, idx: i }));

  if (!has6) {
    const idx = remaining.findIndex((d) => d.value === 6);
    if (idx >= 0) { has6 = true; newDice[remaining[idx]!.idx]!.kept = true; remaining.splice(idx, 1); }
  }
  if (has6 && !has5) {
    const idx = remaining.findIndex((d) => d.value === 5);
    if (idx >= 0) { has5 = true; newDice[remaining[idx]!.idx]!.kept = true; remaining.splice(idx, 1); }
  }
  if (has6 && has5 && !has4) {
    const idx = remaining.findIndex((d) => d.value === 4);
    if (idx >= 0) { has4 = true; newDice[remaining[idx]!.idx]!.kept = true; remaining.splice(idx, 1); }
  }

  const cargo = has6 && has5 && has4 ? remaining.reduce((s, d) => s + d.value, 0) : 0;
  return { has6, has5, has4, dice: newDice, cargo };
}

function simulateBot(seed: number): { score: number; nextSeed: number } {
  let { rng, nextSeed } = advanceSeed(seed);
  let round = initialRound();

  for (let roll = 1; roll <= 3; roll++) {
    const raw = roll === 1 ? rollDice(5, rng) : rerollUnkept(round.dice, rng);
    const proc = processBoss(raw, round);
    round = { ...proc, rollsUsed: roll };
    const next = advanceSeed(nextSeed);
    rng = next.rng; nextSeed = next.nextSeed;
    if (round.has6 && round.has5 && round.has4) break;
  }
  return { score: round.cargo, nextSeed };
}

export function reducer(state: BossDiceState, action: BossDiceAction): BossDiceState {
  if (state.gameOver) return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll" && state.phase !== "rolling") return state;
      if (state.current.rollsUsed >= 3) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const raw = state.current.rollsUsed === 0
        ? rollDice(5, rng)
        : rerollUnkept(state.current.dice, rng);

      const proc = processBoss(raw, state.current);
      const newCurrent: BossRound = { ...proc, rollsUsed: state.current.rollsUsed + 1 };
      const crewComplete = newCurrent.has6 && newCurrent.has5 && newCurrent.has4;
      const canRollAgain = newCurrent.rollsUsed < 3;

      return {
        ...state,
        rngSeed: nextSeed,
        current: newCurrent,
        phase: "rolling",
        message: crewComplete
          ? `6-5-4 locked! Cargo: ${newCurrent.cargo}. ${canRollAgain ? "Bank or roll for more cargo." : "Out of rolls — banking."}`
          : `Roll ${newCurrent.rollsUsed}/3. ${canRollAgain ? "Keep rolling or bank." : "Out of rolls — banking."}`,
      };
    }

    case "bank": {
      if (state.phase !== "rolling") return state;

      const playerScore = state.current.cargo;
      const { score: botScore, nextSeed } = simulateBot(state.rngSeed);
      const newPlayerScores = [...state.playerScores, playerScore];
      const newBotScores = [...state.botScores, botScore];
      const isLastRound = state.round >= state.maxRounds;

      const totalPlayer = newPlayerScores.reduce((s, n) => s + n, 0);
      const totalBot = newBotScores.reduce((s, n) => s + n, 0);

      return {
        ...state,
        rngSeed: nextSeed,
        playerScores: newPlayerScores,
        botScores: newBotScores,
        phase: isLastRound ? "gameOver" : "roundOver",
        roundResult: { player: playerScore, bot: botScore },
        gameOver: isLastRound,
        message: isLastRound
          ? `Round ${state.round}: You ${playerScore}, Bot ${botScore}. Final — You: ${totalPlayer}, Bot: ${totalBot}. ${totalPlayer >= totalBot ? "You win!" : "Bot wins!"}`
          : `Round ${state.round}: You ${playerScore}, Bot ${botScore}. Totals — You: ${totalPlayer}, Bot: ${totalBot}.`,
      };
    }

    case "nextRound": {
      if (state.phase !== "roundOver" || state.gameOver) return state;
      return {
        ...state,
        round: state.round + 1,
        phase: "preRoll",
        current: initialRound(),
        roundResult: null,
        message: `Round ${state.round + 1}. Roll to start!`,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: BossDiceState): { score: number } | null {
  if (!state.gameOver) return null;
  const player = state.playerScores.reduce((s, n) => s + n, 0);
  const bot = state.botScores.reduce((s, n) => s + n, 0);
  return { score: player * 10 + Math.max(0, player - bot) };
}
