// Palace — shedding card game (a.k.a. Shithead / Karma)
// Players shed hands → face-up table cards → face-down table cards.
// Must beat the top of the discard pile or pick up the pile.
// Special ranks: 2 resets pile, 10 burns pile.

import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle, rankLabel } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type { Rank };

export interface PalaceSettings {
  opponents: "1" | "2" | "3";
}

export type PalacePhase = "playing" | "done";
export type PalaceZone = "hand" | "tableUp" | "tableDown";

export interface PlayerState {
  hand: readonly Card[];
  tableUp: readonly Card[];    // 3 face-up table cards
  tableDown: readonly Card[];  // 3 face-down table cards
}

export interface PalaceState {
  settings: PalaceSettings;
  seats: number;
  players: readonly PlayerState[];
  drawPile: readonly Card[];
  discardPile: readonly Card[];
  turn: number;
  phase: PalacePhase;
  winner: number | null;
  rngSeed: number;
  log: string;
}

export type PalaceAction =
  | { type: "playCards"; cardIds: string[] }
  | { type: "pickUpPile" };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];
export function seatName(s: number): string { return SEAT_NAMES[s] ?? `P${s}`; }

function effectiveRank(r: Rank): number { return r === 1 ? 14 : r; } // Ace high

function topRank(pile: readonly Card[]): number {
  // Find last non-transparent card (2 is transparent — play over anything)
  for (let i = pile.length - 1; i >= 0; i--) {
    const r = pile[i]!.rank;
    if (r !== 2) return effectiveRank(r);
  }
  return 0; // pile empty or all 2s → anything beats it
}

function canPlay(card: Card, pile: readonly Card[]): boolean {
  if (card.rank === 2 || card.rank === 10) return true; // specials always playable
  return effectiveRank(card.rank) >= topRank(pile);
}

function activeZone(p: PlayerState): PalaceZone {
  if (p.hand.length > 0) return "hand";
  if (p.tableUp.length > 0) return "tableUp";
  return "tableDown";
}

function isOut(p: PlayerState): boolean {
  return p.hand.length === 0 && p.tableUp.length === 0 && p.tableDown.length === 0;
}

// Refill hand from draw pile up to 3 cards
function refillHand(p: PlayerState, draw: readonly Card[]): { player: PlayerState; draw: Card[] } {
  const newDraw = [...draw];
  let hand = [...p.hand];
  while (hand.length < 3 && newDraw.length > 0) {
    hand.push(newDraw.shift()!);
  }
  return { player: { ...p, hand }, draw: newDraw };
}

function applyPlay(
  state: PalaceState,
  seat: number,
  cardIds: string[],
): PalaceState {
  const p = state.players[seat]!;
  const zone = activeZone(p);
  let piles = [...state.discardPile];

  let playedCards: Card[] = [];

  if (zone === "hand") {
    playedCards = p.hand.filter(c => cardIds.includes(c.id));
    if (playedCards.length === 0 || !playedCards.every(c => canPlay(c, piles) && c.rank === playedCards[0]!.rank)) return state;
  } else if (zone === "tableUp") {
    playedCards = p.tableUp.filter(c => cardIds.includes(c.id));
    if (playedCards.length === 0 || !playedCards.every(c => canPlay(c, piles) && c.rank === playedCards[0]!.rank)) return state;
  } else {
    // tableDown — blind draw
    const idx = Math.floor(mulberry32(state.rngSeed)() * p.tableDown.length);
    playedCards = [p.tableDown[idx]!];
  }

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  let newPlayer: PlayerState = { ...p };
  if (zone === "hand") {
    newPlayer = { ...newPlayer, hand: p.hand.filter(c => !cardIds.includes(c.id)) };
  } else if (zone === "tableUp") {
    newPlayer = { ...newPlayer, tableUp: p.tableUp.filter(c => !cardIds.includes(c.id)) };
  } else {
    newPlayer = { ...newPlayer, tableDown: p.tableDown.filter((_, i) => i !== Math.floor(mulberry32(state.rngSeed)() * p.tableDown.length)) };
  }

  piles = [...piles, ...playedCards];

  // Refill hand
  let newDraw = [...state.drawPile];
  if (zone === "hand") {
    const refilled = refillHand(newPlayer, newDraw);
    newPlayer = refilled.player;
    newDraw = refilled.draw;
  }

  const topCard = playedCards[0]!;
  let burned = false;
  // 10 burns the pile
  if (topCard.rank === 10) {
    piles = [];
    burned = true;
  }
  // 4 of the same rank burns too
  const last4 = piles.slice(-4);
  if (!burned && last4.length === 4 && last4.every(c => c.rank === last4[0]!.rank)) {
    piles = [];
    burned = true;
  }

  const newPlayers = state.players.map((pl, i) => i === seat ? newPlayer : pl);
  const playedLabel = playedCards.map(c => rankLabel(c.rank)).join(", ");

  let log = `${seatName(seat)} played ${playedLabel}.`;
  if (burned) log += " Pile burned!";

  // Check win
  if (isOut(newPlayer)) {
    return {
      ...state,
      players: newPlayers,
      drawPile: newDraw,
      discardPile: piles,
      winner: seat,
      phase: "done",
      rngSeed: nextSeed,
      log: `${seatName(seat)} is out — they win!`,
    };
  }

  // Advance turn
  let nextTurn = (seat + 1) % state.seats;
  let skipped = 0;
  while (isOut(newPlayers[nextTurn]!) && skipped < state.seats) {
    nextTurn = (nextTurn + 1) % state.seats;
    skipped++;
  }

  return { ...state, players: newPlayers, drawPile: newDraw, discardPile: piles, turn: nextTurn, rngSeed: nextSeed, log };
}

function botPickupOrPlay(state: PalaceState, seat: number): PalaceState {
  const p = state.players[seat]!;
  const zone = activeZone(p);
  const pile = state.discardPile;
  const top = topRank(pile);

  if (zone === "tableDown") {
    // Blind — just play
    const idx = Math.floor(mulberry32(state.rngSeed)() * p.tableDown.length);
    const card = p.tableDown[idx]!;
    if (!canPlay(card, pile)) {
      // Must pick up pile + the blind card
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const newHand = [...pile, card];
      const newPlayers = state.players.map((pl, i) =>
        i === seat ? { ...pl, tableDown: pl.tableDown.filter((_, ii) => ii !== idx), hand: newHand } : pl
      );
      return { ...state, players: newPlayers, discardPile: [], turn: (seat + 1) % state.seats, rngSeed: nextSeed, log: `${seatName(seat)} picked up the pile (blind card failed).` };
    }
    return applyPlay(state, seat, [card.id]);
  }

  const sourceCards = zone === "hand" ? p.hand : p.tableUp;
  const playable = sourceCards.filter(c => canPlay(c, pile));

  if (playable.length === 0) {
    // Pick up pile
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newHand = [...p.hand, ...pile];
    const newPlayers = state.players.map((pl, i) =>
      i === seat ? { ...pl, hand: newHand } : pl
    );
    return { ...state, players: newPlayers, discardPile: [], turn: (seat + 1) % state.seats, rngSeed: nextSeed, log: `${seatName(seat)} picked up the pile.` };
  }

  // Play: prefer 10 > low cards > any playable
  const sorted = [...playable].sort((a, b) => {
    if (a.rank === 10) return -1;
    if (b.rank === 10) return 1;
    return effectiveRank(a.rank) - effectiveRank(b.rank); // play lowest that beats
  });

  const chosen = sorted[0]!;
  // Play all of the same rank
  const sameRank = sourceCards.filter(c => c.rank === chosen.rank && canPlay(c, pile));
  return applyPlay(state, seat, sameRank.map(c => c.id));
}

function runBots(state: PalaceState): PalaceState {
  let s = state;
  let iters = 0;
  while (!s.winner && s.turn !== 0 && iters < 200) {
    iters++;
    s = botPickupOrPlay(s, s.turn);
  }
  return s;
}

export function reducer(state: PalaceState, action: PalaceAction): PalaceState {
  if (state.phase === "done") return state;
  if (state.turn !== 0) return state;

  if (action.type === "pickUpPile") {
    if (state.discardPile.length === 0) return state;
    const p = state.players[0]!;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newHand = [...p.hand, ...state.discardPile];
    const newPlayers = state.players.map((pl, i) => i === 0 ? { ...pl, hand: newHand } : pl);
    const s: PalaceState = { ...state, players: newPlayers, discardPile: [], turn: 1 % state.seats, rngSeed: nextSeed, log: "You picked up the pile." };
    if (state.seats > 1) return runBots(s);
    return s;
  }

  if (action.type === "playCards") {
    const p = state.players[0]!;
    const zone = activeZone(p);

    if (zone === "tableDown") {
      // Player picks an index to flip — cardIds should have one id
      const card = p.tableDown.find(c => action.cardIds.includes(c.id));
      if (!card) return state;
      if (!canPlay(card, state.discardPile)) {
        // Flip failed — pick up pile + card
        const rng = mulberry32(state.rngSeed);
        const nextSeed = Math.floor(rng() * 2 ** 31);
        const newHand = [...p.hand, ...state.discardPile, card];
        const newTableDown = p.tableDown.filter(c => c.id !== card.id);
        const newPlayers = state.players.map((pl, i) => i === 0 ? { ...pl, hand: newHand, tableDown: newTableDown } : pl);
        const s: PalaceState = { ...state, players: newPlayers, discardPile: [], turn: 1 % state.seats, rngSeed: nextSeed, log: `Blind card ${rankLabel(card.rank)} can't play — you pick up the pile!` };
        return runBots(s);
      }
    } else {
      const source = zone === "hand" ? p.hand : p.tableUp;
      const cards = source.filter(c => action.cardIds.includes(c.id));
      if (cards.length === 0) return state;
      if (!cards.every(c => c.rank === cards[0]!.rank)) return state;
      if (!cards.every(c => canPlay(c, state.discardPile))) return state;
    }

    let s = applyPlay(state, 0, action.cardIds);
    if (!s.winner && s.turn !== 0) s = runBots(s);
    return s;
  }

  return state;
}

export function initialState(seed: number, settings: PalaceSettings): PalaceState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const seats = 1 + parseInt(settings.opponents, 10);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);

  const players: PlayerState[] = [];
  let idx = 0;
  for (let i = 0; i < seats; i++) {
    players.push({
      hand: deck.slice(idx, idx + 3),
      tableUp: deck.slice(idx + 3, idx + 6),
      tableDown: deck.slice(idx + 6, idx + 9),
    });
    idx += 9;
  }

  return {
    settings,
    seats,
    players,
    drawPile: deck.slice(idx),
    discardPile: [],
    turn: 0,
    phase: "playing",
    winner: null,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    log: "Play a card (or pick up the pile). Special: 2=any, 10=burn.",
  };
}

export function isTerminal(state: PalaceState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return { score: state.winner === 0 ? 500 : 50 };
}

export { rankLabel, canPlay, activeZone, seatName as palaceSeatName };
