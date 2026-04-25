// Karma — a.k.a. Good Karma / What-Goes-Around
// Variation of Palace where players secretly swap table cards with hand cards before play.
// Identical shedding rules; 2 is wild/reset, 10 burns.

import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle, rankLabel } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type { Rank };

export interface KarmaSettings {
  opponents: "1" | "2" | "3";
}

export type KarmaPhase = "swap" | "playing" | "done";

export interface KarmaPlayerState {
  hand: readonly Card[];
  tableUp: readonly Card[];
  tableDown: readonly Card[];
}

export interface KarmaState {
  settings: KarmaSettings;
  seats: number;
  players: readonly KarmaPlayerState[];
  drawPile: readonly Card[];
  discardPile: readonly Card[];
  swapsDone: readonly boolean[]; // which seats have confirmed swaps
  turn: number;
  phase: KarmaPhase;
  winner: number | null;
  rngSeed: number;
  log: string;
}

export type KarmaAction =
  | { type: "swapCard"; handId: string; tableId: string } // swap hand↔tableUp
  | { type: "confirmSwap" }
  | { type: "playCards"; cardIds: string[] }
  | { type: "pickUpPile" };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];
export function seatName(s: number): string { return SEAT_NAMES[s] ?? `P${s}`; }

function effectiveRank(r: Rank): number { return r === 1 ? 14 : r; }

function topRank(pile: readonly Card[]): number {
  for (let i = pile.length - 1; i >= 0; i--) {
    if (pile[i]!.rank !== 2) return effectiveRank(pile[i]!.rank);
  }
  return 0;
}

export function canPlay(card: Card, pile: readonly Card[]): boolean {
  if (card.rank === 2 || card.rank === 10) return true;
  return effectiveRank(card.rank) >= topRank(pile);
}

function activeZone(p: KarmaPlayerState): "hand" | "tableUp" | "tableDown" {
  if (p.hand.length > 0) return "hand";
  if (p.tableUp.length > 0) return "tableUp";
  return "tableDown";
}

function isOut(p: KarmaPlayerState): boolean {
  return p.hand.length === 0 && p.tableUp.length === 0 && p.tableDown.length === 0;
}

function refill(p: KarmaPlayerState, draw: readonly Card[]): { player: KarmaPlayerState; draw: Card[] } {
  const d = [...draw];
  let h = [...p.hand];
  while (h.length < 3 && d.length > 0) h.push(d.shift()!);
  return { player: { ...p, hand: h }, draw: d };
}

function botPlayOrPickup(state: KarmaState, seat: number): KarmaState {
  const p = state.players[seat]!;
  const zone = activeZone(p);
  const pile = state.discardPile;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (zone === "tableDown") {
    const idx = Math.floor(mulberry32(state.rngSeed)() * p.tableDown.length);
    const card = p.tableDown[idx]!;
    if (!canPlay(card, pile)) {
      const newHand = [...p.hand, ...pile, card];
      const newPlayers = state.players.map((pl, i) =>
        i === seat ? { ...pl, hand: newHand, tableDown: pl.tableDown.filter((_, ii) => ii !== idx) } : pl
      );
      return { ...state, players: newPlayers, discardPile: [], turn: (seat + 1) % state.seats, rngSeed: nextSeed, log: `${seatName(seat)} picked up (blind fail).` };
    }
    // play it
    const newTableDown = p.tableDown.filter((_, ii) => ii !== idx);
    const newPile = [...pile, card];
    const burned = card.rank === 10 || (newPile.slice(-4).length === 4 && newPile.slice(-4).every(c => c.rank === newPile.at(-1)!.rank));
    const finalPile = burned ? [] : newPile;
    const newPlayers = state.players.map((pl, i) => i === seat ? { ...pl, tableDown: newTableDown } : pl);
    if (isOut({ ...p, tableDown: newTableDown })) return { ...state, players: newPlayers, discardPile: finalPile, winner: seat, phase: "done", rngSeed: nextSeed, log: `${seatName(seat)} wins!` };
    return { ...state, players: newPlayers, discardPile: finalPile, turn: (seat + 1) % state.seats, rngSeed: nextSeed, log: `${seatName(seat)} played blind ${rankLabel(card.rank)}.` };
  }

  const source = zone === "hand" ? p.hand : p.tableUp;
  const playable = source.filter(c => canPlay(c, pile));
  if (playable.length === 0) {
    const newHand = [...p.hand, ...pile];
    const newPlayers = state.players.map((pl, i) => i === seat ? { ...pl, hand: newHand } : pl);
    return { ...state, players: newPlayers, discardPile: [], turn: (seat + 1) % state.seats, rngSeed: nextSeed, log: `${seatName(seat)} picked up the pile.` };
  }

  const sorted = [...playable].sort((a, b) => {
    if (a.rank === 10) return -1; if (b.rank === 10) return 1;
    return effectiveRank(a.rank) - effectiveRank(b.rank);
  });
  const chosen = sorted[0]!;
  const sameRank = source.filter(c => c.rank === chosen.rank && canPlay(c, pile));
  const ids = new Set(sameRank.map(c => c.id));
  let newP: KarmaPlayerState;
  if (zone === "hand") {
    newP = { ...p, hand: p.hand.filter(c => !ids.has(c.id)) };
    const { player: rp, draw: rd } = refill(newP, state.drawPile);
    newP = rp;
    const newPile = [...pile, ...sameRank];
    const burned = chosen.rank === 10 || (newPile.slice(-4).length === 4 && newPile.slice(-4).every(c => c.rank === chosen.rank));
    const finalPile = burned ? [] : newPile;
    const newPlayers = state.players.map((pl, i) => i === seat ? newP : pl);
    if (isOut(newP)) return { ...state, players: newPlayers, drawPile: rd, discardPile: finalPile, winner: seat, phase: "done", rngSeed: nextSeed, log: `${seatName(seat)} wins!` };
    return { ...state, players: newPlayers, drawPile: rd, discardPile: finalPile, turn: (seat + 1) % state.seats, rngSeed: nextSeed, log: `${seatName(seat)} played ${rankLabel(chosen.rank)}.` };
  } else {
    newP = { ...p, tableUp: p.tableUp.filter(c => !ids.has(c.id)) };
    const newPile = [...pile, ...sameRank];
    const burned = chosen.rank === 10 || (newPile.slice(-4).length === 4 && newPile.slice(-4).every(c => c.rank === chosen.rank));
    const finalPile = burned ? [] : newPile;
    const newPlayers = state.players.map((pl, i) => i === seat ? newP : pl);
    if (isOut(newP)) return { ...state, players: newPlayers, discardPile: finalPile, winner: seat, phase: "done", rngSeed: nextSeed, log: `${seatName(seat)} wins!` };
    return { ...state, players: newPlayers, discardPile: finalPile, turn: (seat + 1) % state.seats, rngSeed: nextSeed, log: `${seatName(seat)} played ${rankLabel(chosen.rank)}.` };
  }
}

function runBots(state: KarmaState): KarmaState {
  let s = state;
  let iters = 0;
  while (!s.winner && s.turn !== 0 && iters < 200) {
    iters++;
    s = botPlayOrPickup(s, s.turn);
  }
  return s;
}

export function initialState(seed: number, settings: KarmaSettings): KarmaState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const seats = 1 + parseInt(settings.opponents, 10);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);

  const players: KarmaPlayerState[] = [];
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
    swapsDone: new Array<boolean>(seats).fill(false),
    turn: 0,
    phase: "swap",
    winner: null,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    log: "Swap phase: click a hand card + a table-up card to swap them, then confirm.",
  };
}

export function reducer(state: KarmaState, action: KarmaAction): KarmaState {
  if (state.phase === "done") return state;

  if (state.phase === "swap") {
    if (action.type === "swapCard") {
      const p = state.players[0]!;
      const handCard = p.hand.find(c => c.id === action.handId);
      const tableCard = p.tableUp.find(c => c.id === action.tableId);
      if (!handCard || !tableCard) return state;
      const newHand = p.hand.map(c => c.id === action.handId ? tableCard : c);
      const newTableUp = p.tableUp.map(c => c.id === action.tableId ? handCard : c);
      const newP: KarmaPlayerState = { ...p, hand: newHand, tableUp: newTableUp };
      const newPlayers = state.players.map((pl, i) => i === 0 ? newP : pl);
      return { ...state, players: newPlayers, log: `Swapped ${rankLabel(handCard.rank)} ↔ ${rankLabel(tableCard.rank)}. Confirm when ready.` };
    }
    if (action.type === "confirmSwap") {
      // Bots do random swaps then confirm
      let newPlayers = [...state.players];
      const rng = mulberry32(state.rngSeed);
      for (let seat = 1; seat < state.seats; seat++) {
        const p = newPlayers[seat]!;
        // Bot: swap the lowest hand card with the highest table-up card
        const sortedHand = [...p.hand].sort((a, b) => a.rank - b.rank);
        const sortedTable = [...p.tableUp].sort((a, b) => b.rank - a.rank);
        if (sortedHand.length > 0 && sortedTable.length > 0 && sortedHand[0]!.rank < sortedTable[0]!.rank) {
          const h = sortedHand[0]!; const t = sortedTable[0]!;
          const newHand = p.hand.map(c => c.id === h.id ? t : c);
          const newTableUp = p.tableUp.map(c => c.id === t.id ? h : c);
          newPlayers[seat] = { ...p, hand: newHand, tableUp: newTableUp };
        }
      }
      const nextSeed = Math.floor(rng() * 2 ** 31);
      return { ...state, players: newPlayers, phase: "playing", rngSeed: nextSeed, log: "Swaps done — play a card (2=wild, 10=burn)." };
    }
    return state;
  }

  // playing phase
  if (state.turn !== 0) return state;

  if (action.type === "pickUpPile") {
    if (state.discardPile.length === 0) return state;
    const p = state.players[0]!;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newHand = [...p.hand, ...state.discardPile];
    const newPlayers = state.players.map((pl, i) => i === 0 ? { ...pl, hand: newHand } : pl);
    const s: KarmaState = { ...state, players: newPlayers, discardPile: [], turn: 1 % state.seats, rngSeed: nextSeed, log: "You picked up the pile." };
    return state.seats > 1 ? runBots(s) : s;
  }

  if (action.type === "playCards") {
    const p = state.players[0]!;
    const zone = activeZone(p);
    const source = zone === "hand" ? p.hand : zone === "tableUp" ? p.tableUp : p.tableDown;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    if (zone === "tableDown") {
      const card = source.find(c => action.cardIds.includes(c.id));
      if (!card) return state;
      if (!canPlay(card, state.discardPile)) {
        const newHand = [...p.hand, ...state.discardPile, card];
        const newTableDown = p.tableDown.filter(c => c.id !== card.id);
        const newPlayers = state.players.map((pl, i) => i === 0 ? { ...pl, hand: newHand, tableDown: newTableDown } : pl);
        const s: KarmaState = { ...state, players: newPlayers, discardPile: [], turn: 1 % state.seats, rngSeed: nextSeed, log: `Blind ${rankLabel(card.rank)} can't play — you pick up!` };
        return runBots(s);
      }
      const newTableDown = p.tableDown.filter(c => c.id !== card.id);
      const newPile = [...state.discardPile, card];
      const burned = card.rank === 10 || (newPile.slice(-4).length === 4 && newPile.slice(-4).every(c => c.rank === card.rank));
      const finalPile = burned ? [] : newPile;
      const newP: KarmaPlayerState = { ...p, tableDown: newTableDown };
      const newPlayers = state.players.map((pl, i) => i === 0 ? newP : pl);
      if (isOut(newP)) return { ...state, players: newPlayers, discardPile: finalPile, winner: 0, phase: "done", rngSeed: nextSeed, log: "You played your last card — you win!" };
      const s: KarmaState = { ...state, players: newPlayers, discardPile: finalPile, turn: 1 % state.seats, rngSeed: nextSeed, log: `You played blind ${rankLabel(card.rank)}.${burned ? " Pile burned!" : ""}` };
      return runBots(s);
    }

    const cards = source.filter(c => action.cardIds.includes(c.id));
    if (cards.length === 0) return state;
    if (!cards.every(c => c.rank === cards[0]!.rank && canPlay(c, state.discardPile))) return state;

    let newP: KarmaPlayerState = { ...p };
    if (zone === "hand") {
      newP = { ...newP, hand: p.hand.filter(c => !action.cardIds.includes(c.id)) };
      const { player: rp, draw: rd } = refill(newP, state.drawPile);
      newP = rp;
      const newPile = [...state.discardPile, ...cards];
      const burned = cards[0]!.rank === 10 || (newPile.slice(-4).length === 4 && newPile.slice(-4).every(c => c.rank === cards[0]!.rank));
      const finalPile = burned ? [] : newPile;
      const newPlayers = state.players.map((pl, i) => i === 0 ? newP : pl);
      if (isOut(newP)) return { ...state, players: newPlayers, drawPile: rd, discardPile: finalPile, winner: 0, phase: "done", rngSeed: nextSeed, log: "You played your last card — you win!" };
      const s: KarmaState = { ...state, players: newPlayers, drawPile: rd, discardPile: finalPile, turn: 1 % state.seats, rngSeed: nextSeed, log: `You played ${rankLabel(cards[0]!.rank)}×${cards.length}.${burned ? " Pile burned!" : ""}` };
      return runBots(s);
    } else {
      newP = { ...newP, tableUp: p.tableUp.filter(c => !action.cardIds.includes(c.id)) };
      const newPile = [...state.discardPile, ...cards];
      const burned = cards[0]!.rank === 10 || (newPile.slice(-4).length === 4 && newPile.slice(-4).every(c => c.rank === cards[0]!.rank));
      const finalPile = burned ? [] : newPile;
      const newPlayers = state.players.map((pl, i) => i === 0 ? newP : pl);
      if (isOut(newP)) return { ...state, players: newPlayers, discardPile: finalPile, winner: 0, phase: "done", rngSeed: nextSeed, log: "You played your last card — you win!" };
      const s: KarmaState = { ...state, players: newPlayers, discardPile: finalPile, turn: 1 % state.seats, rngSeed: nextSeed, log: `You played ${rankLabel(cards[0]!.rank)}×${cards.length} (table).${burned ? " Pile burned!" : ""}` };
      return runBots(s);
    }
  }

  return state;
}

export function isTerminal(state: KarmaState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return { score: state.winner === 0 ? 500 : 50 };
}

export { rankLabel, activeZone, seatName as karmaSeatName };
