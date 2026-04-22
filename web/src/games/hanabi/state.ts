import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type HanabiColor = "red" | "yellow" | "green" | "blue" | "white";
export const COLORS: HanabiColor[] = ["red", "yellow", "green", "blue", "white"];
export const NUMBERS = [1, 2, 3, 4, 5] as const;
export type HanabiNumber = 1 | 2 | 3 | 4 | 5;

export interface HanabiCard {
  id: number;
  color: HanabiColor;
  number: HanabiNumber;
  // Clue info (for player's own hand)
  knownColor: HanabiColor | null;
  knownNumber: HanabiNumber | null;
}

export interface HanabiClue {
  from: number;  // player index
  to: number;    // player index
  type: "color" | "number";
  value: HanabiColor | HanabiNumber;
  indices: number[]; // which cards in target hand match
}

export interface HanabiState {
  deck: HanabiCard[];
  hands: HanabiCard[][]; // [playerHand, bot1, bot2, bot3]
  fireworks: Record<HanabiColor, number>; // highest played value per color, 0=none
  discards: HanabiCard[];
  clueTokens: number;
  lives: number;
  turn: number; // 0=player, 1-3=bots
  log: string[];
  clueLog: HanabiClue[];
  finalTurnsLeft: number | null; // countdown after deck empty
  won: boolean;
  lost: boolean;
  score: number;
}

export type HanabiAction =
  | { type: "playCard"; index: number }
  | { type: "discardCard"; index: number }
  | { type: "giveClue"; toPlayer: number; clueType: "color" | "number"; value: HanabiColor | HanabiNumber };

const HAND_SIZE = 4;
const MAX_CLUES = 8;
const MAX_LIVES = 3;

function buildDeck(rng: () => number): HanabiCard[] {
  const cards: HanabiCard[] = [];
  let id = 0;
  for (const color of COLORS) {
    for (const num of NUMBERS) {
      const copies = num === 1 ? 3 : num === 5 ? 1 : 2;
      for (let c = 0; c < copies; c++) {
        cards.push({ id: id++, color, number: num, knownColor: null, knownNumber: null });
      }
    }
  }
  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j]!, cards[i]!];
  }
  return cards;
}

function computeScore(fireworks: Record<HanabiColor, number>): number {
  return Object.values(fireworks).reduce((s, v) => s + v, 0);
}

function botShouldPlay(card: HanabiCard, fireworks: Record<HanabiColor, number>): boolean {
  return fireworks[card.color] === card.number - 1;
}

function botShouldDiscard(card: HanabiCard, fireworks: Record<HanabiColor, number>, discards: HanabiCard[]): boolean {
  // Discard if already played or duplicate in discards
  if (fireworks[card.color] >= card.number) return true;
  // Discard lower numbers that are already fireworked
  return false;
}

function botChoosePlay(hand: HanabiCard[], fireworks: Record<HanabiColor, number>): number | null {
  for (let i = 0; i < hand.length; i++) {
    if (botShouldPlay(hand[i]!, fireworks)) return i;
  }
  return null;
}

function botChooseDiscard(hand: HanabiCard[], fireworks: Record<HanabiColor, number>, discards: HanabiCard[]): number {
  // Discard already-fireworked cards first
  for (let i = 0; i < hand.length; i++) {
    if (fireworks[hand[i]!.color] >= hand[i]!.number) return i;
  }
  // Else discard oldest (last in hand)
  return hand.length - 1;
}

function drawCard(deck: HanabiCard[], hand: HanabiCard[]): { deck: HanabiCard[]; hand: HanabiCard[] } {
  if (deck.length === 0) return { deck, hand };
  const [card, ...rest] = deck;
  return { deck: rest, hand: [...hand, { ...card!, knownColor: null, knownNumber: null }] };
}

function applyClueToHand(hand: HanabiCard[], clueType: "color" | "number", value: HanabiColor | HanabiNumber): HanabiCard[] {
  return hand.map(card => {
    if (clueType === "color" && card.color === value) {
      return { ...card, knownColor: value as HanabiColor };
    }
    if (clueType === "number" && card.number === value) {
      return { ...card, knownNumber: value as HanabiNumber };
    }
    return card;
  });
}

function runBotTurns(state: HanabiState): HanabiState {
  let s = state;
  while (s.turn !== 0 && !s.won && !s.lost) {
    s = botTakeTurn(s);
  }
  return s;
}

function botTakeTurn(state: HanabiState): HanabiState {
  const botIdx = state.turn;
  const hand = state.hands[botIdx]!;
  const fireworks = state.fireworks;

  // Try to play a safe card
  const playIdx = botChoosePlay(hand, fireworks);
  if (playIdx !== null) {
    return applyPlay(state, botIdx, playIdx);
  }

  // Give a clue if tokens available and there's something useful
  if (state.clueTokens > 0) {
    // Find a playable card in player's hand (hand[0]) that player doesn't know
    const playerHand = state.hands[0]!;
    for (let i = 0; i < playerHand.length; i++) {
      const card = playerHand[i]!;
      if (botShouldPlay(card, fireworks)) {
        if (card.knownColor === null) {
          return applyGiveClue(state, botIdx, 0, "color", card.color);
        }
        if (card.knownNumber === null) {
          return applyGiveClue(state, botIdx, 0, "number", card.number);
        }
      }
    }
  }

  // Discard
  const discardIdx = botChooseDiscard(hand, fireworks, state.discards);
  return applyDiscard(state, botIdx, discardIdx);
}

function applyPlay(state: HanabiState, playerIdx: number, cardIdx: number): HanabiState {
  const hands = state.hands.map(h => [...h]);
  const hand = hands[playerIdx]!;
  const card = hand[cardIdx]!;
  hand.splice(cardIdx, 1);

  const fireworks = { ...state.fireworks };
  let lives = state.lives;
  let clueTokens = state.clueTokens;
  const log = [...state.log];

  if (fireworks[card.color] === card.number - 1) {
    fireworks[card.color] = card.number;
    log.push(`P${playerIdx} played ${card.color} ${card.number}`);
    if (card.number === 5 && clueTokens < MAX_CLUES) clueTokens++;
  } else {
    lives--;
    log.push(`P${playerIdx} misplayed ${card.color} ${card.number}! Lives: ${lives}`);
  }

  let deck = [...state.deck];
  const { deck: newDeck, hand: newHand } = drawCard(deck, hand);
  deck = newDeck;
  hands[playerIdx] = newHand;

  const score = computeScore(fireworks);
  const won = score === 25;
  const lost = lives === 0;

  let finalTurnsLeft = state.finalTurnsLeft;
  if (deck.length === 0 && finalTurnsLeft === null) finalTurnsLeft = 4;
  else if (finalTurnsLeft !== null) finalTurnsLeft--;

  const nextTurn = (playerIdx + 1) % 4 as 0 | 1 | 2 | 3;
  return {
    ...state, hands, fireworks, lives, clueTokens, deck, log,
    won, lost, score, finalTurnsLeft,
    turn: (finalTurnsLeft !== null && finalTurnsLeft <= 0) ? state.turn : nextTurn as HanabiState["turn"],
  };
}

function applyDiscard(state: HanabiState, playerIdx: number, cardIdx: number): HanabiState {
  if (state.clueTokens >= MAX_CLUES) {
    // Can't discard at max clues — skip turn (shouldn't happen in practice)
  }
  const hands = state.hands.map(h => [...h]);
  const hand = hands[playerIdx]!;
  const card = hand[cardIdx]!;
  hand.splice(cardIdx, 1);

  const discards = [...state.discards, card];
  let clueTokens = Math.min(state.clueTokens + 1, MAX_CLUES);

  let deck = [...state.deck];
  const { deck: newDeck, hand: newHand } = drawCard(deck, hand);
  deck = newDeck;
  hands[playerIdx] = newHand;

  let finalTurnsLeft = state.finalTurnsLeft;
  if (deck.length === 0 && finalTurnsLeft === null) finalTurnsLeft = 4;
  else if (finalTurnsLeft !== null) finalTurnsLeft--;

  const log = [...state.log, `P${playerIdx} discarded ${card.color} ${card.number}`];
  const nextTurn = ((playerIdx + 1) % 4) as HanabiState["turn"];
  const lost = state.lives === 0 || (finalTurnsLeft !== null && finalTurnsLeft <= 0);

  return {
    ...state, hands, discards, clueTokens, deck, log,
    lost, finalTurnsLeft,
    turn: nextTurn,
  };
}

function applyGiveClue(
  state: HanabiState,
  fromIdx: number,
  toIdx: number,
  clueType: "color" | "number",
  value: HanabiColor | HanabiNumber
): HanabiState {
  if (state.clueTokens <= 0) return state;
  const hands = state.hands.map(h => [...h]);
  hands[toIdx] = applyClueToHand(hands[toIdx]!, clueType, value);

  const indices: number[] = [];
  hands[toIdx]!.forEach((c, i) => {
    if (clueType === "color" && c.color === value) indices.push(i);
    if (clueType === "number" && c.number === value) indices.push(i);
  });

  const clueLog = [...state.clueLog, { from: fromIdx, to: toIdx, type: clueType, value, indices }];
  const log = [...state.log, `P${fromIdx} told P${toIdx}: ${clueType} ${value}`];

  let finalTurnsLeft = state.finalTurnsLeft;
  if (state.deck.length === 0 && finalTurnsLeft === null) finalTurnsLeft = 4;
  else if (finalTurnsLeft !== null) finalTurnsLeft--;

  const nextTurn = ((fromIdx + 1) % 4) as HanabiState["turn"];
  const lost = state.lives === 0 || (finalTurnsLeft !== null && finalTurnsLeft <= 0);

  return {
    ...state, hands, clueTokens: state.clueTokens - 1, clueLog, log,
    finalTurnsLeft, lost,
    turn: nextTurn,
  };
}

export function initialState(seed: number): HanabiState {
  const rng = mulberry32(seed);
  const deck = buildDeck(rng);

  const hands: HanabiCard[][] = [[], [], [], []];
  let remaining = deck;
  for (let p = 0; p < 4; p++) {
    for (let i = 0; i < HAND_SIZE; i++) {
      const { deck: d, hand: h } = drawCard(remaining, hands[p]!);
      remaining = d;
      hands[p] = h;
    }
  }

  const fireworks: Record<HanabiColor, number> = { red: 0, yellow: 0, green: 0, blue: 0, white: 0 };

  return {
    deck: remaining,
    hands,
    fireworks,
    discards: [],
    clueTokens: MAX_CLUES,
    lives: MAX_LIVES,
    turn: 0,
    log: [],
    clueLog: [],
    finalTurnsLeft: null,
    won: false,
    lost: false,
    score: 0,
  };
}

export function reducer(state: HanabiState, action: HanabiAction): HanabiState {
  if (state.won || state.lost) return state;
  if (state.turn !== 0) return state; // not player's turn

  let next: HanabiState;
  switch (action.type) {
    case "playCard":
      next = applyPlay(state, 0, action.index);
      break;
    case "discardCard":
      if (state.clueTokens >= MAX_CLUES) return state;
      next = applyDiscard(state, 0, action.index);
      break;
    case "giveClue":
      if (action.toPlayer === 0 || state.clueTokens <= 0) return state;
      next = applyGiveClue(state, 0, action.toPlayer, action.clueType, action.value);
      break;
    default:
      return state;
  }

  // Run bot turns
  return runBotTurns(next);
}

export function isTerminal(state: HanabiState): { score: number } | null {
  if (state.won) return { score: state.score * 4 };
  if (state.lost) return { score: state.score * 2 };
  return null;
}
