import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 36-card Russian Durak deck: 6,7,8,9,10,J,Q,K,A per suit
const DURAK_RANKS = [6, 7, 8, 9, 10, 11, 12, 13, 1] as const; // 1=Ace (highest)
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function durakDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of DURAK_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `dk-${s}${r}` });
    }
  }
  return cards;
}

/** Rank strength: 6 lowest, Ace highest */
function rankStrength(rank: Card["rank"]): number {
  if (rank === 1) return 14; // Ace
  return rank; // 6-13
}

/** Can card beat another given a trump suit? */
export function canBeat(attacker: Card, defender: Card, trump: Suit): boolean {
  if (attacker.suit === trump && defender.suit !== trump) return false; // trump beats non-trump... we check wrong way
  // defender beats attacker if:
  // - defender is trump and attacker is not
  if (defender.suit === trump && attacker.suit !== trump) return true;
  // - same suit and higher rank
  if (defender.suit === attacker.suit && rankStrength(defender.rank) > rankStrength(attacker.rank)) return true;
  return false;
}

export type DurakPhase = "player-attack" | "player-defend" | "bot-attack" | "bot-defend" | "done";

export interface DurakState {
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  deck: readonly Card[];
  trump: Suit;
  trumpCard: Card; // the card that defines trump
  attackCard: Card | null; // card on table being attacked with
  defendCard: Card | null; // card defending (if any)
  playerScore: number; // lower = better (Durak = fool = 0 wins)
  phase: DurakPhase;
  message: string;
  finalScores: { player: number; bot: number } | null;
}

export type DurakAction =
  | { type: "play-attack"; cardId: string }
  | { type: "play-defend"; cardId: string }
  | { type: "take" }; // defender takes cards

function drawCards(hand: readonly Card[], deck: readonly Card[], needed: number): { hand: Card[]; deck: Card[] } {
  const toTake = Math.min(needed, deck.length);
  return { hand: [...hand, ...deck.slice(0, toTake)], deck: [...deck.slice(toTake)] };
}

function checkGameEnd(state: DurakState): DurakState {
  // Game over when deck is empty and a player empties hand
  if (state.deck.length > 0) return state;
  if (state.playerHand.length === 0 && state.botHand.length === 0) {
    return { ...state, phase: "done", finalScores: { player: 1, bot: 1 }, message: "Draw! Both empty hands." };
  }
  if (state.playerHand.length === 0) {
    return { ...state, phase: "done", finalScores: { player: 1, bot: 0 }, message: "You win! Bot is the Durak (fool)!" };
  }
  if (state.botHand.length === 0) {
    return { ...state, phase: "done", finalScores: { player: 0, bot: 1 }, message: "Bot wins! You are the Durak (fool)!" };
  }
  return state;
}

function botDefend(state: DurakState, rng: () => number): DurakState {
  // Bot tries to defend against the attack card
  const attack = state.attackCard!;
  const defender = state.botHand.find(c => canBeat(attack, c, state.trump));
  if (!defender) {
    // Bot takes the attack card
    const botHand = [...state.botHand, attack];
    const newDeck = state.deck;
    // Player draws up to 6
    const playerNeeds = Math.max(0, 6 - state.playerHand.length);
    const { hand: playerHand, deck } = drawCards(state.playerHand, newDeck, playerNeeds);
    // Bot took, so player attacks again
    const msg = `Bot takes ${attack.suit}${attack.rank}. You attack again.`;
    const s: DurakState = { ...state, botHand, playerHand, deck, attackCard: null, defendCard: null, phase: "player-attack", message: msg };
    return checkGameEnd(s);
  }

  // Bot defends
  const botHand = state.botHand.filter(c => c.id !== defender.id);
  const msg = `Bot defends with ${defender.suit}${defender.rank}. Your attack was beaten.`;
  // After successful defense: both draw, bot attacks next
  const playerNeeds = Math.max(0, 6 - state.playerHand.length);
  const botNeeds = Math.max(0, 6 - botHand.length);
  let newDeck = [...state.deck];
  let playerHand = [...state.playerHand];
  const drawn1 = drawCards(playerHand, newDeck, playerNeeds);
  playerHand = drawn1.hand; newDeck = drawn1.deck;
  const drawn2 = drawCards(botHand, newDeck, botNeeds);
  const newBotHand = drawn2.hand; newDeck = drawn2.deck;

  let s: DurakState = { ...state, botHand: newBotHand, playerHand, deck: newDeck, attackCard: null, defendCard: null, phase: "bot-attack", message: msg };
  s = checkGameEnd(s);
  if (s.phase === "bot-attack") s = botAttack(s, rng);
  return s;
}

function botAttack(state: DurakState, rng: () => number): DurakState {
  if (state.botHand.length === 0) {
    const s = checkGameEnd(state);
    if (s.phase !== "done") return { ...s, phase: "player-attack", message: "Bot has no cards. Your turn to attack." };
    return s;
  }
  // Bot attacks with its lowest non-trump card, or lowest trump
  const nonTrumps = state.botHand.filter(c => c.suit !== state.trump).sort((a, b) => rankStrength(a.rank) - rankStrength(b.rank));
  const trumps = state.botHand.filter(c => c.suit === state.trump).sort((a, b) => rankStrength(a.rank) - rankStrength(b.rank));
  const chosen = nonTrumps[0] ?? trumps[0]!;
  const botHand = state.botHand.filter(c => c.id !== chosen.id);
  return {
    ...state,
    botHand,
    attackCard: chosen,
    phase: "player-defend",
    message: `Bot attacks with ${chosen.suit}${chosen.rank}. Play a card to defend, or take the card.`,
  };
}

export function reducer(state: DurakState, action: DurakAction): DurakState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const s = { ...state, rngSeed: nextSeed };

  if (action.type === "play-attack" && state.phase === "player-attack") {
    const card = state.playerHand.find(c => c.id === action.cardId);
    if (!card) return state;
    const playerHand = state.playerHand.filter(c => c.id !== card.id);
    let next: DurakState = { ...s, playerHand, attackCard: card, phase: "bot-defend", message: `You attack with ${card.suit}${card.rank}. Bot defends…` };
    next = botDefend(next, rng);
    return next;
  }

  if (action.type === "play-defend" && state.phase === "player-defend") {
    const attack = state.attackCard!;
    const card = state.playerHand.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!canBeat(attack, card, state.trump)) {
      return { ...state, message: `${card.suit}${card.rank} can't beat ${attack.suit}${attack.rank}. Try another card or take it.` };
    }
    const playerHand = state.playerHand.filter(c => c.id !== card.id);
    // Successful defense: draw cards, player now attacks
    const botNeeds = Math.max(0, 6 - state.botHand.length);
    const playerNeeds = Math.max(0, 6 - playerHand.length);
    let newDeck = [...state.deck];
    let newPlayerHand = [...playerHand];
    let newBotHand = [...state.botHand];
    const d1 = drawCards(newPlayerHand, newDeck, playerNeeds);
    newPlayerHand = d1.hand; newDeck = d1.deck;
    const d2 = drawCards(newBotHand, newDeck, botNeeds);
    newBotHand = d2.hand; newDeck = d2.deck;

    let next: DurakState = { ...s, playerHand: newPlayerHand, botHand: newBotHand, deck: newDeck, attackCard: null, defendCard: null, phase: "player-attack", message: `You defended with ${card.suit}${card.rank}. Now you attack!` };
    next = checkGameEnd(next);
    return next;
  }

  if (action.type === "take" && state.phase === "player-defend") {
    // Player takes the attack card
    const attack = state.attackCard!;
    const playerHand = [...state.playerHand, attack];
    // Bot draws up to 6
    const botNeeds = Math.max(0, 6 - state.botHand.length);
    const { hand: newBotHand, deck } = drawCards(state.botHand, state.deck, botNeeds);
    let next: DurakState = { ...s, playerHand, botHand: newBotHand, deck, attackCard: null, phase: "bot-attack", message: `You took ${attack.suit}${attack.rank}. Bot attacks.` };
    next = checkGameEnd(next);
    if (next.phase === "bot-attack") next = botAttack(next, rng);
    return next;
  }

  return state;
}

export function initialState(seed: number): DurakState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(durakDeck(), mulberry32(nextSeed));

  // Deal 6 to each, flip trump card
  const playerHand = deck.slice(0, 6);
  const botHand = deck.slice(6, 12);
  const trumpCard = deck[12]!;
  const trump = trumpCard.suit;
  const remaining = [...deck.slice(13), trumpCard]; // trump card goes to bottom

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    playerHand,
    botHand,
    deck: remaining,
    trump,
    trumpCard,
    attackCard: null,
    defendCard: null,
    playerScore: 0,
    phase: "player-attack",
    message: `Trump suit is ${trump}. You attack first — pick a card!`,
    finalScores: null,
  };
}

export function isTerminal(state: DurakState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const won = state.finalScores.player > state.finalScores.bot;
  const drew = state.finalScores.player === state.finalScores.bot;
  return { score: drew ? 50 : won ? 85 : 15 };
}
