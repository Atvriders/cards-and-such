// Pig (card version) — fast matching/reaction game
// Players simultaneously pass cards trying to collect 4-of-a-kind.
// First player with four of a kind touches their nose (clicks button).
// Others must follow immediately or lose a life. Very similar to Spoons without spoons.

import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle, rankLabel } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type { Rank };

export interface PigSettings {
  opponents: "1" | "2" | "3";
}

export type PigPhase = "passing" | "nose" | "done";

export interface PigState {
  settings: PigSettings;
  seats: number;
  hands: readonly (readonly Card[])[];
  nosePressed: readonly boolean[];  // who has touched their nose
  lives: readonly number[];          // lives remaining
  phase: PigPhase;
  winner: number | null;
  rngSeed: number;
  log: string;
}

export type PigAction =
  | { type: "pass"; cardId: string }
  | { type: "pressNose" };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];
export function seatName(s: number): string { return SEAT_NAMES[s] ?? `P${s}`; }

function hasQuad(hand: readonly Card[]): boolean {
  const cnt = new Map<Rank, number>();
  for (const c of hand) cnt.set(c.rank, (cnt.get(c.rank) ?? 0) + 1);
  return [...cnt.values()].some(v => v >= 4);
}

function botBestPass(hand: readonly Card[]): Card {
  const cnt = new Map<Rank, Card[]>();
  for (const c of hand) { const arr = cnt.get(c.rank) ?? []; arr.push(c); cnt.set(c.rank, arr); }
  let minCount = Infinity; let worstGroup: Card[] = [];
  for (const grp of cnt.values()) { if (grp.length < minCount) { minCount = grp.length; worstGroup = grp; } }
  return worstGroup[0]!;
}

export function initialState(seed: number, settings: PigSettings): PigState {
  const rng = mulberry32(seed);
  const seats = 1 + parseInt(settings.opponents, 10);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);

  const hands: Card[][] = [];
  for (let i = 0; i < seats; i++) hands.push(deck.slice(i * 4, i * 4 + 4));

  return {
    settings,
    seats,
    hands,
    nosePressed: new Array<boolean>(seats).fill(false),
    lives: new Array<number>(seats).fill(3),
    phase: "passing",
    winner: null,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    log: "Select a card to pass left!",
  };
}

function newRound(state: PigState, rng: () => number): PigState {
  const seats = state.seats;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);
  const hands: Card[][] = [];
  for (let i = 0; i < seats; i++) hands.push(deck.slice(i * 4, i * 4 + 4));
  return {
    ...state,
    hands,
    nosePressed: new Array<boolean>(seats).fill(false),
    phase: "passing",
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    log: "New round! Pass a card.",
  };
}

export function reducer(state: PigState, action: PigAction): PigState {
  if (state.phase === "done") return state;

  if (action.type === "pass") {
    if (state.phase !== "passing") return state;
    const playerHand = state.hands[0]!;
    const card = playerHand.find(c => c.id === action.cardId);
    if (!card) return state;

    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    const newHands = state.hands.map(h => [...h]) as Card[][];
    const passes: Card[] = [card];
    newHands[0] = playerHand.filter(c => c.id !== action.cardId);

    for (let s = 1; s < state.seats; s++) {
      const botCard = botBestPass(newHands[s]!);
      passes.push(botCard);
      newHands[s] = newHands[s]!.filter(c => c.id !== botCard.id);
    }

    // Pass left
    for (let s = 0; s < state.seats; s++) {
      const from = (s - 1 + state.seats) % state.seats;
      newHands[s]!.push(passes[from]!);
    }

    let s: PigState = { ...state, hands: newHands, rngSeed: nextSeed };

    // Check for quads
    const quads = newHands.map(h => hasQuad(h));
    if (quads.some(Boolean)) {
      // Bots with quads press nose
      const nosePressed = [...s.nosePressed];
      let noseLog = "Someone has four of a kind!";
      for (let seat = 1; seat < state.seats; seat++) {
        if (quads[seat]) { nosePressed[seat] = true; noseLog += ` ${seatName(seat)} touches nose!`; }
      }
      // Random bots may also react
      const r2 = mulberry32(nextSeed)();
      if (r2 < 0.4) {
        for (let seat = 1; seat < state.seats; seat++) {
          if (!nosePressed[seat]) { nosePressed[seat] = true; noseLog += ` ${seatName(seat)} also!`; break; }
        }
      }
      s = { ...s, nosePressed, phase: "nose", log: noseLog + " Touch your nose!" };
    } else {
      s = { ...s, log: "Card passed! Select another to pass." };
    }

    return s;
  }

  if (action.type === "pressNose") {
    if (state.phase !== "nose") return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    const nosePressed = [...state.nosePressed];
    nosePressed[0] = true;

    // Find who didn't press (last to react loses a life)
    const notPressed = nosePressed.map((p, i) => !p ? i : -1).filter(i => i >= 0);
    const newLives = [...state.lives];
    for (const loser of notPressed) newLives[loser] = Math.max(0, (newLives[loser] ?? 3) - 1);

    let logMsg = "You touched your nose!";
    if (notPressed.length > 0) logMsg += ` ${notPressed.map(i => seatName(i)).join(", ")} didn't — lose a life!`;

    // Check win condition
    const activePlayers = newLives.filter(l => l > 0).length;
    if (newLives[0]! <= 0) {
      return { ...state, lives: newLives, winner: newLives.indexOf(Math.max(...newLives)), phase: "done", log: "You're out of lives!" };
    }
    if (activePlayers <= 1) {
      return { ...state, lives: newLives, winner: 0, phase: "done", log: "You win!" };
    }

    const next = newRound({ ...state, lives: newLives, rngSeed: nextSeed }, mulberry32(nextSeed));
    return { ...next, log: logMsg + " " + next.log };
  }

  return state;
}

export function isTerminal(state: PigState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return { score: state.winner === 0 ? 500 : Math.max(0, (state.lives[0] ?? 0) * 50) };
}

export { rankLabel, hasQuad };
