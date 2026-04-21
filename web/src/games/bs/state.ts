import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BSSettings {
  players: "3" | "4";
}

export type BSPhase = "playing" | "calling" | "done";

export interface BSState {
  settings: BSSettings;
  seats: number;
  hands: readonly (readonly Card[])[];
  pile: readonly Card[];
  // Cards played face-down in the current round (actual cards)
  currentFaceDown: readonly Card[];
  currentClaimRank: Rank | null;
  currentPlaySeat: number | null;
  turn: number;
  claimRankSequence: Rank; // cycles 1(A)..13(K), 1..13 etc.
  phase: BSPhase;
  winner: number | null;
  rngSeed: number;
  lastEvent: string | null;
}

export type BSAction =
  | { type: "play"; cardIds: string[]; claimRank: Rank }
  | { type: "call-bs" }
  | { type: "pass" };

// ── helpers ────────────────────────────────────────────────────────────────────

const RANKS_CYCLE: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function nextRank(r: Rank): Rank {
  const idx = RANKS_CYCLE.indexOf(r);
  return RANKS_CYCLE[(idx + 1) % RANKS_CYCLE.length]!;
}

function rankName(r: Rank): string {
  const names: Record<number, string> = {
    1: "Ace", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6",
    7: "7", 8: "8", 9: "9", 10: "10", 11: "Jack", 12: "Queen", 13: "King"
  };
  return names[r] ?? String(r);
}

function seatName(s: number): string {
  return s === 0 ? "You" : `Bot ${s}`;
}

/** Bot plays: puts 1-3 cards face-down, sometimes lying. */
function botPlayCards(
  hand: readonly Card[],
  claimRank: Rank,
  rng: () => number,
): { cardIds: string[]; isLying: boolean } {
  const honest = hand.filter(c => c.rank === claimRank);
  const count = Math.min(1 + Math.floor(rng() * 2), 3); // 1 or 2 cards

  // 40% chance to lie
  const willLie = rng() < 0.4;

  if (!willLie && honest.length >= 1) {
    const chosen = honest.slice(0, Math.min(count, honest.length));
    return { cardIds: chosen.map(c => c.id), isLying: false };
  }

  // Lying: pick any cards
  const anyCards = hand.slice(0, Math.min(count, hand.length));
  const isLying = !anyCards.every(c => c.rank === claimRank);
  return { cardIds: anyCards.map(c => c.id), isLying };
}

/** Bot decides whether to call BS. */
function botCallsBS(
  state: BSState,
  callerSeat: number,
  rng: () => number,
): boolean {
  const pile = state.currentFaceDown;
  // Naive heuristic: if many cards claimed with that rank already in our hand, more likely it's a lie
  const claimed = pile.length;
  const claimRank = state.currentClaimRank!;
  const myHand = state.hands[callerSeat]!;
  const iHaveInRank = myHand.filter(c => c.rank === claimRank).length;

  // If we hold 3+ of the claimed rank, lying is very plausible
  const suspicion = 0.25 + iHaveInRank * 0.1 + (claimed > 2 ? 0.2 : 0);
  return rng() < suspicion;
}

function applyBSCall(state: BSState, callerSeat: number): BSState {
  const faceDown = state.currentFaceDown;
  const claimRank = state.currentClaimRank!;
  const playedSeat = state.currentPlaySeat!;

  const isLying = faceDown.some(c => c.rank !== claimRank);
  const loserSeat = isLying ? playedSeat : callerSeat;

  // Loser takes the whole pile
  const allPile = [...state.pile, ...faceDown];
  const newHands = state.hands.map((h, i) =>
    i === loserSeat ? [...h, ...allPile] : h
  );

  const nextTurn = (playedSeat + 1) % state.seats;
  const nextRankVal = nextRank(claimRank);

  const event = isLying
    ? `BS! ${seatName(playedSeat)} was lying! ${seatName(loserSeat)} takes ${allPile.length} cards.`
    : `BS failed — ${seatName(playedSeat)} was honest. ${seatName(callerSeat)} takes ${allPile.length} cards.`;

  return {
    ...state,
    hands: newHands,
    pile: [],
    currentFaceDown: [],
    currentClaimRank: nextRankVal,
    currentPlaySeat: null,
    turn: nextTurn,
    claimRankSequence: nextRankVal,
    phase: "playing",
    lastEvent: event,
  };
}

function checkWinner(state: BSState): BSState {
  for (let s = 0; s < state.seats; s++) {
    if (state.hands[s]!.length === 0) {
      return { ...state, phase: "done", winner: s };
    }
  }
  return state;
}

function applyPlay(
  state: BSState,
  seat: number,
  cardIds: string[],
  claimRank: Rank,
): BSState {
  const hand = state.hands[seat]!;
  const played = cardIds.map(id => hand.find(c => c.id === id)).filter(Boolean) as Card[];
  if (played.length === 0 || played.length !== cardIds.length) return state;

  const newHand = hand.filter(c => !cardIds.includes(c.id));
  const newHands = state.hands.map((h, i) => i === seat ? newHand : h);

  let s: BSState = {
    ...state,
    hands: newHands,
    currentFaceDown: played,
    currentClaimRank: claimRank,
    currentPlaySeat: seat,
    phase: "calling", // other players can call BS
    lastEvent: `${seatName(seat)} played ${played.length} card(s) claiming ${rankName(claimRank)}s.`,
  };

  s = checkWinner(s);
  return s;
}

function runBots(state: BSState, rng: () => number): BSState {
  let s = state;
  let safety = 0;

  while (s.phase !== "done" && s.turn !== 0 && safety < 200) {
    safety++;

    if (s.phase === "calling") {
      // Each bot after the player decides to call BS or not
      let called = false;
      for (let i = 1; i < s.seats; i++) {
        const seat = i;
        if (seat === s.currentPlaySeat) continue;
        if (botCallsBS(s, seat, rng)) {
          s = applyBSCall(s, seat);
          called = true;
          break;
        }
      }
      if (!called) {
        // Nobody called BS — advance to next turn
        const nextTurn = (s.currentPlaySeat! + 1) % s.seats;
        const nextRankVal = nextRank(s.currentClaimRank!);
        s = {
          ...s,
          pile: [...s.pile, ...s.currentFaceDown],
          currentFaceDown: [],
          turn: nextTurn,
          claimRankSequence: nextRankVal,
          currentClaimRank: nextRankVal,
          phase: "playing",
        };
      }
      continue;
    }

    if (s.phase === "playing" && s.turn !== 0) {
      const seat = s.turn;
      const hand = s.hands[seat]!;
      if (hand.length === 0) {
        s = { ...s, phase: "done", winner: seat };
        break;
      }
      const { cardIds } = botPlayCards(hand, s.claimRankSequence, rng);
      if (cardIds.length === 0) continue;
      s = applyPlay(s, seat, cardIds, s.claimRankSequence);

      // After bot plays, check if human wants to call BS or other bots
      // If in calling phase and turn not 0, bots decide
    }
  }

  return s;
}

// ── initialState ───────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: BSSettings): BSState {
  const rng = mulberry32(seed);
  const seats = Number(settings.players);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const hands: Card[][] = Array.from({ length: seats }, () => []);
  for (let i = 0; i < deck.length; i++) {
    hands[i % seats]!.push(deck[i]!);
  }

  return {
    settings,
    seats,
    hands,
    pile: [],
    currentFaceDown: [],
    currentClaimRank: 1 as Rank, // starts at Ace
    currentPlaySeat: null,
    turn: 0,
    claimRankSequence: 1 as Rank,
    phase: "playing",
    winner: null,
    rngSeed: nextSeed,
    lastEvent: null,
  };
}

// ── reducer ────────────────────────────────────────────────────────────────────

export function reducer(state: BSState, action: BSAction): BSState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  let s: BSState = { ...state, rngSeed: nextSeed };

  if (action.type === "play") {
    if (s.phase !== "playing" || s.turn !== 0) return state;
    const played = applyPlay(s, 0, action.cardIds, action.claimRank);
    if (played === s) return state;
    s = played;
    if (s.phase === "done") return s;
    // Now bots decide whether to call BS (calling phase)
    return runBots(s, mulberry32(nextSeed));
  }

  if (action.type === "call-bs") {
    if (s.phase !== "calling" || s.currentPlaySeat === 0) return state;
    s = applyBSCall(s, 0);
    s = checkWinner(s);
    if (s.phase === "done") return s;
    return runBots(s, mulberry32(nextSeed));
  }

  if (action.type === "pass") {
    if (s.phase !== "calling") return state;
    // Player passes on calling BS — advance through calling phase
    // Add face-down cards to pile, advance turn
    const nextTurn = (s.currentPlaySeat! + 1) % s.seats;
    const nextRankVal = nextRank(s.currentClaimRank!);
    s = {
      ...s,
      pile: [...s.pile, ...s.currentFaceDown],
      currentFaceDown: [],
      turn: nextTurn,
      claimRankSequence: nextRankVal,
      currentClaimRank: nextRankVal,
      phase: "playing",
      lastEvent: s.lastEvent,
    };
    return runBots(s, mulberry32(nextSeed));
  }

  return state;
}

// ── isTerminal ─────────────────────────────────────────────────────────────────

export function isTerminal(state: BSState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}

export { rankName, seatName, RANKS_CYCLE };
