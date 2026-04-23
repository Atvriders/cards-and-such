import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Twenty-Nine (29) — South Asian partnership trick-taking, 4 players, 32-card deck (7-A × 4 suits).
// Card values: J=3, 9=2, A=1, 10=1, others=0. Total = 28 + "game" point = 29.
// Simplified bidding: player bids 15-28; highest bids names trump.
// Play 8 tricks. Bidding team needs to reach bid total.

export interface TwentyNineSettings {
  placeholder: "none";
}

export type TwentyNinePhase = "bidding" | "playing" | "done";

export interface TwentyNineState {
  settings: TwentyNineSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];  // seats 0-3; 0+2 = player team, 1+3 = bot team
  trumpSuit: Suit;
  trumpRevealed: boolean;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: TwentyNinePhase;
  tricksTaken: readonly number[];
  pointsTaken: readonly number[];  // [team0pts, team1pts]
  tricksPlayed: number;
  bid: number;
  bidTeam: 0 | 1;
  bids: readonly number[];          // bid per seat (0 if not bidder)
  finalScores: readonly number[] | null;
  message: string;
}

export type TwentyNineAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

// ── helpers ──────────────────────────────────────────────────────────────────

// 32-card deck: ranks 7-A (7,8,9,10,J,Q,K,A per suit) = 8 ranks × 4 suits
export function new32Deck(): Card[] {
  return newDeck().filter(c => c.rank >= 7 || c.rank === 1);
}

export function cardPoints(card: Card): number {
  if (card.rank === 11) return 3; // Jack
  if (card.rank === 9) return 2;  // Nine
  if (card.rank === 1 || card.rank === 10) return 1; // Ace or Ten
  return 0;
}

function ledSuit(trick: readonly { seat: number; card: Card }[]): Suit | null {
  return trick.length > 0 ? trick[0]!.card.suit : null;
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = ledSuit(trick)!;
  const trumps = trick.filter(e => e.card.suit === trump);
  if (trumps.length > 0) return trumps.reduce((b, c) => c.card.rank > b.card.rank ? c : b).seat;
  return trick.filter(e => e.card.suit === led).reduce((b, c) => c.card.rank > b.card.rank ? c : b).seat;
}

export function legalPlays(state: TwentyNineState, seat: number): Card[] {
  const hand = state.hands[seat]!;
  if (hand.length === 0) return [];
  const trick = state.currentTrick;
  if (trick.length === 0) return [...hand];
  const led = ledSuit(trick)!;
  const suitCards = hand.filter(c => c.suit === led);
  if (suitCards.length > 0) return suitCards;
  // Cannot follow — must follow trump if available (29 rule)
  const trumpCards = hand.filter(c => c.suit === state.trumpSuit);
  if (trumpCards.length > 0 && !state.trumpRevealed) {
    // May choose to reveal trump or not — simplified: must play trump
    return trumpCards;
  }
  return [...hand];
}

function seatTeam(seat: number): number {
  return seat % 2; // 0,2 = team 0; 1,3 = team 1
}

// ── bot logic ─────────────────────────────────────────────────────────────────

function botBid(state: TwentyNineState, seat: number): number {
  const hand = state.hands[seat]!;
  const pts = hand.reduce((s, c) => s + cardPoints(c), 0);
  // Bid based on points in hand: more points → higher bid
  const base = 15 + Math.floor(pts * 0.8);
  return Math.min(28, base);
}

function botPlay(state: TwentyNineState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  const trump = state.trumpSuit;
  const myTeam = seatTeam(seat);

  if (trick.length === 0) {
    // Lead highest value card or highest trump
    const trumpCards = legal.filter(c => c.suit === trump);
    if (trumpCards.length > 0) return trumpCards.reduce((hi, c) => c.rank > hi.rank ? c : hi);
    return legal.reduce((hi, c) => cardPoints(c) > cardPoints(hi) ? c : hi);
  }

  const winner = trickWinner(trick, trump);
  const winnerTeam = seatTeam(winner);
  const teamWinning = winnerTeam === myTeam;

  if (teamWinning) {
    return legal.reduce((lo, c) => cardPoints(c) < cardPoints(lo) ? c : lo);
  }

  const led = ledSuit(trick)!;
  const follow = legal.filter(c => c.suit === led);
  if (follow.length > 0) {
    const winnerCard = trick.find(e => e.seat === winner)!.card;
    const above = follow.filter(c => c.rank > winnerCard.rank && winnerCard.suit === led);
    if (above.length > 0) {
      return above.reduce((hi, c) => cardPoints(c) > cardPoints(hi) ? c : hi);
    }
    return follow.reduce((lo, c) => cardPoints(c) < cardPoints(lo) ? c : lo);
  }
  const trumpCards = legal.filter(c => c.suit === trump);
  if (trumpCards.length > 0) return trumpCards.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  return legal.reduce((lo, c) => cardPoints(c) < cardPoints(lo) ? c : lo);
}

// ── applyCard ─────────────────────────────────────────────────────────────────

function applyCard(state: TwentyNineState, seat: number, card: Card): TwentyNineState {
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: TwentyNineState = { ...state, hands: newHands, currentTrick: newTrick };

  // Reveal trump if player played a trump
  if (card.suit === state.trumpSuit && !state.trumpRevealed) {
    s = { ...s, trumpRevealed: true };
  }

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const team = seatTeam(winner);
    const trickPts = newTrick.reduce((sum, e) => sum + cardPoints(e.card), 0);
    const newPts = state.pointsTaken.map((p, i) => i === team ? p + trickPts : p);
    const newTricksTaken = state.tricksTaken.map((t, i) => i === team ? t + 1 : t);
    const tricksPlayed = state.tricksPlayed + 1;

    if (tricksPlayed === 8) {
      // Game bonus: 1 extra point to team with most tricks
      const bonusPts = newPts.map((p, i) => p);
      const bidTeamPts = bonusPts[state.bidTeam]! + 1; // game point to bidding team to keep it simple
      const finalPts = bonusPts.map((p, i) => i === state.bidTeam ? p + 1 : p);
      void bidTeamPts;

      const bidTeamReached = finalPts[state.bidTeam]! >= state.bid;
      s = {
        ...s,
        currentTrick: [],
        pointsTaken: finalPts,
        tricksTaken: newTricksTaken,
        tricksPlayed,
        leadSeat: winner,
        turn: winner,
        phase: "done",
        finalScores: [finalPts[0]!, finalPts[1]!],
        message: `Game over! Team 0: ${finalPts[0]} pts, Team 1: ${finalPts[1]} pts. Bid was ${state.bid} by team ${state.bidTeam}. ${bidTeamReached ? "Bid made!" : "Bid failed!"}`,
      };
    } else {
      s = {
        ...s,
        currentTrick: [],
        pointsTaken: newPts,
        tricksTaken: newTricksTaken,
        tricksPlayed,
        leadSeat: winner,
        turn: winner,
        message: `${[0, 2].includes(winner) ? "Your team" : "Bot team"} wins trick! Score: ${newPts[0]} / ${newPts[1]}`,
      };
    }
  } else {
    const next = (seat + 1) % 4;
    s = { ...s, turn: next };
  }

  return s;
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: TwentyNineState, action: TwentyNineAction): TwentyNineState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  let s: TwentyNineState = { ...state, rngSeed: nextSeed };

  if (state.phase === "bidding") {
    if (action.type !== "bid") return state;
    // Player bids; then bots each counter-bid if higher
    const playerBid = Math.max(15, Math.min(28, action.amount));

    const botBids = [1, 2, 3].map(seat => botBid(state, seat));
    const allBids = [playerBid, ...botBids];
    const maxBid = Math.max(...allBids);
    const winnerIdx = allBids.indexOf(maxBid);
    const winnerSeat = winnerIdx; // seat 0=player, 1-3=bots
    const bidTeam: 0 | 1 = (winnerSeat % 2 === 0 ? 0 : 1);

    // Trump declared by winning bidder's best suit
    const winnerHand = s.hands[winnerSeat]!;
    const suitTotals = SUITS.map(suit =>
      winnerHand.filter(c => c.suit === suit).reduce((sum, c) => sum + cardPoints(c), 0)
    );
    const trumpIdx = suitTotals.indexOf(Math.max(...suitTotals));
    const trumpSuit: Suit = SUITS[trumpIdx] ?? "♠";

    s = {
      ...s,
      bid: maxBid,
      bidTeam,
      bids: allBids,
      trumpSuit,
      phase: "playing",
      leadSeat: 0,
      turn: 0,
      message: `Bid: ${maxBid} by ${winnerSeat === 0 ? "you" : `Bot ${winnerSeat}`} (team ${bidTeam}). Trump: ${trumpSuit}`,
    };
    return s;
  }

  if (state.phase === "playing") {
    if (action.type !== "play") return state;
    if (state.turn !== 0 && state.turn !== 2) return state; // only player controls seats 0,2 wait no — player controls seat 0 only

    // Player only controls seat 0; seat 2 is bot partner
    if (state.turn !== 0) return state;

    const card = s.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    const legal = legalPlays(s, 0);
    if (!legal.some(c => c.id === card.id)) return state;

    s = applyCard(s, 0, card);

    // Auto-play seats 1, 2, 3
    while (s.phase !== "done" && s.turn !== 0) {
      const botCard = botPlay(s, s.turn);
      s = applyCard(s, s.turn, botCard);
    }

    return s;
  }

  return state;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: TwentyNineSettings): TwentyNineState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(new32Deck(), dealRng);

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands: [
      deck.slice(0, 8),
      deck.slice(8, 16),
      deck.slice(16, 24),
      deck.slice(24, 32),
    ],
    trumpSuit: "♠",
    trumpRevealed: false,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "bidding",
    tricksTaken: [0, 0],
    pointsTaken: [0, 0],
    tricksPlayed: 0,
    bid: 15,
    bidTeam: 0,
    bids: [0, 0, 0, 0],
    finalScores: null,
    message: "Bidding phase: enter your bid (15-28) or pass (enter 0).",
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: TwentyNineState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const p = state.finalScores[0]!;
  const b = state.finalScores[1]!;
  const playerTeamBid = state.bidTeam === 0;
  const bidMade = playerTeamBid ? p >= state.bid : b >= state.bid;
  if (playerTeamBid && bidMade) return { score: 100 };
  if (!playerTeamBid && !bidMade) return { score: 100 }; // opponent failed bid
  if (playerTeamBid && !bidMade) return { score: 0 };
  return { score: 0 };
}
