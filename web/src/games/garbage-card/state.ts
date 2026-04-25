// Garbage (a.k.a. Trash) — 2-player card game
// Each player has 10 face-down slots numbered 1-10.
// Draw a card; place it face-up in its numbered slot (A=1, J=wild, Q/K=garbage).
// Displaced cards go to their slot. First to flip all 10 wins the round.

import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle, rankLabel } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type { Rank };

export interface GarbageSettings {
  rounds: "3" | "5" | "7";
}

export type GarbagePhase = "playerTurn" | "botTurn" | "roundOver" | "done";

// A slot: null=face-down, Card=face-up placed
export interface GarbageState {
  settings: GarbageSettings;
  playerSlots: readonly (Card | null)[];   // 10 slots, index 0 = position 1
  botSlots: readonly (Card | null)[];
  drawPile: readonly Card[];
  discardPile: readonly Card[];
  currentCard: Card | null;                // card in hand being placed
  phase: GarbagePhase;
  roundsWon: readonly [number, number];   // [player, bot]
  totalRounds: number;
  rngSeed: number;
  log: string;
  winner: number | null;
}

export type GarbageAction =
  | { type: "draw" }
  | { type: "placeCard"; slot: number }    // 0-9 (positions 1-10)
  | { type: "discard" }                    // discard current garbage card
  | { type: "nextRound" };

const RANKS_NEEDED = 10; // slots 1-10

function slotForRank(rank: Rank): number | null {
  if (rank >= 1 && rank <= 10) return rank - 1;
  return null; // J=wild (11), Q(12)/K(13)=garbage
}

function isWild(rank: Rank): boolean { return rank === 11; } // Jack
function isGarbage(rank: Rank): boolean { return rank === 12 || rank === 13; } // Q/K

export function initialState(seed: number, settings: GarbageSettings): GarbageState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);

  return {
    settings,
    playerSlots: new Array<null>(10).fill(null),
    botSlots: new Array<null>(10).fill(null),
    drawPile: deck,
    discardPile: [],
    currentCard: null,
    phase: "playerTurn",
    roundsWon: [0, 0],
    totalRounds: parseInt(settings.rounds, 10),
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    winner: null,
    log: "Draw a card to start!",
  };
}

function dealNewRound(state: GarbageState): GarbageState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);
  return {
    ...state,
    playerSlots: new Array<null>(10).fill(null),
    botSlots: new Array<null>(10).fill(null),
    drawPile: deck,
    discardPile: [],
    currentCard: null,
    phase: "playerTurn",
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    log: "New round! Draw a card.",
  };
}

function runBotTurn(state: GarbageState): GarbageState {
  let s = state;
  let iters = 0;
  while (s.phase === "botTurn" && iters < 50) {
    iters++;
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    if (s.drawPile.length === 0 && s.currentCard === null) {
      // Shuffle discard
      const shuffled = shuffle([...s.discardPile], rng);
      s = { ...s, drawPile: shuffled, discardPile: [], rngSeed: nextSeed };
    }

    if (s.currentCard === null) {
      if (s.drawPile.length === 0) { s = { ...s, phase: "playerTurn", log: "Bot is stuck — your turn." }; break; }
      const drawn = s.drawPile[0]!;
      s = { ...s, currentCard: drawn, drawPile: s.drawPile.slice(1), rngSeed: nextSeed };
      continue;
    }

    const card = s.currentCard;
    if (isGarbage(card.rank)) {
      // Discard
      s = { ...s, currentCard: null, discardPile: [...s.discardPile, card], phase: "playerTurn", rngSeed: nextSeed, log: `Bot discarded garbage ${rankLabel(card.rank)}.` };
      break;
    }

    let targetSlot: number;
    if (isWild(card.rank)) {
      // Find first empty slot
      const empty = s.botSlots.findIndex(sl => sl === null);
      if (empty === -1) { s = { ...s, currentCard: null, discardPile: [...s.discardPile, card], phase: "playerTurn", rngSeed: nextSeed, log: "Bot discarded wild (all full)." }; break; }
      targetSlot = empty;
    } else {
      targetSlot = slotForRank(card.rank)!;
    }

    const existing = s.botSlots[targetSlot];
    const newBotSlots = [...s.botSlots] as (Card | null)[];
    newBotSlots[targetSlot] = card;

    if (newBotSlots.every(sl => sl !== null)) {
      // Bot wins round
      const newRoundsWon: [number, number] = [s.roundsWon[0], s.roundsWon[1] + 1];
      if (newRoundsWon[1] >= Math.ceil(s.totalRounds / 2) + (s.totalRounds % 2 === 0 ? 0 : 0)) {
        const botWins = newRoundsWon[1] > s.totalRounds / 2;
        if (botWins) {
          return { ...s, botSlots: newBotSlots, currentCard: null, roundsWon: newRoundsWon, phase: "done", winner: 1, rngSeed: nextSeed, log: "Bot wins the match!" };
        }
      }
      return { ...s, botSlots: newBotSlots, currentCard: null, roundsWon: newRoundsWon, phase: "roundOver", rngSeed: nextSeed, log: `Bot completes the round! Score: You ${newRoundsWon[0]} – Bot ${newRoundsWon[1]}.` };
    }

    s = { ...s, botSlots: newBotSlots, currentCard: existing ?? null, rngSeed: nextSeed };
    if (existing === null) {
      s = { ...s, phase: "playerTurn", log: "Bot placed a card. Your turn — draw!" };
    }
    // else continue loop with displaced card
  }
  return s;
}

export function reducer(state: GarbageState, action: GarbageAction): GarbageState {
  if (state.phase === "done") return state;

  if (action.type === "nextRound") {
    if (state.phase !== "roundOver") return state;
    return dealNewRound(state);
  }

  if (state.phase !== "playerTurn") return state;

  if (action.type === "draw") {
    if (state.currentCard !== null) return state; // already have a card
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    let drawPile = state.drawPile;
    let discardPile = state.discardPile;
    if (drawPile.length === 0) {
      drawPile = shuffle([...discardPile], rng);
      discardPile = [];
    }
    if (drawPile.length === 0) return state;
    const drawn = drawPile[0]!;
    return { ...state, currentCard: drawn, drawPile: drawPile.slice(1), discardPile, rngSeed: nextSeed, log: `You drew ${drawn.suit}${rankLabel(drawn.rank)}. ${isWild(drawn.rank) ? "Wild — place anywhere!" : isGarbage(drawn.rank) ? "Garbage — must discard." : `Place in slot ${drawn.rank}.`}` };
  }

  if (action.type === "discard") {
    if (!state.currentCard) return state;
    if (!isGarbage(state.currentCard.rank) && !isWild(state.currentCard.rank)) return state; // can't discard a valid card... well allow it for UX but only garbage/failed wilds
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const s: GarbageState = {
      ...state,
      discardPile: [...state.discardPile, state.currentCard],
      currentCard: null,
      phase: "botTurn",
      rngSeed: nextSeed,
      log: `You discarded ${rankLabel(state.currentCard.rank)}. Bot's turn.`,
    };
    return runBotTurn(s);
  }

  if (action.type === "placeCard") {
    if (!state.currentCard) return state;
    const card = state.currentCard;
    const slot = action.slot;
    if (slot < 0 || slot >= 10) return state;

    // Validate placement
    if (!isWild(card.rank)) {
      const expected = slotForRank(card.rank);
      if (expected === null || expected !== slot) return state; // must go to its numbered slot
    }

    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    const newPlayerSlots = [...state.playerSlots] as (Card | null)[];
    const displaced: Card | null = newPlayerSlots[slot] ?? null;
    newPlayerSlots[slot] = card;

    if (newPlayerSlots.every(sl => sl !== null)) {
      // Player wins round
      const newRoundsWon: [number, number] = [state.roundsWon[0] + 1, state.roundsWon[1]];
      const playerWins = newRoundsWon[0] > state.totalRounds / 2;
      if (playerWins) {
        return { ...state, playerSlots: newPlayerSlots, currentCard: null, roundsWon: newRoundsWon, phase: "done", winner: 0, rngSeed: nextSeed, log: "You win the match!" };
      }
      return { ...state, playerSlots: newPlayerSlots, currentCard: null, roundsWon: newRoundsWon, phase: "roundOver", rngSeed: nextSeed, log: `You complete the round! Score: You ${newRoundsWon[0]} – Bot ${newRoundsWon[1]}.` };
    }

    if (displaced === null || isGarbage(displaced.rank)) {
      // No chain — end turn
      const discarded = displaced ?? card; // if displaced was null, use card? No — displaced null means empty slot
      const s: GarbageState = {
        ...state,
        playerSlots: newPlayerSlots,
        currentCard: null,
        discardPile: displaced ? state.discardPile : state.discardPile,
        phase: "botTurn",
        rngSeed: nextSeed,
        log: `Placed ${rankLabel(card.rank)} in slot ${slot + 1}. ${displaced ? "Displaced " + rankLabel(displaced.rank) + " (garbage) — bot's turn." : "Bot's turn."}`,
      };
      const withDiscard = displaced ? { ...s, discardPile: [...s.discardPile, displaced] } : s;
      return runBotTurn(withDiscard);
    }

    // Chain: displaced card goes back in hand to place
    return {
      ...state,
      playerSlots: newPlayerSlots,
      currentCard: displaced,
      rngSeed: nextSeed,
      log: `Placed ${rankLabel(card.rank)} in slot ${slot + 1}. Displaced ${rankLabel(displaced.rank)} — place it too!`,
    };
  }

  return state;
}

export function isTerminal(state: GarbageState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return { score: state.winner === 0 ? state.roundsWon[0] * 200 : state.roundsWon[0] * 50 };
}

export { rankLabel, slotForRank, isWild, isGarbage };
