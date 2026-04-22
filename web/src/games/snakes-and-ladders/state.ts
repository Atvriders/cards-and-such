import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Snakes and Ladders (Chutes and Ladders) — 100-space board (10x10)
// Roll 1 die, advance. Land on ladder bottom → climb. Land on snake head → slide.
// First to reach or pass 100 wins.

export const BOARD_SIZE = 100;
export const START = 0;

export interface SnakesSettings {
  opponents: "1" | "2" | "3";
}

// Fixed snake/ladder layout (seeded by game)
export interface SnakeLadder {
  from: number;
  to: number;
  type: "snake" | "ladder";
}

const FIXED_SNAKES_LADDERS: SnakeLadder[] = [
  // Ladders (from < to)
  { from: 4, to: 14, type: "ladder" },
  { from: 9, to: 31, type: "ladder" },
  { from: 20, to: 38, type: "ladder" },
  { from: 28, to: 84, type: "ladder" },
  { from: 40, to: 59, type: "ladder" },
  { from: 51, to: 67, type: "ladder" },
  { from: 63, to: 81, type: "ladder" },
  { from: 71, to: 91, type: "ladder" },
  { from: 80, to: 99, type: "ladder" },
  { from: 88, to: 95, type: "ladder" },
  // Snakes (from > to)
  { from: 17, to: 7, type: "snake" },
  { from: 54, to: 34, type: "snake" },
  { from: 62, to: 19, type: "snake" },
  { from: 64, to: 60, type: "snake" },
  { from: 87, to: 24, type: "snake" },
  { from: 93, to: 73, type: "snake" },
  { from: 95, to: 75, type: "snake" },
  { from: 99, to: 78, type: "snake" },
  { from: 46, to: 25, type: "snake" },
  { from: 76, to: 37, type: "snake" },
];

// Build lookup map: position -> teleport destination
function buildMap(): Map<number, number> {
  const m = new Map<number, number>();
  for (const sl of FIXED_SNAKES_LADDERS) {
    m.set(sl.from, sl.to);
  }
  return m;
}

const TELEPORT_MAP = buildMap();

export interface SnakesState {
  settings: SnakesSettings;
  rngSeed: number;
  positions: readonly number[]; // 0-based position for each player (0 = not started, 1-100 = on board)
  die: number;
  turn: number;
  numPlayers: number;
  winner: number | null;
  phase: "rolling" | "moved";
  lastTeleport: { player: number; from: number; to: number; type: "snake" | "ladder" } | null;
}

export type SnakesAction =
  | { type: "roll" }
  | { type: "acknowledge" }; // acknowledge teleport animation

function numPlayers(s: SnakesSettings): number {
  return 1 + parseInt(s.opponents);
}

export function initialState(seed: number, settings: SnakesSettings): SnakesState {
  const np = numPlayers(settings);
  return {
    settings,
    rngSeed: seed,
    positions: new Array(np).fill(0),
    die: 0,
    turn: 0,
    numPlayers: np,
    winner: null,
    phase: "rolling",
    lastTeleport: null,
  };
}

function applyTeleport(pos: number): number {
  return TELEPORT_MAP.get(pos) ?? pos;
}

function movePlayer(pos: number, die: number): { newPos: number; teleport: { from: number; to: number; type: "snake" | "ladder" } | null } {
  let newPos = pos + die;
  if (newPos > BOARD_SIZE) newPos = pos; // must land exactly or bounce (simplified: don't move)
  if (newPos === BOARD_SIZE) return { newPos, teleport: null };
  const teleported = applyTeleport(newPos);
  if (teleported !== newPos) {
    const type = teleported > newPos ? "ladder" : "snake";
    return { newPos: teleported, teleport: { from: newPos, to: teleported, type } };
  }
  return { newPos, teleport: null };
}

function advanceBots(state: SnakesState): SnakesState {
  let s = state;
  let iter = 0;
  while (s.winner === null && s.turn !== 0 && iter++ < 500) {
    const rng = mulberry32(s.rngSeed);
    const d = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const player = s.turn;
    const { newPos, teleport } = movePlayer(s.positions[player]!, d);
    const newPositions = [...s.positions];
    newPositions[player] = newPos;
    const lastTeleport = teleport ? { player, ...teleport } : null;
    if (newPos === BOARD_SIZE) {
      s = { ...s, rngSeed: nextSeed, positions: newPositions, die: d, winner: player, lastTeleport };
      break;
    }
    const nt = (s.turn + 1) % s.numPlayers;
    s = { ...s, rngSeed: nextSeed, positions: newPositions, die: d, turn: nt, lastTeleport, phase: "rolling" };
  }
  return s;
}

export function reducer(state: SnakesState, action: SnakesAction): SnakesState {
  if (state.winner !== null) return state;

  if (action.type === "roll") {
    if (state.phase !== "rolling" || state.turn !== 0) return state;
    const rng = mulberry32(state.rngSeed);
    const d = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { newPos, teleport } = movePlayer(state.positions[0]!, d);
    const newPositions = [...state.positions];
    newPositions[0] = newPos;
    const lastTeleport = teleport ? { player: 0, ...teleport } : null;
    if (newPos === BOARD_SIZE) {
      return { ...state, rngSeed: nextSeed, positions: newPositions, die: d, winner: 0, lastTeleport };
    }
    const nt = (0 + 1) % state.numPlayers;
    const next: SnakesState = {
      ...state,
      rngSeed: nextSeed,
      positions: newPositions,
      die: d,
      turn: nt,
      lastTeleport,
      phase: "rolling",
    };
    return advanceBots(next);
  }

  return state;
}

export function isTerminal(state: SnakesState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}

export { FIXED_SNAKES_LADDERS };
