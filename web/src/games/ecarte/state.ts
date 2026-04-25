// Écarté – 2-player (player vs bot) French trick-taking game with exchange
import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface EcarteSettings {
  botDifficulty: "easy" | "hard";
}

export type EcartePhase = "propose" | "exchange" | "playing" | "done";

export interface EcarteState {
  settings: EcarteSettings;
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  stock: readonly Card[];
  trumpCard: Card;
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  turn: number; // 0 = player, 1 = bot
  leadSeat: number;
  phase: EcartePhase;
  playerTricks: number;
  botTricks: number;
  playerScore: number;
  botScore: number;
  message: string;
}

export type EcarteAction =
  | { type: "propose" }           // player proposes exchange
  | { type: "refuse" }            // player refuses exchange, plays as-is
  | { type: "exchange"; ids: string[] } // player exchanges selected cards
  | { type: "play"; cardId: string };

const HAND_SIZE = 5;
const ECARTE_RANKS: Card["rank"][] = [7, 8, 9, 10, 11, 12, 13, 1]; // 7 low, A high

function ecarteRank(rank: Card["rank"]): number {
  const idx = ECARTE_RANKS.indexOf(rank);
  return idx === -1 ? 0 : idx;
}

function cardStrength(card: Card, trump: Suit, ledSuit: Suit): number {
  if (card.suit === trump) return 200 + ecarteRank(card.rank);
  if (card.suit === ledSuit) return 100 + ecarteRank(card.rank);
  return ecarteRank(card.rank);
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(best.card, trump, led) ? cur : best
  ).seat;
}

export function legalPlays(hand: readonly Card[], trick: readonly { seat: number; card: Card }[], trump: Suit): Card[] {
  if (trick.length === 0) return [...hand];
  const ledSuit = trick[0]!.card.suit;
  const followers = hand.filter(c => c.suit === ledSuit);
  if (followers.length > 0) return followers;
  const trumpers = hand.filter(c => c.suit === trump);
  return trumpers.length > 0 ? trumpers : [...hand];
}

function botPlay(hand: readonly Card[], trick: readonly { seat: number; card: Card }[], trump: Suit): Card {
  const legal = legalPlays(hand, trick, trump);
  if (legal.length === 1) return legal[0]!;
  if (trick.length === 0) {
    const trumpCards = legal.filter(c => c.suit === trump).sort((a, b) => ecarteRank(b.rank) - ecarteRank(a.rank));
    if (trumpCards.length > 0) return trumpCards[0]!;
    return legal.reduce((hi, c) => ecarteRank(c.rank) > ecarteRank(hi.rank) ? c : hi);
  }
  const led = trick[0]!.card.suit;
  const best = trick.reduce((b, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(b.card, trump, led) ? cur : b
  );
  const winners = legal.filter(c => cardStrength(c, trump, led) > cardStrength(best.card, trump, led));
  if (winners.length > 0) return winners.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
  return legal.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
}

function scoreRound(state: EcarteState): EcarteState {
  // Win: 3+ tricks of 5. Score 1 pt; 5 tricks = vole = 2 pts. Opponent of proposer gets extra if refused.
  let pPts = 0, bPts = 0;
  if (state.playerTricks >= 3) pPts = state.playerTricks === 5 ? 2 : 1;
  else bPts = state.botTricks === 5 ? 2 : 1;
  return {
    ...state,
    playerScore: state.playerScore + pPts,
    botScore: state.botScore + bPts,
    phase: "done",
    message: `You took ${state.playerTricks} tricks. ${pPts > 0 ? `You score ${pPts}.` : `Bot scores ${bPts}.`}`,
  };
}

export function reducer(state: EcarteState, action: EcarteAction): EcarteState {
  if (state.phase === "done") return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (state.phase === "propose") {
    if (action.type === "propose") {
      // Exchange: player selects cards (up to 5) next
      return { ...state, rngSeed: nextSeed, phase: "exchange", message: "Click cards to discard, then confirm exchange." };
    }
    if (action.type === "refuse") {
      return { ...state, rngSeed: nextSeed, phase: "playing", turn: state.leadSeat, message: `Trump: ${state.trumpSuit}. Play a card.` };
    }
  }

  if (state.phase === "exchange" && action.type === "exchange") {
    const { ids } = action;
    const kept = state.playerHand.filter(c => !ids.includes(c.id));
    const drawn = state.stock.slice(0, ids.length);
    const newStock = state.stock.slice(ids.length);
    const newPlayerHand = [...kept, ...drawn];
    // Bot exchanges its weak cards
    const botExchange = state.botHand.filter(c => c.suit !== state.trumpSuit && ecarteRank(c.rank) < 3);
    const botKept = state.botHand.filter(c => !botExchange.some(x => x.id === c.id));
    const botDrawn = newStock.slice(0, Math.min(botExchange.length, newStock.length));
    const newBotHand = [...botKept, ...botDrawn];
    return {
      ...state,
      rngSeed: nextSeed,
      playerHand: newPlayerHand,
      botHand: newBotHand,
      stock: newStock.slice(botDrawn.length),
      phase: "playing",
      turn: state.leadSeat,
      message: `Exchanged. Trump: ${state.trumpSuit}. Play a card.`,
    };
  }

  if (state.phase === "playing" && action.type === "play") {
    if (state.turn !== 0) return state;
    const card = state.playerHand.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!legalPlays(state.playerHand, state.currentTrick, state.trumpSuit).some(c => c.id === card.id)) return state;

    const newPlayerHand = state.playerHand.filter(c => c.id !== card.id);
    const newTrick = [...state.currentTrick, { seat: 0, card }];
    let s: EcarteState = { ...state, rngSeed: nextSeed, playerHand: newPlayerHand, currentTrick: newTrick };

    if (newTrick.length === 2) {
      const winner = trickWinner(newTrick, state.trumpSuit);
      const pT = s.playerTricks + (winner === 0 ? 1 : 0);
      const bT = s.botTricks + (winner === 1 ? 1 : 0);
      s = { ...s, currentTrick: [], playerTricks: pT, botTricks: bT, leadSeat: winner, turn: winner };
      if (newPlayerHand.length === 0) return scoreRound(s);
      s = { ...s, message: `${winner === 0 ? "You" : "Bot"} win the trick.` };
    } else {
      // Bot plays
      const botCard = botPlay(state.botHand, newTrick, state.trumpSuit);
      const newBotHand = state.botHand.filter(c => c.id !== botCard.id);
      const fullTrick = [...newTrick, { seat: 1, card: botCard }];
      const winner = trickWinner(fullTrick, state.trumpSuit);
      const pT = s.playerTricks + (winner === 0 ? 1 : 0);
      const bT = s.botTricks + (winner === 1 ? 1 : 0);
      s = { ...s, botHand: newBotHand, currentTrick: [], playerTricks: pT, botTricks: bT, leadSeat: winner, turn: winner };
      if (newPlayerHand.length === 0) return scoreRound(s);
      s = { ...s, message: `${winner === 0 ? "You" : "Bot"} win the trick.` };
      if (winner === 1) {
        // Bot leads next
        const nextBotCard = botPlay(s.botHand, [], s.trumpSuit);
        const nextBotHand = s.botHand.filter(c => c.id !== nextBotCard.id);
        s = { ...s, botHand: nextBotHand, currentTrick: [{ seat: 1, card: nextBotCard }], turn: 0 };
      }
    }
    return s;
  }
  return state;
}

export function initialState(seed: number, settings: EcarteSettings): EcarteState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  // Écarté uses 32-card deck (7-A per suit)
  const fullDeck = newDeck().filter(c => ecarteRank(c.rank) >= 0 && ECARTE_RANKS.includes(c.rank));
  const deck = shuffle(fullDeck, dealRng);
  const playerHand = deck.slice(0, HAND_SIZE);
  const botHand = deck.slice(HAND_SIZE, HAND_SIZE * 2);
  const trumpCard = deck[HAND_SIZE * 2]!;
  const stock = deck.slice(HAND_SIZE * 2);
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    playerHand,
    botHand,
    stock,
    trumpCard,
    trumpSuit: trumpCard.suit,
    currentTrick: [],
    turn: 0,
    leadSeat: 0,
    phase: "propose",
    playerTricks: 0,
    botTricks: 0,
    playerScore: 0,
    botScore: 0,
    message: `Trump: ${trumpCard.suit}. Propose an exchange, or refuse and play.`,
  };
}

export function isTerminal(state: EcarteState): { score: number } | null {
  if (state.phase !== "done") return null;
  const total = state.playerScore + state.botScore;
  const pct = total > 0 ? state.playerScore / total : 0.5;
  return { score: Math.round(pct * 100) };
}
