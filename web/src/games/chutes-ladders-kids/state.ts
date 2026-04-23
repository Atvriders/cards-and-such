import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Chutes & Ladders — Kids Edition
// Shorter board: 30 squares. Fewer snakes/chutes. D4 (1-4) instead of D6 for shorter games.
// First to reach or pass square 30 wins.

export const BOARD_SIZE = 30;

export interface KidsSettings {
  opponents: "1" | "2" | "3";
}

export interface ChuteLadder {
  from: number;
  to: number;
  type: "chute" | "ladder";
}

// Simplified layout: fewer chutes, more ladders (good for kids)
export const CHUTES_LADDERS: ChuteLadder[] = [
  // Ladders (from < to) — good luck!
  { from: 2,  to: 11, type: "ladder" },
  { from: 7,  to: 22, type: "ladder" },
  { from: 14, to: 26, type: "ladder" },
  { from: 20, to: 28, type: "ladder" },
  // Chutes (from > to) — bad luck
  { from: 9,  to: 3,  type: "chute" },
  { from: 17, to: 6,  type: "chute" },
  { from: 25, to: 13, type: "chute" },
  { from: 29, to: 18, type: "chute" },
];

function buildTeleportMap(): Map<number, number> {
  const m = new Map<number, number>();
  for (const cl of CHUTES_LADDERS) m.set(cl.from, cl.to);
  return m;
}

const TELEPORT_MAP = buildTeleportMap();

export interface KidsState {
  settings: KidsSettings;
  rngSeed: number;
  positions: number[];
  numPlayers: number;
  die: number;
  turn: number;
  winner: number | null;
  lastTeleport: { player: number; from: number; to: number; type: "chute" | "ladder" } | null;
  message: string;
}

export type KidsAction = { type: "roll" };

function numPlayers(s: KidsSettings): number {
  return 1 + parseInt(s.opponents);
}

export function initialState(seed: number, settings: KidsSettings): KidsState {
  const np = numPlayers(settings);
  return {
    settings,
    rngSeed: seed,
    positions: new Array(np).fill(0),
    numPlayers: np,
    die: 0,
    turn: 0,
    winner: null,
    lastTeleport: null,
    message: "Roll to start! First to square 30 wins!",
  };
}

function movePlayer(pos: number, die: number): { newPos: number; teleport: { from: number; to: number; type: "chute" | "ladder" } | null } {
  let newPos = pos + die;
  if (newPos > BOARD_SIZE) newPos = pos; // must land exactly (or stay)
  if (newPos === BOARD_SIZE) return { newPos, teleport: null };
  const teleported = TELEPORT_MAP.get(newPos);
  if (teleported !== undefined && teleported !== newPos) {
    const type = teleported > newPos ? "ladder" : "chute";
    return { newPos: teleported, teleport: { from: newPos, to: teleported, type } };
  }
  return { newPos, teleport: null };
}

function advanceBots(state: KidsState): KidsState {
  let s = state;
  let iter = 0;
  while (s.winner === null && s.turn !== 0 && iter++ < 500) {
    const rng = mulberry32(s.rngSeed);
    const d = Math.floor(rng() * 4) + 1; // d4
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const player = s.turn;
    const { newPos, teleport } = movePlayer(s.positions[player]!, d);
    const newPositions = [...s.positions];
    newPositions[player] = newPos;
    const lastTeleport = teleport ? { player, ...teleport } : null;
    if (newPos === BOARD_SIZE) {
      s = { ...s, rngSeed: nextSeed, positions: newPositions, die: d, winner: player, lastTeleport, message: `Bot ${player} wins!` };
      break;
    }
    const nt = (s.turn + 1) % s.numPlayers;
    s = { ...s, rngSeed: nextSeed, positions: newPositions, die: d, turn: nt, lastTeleport };
  }
  return s;
}

export function reducer(state: KidsState, action: KidsAction): KidsState {
  if (state.winner !== null) return state;
  if (action.type !== "roll") return state;
  if (state.turn !== 0) return state;

  const rng = mulberry32(state.rngSeed);
  const d = Math.floor(rng() * 4) + 1;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const { newPos, teleport } = movePlayer(state.positions[0]!, d);
  const newPositions = [...state.positions];
  newPositions[0] = newPos;
  const lastTeleport = teleport ? { player: 0, ...teleport } : null;

  if (newPos === BOARD_SIZE) {
    return {
      ...state,
      rngSeed: nextSeed,
      positions: newPositions,
      die: d,
      winner: 0,
      lastTeleport,
      message: `You rolled ${d} and reached square 30! You win!`,
    };
  }

  const teleportMsg = teleport
    ? ` ${teleport.type === "ladder" ? "🪜 Ladder!" : "🎢 Chute!"} ${teleport.from}→${teleport.to}`
    : "";
  const nt = 1 % state.numPlayers;
  const next: KidsState = {
    ...state,
    rngSeed: nextSeed,
    positions: newPositions,
    die: d,
    turn: nt,
    lastTeleport,
    message: `You rolled ${d} → sq ${newPos}.${teleportMsg}`,
  };
  return advanceBots(next);
}

export function isTerminal(state: KidsState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
