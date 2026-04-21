import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface EuchreSettings {
  botDifficulty: "easy" | "hard";
}

export type EuchrePhase =
  | "trump-select-1"   // round 1: order up or pass
  | "trump-select-2"   // round 2: name suit or pass
  | "playing"
  | "done";

export interface EuchreState {
  settings: EuchreSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];   // 4 hands of 5
  kitty: readonly Card[];                // remaining 4 cards
  upCard: Card;                          // flipped card for trump selection
  trumpSuit: Suit | null;
  makerSeat: number | null;              // who made trump
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: EuchrePhase;
  tricks: readonly number[];             // tricks won per seat
  score: readonly [number, number];      // team scores: team0 (0&2), team1 (1&3)
  message: string;
  passCount: number;                     // how many have passed in trump selection
}

export type EuchreAction =
  | { type: "order-up" }         // order up the flipped card as trump
  | { type: "pass" }             // pass in trump selection
  | { type: "name-suit"; suit: Suit }  // round 2: name trump suit
  | { type: "play"; cardId: string };

// ── 24-card Euchre deck ─────────────────────────────────────────────────────
// Ranks: 9(=9), 10(=10), J(=11), Q(=12), K(=13), A(=1 in this game)
// But in state.ts deck uses rank 1 for Ace. We'll use standard Rank type.
// Euchre uses only 9,10,J,Q,K,A => ranks 9,10,11,12,13,1

const EUCHRE_RANKS = [9, 10, 11, 12, 13, 1] as const;
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

function euchreDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of EUCHRE_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `e-${s}${r}` });
    }
  }
  return cards;
}

// ── Bower logic ──────────────────────────────────────────────────────────────

function sameColor(a: Suit, b: Suit): boolean {
  const red = new Set<Suit>(["♥", "♦"]);
  return red.has(a) === red.has(b);
}

function leftBowerSuit(trump: Suit): Suit {
  // Left bower: Jack of same-color suit
  for (const s of SUITS) {
    if (s !== trump && sameColor(s, trump)) return s;
  }
  return trump; // fallback
}

function isRightBower(card: Card, trump: Suit): boolean {
  return card.rank === 11 && card.suit === trump;
}

function isLeftBower(card: Card, trump: Suit): boolean {
  return card.rank === 11 && card.suit !== trump && sameColor(card.suit, trump);
}

function effectiveSuit(card: Card, trump: Suit): Suit {
  if (isLeftBower(card, trump)) return trump;
  return card.suit;
}

function cardStrength(card: Card, trump: Suit, ledSuit: Suit): number {
  if (isRightBower(card, trump)) return 1000;
  if (isLeftBower(card, trump)) return 900;
  if (card.suit === trump) {
    return 200 + euchreRankOrder(card.rank);
  }
  if (card.suit === ledSuit) {
    return 100 + euchreRankOrder(card.rank);
  }
  return euchreRankOrder(card.rank);
}

function euchreRankOrder(rank: Card["rank"]): number {
  if (rank === 1) return 14; // Ace high
  return rank;
}

// ── Legal plays ──────────────────────────────────────────────────────────────

export function legalPlays(state: EuchreState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  const trick = state.currentTrick;
  const trump = state.trumpSuit!;

  if (trick.length === 0) return hand;

  const led = effectiveSuit(trick[0]!.card, trump);
  const suitCards = hand.filter(c => effectiveSuit(c, trump) === led);
  return suitCards.length > 0 ? suitCards : hand;
}

// ── Trick winner ─────────────────────────────────────────────────────────────

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = effectiveSuit(trick[0]!.card, trump);
  return trick.reduce((best, cur) => {
    return cardStrength(cur.card, trump, led) > cardStrength(best.card, trump, led) ? cur : best;
  }).seat;
}

// ── Bot logic ────────────────────────────────────────────────────────────────

function botShouldOrderUp(hand: readonly Card[], upCard: Card, trump: Suit): boolean {
  const trumpCards = hand.filter(c =>
    c.suit === trump || isRightBower(c, trump) || isLeftBower(c, trump)
  );
  return trumpCards.length >= 2;
}

function botNameSuit(hand: readonly Card[], excludeSuit: Suit): Suit | null {
  // Count cards by suit (not excluded)
  const counts = new Map<Suit, number>();
  for (const s of SUITS) {
    if (s !== excludeSuit) counts.set(s, 0);
  }
  for (const c of hand) {
    const s = c.suit as Suit;
    if (s !== excludeSuit && counts.has(s)) {
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
  }
  let bestSuit: Suit | null = null;
  let bestCount = 0;
  for (const [s, cnt] of counts) {
    if (cnt > bestCount) { bestCount = cnt; bestSuit = s; }
  }
  return bestCount >= 2 ? bestSuit : null;
}

function botPlayCard(state: EuchreState, seat: number, rng: () => number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;

  const trump = state.trumpSuit!;
  const trick = state.currentTrick;

  if (trick.length === 0) {
    // Lead strongest trump if have bowers, else lowest
    const bowers = legal.filter(c => isRightBower(c, trump) || isLeftBower(c, trump));
    if (bowers.length > 0) return bowers[0]!;
    return legal.reduce((lo, c) => euchreRankOrder(c.rank) < euchreRankOrder(lo.rank) ? c : lo);
  }

  const led = effectiveSuit(trick[0]!.card, trump);
  const currentWinnerEntry = trick.reduce((best, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(best.card, trump, led) ? cur : best
  );
  const myTeam = seat % 2;
  const partnerWinning = currentWinnerEntry.seat % 2 === myTeam;

  if (partnerWinning) {
    // Play lowest
    return legal.reduce((lo, c) =>
      cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo
    );
  }

  // Try to win
  const winCards = legal.filter(c =>
    cardStrength(c, trump, led) > cardStrength(currentWinnerEntry.card, trump, led)
  );
  if (winCards.length > 0) {
    return winCards.reduce((lo, c) =>
      cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo
    );
  }
  return legal.reduce((lo, c) =>
    cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo
  );
}

// ── applyCard ────────────────────────────────────────────────────────────────

function applyCard(state: EuchreState, seat: number, card: Card, rng: () => number): EuchreState {
  const newHands = state.hands.map((h, i) =>
    i === seat ? h.filter(c => c.id !== card.id) : h
  );
  const newTrick = [...state.currentTrick, { seat, card }];

  let s: EuchreState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, state.trumpSuit!);
    const newTricks = state.tricks.map((t, i) => i === winner ? t + 1 : t);
    s = { ...s, currentTrick: [], tricks: newTricks, leadSeat: winner, turn: winner };

    const total = newTricks.reduce((a, b) => a + b, 0);
    if (total === 5) {
      // Hand over
      const makerTeam = state.makerSeat! % 2;
      const makerTricks = [0, 2].includes(makerTeam) ? newTricks[0]! + newTricks[2]! : newTricks[1]! + newTricks[3]!;
      const defTricks = 5 - makerTricks;
      const newScore: [number, number] = [state.score[0], state.score[1]];
      let msg = "";

      if (makerTricks >= 3) {
        const pts = makerTricks === 5 ? 2 : 1;
        newScore[makerTeam as 0 | 1] += pts;
        msg = `Makers took ${makerTricks} tricks → ${pts} point${pts > 1 ? "s" : ""}!`;
      } else {
        const defTeam: 0 | 1 = makerTeam === 0 ? 1 : 0;
        newScore[defTeam] += 2;
        msg = `Euchred! Defenders took ${defTricks} tricks → 2 points!`;
      }

      s = { ...s, score: newScore, phase: "done", message: msg };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }

  return s;
}

// ── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: EuchreState, action: EuchreAction): EuchreState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  // Trump selection phase 1
  if (state.phase === "trump-select-1") {
    if (action.type === "order-up" && state.turn === 0) {
      // Player orders up
      const trump = state.upCard.suit;
      // Dealer (seat 3 by default) swaps with upCard — simplified: just set trump
      let s: EuchreState = {
        ...state,
        rngSeed: nextSeed,
        trumpSuit: trump,
        makerSeat: 0,
        phase: "playing",
        turn: state.leadSeat,
        message: `You ordered up ${trump} as trump!`,
      };
      while (s.phase === "playing" && s.turn !== 0) {
        const botCard = botPlayCard(s, s.turn, botRng);
        s = applyCard(s, s.turn, botCard, botRng);
      }
      return s;
    }

    if (action.type === "pass" && state.turn === 0) {
      let s: EuchreState = { ...state, rngSeed: nextSeed, passCount: state.passCount + 1, turn: 1 };

      // Bots decide
      while (s.turn !== 0 && s.phase === "trump-select-1") {
        const botSeat = s.turn;
        if (botShouldOrderUp(s.hands[botSeat]!, s.upCard, s.upCard.suit)) {
          const trump = s.upCard.suit;
          s = {
            ...s,
            trumpSuit: trump,
            makerSeat: botSeat,
            phase: "playing",
            turn: s.leadSeat,
            message: `Bot ${botSeat} ordered up ${trump} as trump!`,
          };
          // Auto-play bots until seat 0
          while (s.phase === "playing" && s.turn !== 0) {
            const botCard = botPlayCard(s, s.turn, botRng);
            s = applyCard(s, s.turn, botCard, botRng);
          }
          return s;
        } else {
          s = { ...s, passCount: s.passCount + 1, turn: (botSeat + 1) % 4 };
        }
      }

      // All passed round 1 → round 2
      if (s.passCount >= 4) {
        s = { ...s, phase: "trump-select-2", passCount: 0, message: "All passed. Name a suit (not the up card suit)." };
      }
      return s;
    }
    return state;
  }

  // Trump selection phase 2
  if (state.phase === "trump-select-2") {
    if (action.type === "name-suit" && state.turn === 0) {
      if (action.suit === state.upCard.suit) return state; // can't pick up card suit
      let s: EuchreState = {
        ...state,
        rngSeed: nextSeed,
        trumpSuit: action.suit,
        makerSeat: 0,
        phase: "playing",
        turn: state.leadSeat,
        message: `You named ${action.suit} as trump!`,
      };
      while (s.phase === "playing" && s.turn !== 0) {
        const botCard = botPlayCard(s, s.turn, botRng);
        s = applyCard(s, s.turn, botCard, botRng);
      }
      return s;
    }

    if (action.type === "pass" && state.turn === 0) {
      let s: EuchreState = { ...state, rngSeed: nextSeed, passCount: state.passCount + 1, turn: 1 };
      while (s.turn !== 0 && s.phase === "trump-select-2") {
        const botSeat = s.turn;
        const named = botNameSuit(s.hands[botSeat]!, s.upCard.suit);
        if (named) {
          s = {
            ...s,
            trumpSuit: named,
            makerSeat: botSeat,
            phase: "playing",
            turn: s.leadSeat,
            message: `Bot ${botSeat} named ${named} as trump!`,
          };
          while (s.phase === "playing" && s.turn !== 0) {
            const botCard = botPlayCard(s, s.turn, botRng);
            s = applyCard(s, s.turn, botCard, botRng);
          }
          return s;
        }
        s = { ...s, passCount: s.passCount + 1, turn: (botSeat + 1) % 4 };
      }
      // If all pass again: pick up card suit as trump (forced)
      if (s.passCount >= 4) {
        s = {
          ...s,
          trumpSuit: s.upCard.suit,
          makerSeat: 0,
          phase: "playing",
          turn: s.leadSeat,
          message: `Forced trump: ${s.upCard.suit}`,
        };
        while (s.phase === "playing" && s.turn !== 0) {
          const botCard = botPlayCard(s, s.turn, botRng);
          s = applyCard(s, s.turn, botCard, botRng);
        }
      }
      return s;
    }
    return state;
  }

  // Playing phase
  if (state.phase === "playing") {
    if (action.type !== "play") return state;
    if (state.turn !== 0) return state;

    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    const legal = legalPlays(state, 0);
    if (!legal.some(c => c.id === card.id)) return state;

    let s: EuchreState = { ...state, rngSeed: nextSeed };
    s = applyCard(s, 0, card, botRng);
    while (s.phase === "playing" && s.turn !== 0) {
      const botCard = botPlayCard(s, s.turn, botRng);
      s = applyCard(s, s.turn, botCard, botRng);
    }
    return s;
  }

  return state;
}

// ── initialState ─────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: EuchreSettings): EuchreState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(euchreDeck(), dealRng);
  const hands: Card[][] = [
    deck.slice(0, 5),
    deck.slice(5, 10),
    deck.slice(10, 15),
    deck.slice(15, 20),
  ];
  const upCard = deck[20]!;
  const kitty = deck.slice(20, 24);

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    kitty,
    upCard,
    trumpSuit: null,
    makerSeat: null,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "trump-select-1",
    tricks: [0, 0, 0, 0],
    score: [0, 0],
    message: `Up card: ${upCard.suit}. Order up or pass?`,
    passCount: 0,
  };
}

// ── isTerminal ─────────────────────────────────────────────────────────────

export function isTerminal(state: EuchreState): { score: number } | null {
  if (state.phase !== "done") return null;
  const playerTeam = state.score[0];
  const botTeam = state.score[1];
  const diff = playerTeam - botTeam;
  return { score: Math.max(0, Math.min(100, 50 + diff * 25)) };
}
