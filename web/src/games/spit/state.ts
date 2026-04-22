import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Spit: 2 center piles, each player has 5 reserve piles + a spit pile (stock)
// Cards can be played ±1 rank (A wraps to K)
// When both stuck → SPIT: flip from spit piles to restart

export interface SpitSettings {
  botSpeed: "slow" | "medium" | "fast";
}

export type SpitPhase = "playing" | "spit-ready" | "done";

export interface SpitState {
  settings: SpitSettings;
  phase: SpitPhase;
  // Center piles (2 piles, both players play to either)
  centerPile0: readonly Card[];
  centerPile1: readonly Card[];
  // Player
  playerReserve: readonly [readonly Card[], readonly Card[], readonly Card[], readonly Card[], readonly Card[]]; // 5 piles, each face-up top
  playerSpitPile: readonly Card[];  // stock pile
  // Bot
  botReserve: readonly [readonly Card[], readonly Card[], readonly Card[], readonly Card[], readonly Card[]];
  botSpitPile: readonly Card[];
  winner: "player" | "bot" | null;
  rngSeed: number;
  botTickCounter: number;
  stuckCounter: number; // auto-detect stuck state
}

export type SpitAction =
  | { type: "play"; reserveIdx: number; centerIdx: 0 | 1 }
  | { type: "spit" }
  | { type: "bot-tick" }
  | { type: "restart" };

function rankAdj(r1: Rank, r2: Rank): boolean {
  const diff = Math.abs(r1 - r2);
  return diff === 1 || diff === 12; // A(1)↔K(13)
}

export function canPlay(card: Card, pile: readonly Card[]): boolean {
  if (pile.length === 0) return false;
  const top = pile[pile.length - 1]!;
  return rankAdj(card.rank, top.rank);
}

export function initialState(seed: number, settings: SpitSettings): SpitState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const botDeck = shuffle(newDeck(), rng).map(c => ({ ...c, id: `bot-${c.id}` }));
  const nextSeed = Math.floor(rng() * 2 ** 31);

  function makeReserve(cards: Card[]): [readonly Card[], readonly Card[], readonly Card[], readonly Card[], readonly Card[]] {
    return [
      cards.slice(0, 1),
      cards.slice(1, 2),
      cards.slice(2, 3),
      cards.slice(3, 4),
      cards.slice(4, 5),
    ];
  }

  const playerReserve = makeReserve(deck.slice(0, 5));
  const playerSpitPile = deck.slice(5, 26);
  const botReserve = makeReserve(botDeck.slice(0, 5));
  const botSpitPile = botDeck.slice(5, 26);

  return {
    settings,
    phase: "playing",
    centerPile0: [deck[26]!],
    centerPile1: [deck[27]!],
    playerReserve,
    playerSpitPile,
    botReserve,
    botSpitPile,
    winner: null,
    rngSeed: nextSeed,
    botTickCounter: 0,
    stuckCounter: 0,
  };
}

type Reserve5 = readonly [readonly Card[], readonly Card[], readonly Card[], readonly Card[], readonly Card[]];

function setReserve(reserve: Reserve5, idx: number, val: readonly Card[]): Reserve5 {
  const out = [...reserve] as [readonly Card[], readonly Card[], readonly Card[], readonly Card[], readonly Card[]];
  out[idx] = val;
  return out;
}

function hasAnyMove(reserve: Reserve5, c0: readonly Card[], c1: readonly Card[]): boolean {
  for (let i = 0; i < 5; i++) {
    const top = reserve[i]?.[reserve[i]!.length - 1];
    if (top && (canPlay(top, c0) || canPlay(top, c1))) return true;
  }
  return false;
}

export function reducer(state: SpitState, action: SpitAction): SpitState {
  if (state.phase === "done" && action.type !== "restart") return state;
  if (action.type === "restart") return initialState(state.rngSeed, state.settings);

  if (action.type === "spit") {
    if (state.playerSpitPile.length === 0 && state.botSpitPile.length === 0) return state;
    // Flip top of each spit pile onto centers
    const newC0 = state.playerSpitPile.length > 0
      ? [...state.centerPile0, state.playerSpitPile[0]!]
      : state.centerPile0;
    const newC1 = state.botSpitPile.length > 0
      ? [...state.centerPile1, state.botSpitPile[0]!]
      : state.centerPile1;
    return {
      ...state,
      phase: "playing",
      centerPile0: newC0,
      centerPile1: newC1,
      playerSpitPile: state.playerSpitPile.slice(1),
      botSpitPile: state.botSpitPile.slice(1),
      stuckCounter: 0,
    };
  }

  if (action.type === "play") {
    if (state.phase !== "playing") return state;
    const { reserveIdx, centerIdx } = action;
    const reserve = state.playerReserve[reserveIdx];
    if (!reserve || reserve.length === 0) return state;
    const card = reserve[reserve.length - 1]!;
    const centerPile = centerIdx === 0 ? state.centerPile0 : state.centerPile1;
    if (!canPlay(card, centerPile)) return state;

    const newCenter = [...centerPile, card];
    const newReserve = setReserve(state.playerReserve, reserveIdx, reserve.slice(0, -1));
    const playerEmpty = newReserve.every(p => p.length === 0) && state.playerSpitPile.length === 0;

    // Check if player wins (all reserves empty and spit pile empty)
    if (playerEmpty) {
      return {
        ...state,
        centerPile0: centerIdx === 0 ? newCenter : state.centerPile0,
        centerPile1: centerIdx === 1 ? newCenter : state.centerPile1,
        playerReserve: newReserve,
        winner: "player",
        phase: "done",
      };
    }

    const newState = {
      ...state,
      centerPile0: centerIdx === 0 ? newCenter : state.centerPile0,
      centerPile1: centerIdx === 1 ? newCenter : state.centerPile1,
      playerReserve: newReserve,
      stuckCounter: 0,
    };

    // Check stuck
    const playerHasMoves = hasAnyMove(newState.playerReserve, newState.centerPile0, newState.centerPile1);
    const botHasMoves = hasAnyMove(state.botReserve, newState.centerPile0, newState.centerPile1);
    if (!playerHasMoves && !botHasMoves) {
      return { ...newState, phase: "spit-ready" };
    }
    return newState;
  }

  if (action.type === "bot-tick") {
    let s = state;
    const tickTarget = s.settings.botSpeed === "fast" ? 1 : s.settings.botSpeed === "medium" ? 2 : 4;
    const newCounter = s.botTickCounter + 1;
    if (newCounter < tickTarget) return { ...s, botTickCounter: newCounter };
    s = { ...s, botTickCounter: 0 };

    // Bot tries to play reserve → center
    for (let i = 0; i < 5; i++) {
      const reserve = s.botReserve[i]!;
      const top = reserve[reserve.length - 1];
      if (!top) continue;
      if (canPlay(top, s.centerPile0)) {
        const newReserve = setReserve(s.botReserve, i, reserve.slice(0, -1));
        const newCenter = [...s.centerPile0, top];
        const botEmpty = newReserve.every(p => p.length === 0) && s.botSpitPile.length === 0;
        if (botEmpty) return { ...s, botReserve: newReserve, centerPile0: newCenter, winner: "bot", phase: "done" };
        const newS = { ...s, botReserve: newReserve, centerPile0: newCenter, stuckCounter: 0 };
        const playerHasMoves = hasAnyMove(newS.playerReserve, newS.centerPile0, newS.centerPile1);
        const botHasMoves2 = hasAnyMove(newReserve, newS.centerPile0, newS.centerPile1);
        if (!playerHasMoves && !botHasMoves2) return { ...newS, phase: "spit-ready" };
        return newS;
      }
      if (canPlay(top, s.centerPile1)) {
        const newReserve = setReserve(s.botReserve, i, reserve.slice(0, -1));
        const newCenter = [...s.centerPile1, top];
        const botEmpty = newReserve.every(p => p.length === 0) && s.botSpitPile.length === 0;
        if (botEmpty) return { ...s, botReserve: newReserve, centerPile1: newCenter, winner: "bot", phase: "done" };
        const newS = { ...s, botReserve: newReserve, centerPile1: newCenter, stuckCounter: 0 };
        const playerHasMoves = hasAnyMove(newS.playerReserve, newS.centerPile0, newS.centerPile1);
        const botHasMoves2 = hasAnyMove(newReserve, newS.centerPile0, newS.centerPile1);
        if (!playerHasMoves && !botHasMoves2) return { ...newS, phase: "spit-ready" };
        return newS;
      }
    }

    // Increment stuck counter — after a while, auto-spit
    const newStuck = s.stuckCounter + 1;
    if (newStuck > 8 && s.phase === "playing") {
      return { ...s, stuckCounter: newStuck, phase: "spit-ready" };
    }
    return { ...s, stuckCounter: newStuck };
  }

  return state;
}

export function isTerminal(state: SpitState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return { score: state.winner === "player" ? 100 : 0 };
}
