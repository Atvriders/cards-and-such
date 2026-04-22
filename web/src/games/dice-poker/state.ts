import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Poker (Poker Dice): 5 dice with faces 9, 10, J, Q, K, A
// 1-3 rolls per hand. Evaluate as poker hand.
// Multi-round vs bot. First to N points wins.

export type PokerFace = 9 | 10 | 11 | 12 | 13 | 14; // 9,10,J(11),Q(12),K(13),A(14)

const POKER_FACES: PokerFace[] = [9, 10, 11, 12, 13, 14];

export function faceLabel(f: PokerFace): string {
  const labels: Record<number, string> = { 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K", 14: "A" };
  return labels[f] ?? String(f);
}

export interface PokerDie {
  value: PokerFace;
  kept: boolean;
}

export type HandRank =
  | "fiveOfAKind"
  | "fourOfAKind"
  | "fullHouse"
  | "straight"
  | "threeOfAKind"
  | "twoPair"
  | "onePair"
  | "highCard";

const HAND_RANK_ORDER: HandRank[] = [
  "fiveOfAKind", "fourOfAKind", "fullHouse", "straight",
  "threeOfAKind", "twoPair", "onePair", "highCard",
];

export const HAND_LABELS: Record<HandRank, string> = {
  fiveOfAKind: "Five of a Kind",
  fourOfAKind:  "Four of a Kind",
  fullHouse:    "Full House",
  straight:     "Straight",
  threeOfAKind: "Three of a Kind",
  twoPair:      "Two Pair",
  onePair:      "One Pair",
  highCard:     "High Card",
};

export function evaluateHand(dice: PokerDie[]): HandRank {
  const counts: Record<number, number> = {};
  for (const d of dice) counts[d.value] = (counts[d.value] ?? 0) + 1;
  const countVals = Object.values(counts).sort((a, b) => b - a);

  if ((countVals[0] ?? 0) === 5) return "fiveOfAKind";
  if ((countVals[0] ?? 0) === 4) return "fourOfAKind";
  if ((countVals[0] ?? 0) === 3 && (countVals[1] ?? 0) === 2) return "fullHouse";

  // Straight: all different, max-min === 4
  const values = dice.map((d) => d.value as number).sort((a, b) => a - b);
  const isStr = new Set(values).size === 5 && (values[4] ?? 0) - (values[0] ?? 0) === 4;
  if (isStr) return "straight";

  if ((countVals[0] ?? 0) === 3) return "threeOfAKind";
  if ((countVals[0] ?? 0) === 2 && (countVals[1] ?? 0) === 2) return "twoPair";
  if ((countVals[0] ?? 0) === 2) return "onePair";
  return "highCard";
}

export function handScore(rank: HandRank): number {
  return HAND_RANK_ORDER.length - HAND_RANK_ORDER.indexOf(rank);
}

/** Returns positive if a > b, negative if a < b, 0 if equal */
export function compareHands(a: PokerDie[], b: PokerDie[]): number {
  const ra = evaluateHand(a);
  const rb = evaluateHand(b);
  const diff = handScore(ra) - handScore(rb);
  if (diff !== 0) return diff;
  // Tiebreak: sum of dice values (higher = better)
  const sumA = a.reduce((s, d) => s + d.value, 0);
  const sumB = b.reduce((s, d) => s + d.value, 0);
  return sumA - sumB;
}

export interface DicePokerSettings {
  winScore: "3" | "5" | "7";
}

export type Phase = "playerRoll" | "playerReroll" | "botTurn" | "result" | "gameOver";

export interface DicePokerState {
  settings: DicePokerSettings;
  rngSeed: number;
  phase: Phase;
  playerDice: PokerDie[];
  playerRollsUsed: number;
  playerHand: HandRank | null;
  botDice: PokerDie[];
  botHand: HandRank | null;
  playerScore: number;
  botScore: number;
  roundWinner: "player" | "bot" | "tie" | null;
  winner: "player" | "bot" | null;
  message: string;
  round: number;
}

export type DicePokerAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "bank" } // end player turn, trigger bot
  | { type: "nextRound" };

export function initialState(seed: number, settings: DicePokerSettings): DicePokerState {
  return {
    settings,
    rngSeed: seed,
    phase: "playerRoll",
    playerDice: Array.from({ length: 5 }, () => ({ value: 9 as PokerFace, kept: false })),
    playerRollsUsed: 0,
    playerHand: null,
    botDice: Array.from({ length: 5 }, () => ({ value: 9 as PokerFace, kept: false })),
    botHand: null,
    playerScore: 0,
    botScore: 0,
    roundWinner: null,
    winner: null,
    message: "Roll your dice to start the round.",
    round: 1,
  };
}

function rollPokerDice(n: number, rng: () => number): PokerDie[] {
  return Array.from({ length: n }, () => {
    const v = POKER_FACES[Math.floor(rng() * 6)] ?? 9;
    return { value: v, kept: false };
  });
}

function rerollUnkeptPoker(dice: PokerDie[], rng: () => number): PokerDie[] {
  return dice.map((d) => {
    if (d.kept) return d;
    const v = POKER_FACES[Math.floor(rng() * 6)] ?? 9;
    return { value: v, kept: false };
  });
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

/** Run bot turn: up to 3 rolls, keep highest-scoring dice greedily */
function runBotTurn(seed: number): { botDice: PokerDie[]; nextSeed: number } {
  const { rng, nextSeed: s1 } = advanceSeed(seed);
  let dice = rollPokerDice(5, rng);

  // Bot rolls up to 2 more times, keeping dice that contribute to best hand
  const { rng: rng2, nextSeed: s2 } = advanceSeed(s1);
  // Simple strategy: keep duplicates and high cards
  dice = keepBestDice(dice);
  dice = rerollUnkeptPoker(dice, rng2);

  const { rng: rng3, nextSeed: s3 } = advanceSeed(s2);
  dice = keepBestDice(dice);
  dice = rerollUnkeptPoker(dice, rng3);

  return { botDice: dice.map((d) => ({ ...d, kept: false })), nextSeed: s3 };
}

function keepBestDice(dice: PokerDie[]): PokerDie[] {
  const counts: Record<number, number> = {};
  for (const d of dice) counts[d.value] = (counts[d.value] ?? 0) + 1;
  const maxCount = Math.max(...Object.values(counts));

  // Keep dice that are part of the best group (or high cards)
  return dice.map((d) => {
    const keep = counts[d.value] === maxCount || (maxCount === 1 && d.value >= 12);
    return { ...d, kept: keep };
  });
}

export function reducer(state: DicePokerState, action: DicePokerAction): DicePokerState {
  if (state.winner !== null) return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "playerRoll" && state.phase !== "playerReroll") return state;
      if (state.playerRollsUsed >= 3) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const newDice = state.playerRollsUsed === 0
        ? rollPokerDice(5, rng)
        : rerollUnkeptPoker(state.playerDice, rng);

      const rollsUsed = state.playerRollsUsed + 1;
      const handRank = evaluateHand(newDice);

      return {
        ...state,
        rngSeed: nextSeed,
        playerDice: newDice,
        playerRollsUsed: rollsUsed,
        playerHand: handRank,
        phase: rollsUsed >= 3 ? "botTurn" : "playerReroll",
        message: rollsUsed >= 3
          ? `Your hand: ${HAND_LABELS[handRank]}. (3 rolls used — bot's turn!)`
          : `Your hand: ${HAND_LABELS[handRank]}. Keep dice and re-roll, or bank this hand.`,
      };
    }

    case "toggleKeep": {
      if (state.phase !== "playerReroll") return state;
      const newDice = state.playerDice.map((d, i) =>
        i === action.index ? { ...d, kept: !d.kept } : d
      );
      return { ...state, playerDice: newDice };
    }

    case "bank": {
      if (state.phase !== "playerReroll" && state.phase !== "botTurn") return state;
      if (state.playerRollsUsed === 0) return state;

      // Freeze player hand
      const playerHand = evaluateHand(state.playerDice);

      // Run bot turn
      const { botDice, nextSeed } = runBotTurn(state.rngSeed);
      const botHand = evaluateHand(botDice);

      const cmp = compareHands(state.playerDice, botDice);
      let roundWinner: "player" | "bot" | "tie";
      let playerScore = state.playerScore;
      let botScore = state.botScore;

      if (cmp > 0) { roundWinner = "player"; playerScore++; }
      else if (cmp < 0) { roundWinner = "bot"; botScore++; }
      else { roundWinner = "tie"; }

      const target = Number(state.settings.winScore);
      let winner: "player" | "bot" | null = null;
      if (playerScore >= target) winner = "player";
      else if (botScore >= target) winner = "bot";

      const msg = `You: ${HAND_LABELS[playerHand]} | Bot: ${HAND_LABELS[botHand]} — ${
        roundWinner === "tie" ? "Tie!" : roundWinner === "player" ? "You win this round!" : "Bot wins this round!"
      }`;

      return {
        ...state,
        rngSeed: nextSeed,
        botDice,
        botHand,
        playerHand,
        playerScore,
        botScore,
        roundWinner,
        winner,
        phase: winner ? "gameOver" : "result",
        message: msg,
      };
    }

    case "nextRound": {
      if (state.phase !== "result") return state;
      return startNextRound(state);
    }

    default:
      return state;
  }
}

export function startNextRound(state: DicePokerState): DicePokerState {
  if (state.winner !== null) return state;
  return {
    ...state,
    phase: "playerRoll",
    playerDice: Array.from({ length: 5 }, () => ({ value: 9 as PokerFace, kept: false })),
    playerRollsUsed: 0,
    playerHand: null,
    botDice: Array.from({ length: 5 }, () => ({ value: 9 as PokerFace, kept: false })),
    botHand: null,
    roundWinner: null,
    message: "Roll your dice to start the round.",
    round: state.round + 1,
  };
}

export function isTerminal(state: DicePokerState): { score: number } | null {
  if (!state.winner) return null;
  return { score: state.winner === "player" ? state.playerScore * 10 : 0 };
}
