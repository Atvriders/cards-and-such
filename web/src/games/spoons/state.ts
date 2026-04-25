// Spoons — classic matching/grabbing card game
// Players simultaneously pass cards trying to collect 4-of-a-kind;
// first to do so grabs a spoon. Last player without a spoon is eliminated.
// This is a 2-4 player version where "elimination" is tracked as rounds lost.

import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle, rankLabel } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type { Rank };

export interface SpoonsSettings {
  opponents: "1" | "2" | "3";
}

export type SpoonsPhase = "passing" | "grab" | "done";

export interface SpoonsState {
  settings: SpoonsSettings;
  seats: number;
  hands: readonly (readonly Card[])[];
  passQueue: readonly Card[];   // card player selected to pass
  spoons: number;               // spoons remaining on table
  spoonsGrabbed: number;        // how many spoons taken this round
  lives: readonly number[];     // lives remaining per seat (start at 3)
  winner: number | null;
  phase: SpoonsPhase;
  rngSeed: number;
  log: string;
}

export type SpoonsAction =
  | { type: "pass"; cardId: string }   // player selects a card to pass left
  | { type: "grab" };                  // player grabs a spoon

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];
export function seatName(s: number): string { return SEAT_NAMES[s] ?? `P${s}`; }

function hasQuad(hand: readonly Card[]): boolean {
  const cnt = new Map<Rank, number>();
  for (const c of hand) cnt.set(c.rank, (cnt.get(c.rank) ?? 0) + 1);
  return [...cnt.values()].some(v => v >= 4);
}

function botBestPass(hand: readonly Card[]): Card {
  // Keep the most-common rank; pass a card from the least-common rank
  const cnt = new Map<Rank, Card[]>();
  for (const c of hand) {
    const arr = cnt.get(c.rank) ?? [];
    arr.push(c);
    cnt.set(c.rank, arr);
  }
  let minCount = Infinity;
  let worstGroup: Card[] = [];
  for (const grp of cnt.values()) {
    if (grp.length < minCount) { minCount = grp.length; worstGroup = grp; }
  }
  return worstGroup[0]!;
}

export function initialState(seed: number, settings: SpoonsSettings): SpoonsState {
  const rng = mulberry32(seed);
  const seats = 1 + parseInt(settings.opponents, 10);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);

  const hands: Card[][] = [];
  for (let i = 0; i < seats; i++) {
    hands.push(deck.slice(i * 4, i * 4 + 4));
  }

  return {
    settings,
    seats,
    hands,
    passQueue: [],
    spoons: seats - 1,
    spoonsGrabbed: 0,
    lives: new Array<number>(seats).fill(3),
    winner: null,
    phase: "passing",
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    log: "Select a card to pass left!",
  };
}

function newRound(state: SpoonsState, rng: () => number): SpoonsState {
  const seats = state.seats;
  const seed2 = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(seed2);
  const deck = shuffle(newDeck(), dealRng);
  const hands: Card[][] = [];
  for (let i = 0; i < seats; i++) hands.push(deck.slice(i * 4, i * 4 + 4));
  return {
    ...state,
    hands,
    passQueue: [],
    spoons: seats - 1,
    spoonsGrabbed: 0,
    phase: "passing",
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    log: "New round! Select a card to pass left.",
  };
}

export function reducer(state: SpoonsState, action: SpoonsAction): SpoonsState {
  if (state.phase === "done") return state;

  if (action.type === "pass") {
    if (state.phase !== "passing") return state;
    const playerHand = state.hands[0]!;
    const card = playerHand.find(c => c.id === action.cardId);
    if (!card) return state;

    // Remove card from player hand, enqueue it
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    // Bots also select cards to pass simultaneously
    const newHands = state.hands.map(h => [...h]) as Card[][];
    const passes: Card[] = [card];
    newHands[0] = playerHand.filter(c => c.id !== action.cardId);

    for (let s = 1; s < state.seats; s++) {
      const botCard = botBestPass(newHands[s]!);
      passes.push(botCard);
      newHands[s] = newHands[s]!.filter(c => c.id !== botCard.id);
    }

    // Pass cards to the left (seat i receives from seat i-1)
    for (let s = 0; s < state.seats; s++) {
      const from = (s - 1 + state.seats) % state.seats;
      newHands[s]!.push(passes[from]!);
    }

    let s: SpoonsState = { ...state, hands: newHands, rngSeed: nextSeed };

    // Check if any seat has a quad → grab phase
    const quadSeats = newHands.map(h => hasQuad(h));
    if (quadSeats.some(Boolean)) {
      // Bots with quads instantly grab spoons
      let grabbed = 0;
      const newSpoons = state.spoons;
      let botGrabLog = "";
      for (let seat = 1; seat < state.seats && grabbed < newSpoons; seat++) {
        if (quadSeats[seat]) {
          grabbed++;
          botGrabLog += ` ${seatName(seat)} grabs!`;
        }
      }
      s = { ...s, spoonsGrabbed: grabbed, spoons: newSpoons - grabbed, log: `A quad was made!${botGrabLog} Grab a spoon!`, phase: "grab" };
      // Also non-quad bots grab if spoons still available
      const rng2 = mulberry32(nextSeed);
      const r2 = rng2();
      // Random bot might also sneak-grab (10% chance if aware)
      const sneakGrab = r2 < 0.3 && grabbed < s.spoons + grabbed;
      if (sneakGrab && s.spoons > 0) {
        // A watching bot grabs
        for (let seat = 1; seat < state.seats; seat++) {
          if (!quadSeats[seat] && s.spoons > 0) {
            s = { ...s, spoons: s.spoons - 1, spoonsGrabbed: s.spoonsGrabbed + 1, log: s.log + ` ${seatName(seat)} also grabs!` };
            break;
          }
        }
      }
    } else {
      s = { ...s, log: "Card passed! Select next card to pass." };
    }

    return s;
  }

  if (action.type === "grab") {
    if (state.phase !== "grab") return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    if (state.spoons > 0) {
      // Player grabs a spoon — safe this round
      const newSpoons = state.spoons - 1;
      // If no spoons left, the last person (with most spoons grabbed = fewest) loses a life
      // Actually simplify: player grabbed → safe. Remaining no-spoon players lose a life
      // Count who didn't grab: those who grabbed < seats-1 spoons
      const totalGrabbed = state.spoonsGrabbed + 1; // player + bots
      const totalSeats = state.seats;
      const losers: number[] = [];
      if (totalGrabbed >= totalSeats - 1) {
        // Find who lost — it's whoever didn't grab. Since we can't track per-bot,
        // pick random bot that didn't have a quad as loser
        const quadSeats = state.hands.map(hasQuad);
        for (let seat = 1; seat < totalSeats; seat++) {
          if (!quadSeats[seat] && state.spoonsGrabbed < state.seats - 1) {
            losers.push(seat);
            break;
          }
        }
        if (losers.length === 0) {
          // All bots grabbed — player is safe, no loser tracked this path
        }
      }
      const newLives = [...state.lives];
      for (const l of losers) newLives[l] = Math.max(0, (newLives[l] ?? 3) - 1);

      let logMsg = "You grabbed a spoon — safe!";
      if (losers.length > 0) logMsg += ` ${seatName(losers[0]!)} loses a life!`;

      // Check win condition
      const activePlayers = newLives.filter(l => l > 0).length;
      if (newLives[0]! <= 0) {
        return { ...state, lives: newLives, winner: newLives.indexOf(Math.max(...newLives)), phase: "done", log: "You're out! Game over." };
      }
      if (activePlayers <= 1) {
        return { ...state, lives: newLives, winner: 0, phase: "done", log: "You win!" };
      }

      const nextState = newRound({ ...state, lives: newLives, rngSeed: nextSeed }, mulberry32(nextSeed));
      return { ...nextState, log: logMsg + " " + nextState.log };
    } else {
      // No spoons left — player loses a life
      const newLives = [...state.lives];
      newLives[0] = Math.max(0, (newLives[0] ?? 3) - 1);
      if (newLives[0]! <= 0) {
        return { ...state, lives: newLives, winner: state.lives.slice(1).findIndex(l => l > 0) + 1, phase: "done", log: "You're out of lives! Game over." };
      }
      const nextState = newRound({ ...state, lives: newLives, rngSeed: nextSeed }, mulberry32(nextSeed));
      return { ...nextState, log: "Too slow — you lose a life! " + nextState.log };
    }
  }

  return state;
}

export function isTerminal(state: SpoonsState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return { score: state.winner === 0 ? 500 : Math.max(0, (state.lives[0] ?? 0) * 50) };
}
