import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, isRed } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface NertzSettings {
  botSpeed: "slow" | "medium" | "fast";
}

export type NertzPhase = "playing" | "done";

// Nertz: each player has a full 52-card deck.
// Nertz pile: 12 cards (face-down stack, play from top)
// River: 4 face-up piles (can be built down alternating color)
// Stream: remaining cards as draw pile, flip 3 at a time (top accessible)
// Center: shared build up by suit from Ace (A-2-3...K)

export interface NertzState {
  settings: NertzSettings;
  phase: NertzPhase;
  // Player
  playerNertzPile: readonly Card[];
  playerRiver: readonly [readonly Card[], readonly Card[], readonly Card[], readonly Card[]];
  playerStream: readonly Card[];       // face-down draw pile
  playerStreamHand: readonly Card[];   // accessible top card(s)
  // Bot (mirrors player structure, auto-played)
  botNertzPile: readonly Card[];
  botRiver: readonly [readonly Card[], readonly Card[], readonly Card[], readonly Card[]];
  botStream: readonly Card[];
  botStreamHand: readonly Card[];
  // Shared center piles (4 suits, each builds A→K)
  centerPiles: Partial<Record<Suit, readonly Card[]>>;
  winner: "player" | "bot" | null;
  rngSeed: number;
  botTickCounter: number;
}

export type NertzAction =
  | { type: "play-nertz-to-center" }
  | { type: "play-river-to-center"; riverIdx: number }
  | { type: "play-stream-to-center" }
  | { type: "play-nertz-to-river"; riverIdx: number }
  | { type: "play-river-to-river"; fromIdx: number; toIdx: number }
  | { type: "play-stream-to-river"; riverIdx: number }
  | { type: "flip-stream" }
  | { type: "bot-tick" }
  | { type: "restart" };

// Center pile: build up same suit from Ace
function canPlayToCenter(card: Card, piles: Partial<Record<Suit, readonly Card[]>>): boolean {
  const pile = piles[card.suit] ?? [];
  if (pile.length === 0) return card.rank === 1;
  const top = pile[pile.length - 1]!;
  return card.rank === top.rank + 1;
}

// River: build down alternating color
function canPlayToRiver(card: Card, pile: readonly Card[]): boolean {
  if (pile.length === 0) return true; // any card on empty
  const top = pile[pile.length - 1]!;
  return card.rank === top.rank - 1 && isRed(card.suit) !== isRed(top.suit);
}

function playToCenter(card: Card, piles: Partial<Record<Suit, readonly Card[]>>): Partial<Record<Suit, readonly Card[]>> {
  const existing = piles[card.suit] ?? [];
  return { ...piles, [card.suit]: [...existing, card] };
}

export function initialState(seed: number, settings: NertzSettings): NertzState {
  const rng = mulberry32(seed);

  const playerDeck = shuffle(newDeck(), rng);
  // Bot deck with distinct IDs
  const botDeck = shuffle(newDeck(1), rng).map(c => ({ ...c, id: `bot-${c.id}` }));
  const nextSeed = Math.floor(rng() * 2 ** 31);

  function dealPlayer(deck: Card[]) {
    const nertzPile = deck.slice(0, 12);
    const river: [Card[], Card[], Card[], Card[]] = [
      [deck[12]!], [deck[13]!], [deck[14]!], [deck[15]!]
    ];
    const stream = deck.slice(16);
    return { nertzPile, river, stream };
  }

  const p = dealPlayer(playerDeck);
  const b = dealPlayer(botDeck);

  return {
    settings,
    phase: "playing",
    playerNertzPile: p.nertzPile,
    playerRiver: p.river,
    playerStream: p.stream,
    playerStreamHand: [],
    botNertzPile: b.nertzPile,
    botRiver: b.river,
    botStream: b.stream,
    botStreamHand: [],
    centerPiles: {},
    winner: null,
    rngSeed: nextSeed,
    botTickCounter: 0,
  };
}

function setRiver<T>(arr: readonly [readonly T[], readonly T[], readonly T[], readonly T[]], idx: number, val: readonly T[]): [readonly T[], readonly T[], readonly T[], readonly T[]] {
  const out: [readonly T[], readonly T[], readonly T[], readonly T[]] = [...arr] as unknown as [readonly T[], readonly T[], readonly T[], readonly T[]];
  out[idx] = val;
  return out;
}

export function reducer(state: NertzState, action: NertzAction): NertzState {
  if (state.phase === "done" && action.type !== "restart") return state;

  if (action.type === "restart") return initialState(state.rngSeed, state.settings);

  if (action.type === "flip-stream") {
    if (state.playerStream.length === 0 && state.playerStreamHand.length === 0) return state;
    if (state.playerStream.length === 0) {
      return { ...state, playerStream: [...state.playerStreamHand].reverse(), playerStreamHand: [] };
    }
    // Flip up to 3
    const n = Math.min(3, state.playerStream.length);
    const drawn = state.playerStream.slice(0, n);
    return {
      ...state,
      playerStream: state.playerStream.slice(n),
      playerStreamHand: drawn,
    };
  }

  if (action.type === "play-nertz-to-center") {
    const card = state.playerNertzPile[state.playerNertzPile.length - 1];
    if (!card || !canPlayToCenter(card, state.centerPiles)) return state;
    const newPiles = playToCenter(card, state.centerPiles);
    const newNertz = state.playerNertzPile.slice(0, -1);
    const winner = newNertz.length === 0 ? "player" : null;
    return { ...state, playerNertzPile: newNertz, centerPiles: newPiles, winner, phase: winner ? "done" : "playing" };
  }

  if (action.type === "play-river-to-center") {
    const { riverIdx } = action;
    const pile = state.playerRiver[riverIdx];
    if (!pile || pile.length === 0) return state;
    const card = pile[pile.length - 1]!;
    if (!canPlayToCenter(card, state.centerPiles)) return state;
    const newPiles = playToCenter(card, state.centerPiles);
    return { ...state, playerRiver: setRiver(state.playerRiver, riverIdx, pile.slice(0, -1)), centerPiles: newPiles };
  }

  if (action.type === "play-stream-to-center") {
    const card = state.playerStreamHand[state.playerStreamHand.length - 1];
    if (!card || !canPlayToCenter(card, state.centerPiles)) return state;
    const newPiles = playToCenter(card, state.centerPiles);
    return { ...state, playerStreamHand: state.playerStreamHand.slice(0, -1), centerPiles: newPiles };
  }

  if (action.type === "play-nertz-to-river") {
    const { riverIdx } = action;
    const card = state.playerNertzPile[state.playerNertzPile.length - 1];
    if (!card) return state;
    const targetPile = state.playerRiver[riverIdx]!;
    if (!canPlayToRiver(card, targetPile)) return state;
    const newNertz = state.playerNertzPile.slice(0, -1);
    const winner = newNertz.length === 0 ? "player" : null;
    return {
      ...state,
      playerNertzPile: newNertz,
      playerRiver: setRiver(state.playerRiver, riverIdx, [...targetPile, card]),
      winner,
      phase: winner ? "done" : "playing",
    };
  }

  if (action.type === "play-river-to-river") {
    const { fromIdx, toIdx } = action;
    if (fromIdx === toIdx) return state;
    const fromPile = state.playerRiver[fromIdx]!;
    const toPile = state.playerRiver[toIdx]!;
    if (fromPile.length === 0) return state;
    const card = fromPile[fromPile.length - 1]!;
    if (!canPlayToRiver(card, toPile)) return state;
    let river = setRiver(state.playerRiver, fromIdx, fromPile.slice(0, -1));
    river = setRiver(river, toIdx, [...toPile, card]);
    return { ...state, playerRiver: river };
  }

  if (action.type === "play-stream-to-river") {
    const { riverIdx } = action;
    const card = state.playerStreamHand[state.playerStreamHand.length - 1];
    if (!card) return state;
    const targetPile = state.playerRiver[riverIdx]!;
    if (!canPlayToRiver(card, targetPile)) return state;
    return {
      ...state,
      playerStreamHand: state.playerStreamHand.slice(0, -1),
      playerRiver: setRiver(state.playerRiver, riverIdx, [...targetPile, card]),
    };
  }

  if (action.type === "bot-tick") {
    let s = state;
    const tickTarget = s.settings.botSpeed === "fast" ? 1 : s.settings.botSpeed === "medium" ? 2 : 4;
    const newCounter = s.botTickCounter + 1;
    if (newCounter < tickTarget) return { ...s, botTickCounter: newCounter };
    s = { ...s, botTickCounter: 0 };

    // Bot: try nertz → center
    const nertzTop = s.botNertzPile[s.botNertzPile.length - 1];
    if (nertzTop && canPlayToCenter(nertzTop, s.centerPiles)) {
      const newPiles = playToCenter(nertzTop, s.centerPiles);
      const newNertz = s.botNertzPile.slice(0, -1);
      const winner = newNertz.length === 0 ? "bot" : null;
      return { ...s, botNertzPile: newNertz, centerPiles: newPiles, winner, phase: winner ? "done" : "playing" };
    }

    // Bot: try river → center
    for (let i = 0; i < 4; i++) {
      const pile = s.botRiver[i]!;
      const top = pile[pile.length - 1];
      if (top && canPlayToCenter(top, s.centerPiles)) {
        const newPiles = playToCenter(top, s.centerPiles);
        return { ...s, botRiver: setRiver(s.botRiver, i, pile.slice(0, -1)), centerPiles: newPiles };
      }
    }

    // Flip stream and try to play
    if (s.botStreamHand.length === 0 && s.botStream.length > 0) {
      const n = Math.min(3, s.botStream.length);
      const drawn = s.botStream.slice(0, n);
      s = { ...s, botStream: s.botStream.slice(n), botStreamHand: drawn };
    }
    const streamTop = s.botStreamHand[s.botStreamHand.length - 1];
    if (streamTop && canPlayToCenter(streamTop, s.centerPiles)) {
      return { ...s, botStreamHand: s.botStreamHand.slice(0, -1), centerPiles: playToCenter(streamTop, s.centerPiles) };
    }
    // Bot: stream to river
    if (streamTop) {
      for (let i = 0; i < 4; i++) {
        if (canPlayToRiver(streamTop, s.botRiver[i]!)) {
          return { ...s, botStreamHand: s.botStreamHand.slice(0, -1), botRiver: setRiver(s.botRiver, i, [...s.botRiver[i]!, streamTop]) };
        }
      }
    }
    // recycle
    if (s.botStream.length === 0 && s.botStreamHand.length > 0) {
      return { ...s, botStream: [...s.botStreamHand].reverse(), botStreamHand: [] };
    }
    return s;
  }

  return state;
}

export function isTerminal(state: NertzState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  const left = state.playerNertzPile.length;
  return { score: state.winner === "player" ? 100 - left : Math.max(0, 40 - left * 2) };
}

export { canPlayToCenter, canPlayToRiver };
