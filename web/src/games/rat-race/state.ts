import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Rat Race — simple linear race, ~80 squares
// Each turn: draw a card. Cards move you forward N, or have special effects.
// Special effects: go ahead bonus, go back penalty, skip next turn, extra turn.
// First to reach square 80 (or beyond) wins.
// Single-player tries to beat 1-3 bots.

export const FINISH = 80;

export type RatCard =
  | { kind: "move"; value: number }        // move forward value spaces
  | { kind: "back"; value: number }        // move back value spaces
  | { kind: "skip" }                        // lose next turn
  | { kind: "extra" }                       // take another turn immediately
  | { kind: "teleport"; to: number };      // teleport to specific square

export interface RatRaceSettings {
  opponents: "1" | "2" | "3";
}

export interface RatRaceState {
  settings: RatRaceSettings;
  rngSeed: number;
  positions: readonly number[];
  skipNext: readonly boolean[]; // whether this player skips next turn
  deck: readonly RatCard[];
  currentCard: RatCard | null;
  turn: number;
  numPlayers: number;
  winner: number | null;
  phase: "drawing" | "result"; // result = card drawn, showing effect
  extraTurn: boolean;
}

export type RatRaceAction =
  | { type: "draw" }
  | { type: "confirm" }; // confirm result and proceed

function numPlayers(s: RatRaceSettings): number {
  return 1 + parseInt(s.opponents);
}

// Build a deck of 40 cards
function buildDeck(): RatCard[] {
  const cards: RatCard[] = [
    // Move forward cards
    ...([1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 2, 3, 4, 5] as number[]).map((v): RatCard => ({ kind: "move", value: v })),
    // Move back cards
    ...([1, 2, 3, 4, 2, 3] as number[]).map((v): RatCard => ({ kind: "back", value: v })),
    // Special cards
    { kind: "skip" },
    { kind: "skip" },
    { kind: "extra" },
    { kind: "extra" },
    { kind: "extra" },
    { kind: "teleport", to: 10 },
    { kind: "teleport", to: 20 },
    { kind: "teleport", to: 35 },
    { kind: "teleport", to: 50 },
    { kind: "teleport", to: 65 },
    { kind: "back", value: 5 },
    { kind: "back", value: 8 },
    { kind: "move", value: 10 },
    { kind: "move", value: 12 },
  ];
  return cards;
}

function shuffleDeck(rng: () => number, cards: RatCard[]): RatCard[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

export function initialState(seed: number, settings: RatRaceSettings): RatRaceState {
  const np = numPlayers(settings);
  const rng = mulberry32(seed);
  const deck = shuffleDeck(rng, buildDeck());
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    settings,
    rngSeed: nextSeed,
    positions: new Array(np).fill(0),
    skipNext: new Array(np).fill(false),
    deck,
    currentCard: null,
    turn: 0,
    numPlayers: np,
    winner: null,
    phase: "drawing",
    extraTurn: false,
  };
}

function applyCard(
  state: RatRaceState,
  card: RatCard,
  player: number,
): { positions: number[]; skipNext: boolean[]; extraTurn: boolean; winner: number | null } {
  const positions = [...state.positions];
  const skipNext = [...state.skipNext];
  let extraTurn = false;
  let winner: number | null = null;

  switch (card.kind) {
    case "move": {
      positions[player] = Math.min(FINISH, positions[player]! + card.value);
      if (positions[player] === FINISH) winner = player;
      break;
    }
    case "back": {
      positions[player] = Math.max(0, positions[player]! - card.value);
      break;
    }
    case "skip": {
      skipNext[player] = true;
      break;
    }
    case "extra": {
      extraTurn = true;
      break;
    }
    case "teleport": {
      positions[player] = card.to;
      if (card.to >= FINISH) winner = player;
      break;
    }
  }

  return { positions, skipNext, extraTurn, winner };
}

function drawFromDeck(deck: readonly RatCard[], rng: () => number): { card: RatCard; newDeck: RatCard[] } {
  let d = [...deck];
  if (d.length === 0) {
    d = shuffleDeck(rng, buildDeck());
  }
  const idx = Math.floor(rng() * d.length);
  const card = d[idx]!;
  const newDeck = [...d.slice(0, idx), ...d.slice(idx + 1)];
  return { card, newDeck };
}

function advanceBots(state: RatRaceState): RatRaceState {
  let s = state;
  let iter = 0;
  while (s.winner === null && s.turn !== 0 && iter++ < 500) {
    const rng = mulberry32(s.rngSeed);

    // Handle skip
    if (s.skipNext[s.turn]) {
      const newSkip = [...s.skipNext];
      newSkip[s.turn] = false;
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const nt = (s.turn + 1) % s.numPlayers;
      s = { ...s, rngSeed: nextSeed, skipNext: newSkip, turn: nt, currentCard: null, phase: "drawing", extraTurn: false };
      continue;
    }

    const { card, newDeck } = drawFromDeck(s.deck, rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { positions, skipNext, extraTurn, winner } = applyCard(s, card, s.turn);

    if (winner !== null) {
      s = { ...s, rngSeed: nextSeed, positions, skipNext, deck: newDeck, currentCard: card, winner };
      break;
    }

    const nt = extraTurn ? s.turn : (s.turn + 1) % s.numPlayers;
    s = {
      ...s,
      rngSeed: nextSeed,
      positions,
      skipNext,
      deck: newDeck,
      currentCard: null,
      turn: nt,
      phase: "drawing",
      extraTurn: false,
    };
  }
  return s;
}

export function reducer(state: RatRaceState, action: RatRaceAction): RatRaceState {
  if (state.winner !== null) return state;

  if (action.type === "draw") {
    if (state.phase !== "drawing" || state.turn !== 0) return state;

    // Handle skip
    if (state.skipNext[0]) {
      const newSkip = [...state.skipNext];
      newSkip[0] = false;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const nt = (0 + 1) % state.numPlayers;
      const next: RatRaceState = {
        ...state,
        rngSeed: nextSeed,
        skipNext: newSkip,
        turn: nt,
        phase: "drawing",
        currentCard: null,
        extraTurn: false,
      };
      return advanceBots(next);
    }

    const rng = mulberry32(state.rngSeed);
    const { card, newDeck } = drawFromDeck(state.deck, rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { positions, skipNext, extraTurn, winner } = applyCard(state, card, 0);

    if (winner !== null) {
      return { ...state, rngSeed: nextSeed, positions, skipNext, deck: newDeck, currentCard: card, winner, phase: "result" };
    }

    const next: RatRaceState = {
      ...state,
      rngSeed: nextSeed,
      positions,
      skipNext,
      deck: newDeck,
      currentCard: card,
      phase: "result",
      extraTurn,
    };
    return next;
  }

  if (action.type === "confirm") {
    if (state.phase !== "result" || state.turn !== 0) return state;
    const nt = state.extraTurn ? 0 : (0 + 1) % state.numPlayers;
    const next: RatRaceState = { ...state, phase: "drawing", currentCard: null, extraTurn: false, turn: nt };
    if (nt !== 0) return advanceBots(next);
    return next;
  }

  return state;
}

export function isTerminal(state: RatRaceState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
