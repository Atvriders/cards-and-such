import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Uncle Wiggily — themed racing game on an 80-space track.
// Players draw cards to move. Special story-spaces: skip, bonus, teleport.
// Bot opponents race alongside the player.

export const FINISH = 80;

export type WiggilyCard =
  | { kind: "move"; value: number }
  | { kind: "back"; value: number }
  | { kind: "skip" }
  | { kind: "bonus"; value: number }  // move extra next turn
  | { kind: "jump"; to: number };     // story teleport

// Themed special spaces on the track (index = space number)
export interface SpecialSpace {
  space: number;
  effect: "skip" | "back5" | "forward10" | "teleport_start" | "teleport_mid";
  label: string;
}

export const SPECIAL_SPACES: SpecialSpace[] = [
  { space: 8,  effect: "back5",          label: "Fox's Den: Go back 5" },
  { space: 15, effect: "skip",           label: "Muddy Road: Skip turn" },
  { space: 22, effect: "forward10",      label: "Friendly Doctor: Advance 10" },
  { space: 31, effect: "back5",          label: "Weasel's Hole: Go back 5" },
  { space: 38, effect: "teleport_start", label: "Lost in Forest: Back to start!" },
  { space: 45, effect: "skip",           label: "Stuck in Mud: Skip turn" },
  { space: 52, effect: "forward10",      label: "Nurse Jane: Advance 10" },
  { space: 60, effect: "teleport_mid",   label: "Shortcut Bridge: Jump to 65" },
  { space: 68, effect: "back5",          label: "Bramble Bush: Go back 5" },
];

export interface UncleWiggilySettings {
  opponents: "1" | "2" | "3";
}

export interface UncleWiggilyState {
  settings: UncleWiggilySettings;
  rngSeed: number;
  positions: readonly number[];
  skipNext: readonly boolean[];
  bonusMove: readonly number[];   // extra spaces added to next draw
  currentCard: WiggilyCard | null;
  currentEffect: string | null;
  turn: number;
  numPlayers: number;
  winner: number | null;
  phase: "drawing" | "result";
}

export type UncleWiggilyAction =
  | { type: "draw" }
  | { type: "confirm" };

function buildDeck(): WiggilyCard[] {
  const cards: WiggilyCard[] = [
    ...[1,2,3,4,5,6,7,8,3,4,5,6,2,3,4,5,6,7,1,2].map((v): WiggilyCard => ({ kind: "move", value: v })),
    ...[1,2,3,4,2,3].map((v): WiggilyCard => ({ kind: "back", value: v })),
    { kind: "skip" },
    { kind: "skip" },
    { kind: "bonus", value: 3 },
    { kind: "bonus", value: 5 },
    { kind: "jump", to: 20 },
    { kind: "jump", to: 40 },
    { kind: "jump", to: 60 },
  ];
  return cards;
}

function shuffleDeck(rng: () => number, cards: WiggilyCard[]): WiggilyCard[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

function numPlayers(s: UncleWiggilySettings): number {
  return 1 + parseInt(s.opponents);
}

export function initialState(seed: number, settings: UncleWiggilySettings): UncleWiggilyState {
  const np = numPlayers(settings);
  const rng = mulberry32(seed);
  void shuffleDeck(rng, buildDeck()); // consume rng for reproducibility
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    settings,
    rngSeed: nextSeed,
    positions: new Array(np).fill(0),
    skipNext: new Array(np).fill(false),
    bonusMove: new Array(np).fill(0),
    currentCard: null,
    currentEffect: null,
    turn: 0,
    numPlayers: np,
    winner: null,
    phase: "drawing",
  };
}

function applySpecialSpace(
  pos: number,
  skipNext: boolean[],
  player: number,
): { pos: number; skipNext: boolean[]; effect: string | null } {
  const sp = SPECIAL_SPACES.find((s) => s.space === pos);
  if (!sp) return { pos, skipNext, effect: null };
  const newSkip = [...skipNext];
  let newPos = pos;
  switch (sp.effect) {
    case "skip":       newSkip[player] = true; break;
    case "back5":      newPos = Math.max(0, pos - 5); break;
    case "forward10":  newPos = Math.min(FINISH, pos + 10); break;
    case "teleport_start": newPos = 0; break;
    case "teleport_mid":   newPos = 65; break;
  }
  return { pos: newPos, skipNext: newSkip, effect: sp.label };
}

function applyCard(
  state: UncleWiggilyState,
  card: WiggilyCard,
  player: number,
): { positions: number[]; skipNext: boolean[]; bonusMove: number[]; winner: number | null; effect: string | null } {
  const positions = [...state.positions];
  let skipNext = [...state.skipNext];
  const bonusMove = [...state.bonusMove];
  let winner: number | null = null;
  let effect: string | null = null;

  switch (card.kind) {
    case "move": {
      const moved = Math.min(FINISH, positions[player]! + card.value + bonusMove[player]!);
      bonusMove[player] = 0;
      const sp = applySpecialSpace(moved, skipNext, player);
      positions[player] = sp.pos;
      skipNext = sp.skipNext;
      effect = sp.effect;
      if (positions[player]! >= FINISH) winner = player;
      break;
    }
    case "back": {
      bonusMove[player] = 0;
      positions[player] = Math.max(0, positions[player]! - card.value);
      break;
    }
    case "skip": {
      skipNext[player] = true;
      bonusMove[player] = 0;
      break;
    }
    case "bonus": {
      bonusMove[player] = (bonusMove[player] ?? 0) + card.value;
      break;
    }
    case "jump": {
      bonusMove[player] = 0;
      positions[player] = Math.min(FINISH, card.to);
      if (positions[player]! >= FINISH) winner = player;
      break;
    }
  }

  return { positions, skipNext, bonusMove, winner, effect };
}

function drawCard(rng: () => number, deck: WiggilyCard[]): { card: WiggilyCard; deck: WiggilyCard[] } {
  let d = [...deck];
  if (d.length === 0) d = shuffleDeck(rng, buildDeck());
  const idx = Math.floor(rng() * d.length);
  const card = d[idx]!;
  const newDeck = [...d.slice(0, idx), ...d.slice(idx + 1)];
  return { card, deck: newDeck };
}

function advanceBots(state: UncleWiggilyState, deck: WiggilyCard[]): UncleWiggilyState {
  let s = state;
  let d = deck;
  let iter = 0;
  while (s.winner === null && s.turn !== 0 && iter++ < 500) {
    const rng = mulberry32(s.rngSeed);
    if (s.skipNext[s.turn]) {
      const newSkip = [...s.skipNext];
      newSkip[s.turn] = false;
      const nextSeed = Math.floor(rng() * 2 ** 31);
      s = { ...s, rngSeed: nextSeed, skipNext: newSkip, turn: (s.turn + 1) % s.numPlayers, currentCard: null, currentEffect: null, phase: "drawing" };
      continue;
    }
    const drawn = drawCard(rng, d);
    d = drawn.deck;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { positions, skipNext, bonusMove, winner, effect } = applyCard(s, drawn.card, s.turn);
    if (winner !== null) {
      s = { ...s, rngSeed: nextSeed, positions, skipNext, bonusMove, currentCard: drawn.card, currentEffect: effect, winner };
      break;
    }
    s = { ...s, rngSeed: nextSeed, positions, skipNext, bonusMove, currentCard: null, currentEffect: null, turn: (s.turn + 1) % s.numPlayers, phase: "drawing" };
  }
  return s;
}

export function reducer(state: UncleWiggilyState, action: UncleWiggilyAction): UncleWiggilyState {
  if (state.winner !== null) return state;

  if (action.type === "draw") {
    if (state.phase !== "drawing" || state.turn !== 0) return state;
    if (state.skipNext[0]) {
      const newSkip = [...state.skipNext];
      newSkip[0] = false;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const next: UncleWiggilyState = { ...state, rngSeed: nextSeed, skipNext: newSkip, turn: 1 % state.numPlayers, currentCard: null, currentEffect: null, phase: "drawing" };
      return advanceBots(next, []);
    }
    const rng = mulberry32(state.rngSeed);
    const drawn = drawCard(rng, []);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { positions, skipNext, bonusMove, winner, effect } = applyCard(state, drawn.card, 0);
    return { ...state, rngSeed: nextSeed, positions, skipNext, bonusMove, currentCard: drawn.card, currentEffect: effect, winner, phase: "result" };
  }

  if (action.type === "confirm") {
    if (state.phase !== "result" || state.turn !== 0) return state;
    const next: UncleWiggilyState = { ...state, phase: "drawing", currentCard: null, currentEffect: null, turn: 1 % state.numPlayers };
    if (state.numPlayers > 1) return advanceBots(next, []);
    return { ...next, turn: 0 };
  }

  return state;
}

export function isTerminal(state: UncleWiggilyState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}

export const PLAYER_COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];
export const PLAYER_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];
