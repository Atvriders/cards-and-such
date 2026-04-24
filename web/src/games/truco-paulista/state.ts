import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 40-card Spanish deck
const SPANISH_RANKS = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13] as const;
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

// Manilha rank order for Truco Paulista — changes each hand by rotating through ranks
// Standard manilha is the rank just above 7 in the deck cycle: 4 (after K=3 in full deck)
// Simplified: fixed manilhas are 4s (strongest), then: A, 7, 3, 2, K, J, Q, 6, 5
// For playability: we use fixed manilhas = 4s
const MANILHA_RANK = 4 as const;

export function trucoPaulistaDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of SPANISH_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `tp-${s}${r}` });
    }
  }
  return cards;
}

// Manilha suit strength: Clubs > Hearts > Spades > Diamonds
function manilhaStrength(suit: Suit): number {
  if (suit === "♣") return 4;
  if (suit === "♥") return 3;
  if (suit === "♠") return 2;
  if (suit === "♦") return 1;
  return 0;
}

export function cardStrength(card: Card): number {
  if (card.rank === MANILHA_RANK) return 10 + manilhaStrength(card.suit); // 11-14
  if (card.rank === 1) return 9; // Ace
  if (card.rank === 7) return 8;
  if (card.rank === 3) return 7;
  if (card.rank === 2) return 6;
  if (card.rank === 13) return 5; // King
  if (card.rank === 11) return 4; // Jack
  if (card.rank === 12) return 3; // Queen
  if (card.rank === 6) return 2;
  if (card.rank === 5) return 1;
  return 0; // nothing below 4 except manilha
}

export type TrucoPaulistaPhase = "player-turn" | "bot-turn" | "done";

export interface TrucoPaulistaState {
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  playerTrick: Card | null;
  botTrick: Card | null;
  playerScore: number;
  botScore: number;
  roundsWon: { player: number; bot: number };
  phase: TrucoPaulistaPhase;
  message: string;
  finalScores: { player: number; bot: number } | null;
}

export type TrucoPaulistaAction = { type: "play"; cardId: string };

function resolveRound(state: TrucoPaulistaState): TrucoPaulistaState {
  const pt = state.playerTrick!;
  const bt = state.botTrick!;
  const ps = cardStrength(pt);
  const bs = cardStrength(bt);

  let msg: string;
  let pWins = state.roundsWon.player;
  let bWins = state.roundsWon.bot;

  if (ps > bs) {
    pWins++;
    msg = `You won the trick! (${pt.suit}${pt.rank} vs ${bt.suit}${bt.rank})`;
  } else if (bs > ps) {
    bWins++;
    msg = `Bot won the trick. (${bt.suit}${bt.rank} beats ${pt.suit}${pt.rank})`;
  } else {
    msg = `Tied trick! (${pt.suit}${pt.rank} vs ${bt.suit}${bt.rank})`;
  }

  const newRounds = { player: pWins, bot: bWins };
  const s: TrucoPaulistaState = { ...state, playerTrick: null, botTrick: null, roundsWon: newRounds, message: msg };

  if (s.playerHand.length === 0 && s.botHand.length === 0) {
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

function botPlay(state: TrucoPaulistaState): TrucoPaulistaState {
  if (state.botHand.length === 0) return state;
  const sorted = [...state.botHand].sort((a, b) => cardStrength(b) - cardStrength(a));
  const chosen = sorted[0]!;
  const botHand = state.botHand.filter(c => c.id !== chosen.id);
  const s: TrucoPaulistaState = { ...state, botHand, botTrick: chosen };
  if (s.playerTrick) return resolveRound(s);
  return { ...s, phase: "player-turn" };
}

export function reducer(state: TrucoPaulistaState, action: TrucoPaulistaAction): TrucoPaulistaState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (action.type === "play") {
    const card = state.playerHand.find(c => c.id === action.cardId);
    if (!card) return state;
    const playerHand = state.playerHand.filter(c => c.id !== card.id);
    const s: TrucoPaulistaState = { ...state, rngSeed: nextSeed, playerHand, playerTrick: card, phase: "bot-turn" };
    return botPlay(s);
  }
  return state;
}

export function initialState(seed: number): TrucoPaulistaState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(trucoPaulistaDeck(), mulberry32(nextSeed));

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
    message: "Play a card! 4s are Manilhas (highest). Clubs 4 > Hearts 4 > Spades 4 > Diamonds 4.",
    finalScores: null,
  };
}

export function isTerminal(state: TrucoPaulistaState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const diff = state.finalScores.player - state.finalScores.bot;
  return { score: Math.max(0, Math.min(100, 50 + diff * 20)) };
}
