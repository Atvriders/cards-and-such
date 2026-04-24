import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 40-card Spanish deck: A(1),2,3,4,5,6,7,J(11),Q(12),K(13) — no 8,9,10
const SPANISH_RANKS = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13] as const;
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

// Truco rank ordering (highest to lowest): 1♠ > 1♥ > 7♦ > 7♣ > 3 > 2 > 1(others) > K > Q > J > 6 > 5 > 4
function trucoStrength(card: Card): number {
  const r = card.rank;
  const s = card.suit;
  if (r === 1 && s === "♠") return 14;
  if (r === 1 && s === "♥") return 13;
  if (r === 7 && s === "♦") return 12;
  if (r === 7 && s === "♣") return 11;
  if (r === 3) return 10;
  if (r === 2) return 9;
  if (r === 1) return 8; // other aces
  if (r === 13) return 7; // King
  if (r === 12) return 6; // Queen
  if (r === 11) return 5; // Jack
  if (r === 7) return 4; // 7 of ♥/♠
  if (r === 6) return 3;
  if (r === 5) return 2;
  if (r === 4) return 1;
  return 0;
}

export function trucoDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of SPANISH_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `tr-${s}${r}` });
    }
  }
  return cards;
}

export type TrucoPhase = "player-turn" | "bot-turn" | "done";

export interface TrucoState {
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  playerTrick: Card | null;
  botTrick: Card | null;
  playerScore: number;
  botScore: number;
  roundsWon: { player: number; bot: number };
  phase: TrucoPhase;
  message: string;
  finalScores: { player: number; bot: number } | null;
}

export type TrucoAction = { type: "play"; cardId: string };

function resolveRound(state: TrucoState, rng: () => number): TrucoState {
  const pt = state.playerTrick!;
  const bt = state.botTrick!;
  const ps = trucoStrength(pt);
  const bs = trucoStrength(bt);

  let msg: string;
  let pWins = state.roundsWon.player;
  let bWins = state.roundsWon.bot;

  if (ps > bs) {
    pWins++;
    msg = `You won the trick! (${pt.suit}${pt.rank} vs ${bt.suit}${bt.rank})`;
  } else if (bs > ps) {
    bWins++;
    msg = `Bot won the trick. (${bt.suit}${bt.rank} vs ${pt.suit}${pt.rank})`;
  } else {
    msg = `Tie trick. (${pt.suit}${pt.rank} vs ${bt.suit}${bt.rank})`;
  }

  const newRounds = { player: pWins, bot: bWins };
  const s: TrucoState = { ...state, playerTrick: null, botTrick: null, roundsWon: newRounds, message: msg };

  // Each hand has 3 cards → 3 tricks. After all 3 tricks, tally.
  if (s.playerHand.length === 0 && s.botHand.length === 0) {
    // End of hand
    let pScore = s.playerScore;
    let bScore = s.botScore;
    if (newRounds.player > newRounds.bot) pScore++;
    else if (newRounds.bot > newRounds.player) bScore++;

    const finalScores = { player: pScore, bot: bScore };
    const endMsg = pScore > bScore
      ? `Game over! You win ${pScore}-${bScore}.`
      : bScore > pScore
      ? `Game over! Bot wins ${bScore}-${pScore}.`
      : `Game over! Tie ${pScore}-${pScore}.`;

    return { ...s, playerScore: pScore, botScore: bScore, phase: "done", finalScores, message: endMsg };
  }

  return { ...s, phase: "player-turn" };
}

function botPlay(state: TrucoState, rng: () => number): TrucoState {
  if (state.botHand.length === 0) return state;
  // Bot plays the strongest card it has
  const sorted = [...state.botHand].sort((a, b) => trucoStrength(b) - trucoStrength(a));
  const chosen = sorted[0]!;
  const botHand = state.botHand.filter(c => c.id !== chosen.id);
  const s: TrucoState = { ...state, botHand, botTrick: chosen };

  if (s.playerTrick) {
    return resolveRound(s, rng);
  }
  return { ...s, phase: "player-turn" };
}

export function reducer(state: TrucoState, action: TrucoAction): TrucoState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (action.type === "play") {
    const card = state.playerHand.find(c => c.id === action.cardId);
    if (!card) return state;
    const playerHand = state.playerHand.filter(c => c.id !== card.id);
    const s: TrucoState = { ...state, rngSeed: nextSeed, playerHand, playerTrick: card, phase: "bot-turn" };
    return botPlay(s, rng);
  }

  return state;
}

export function initialState(seed: number): TrucoState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(trucoDeck(), mulberry32(nextSeed));

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    playerHand: deck.slice(0, 3),
    botHand: deck.slice(3, 6),
    playerTrick: null,
    botTrick: null,
    playerScore: 0,
    botScore: 0,
    roundsWon: { player: 0, bot: 0 },
    phase: "player-turn",
    message: "Pick a card to play. Highest-ranked card wins each trick!",
    finalScores: null,
  };
}

export function isTerminal(state: TrucoState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const diff = state.finalScores.player - state.finalScores.bot;
  return { score: Math.max(0, Math.min(100, 50 + diff * 20)) };
}
