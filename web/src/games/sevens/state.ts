import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type { Card };

export interface SevensSettings {
  opponents: "1" | "2" | "3";
}

export type PlayerIndex = 0 | 1 | 2 | 3;

/** For each suit: lowest played rank (extending down from 7) and highest played rank (extending up) */
export interface SuitRow {
  low: number;  // current lowest card played (starts at 7)
  high: number; // current highest card played (starts at 7)
  played: boolean; // whether the 7 has been placed yet
}

export interface SevensState {
  settings: SevensSettings;
  rngSeed: number;
  numPlayers: number;
  hands: readonly (readonly Card[])[];
  board: Record<Suit, SuitRow>;
  turn: PlayerIndex;
  winner: PlayerIndex | null;
  lastAction: string | null;
  passCount: number; // consecutive passes (cycle detection)
}

export type SevensAction =
  | { type: "play"; card: Card }
  | { type: "pass" };

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

function emptyBoard(): Record<Suit, SuitRow> {
  return Object.fromEntries(SUITS.map((s) => [s, { low: 0, high: 0, played: false }])) as Record<Suit, SuitRow>;
}

function canPlay(card: Card, board: Record<Suit, SuitRow>): boolean {
  const row = board[card.suit];
  if (card.rank === 7) return !row.played;
  if (!row.played) return false;
  return card.rank === row.low - 1 || card.rank === row.high + 1;
}

function playableCards(hand: readonly Card[], board: Record<Suit, SuitRow>): Card[] {
  return hand.filter((c) => canPlay(c, board));
}

function applyPlay(board: Record<Suit, SuitRow>, card: Card): Record<Suit, SuitRow> {
  const row = board[card.suit];
  let newRow: SuitRow;
  if (card.rank === 7) {
    newRow = { low: 7, high: 7, played: true };
  } else if (card.rank === row.low - 1) {
    newRow = { ...row, low: row.low - 1 };
  } else {
    newRow = { ...row, high: row.high + 1 };
  }
  return { ...board, [card.suit]: newRow };
}

/** Run a bot turn: play a legal card (prefer longest extensions) or pass. */
function botTurn(state: SevensState): SevensState {
  const hand = state.hands[state.turn]!;
  const playable = playableCards(hand, state.board);
  if (playable.length > 0) {
    // Simple heuristic: prefer 7s first, then random
    const sevens = playable.filter((c) => c.rank === 7);
    const card = sevens.length > 0 ? sevens[0]! : playable[0]!;
    return applyCardPlay(state, card, state.turn);
  } else {
    return applyPass(state);
  }
}

function applyCardPlay(state: SevensState, card: Card, player: PlayerIndex): SevensState {
  const newHand = state.hands[player]!.filter((c) => c.id !== card.id);
  const newHands = state.hands.map((h, i) => i === player ? newHand : h) as readonly (readonly Card[])[];
  const newBoard = applyPlay(state.board, card);
  const winner: PlayerIndex | null = newHand.length === 0 ? player : null;
  const nextTurn = ((player + 1) % state.numPlayers) as PlayerIndex;

  return {
    ...state,
    hands: newHands,
    board: newBoard,
    turn: nextTurn,
    winner,
    lastAction: `Player ${player + 1} played ${card.rank}${card.suit}`,
    passCount: 0,
  };
}

function applyPass(state: SevensState): SevensState {
  const nextTurn = ((state.turn + 1) % state.numPlayers) as PlayerIndex;
  const passCount = state.passCount + 1;
  // Detect deadlock (all players passed in a row)
  let winner = state.winner;
  if (passCount >= state.numPlayers) {
    // Force win to whoever has fewest cards
    let minCards = Infinity;
    let minPlayer = 0;
    for (let i = 0; i < state.numPlayers; i++) {
      if (state.hands[i]!.length < minCards) { minCards = state.hands[i]!.length; minPlayer = i; }
    }
    winner = minPlayer as PlayerIndex;
  }
  return {
    ...state,
    turn: nextTurn,
    lastAction: `Player ${state.turn + 1} passed.`,
    passCount,
    winner,
  };
}

export function initialState(seed: number, settings: SevensSettings): SevensState {
  const numPlayers = parseInt(settings.opponents, 10) + 1;
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const hands: Card[][] = Array.from({ length: numPlayers }, () => []);
  deck.forEach((card, i) => hands[i % numPlayers]!.push(card));
  // Sort hands for display
  const sortedHands = hands.map((h) =>
    [...h].sort((a, b) => {
      if (a.suit !== b.suit) return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
      return a.rank - b.rank;
    })
  );

  // Find who has 7♦ — they go first
  let startPlayer: PlayerIndex = 0;
  for (let i = 0; i < numPlayers; i++) {
    if (sortedHands[i]!.some((c) => c.suit === "♦" && c.rank === 7)) {
      startPlayer = i as PlayerIndex;
      break;
    }
  }

  return {
    settings,
    rngSeed: seed,
    numPlayers,
    hands: sortedHands,
    board: emptyBoard(),
    turn: startPlayer,
    winner: null,
    lastAction: `Player ${startPlayer + 1} holds 7♦ and goes first.`,
    passCount: 0,
  };
}

export function reducer(state: SevensState, action: SevensAction): SevensState {
  if (state.winner !== null) return state;

  if (action.type === "play") {
    const hand = state.hands[0]; // only player 0 is human
    if (state.turn !== 0) return state; // not player's turn
    if (!hand!.some((c) => c.id === action.card.id)) return state; // not in hand
    if (!canPlay(action.card, state.board)) return state; // illegal move

    let next = applyCardPlay(state, action.card, 0);
    // Run bot turns
    while (next.winner === null && next.turn !== 0) {
      next = botTurn(next);
    }
    return next;
  }

  if (action.type === "pass") {
    if (state.turn !== 0) return state;
    const playable = playableCards(state.hands[0]!, state.board);
    if (playable.length > 0) return state; // must play if able

    let next = applyPass(state);
    while (next.winner === null && next.turn !== 0) {
      next = botTurn(next);
    }
    return next;
  }

  return state;
}

export function isTerminal(state: SevensState): { score: number } | null {
  if (state.winner === null) return null;
  // Score: 1000 if player won, else 0
  return { score: state.winner === 0 ? 1000 : 0 };
}

export { canPlay, playableCards };
