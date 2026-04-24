// Bourré – Cajun Louisiana trick-taking game
// 5 cards, trump chosen by flipping a card, must win at least 1 trick or "bourre"
import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BourreSettings {
  botDifficulty: "easy" | "hard";
}

export type BourrePhase = "fold-or-play" | "playing" | "done";

export interface BourreState {
  settings: BourreSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  trumpCard: Card;
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: BourrePhase;
  folded: readonly boolean[];   // seats that folded
  tricks: readonly number[];    // tricks won per seat
  pot: number;
  score: readonly [number, number]; // [player net, bot net]
  message: string;
}

export type BourreAction =
  | { type: "fold" }
  | { type: "stay" }
  | { type: "play"; cardId: string };

const HAND_SIZE = 5;

function rankOrder(rank: Card["rank"]): number {
  if (rank === 1) return 14;
  return rank;
}

function cardStrength(card: Card, trump: Suit, ledSuit: Suit): number {
  if (card.suit === trump) return 200 + rankOrder(card.rank);
  if (card.suit === ledSuit) return 100 + rankOrder(card.rank);
  return rankOrder(card.rank);
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(best.card, trump, led) ? cur : best
  ).seat;
}

export function legalPlays(state: BourreState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  const trick = state.currentTrick;
  if (trick.length === 0) return hand;
  const led = trick[0]!.card.suit;
  const matching = hand.filter(c => c.suit === led);
  if (matching.length > 0) return matching;
  const trumpCards = hand.filter(c => c.suit === state.trumpSuit);
  if (trumpCards.length > 0) return trumpCards; // must trump if can't follow
  return hand;
}

function botShouldFold(hand: readonly Card[], trump: Suit): boolean {
  const trumpCount = hand.filter(c => c.suit === trump || c.rank === 1).length;
  return trumpCount === 0;
}

function botPlay(state: BourreState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 0) return state.hands[seat]![0]!;
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  const trump = state.trumpSuit;
  if (trick.length === 0) {
    const trumpCards = legal.filter(c => c.suit === trump).sort((a, b) => rankOrder(b.rank) - rankOrder(a.rank));
    if (trumpCards.length > 0) return trumpCards[0]!;
    return legal.reduce((hi, c) => rankOrder(c.rank) > rankOrder(hi.rank) ? c : hi);
  }
  const led = trick[0]!.card.suit;
  const best = trick.reduce((b, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(b.card, trump, led) ? cur : b
  );
  const winCards = legal.filter(c => cardStrength(c, trump, led) > cardStrength(best.card, trump, led));
  if (winCards.length > 0) return winCards.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
  return legal.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
}

function applyPlay(state: BourreState, seat: number, card: Card): BourreState {
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: BourreState = { ...state, hands: newHands, currentTrick: newTrick };

  const activePlayers = state.folded.filter(f => !f).length;
  if (newTrick.length === activePlayers) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const newTricks = state.tricks.map((t, i) => i === winner ? t + 1 : t);
    s = { ...s, currentTrick: [], tricks: newTricks, leadSeat: winner, turn: winner };

    // Find first non-folded active player starting from winner
    let nextTurn = winner;
    for (let attempt = 0; attempt < 4; attempt++) {
      if (!s.folded[nextTurn]) break;
      nextTurn = (nextTurn + 1) % 4;
    }

    // Check game end: active players have played all their cards
    const firstActive = state.folded.findIndex(f => !f);
    const activeHandEmpty = firstActive >= 0 && newHands[firstActive]!.length === 0;

    if (activeHandEmpty) {
      const maxTricks = Math.max(...newTricks.filter((_, i) => !state.folded[i]));
      const winners = newTricks.map((t, i) => !state.folded[i] && t === maxTricks);
      const winCount = winners.filter(Boolean).length;
      const playerBourre = !state.folded[0] && newTricks[0] === 0;
      const playerWins = winners[0] === true;
      const playerNet = playerWins ? Math.floor(state.pot / winCount) : (playerBourre ? -state.pot : 0);
      let botNet = 0;
      for (let i = 1; i < 4; i++) {
        if (!state.folded[i]) {
          const bWins = winners[i] === true;
          const bBourre = newTricks[i] === 0;
          botNet += bWins ? Math.floor(state.pot / winCount) : (bBourre ? -state.pot : 0);
        }
      }
      const newScore: [number, number] = [state.score[0] + playerNet, state.score[1] + botNet];
      const msg = state.folded[0]
        ? `You folded. Bot result: ${newTricks[winner]} tricks.`
        : playerBourre
        ? `Bourré! You took 0 tricks and lose the pot.`
        : playerWins
        ? `You win ${Math.floor(state.pot / winCount)} from the pot with ${newTricks[0]} tricks!`
        : `You took ${newTricks[0]} tricks. No gain/loss.`;
      s = { ...s, score: newScore, phase: "done", message: msg };
    } else {
      s = { ...s, turn: nextTurn };
    }
  } else {
    // Advance, skipping folded
    let nextTurn = (seat + 1) % 4;
    for (let attempt = 0; attempt < 4; attempt++) {
      if (!s.folded[nextTurn]) break;
      nextTurn = (nextTurn + 1) % 4;
    }
    s = { ...s, turn: nextTurn };
  }
  return s;
}

export function reducer(state: BourreState, action: BourreAction): BourreState {
  if (state.phase === "done") return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (state.phase === "fold-or-play") {
    if (state.turn !== 0) return state;

    const playerFolds = action.type === "fold";
    const newFolded: boolean[] = [...state.folded];
    newFolded[0] = playerFolds;

    // Bots decide
    for (let i = 1; i < 4; i++) {
      newFolded[i] = botShouldFold(state.hands[i]!, state.trumpSuit);
    }

    const allFolded = newFolded.every(f => f);
    if (allFolded) {
      return {
        ...state,
        rngSeed: nextSeed,
        folded: newFolded,
        phase: "done",
        message: "Everyone folded. No winner.",
      };
    }

    // Find first non-folded player to lead
    let firstActive = 0;
    while (newFolded[firstActive]) firstActive = (firstActive + 1) % 4;

    let s: BourreState = {
      ...state,
      rngSeed: nextSeed,
      folded: newFolded,
      phase: "playing",
      turn: firstActive,
      leadSeat: firstActive,
      message: `Trump: ${state.trumpSuit}. ${playerFolds ? "You folded." : "Playing!"} Bots ${newFolded.slice(1).map((f, i) => f ? `B${i + 1}` : "").filter(Boolean).join(", ")} folded.`,
    };

    // Auto-play bots until it's the player's turn or game is done
    while (s.phase === "playing" && s.turn !== 0) {
      if (s.folded[s.turn]) {
        s = { ...s, turn: (s.turn + 1) % 4 };
        continue;
      }
      const botCard = botPlay(s, s.turn);
      s = applyPlay(s, s.turn, botCard);
    }

    if (s.phase === "playing" && playerFolds) {
      // Continue bots until done
      while (s.phase === "playing") {
        if (s.folded[s.turn]) {
          s = { ...s, turn: (s.turn + 1) % 4 };
          continue;
        }
        const botCard = botPlay(s, s.turn);
        s = applyPlay(s, s.turn, botCard);
      }
    }
    return s;
  }

  if (state.phase === "playing" && action.type === "play") {
    if (state.turn !== 0) return state;
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

    let s: BourreState = { ...state, rngSeed: nextSeed };
    s = applyPlay(s, 0, card);
    while (s.phase === "playing" && s.turn !== 0) {
      if (s.folded[s.turn]) {
        s = { ...s, turn: (s.turn + 1) % 4 };
        continue;
      }
      const botCard = botPlay(s, s.turn);
      s = applyPlay(s, s.turn, botCard);
    }
    return s;
  }

  return state;
}

export function initialState(seed: number, settings: BourreSettings): BourreState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);
  const hands: Card[][] = [
    deck.slice(0, HAND_SIZE),
    deck.slice(HAND_SIZE, HAND_SIZE * 2),
    deck.slice(HAND_SIZE * 2, HAND_SIZE * 3),
    deck.slice(HAND_SIZE * 3, HAND_SIZE * 4),
  ];
  const trumpCard = deck[HAND_SIZE * 4]!;
  const trumpSuit = trumpCard.suit;
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    trumpCard,
    trumpSuit,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "fold-or-play",
    folded: [false, false, false, false],
    tricks: [0, 0, 0, 0],
    pot: 10,
    score: [0, 0],
    message: `Trump is ${trumpSuit}. Stay in or fold?`,
  };
}

export function isTerminal(state: BourreState): { score: number } | null {
  if (state.phase !== "done") return null;
  const diff = state.score[0] - state.score[1];
  return { score: Math.max(0, Math.min(100, 50 + diff * 3)) };
}
