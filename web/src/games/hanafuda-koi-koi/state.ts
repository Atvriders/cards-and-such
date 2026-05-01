import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Hanafuda Koi-Koi — real capture mechanics on a 48-card flower deck.
// 12 months × 4 cards each. Card categories: hikari (5 brights), tane (animals),
// tan (ribbons), kasu (plain). Capture by matching month with field card.

export const TOTAL_ROUNDS = 6;
export const HAND_SIZE = 8;
export const FIELD_SIZE = 8;

export type CardCategory = "hikari" | "tane" | "tan" | "kasu";
export interface HanafudaCard {
  id: number;
  month: number;
  category: CardCategory;
  name: string;
}

const MONTH_NAMES = ["Pine","Plum","Cherry","Wisteria","Iris","Peony","Clover","Susuki","Chrysanthemum","Maple","Willow","Paulownia"];

const MONTH_CATS: CardCategory[][] = [
  ["hikari","tan","kasu","kasu"],
  ["tane","tan","kasu","kasu"],
  ["hikari","tan","kasu","kasu"],
  ["tane","tan","kasu","kasu"],
  ["tane","tan","kasu","kasu"],
  ["tane","tan","kasu","kasu"],
  ["tane","tan","kasu","kasu"],
  ["hikari","tane","kasu","kasu"],
  ["tane","tan","kasu","kasu"],
  ["tane","tan","kasu","kasu"],
  ["hikari","tane","tan","kasu"],
  ["hikari","tane","kasu","kasu"],
];

export const DECK: HanafudaCard[] = (() => {
  const out: HanafudaCard[] = [];
  let id = 0;
  for (let m = 0; m < 12; m++) {
    const cats = MONTH_CATS[m]!;
    for (let i = 0; i < 4; i++) {
      out.push({ id: id++, month: m + 1, category: cats[i]!, name: `${MONTH_NAMES[m]} ${cats[i]}` });
    }
  }
  return out;
})();

export interface HanafudaKoiKoiSettings { dummy: boolean; }
export type Phase = "select" | "drawn" | "result" | "done";

export interface HanafudaKoiKoiState {
  rngSeed: number;
  round: number;
  hand: number[];
  cpuHand: number[];
  field: number[];
  deck: number[];
  captured: number[];
  cpuCaptured: number[];
  selected: number | null;
  drawnCard: number | null;
  matches: number[];
  drawnMatches: number[];
  log: string;
  score: number;
  cpuScore: number;
  phase: Phase;
}
export type HanafudaKoiKoiAction =
  | { type: "select"; cardId: number }
  | { type: "matchHand"; fieldId: number }
  | { type: "matchDraw"; fieldId: number }
  | { type: "discardHand" }
  | { type: "discardDraw" }
  | { type: "next" };

export function cardOf(id: number): HanafudaCard { return DECK[id]!; }
export function cardName(id: number): string { return cardOf(id).name; }

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function scoreCaptured(ids: number[]): number {
  let pts = 0;
  const cats = ids.map(i => cardOf(i).category);
  const hikari = cats.filter(c => c === "hikari").length;
  const tane = cats.filter(c => c === "tane").length;
  const tan = cats.filter(c => c === "tan").length;
  const kasu = cats.filter(c => c === "kasu").length;
  if (hikari >= 5) pts += 15;
  else if (hikari === 4) pts += 8;
  else if (hikari === 3) pts += 5;
  if (tane >= 5) pts += 1 + (tane - 5);
  if (tan >= 5) pts += 1 + (tan - 5);
  if (kasu >= 10) pts += 1 + (kasu - 10);
  return pts;
}

function findMatches(field: number[], cardId: number): number[] {
  const m = cardOf(cardId).month;
  return field.filter(f => cardOf(f).month === m);
}

export function initialState(seed: number, _s: HanafudaKoiKoiSettings): HanafudaKoiKoiState {
  const rng = mulberry32(seed);
  const ids = shuffle(DECK.map(c => c.id), rng);
  const hand = ids.slice(0, HAND_SIZE);
  const cpuHand = ids.slice(HAND_SIZE, HAND_SIZE * 2);
  const field = ids.slice(HAND_SIZE * 2, HAND_SIZE * 2 + FIELD_SIZE);
  const deck = ids.slice(HAND_SIZE * 2 + FIELD_SIZE);
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    round: 1, hand, cpuHand, field, deck,
    captured: [], cpuCaptured: [],
    selected: null, drawnCard: null, matches: [], drawnMatches: [],
    log: "Choose a card from your hand.",
    score: 0, cpuScore: 0, phase: "select",
  };
}

function dealRound(state: HanafudaKoiKoiState): HanafudaKoiKoiState {
  const rng = mulberry32(state.rngSeed);
  const ids = shuffle(DECK.map(c => c.id), rng);
  return {
    ...state,
    rngSeed: Math.floor(rng() * 2 ** 31),
    hand: ids.slice(0, HAND_SIZE),
    cpuHand: ids.slice(HAND_SIZE, HAND_SIZE * 2),
    field: ids.slice(HAND_SIZE * 2, HAND_SIZE * 2 + FIELD_SIZE),
    deck: ids.slice(HAND_SIZE * 2 + FIELD_SIZE),
    captured: [], cpuCaptured: [],
    selected: null, drawnCard: null, matches: [], drawnMatches: [],
    log: `Round ${state.round}: choose a card.`,
    phase: "select",
  };
}

function cpuTurn(s: HanafudaKoiKoiState): HanafudaKoiKoiState {
  if (s.cpuHand.length === 0) {
    if (s.hand.length === 0) {
      return { ...s, phase: "result", log: `Round ${s.round} ended.` };
    }
    return { ...s, phase: "select", log: "Your turn." };
  }
  const rng = mulberry32(s.rngSeed);
  let cardIdx = s.cpuHand.findIndex(c => findMatches(s.field, c).length > 0);
  if (cardIdx === -1) cardIdx = 0;
  const card = s.cpuHand[cardIdx]!;
  const cpuHand = [...s.cpuHand]; cpuHand.splice(cardIdx, 1);
  let field = [...s.field];
  const cpuCaptured = [...s.cpuCaptured];
  const handMatches = findMatches(field, card);
  if (handMatches.length > 0) {
    const m = handMatches[0]!;
    field = field.filter(f => f !== m);
    cpuCaptured.push(card, m);
  } else {
    field.push(card);
  }
  const deck = [...s.deck];
  let log = `CPU played ${cardName(card)}.`;
  if (deck.length > 0) {
    const drawn = deck.shift()!;
    const drawMatches = findMatches(field, drawn);
    if (drawMatches.length > 0) {
      const m = drawMatches[0]!;
      field = field.filter(f => f !== m);
      cpuCaptured.push(drawn, m);
      log += ` Drew ${cardName(drawn)} and matched.`;
    } else {
      field.push(drawn);
      log += ` Drew ${cardName(drawn)}, no match.`;
    }
  }
  const next = Math.floor(rng() * 2 ** 31);
  const cpuScore = scoreCaptured(cpuCaptured);
  const isEnd = s.hand.length === 0 && cpuHand.length === 0;
  return { ...s, rngSeed: next, cpuHand, field, deck, cpuCaptured, log, cpuScore,
           phase: isEnd ? "result" : "select",
           selected: null, drawnCard: null, matches: [], drawnMatches: [] };
}

export function reducer(state: HanafudaKoiKoiState, action: HanafudaKoiKoiAction): HanafudaKoiKoiState {
  if (state.phase === "done") return state;

  if (action.type === "select" && state.phase === "select") {
    if (!state.hand.includes(action.cardId)) return state;
    const matches = findMatches(state.field, action.cardId);
    return { ...state, selected: action.cardId, matches,
             log: matches.length > 0 ? `Pick a field match.` : `No match — discard to field.` };
  }

  if (action.type === "discardHand" && state.phase === "select" && state.selected !== null && state.matches.length === 0) {
    const card = state.selected;
    const hand = state.hand.filter(c => c !== card);
    const field = [...state.field, card];
    if (state.deck.length === 0) {
      return cpuTurn({ ...state, hand, field, selected: null, matches: [],
                       log: `Discarded ${cardName(card)}. Deck empty.` });
    }
    const drawnCard = state.deck[0]!;
    const deck = state.deck.slice(1);
    const drawnMatches = findMatches(field, drawnCard);
    return { ...state, hand, field, deck, drawnCard, drawnMatches, selected: null, matches: [],
             phase: "drawn", log: `Drew ${cardName(drawnCard)}.${drawnMatches.length > 0 ? " Pick a match." : " No match."}` };
  }

  if (action.type === "matchHand" && state.phase === "select" && state.selected !== null) {
    const card = state.selected;
    if (!state.matches.includes(action.fieldId)) return state;
    const hand = state.hand.filter(c => c !== card);
    const field = state.field.filter(f => f !== action.fieldId);
    const captured = [...state.captured, card, action.fieldId];
    const score = scoreCaptured(captured);
    if (state.deck.length === 0) {
      return cpuTurn({ ...state, hand, field, captured, score, selected: null, matches: [], log: "Captured. Deck empty." });
    }
    const drawnCard = state.deck[0]!;
    const deck = state.deck.slice(1);
    const drawnMatches = findMatches(field, drawnCard);
    return { ...state, hand, field, captured, deck, drawnCard, drawnMatches, selected: null, matches: [], score,
             phase: "drawn", log: `Captured. Drew ${cardName(drawnCard)}.` };
  }

  if (action.type === "discardDraw" && state.phase === "drawn" && state.drawnCard !== null && state.drawnMatches.length === 0) {
    const card = state.drawnCard;
    const field = [...state.field, card];
    return cpuTurn({ ...state, field, drawnCard: null, drawnMatches: [] });
  }

  if (action.type === "matchDraw" && state.phase === "drawn" && state.drawnCard !== null) {
    if (!state.drawnMatches.includes(action.fieldId)) return state;
    const card = state.drawnCard;
    const field = state.field.filter(f => f !== action.fieldId);
    const captured = [...state.captured, card, action.fieldId];
    const score = scoreCaptured(captured);
    return cpuTurn({ ...state, field, captured, drawnCard: null, drawnMatches: [], score });
  }

  if (action.type === "next" && state.phase === "result") {
    const isLast = state.round >= TOTAL_ROUNDS;
    if (isLast) return { ...state, phase: "done", log: "Game over." };
    return dealRound({ ...state, round: state.round + 1 });
  }

  return state;
}

export function isTerminal(s: HanafudaKoiKoiState): { score: number } | null {
  return s.phase === "done" ? { score: s.score } : null;
}
