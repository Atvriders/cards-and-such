import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

/** Counter value for "Game" point scoring */
export function gameValue(rank: Card["rank"]): number {
  if (rank === 1) return 4;   // Ace
  if (rank === 13) return 3;  // King
  if (rank === 12) return 2;  // Queen
  if (rank === 11) return 1;  // Jack
  if (rank === 10) return 10; // 10
  return 0;
}

export type SetbackPhase = "bidding" | "name-trump" | "playing" | "done";

export interface SetbackState {
  rngSeed: number;
  hands: readonly (readonly Card[])[];   // 4 players
  bids: readonly (number | null)[];
  highBidder: number | null;
  highBid: number;
  trumpSuit: Suit | null;
  currentTrick: readonly { seat: number; card: Card }[];
  tricksWon: readonly number[];          // tricks per seat
  captures: readonly (readonly Card[])[];// all cards captured per seat
  leadSeat: number;
  turn: number;
  phase: SetbackPhase;
  message: string;
  scores: readonly number[];            // final scores per seat (0=player, 1=bot1, 2=bot2, 3=bot3)
}

export type SetbackAction =
  | { type: "bid"; amount: number }
  | { type: "name-trump"; suit: Suit }
  | { type: "play"; cardId: string };

function rankLabel(rank: Card["rank"]): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

function rankOrder(rank: Card["rank"]): number {
  return rank === 1 ? 14 : rank; // Ace high
}

function cardStrength(card: Card, trump: Suit, ledSuit: Suit): number {
  if (card.suit === trump) return 2000 + rankOrder(card.rank);
  if (card.suit === ledSuit) return 1000 + rankOrder(card.rank);
  return rankOrder(card.rank);
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(best.card, trump, led) ? cur : best
  ).seat;
}

export function legalPlays(hand: readonly Card[], trick: readonly { seat: number; card: Card }[], trump: Suit | null): Card[] {
  if (trick.length === 0) return [...hand]; // can lead anything
  if (!trump) return [...hand];
  const led = trick[0]!.card.suit;
  const suitCards = hand.filter(c => c.suit === led || c.suit === trump);
  return suitCards.length > 0 ? suitCards : [...hand];
}

function botBid(hand: readonly Card[], seat: number): number {
  // Simple: bid based on trump strength potential
  const bysuit: Record<string, number> = {};
  for (const s of SUITS) bysuit[s] = 0;
  for (const c of hand) bysuit[c.suit] = (bysuit[c.suit] ?? 0) + (c.rank === 1 ? 3 : c.rank >= 11 ? 2 : 1);
  const maxCount = Math.max(...Object.values(bysuit));
  if (maxCount >= 4) return 3;
  if (maxCount >= 3) return 2;
  return 0; // pass
}

function botChooseTrump(hand: readonly Card[]): Suit {
  const bysuit: Record<string, number> = {};
  for (const s of SUITS) bysuit[s] = 0;
  for (const c of hand) bysuit[c.suit] = (bysuit[c.suit] ?? 0) + 1;
  return SUITS.reduce((best, s) => (bysuit[s]! > bysuit[best]!) ? s : best);
}

function botPlay(state: SetbackState, seat: number): Card {
  const hand = state.hands[seat]!;
  const trump = state.trumpSuit!;
  const legal = legalPlays(hand, state.currentTrick, trump);
  if (legal.length === 1) return legal[0]!;

  if (state.currentTrick.length === 0) {
    // Lead highest trump if have one
    const trumpCards = legal.filter(c => c.suit === trump);
    if (trumpCards.length > 0) return trumpCards.reduce((hi, c) => rankOrder(c.rank) > rankOrder(hi.rank) ? c : hi);
    return legal[0]!;
  }

  const led = state.currentTrick[0]!.card.suit;
  const best = state.currentTrick.reduce((b, e) =>
    cardStrength(e.card, trump, led) > cardStrength(b.card, trump, led) ? e : b
  );
  const winning = legal.filter(c => cardStrength(c, trump, led) > cardStrength(best.card, trump, led));
  if (winning.length > 0) return winning.reduce((hi, c) => cardStrength(c, trump, led) < cardStrength(hi, trump, led) ? c : hi);
  return legal.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
}

/** Compute 4 Setback point categories and return seat-indexed scores */
export function computeSetbackPoints(state: SetbackState, trump: Suit): number[] {
  const scores = [0, 0, 0, 0];

  // High trump
  let highTrump: Card | null = null;
  let highSeat = -1;
  for (let seat = 0; seat < 4; seat++) {
    for (const c of state.captures[seat]!) {
      if (c.suit === trump) {
        if (!highTrump || rankOrder(c.rank) > rankOrder(highTrump.rank)) { highTrump = c; highSeat = seat; }
      }
    }
  }
  if (highSeat >= 0) scores[highSeat]!++;

  // Low trump (who captured the lowest trump)
  let lowTrump: Card | null = null;
  let lowSeat = -1;
  for (let seat = 0; seat < 4; seat++) {
    for (const c of state.captures[seat]!) {
      if (c.suit === trump) {
        if (!lowTrump || rankOrder(c.rank) < rankOrder(lowTrump.rank)) { lowTrump = c; lowSeat = seat; }
      }
    }
  }
  if (lowSeat >= 0) scores[lowSeat]!++;

  // Jack of trump
  for (let seat = 0; seat < 4; seat++) {
    if (state.captures[seat]!.some(c => c.suit === trump && c.rank === 11)) {
      scores[seat]!++;
    }
  }

  // Game: most counter-point value
  const gamePts = state.captures.map(pile => pile.reduce((s, c) => s + gameValue(c.rank), 0));
  const maxGame = Math.max(...gamePts);
  const gameWinners = gamePts.map((v, i) => v === maxGame ? i : -1).filter(i => i >= 0);
  if (gameWinners.length === 1) scores[gameWinners[0]!]!++;

  return scores;
}

function applyTrick(state: SetbackState, trick: readonly { seat: number; card: Card }[], rng: () => number): SetbackState {
  const winner = trickWinner(trick, state.trumpSuit!);
  const newTricksWon = state.tricksWon.map((t, i) => i === winner ? t + 1 : t);
  const newCaptures = state.captures.map((pile, i) =>
    i === winner ? [...pile, ...trick.map(e => e.card)] : pile
  );

  const total = newTricksWon.reduce((a, b) => a + b, 0);
  if (total === 6) {
    // Done — score
    const pts = computeSetbackPoints({ ...state, captures: newCaptures }, state.trumpSuit!);
    const highBidder = state.highBidder!;
    const bidderPts = pts[highBidder]!;
    const finalScores = pts.map((p, i) => {
      if (i === highBidder) {
        return bidderPts >= state.highBid ? bidderPts : -state.highBid;
      }
      return p;
    });
    const playerScore = finalScores[0]!;
    const msg = playerScore > 0
      ? `Hand done! You scored ${playerScore} pts.`
      : `Hand done! You scored ${playerScore} pts.`;
    return { ...state, captures: newCaptures, tricksWon: newTricksWon, currentTrick: [], phase: "done", scores: finalScores, message: msg };
  }

  let s: SetbackState = {
    ...state,
    captures: newCaptures,
    tricksWon: newTricksWon,
    currentTrick: [],
    leadSeat: winner,
    turn: winner,
    message: `Seat ${winner} won the trick.`,
  };

  // Auto-play bots until player's turn
  while (s.phase === "playing" && s.turn !== 0) {
    const botCard = botPlay(s, s.turn);
    const botSeat = s.turn;
    const newHands = s.hands.map((h, i) => i === botSeat ? h.filter(c => c.id !== botCard.id) : h);
    const newTrick = [...s.currentTrick, { seat: botSeat, card: botCard }];
    if (newTrick.length === 4) {
      s = applyTrick({ ...s, hands: newHands, currentTrick: newTrick }, newTrick, rng);
    } else {
      s = { ...s, hands: newHands, currentTrick: newTrick, turn: (botSeat + 1) % 4 };
    }
  }

  return s;
}

export function reducer(state: SetbackState, action: SetbackAction): SetbackState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const s = { ...state, rngSeed: nextSeed };

  if (state.phase === "bidding") {
    if (action.type !== "bid") return state;
    const playerBid = action.amount;
    const bids = [...state.bids];
    bids[0] = playerBid;

    // Bots bid
    let highBid = playerBid;
    let highBidder: number = playerBid > 0 ? 0 : -1;
    for (let seat = 1; seat <= 3; seat++) {
      const bid = botBid(state.hands[seat]!, seat);
      bids[seat] = bid;
      if (bid > highBid) { highBid = bid; highBidder = seat; }
    }

    // Need at least someone to bid
    if (highBidder < 0) {
      highBidder = 0; highBid = 2; bids[0] = 2; // forced bid on player
    }

    const msg = `High bid: ${highBid} by Seat ${highBidder}. ${highBidder === 0 ? "Name your trump!" : `Seat ${highBidder} names trump.`}`;

    if (highBidder !== 0) {
      // Bot names trump automatically
      const trump = botChooseTrump(state.hands[highBidder]!);
      let ns: SetbackState = { ...s, bids, highBid, highBidder, trumpSuit: trump, phase: "playing", message: `Bot named ${trump} as trump. Your lead.` };
      // Bot leads if not seat 0
      while (ns.phase === "playing" && ns.turn !== 0) {
        const bc = botPlay(ns, ns.turn);
        const bseat = ns.turn;
        const nh = ns.hands.map((h, i) => i === bseat ? h.filter(c => c.id !== bc.id) : h);
        const nt = [...ns.currentTrick, { seat: bseat, card: bc }];
        if (nt.length === 4) ns = applyTrick({ ...ns, hands: nh, currentTrick: nt }, nt, rng);
        else ns = { ...ns, hands: nh, currentTrick: nt, turn: (bseat + 1) % 4 };
      }
      return ns;
    }

    return { ...s, bids, highBid, highBidder, phase: "name-trump", message: msg };
  }

  if (state.phase === "name-trump") {
    if (action.type !== "name-trump") return state;
    return { ...s, trumpSuit: action.suit, phase: "playing", message: `You named ${action.suit} as trump. Your lead!` };
  }

  if (state.phase === "playing") {
    if (action.type !== "play") return state;
    if (state.turn !== 0) return state;

    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    const legal = legalPlays(state.hands[0]!, state.currentTrick, state.trumpSuit);
    if (!legal.some(c => c.id === card.id)) return state;

    const newHands = s.hands.map((h, i) => i === 0 ? h.filter(c => c.id !== card.id) : h);
    const newTrick = [...s.currentTrick, { seat: 0, card }];

    if (newTrick.length === 4) {
      return applyTrick({ ...s, hands: newHands, currentTrick: newTrick }, newTrick, rng);
    }

    // Bot plays until trick complete or player's turn
    let ns: SetbackState = { ...s, hands: newHands, currentTrick: newTrick, turn: 1 };
    while (ns.phase === "playing" && ns.turn !== 0) {
      const bc = botPlay(ns, ns.turn);
      const bseat = ns.turn;
      const nh = ns.hands.map((h, i) => i === bseat ? h.filter(c => c.id !== bc.id) : h);
      const nt = [...ns.currentTrick, { seat: bseat, card: bc }];
      if (nt.length === 4) ns = applyTrick({ ...ns, hands: nh, currentTrick: nt }, nt, rng);
      else ns = { ...ns, hands: nh, currentTrick: nt, turn: (bseat + 1) % 4 };
    }
    return ns;
  }

  return state;
}

export function initialState(seed: number): SetbackState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(newDeck(), mulberry32(nextSeed));

  const hands: Card[][] = [
    deck.slice(0, 6),
    deck.slice(6, 12),
    deck.slice(12, 18),
    deck.slice(18, 24),
  ];

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    hands,
    bids: [null, null, null, null],
    highBidder: null,
    highBid: 0,
    trumpSuit: null,
    currentTrick: [],
    tricksWon: [0, 0, 0, 0],
    captures: [[], [], [], []],
    leadSeat: 0,
    turn: 0,
    phase: "bidding",
    message: "Bid 2, 3, or 4 points — or pass (0). Highest bidder names trump.",
    scores: [0, 0, 0, 0],
  };
}

export function isTerminal(state: SetbackState): { score: number } | null {
  if (state.phase !== "done") return null;
  const playerScore = state.scores[0]!;
  return { score: Math.max(0, Math.min(100, 50 + playerScore * 12)) };
}
