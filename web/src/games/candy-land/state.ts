import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Candy Land — simplified 50-space race game
// Colors: red, orange, yellow, green, blue, purple
// Special cards: double-red, named locations

export type CandyColor = "red" | "orange" | "yellow" | "green" | "blue" | "purple";
export type CardType = CandyColor | "double-red" | "gumdrop-pass" | "gloppys-swamp";

export interface CandySettings {
  opponents: "1" | "2" | "3";
}

export const BOARD_SIZE = 50;

// Color sequence for the 50-space path (repeating cycle)
const COLOR_CYCLE: CandyColor[] = ["red", "orange", "yellow", "green", "blue", "purple"];

// Build array of path colors (0-indexed)
export const PATH_COLORS: CandyColor[] = Array.from({ length: BOARD_SIZE }, (_, i) => COLOR_CYCLE[i % 6]!);

// Named location destinations (1-indexed board squares)
export const GUMDROP_PASS = 12; // teleport to square 12
export const GLOPPYS_SWAMP = 28; // teleport to square 28

export interface CandyState {
  settings: CandySettings;
  rngSeed: number;
  positions: number[]; // 0 = start (not yet on board), 1..50 = board, 51 = finished
  numPlayers: number;
  turn: number;
  lastCard: CardType | null;
  winner: number | null;
  message: string;
}

export type CandyAction = { type: "draw" };

function numPlayers(s: CandySettings): number {
  return 1 + parseInt(s.opponents);
}

// All card types with weights
const CARD_POOL: CardType[] = [
  "red", "red", "red", "red",
  "orange", "orange", "orange", "orange",
  "yellow", "yellow", "yellow", "yellow",
  "green", "green", "green", "green",
  "blue", "blue", "blue", "blue",
  "purple", "purple", "purple", "purple",
  "double-red",
  "gumdrop-pass",
  "gloppys-swamp",
];

function drawCard(seed: number): { card: CardType; nextSeed: number } {
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * CARD_POOL.length);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { card: CARD_POOL[idx]!, nextSeed };
}

function nextColorSquare(pos: number, color: CandyColor, skipFirst: boolean): number {
  // Advance to the next (or 2nd) square of this color
  let count = 0;
  for (let sq = pos + 1; sq <= BOARD_SIZE; sq++) {
    if (PATH_COLORS[sq - 1] === color) {
      count++;
      if (!skipFirst || count === 2) return sq;
    }
  }
  // If we can't find a 2nd for double, just go to end
  return BOARD_SIZE + 1; // finished
}

function applyCard(pos: number, card: CardType): { newPos: number; msg: string } {
  switch (card) {
    case "gumdrop-pass":
      return { newPos: GUMDROP_PASS, msg: "Gumdrop Pass! Teleport to square 12!" };
    case "gloppys-swamp":
      return { newPos: GLOPPYS_SWAMP, msg: "Gloppy's Swamp! Stuck at square 28!" };
    case "double-red": {
      const sq = nextColorSquare(pos, "red", true);
      return { newPos: Math.min(sq, BOARD_SIZE + 1), msg: `Double Red! Advance to 2nd red square!` };
    }
    default: {
      const sq = nextColorSquare(pos, card, false);
      return { newPos: Math.min(sq, BOARD_SIZE + 1), msg: `Drew ${card}!` };
    }
  }
}

export function initialState(seed: number, settings: CandySettings): CandyState {
  const np = numPlayers(settings);
  return {
    settings,
    rngSeed: seed,
    positions: new Array(np).fill(0),
    numPlayers: np,
    turn: 0,
    lastCard: null,
    winner: null,
    message: "Draw a card to move!",
  };
}

function advanceBots(state: CandyState): CandyState {
  let s = state;
  let iter = 0;
  while (s.winner === null && s.turn !== 0 && iter++ < 500) {
    const { card, nextSeed } = drawCard(s.rngSeed);
    const player = s.turn;
    const { newPos, msg } = applyCard(s.positions[player]!, card);
    const newPositions = [...s.positions];
    newPositions[player] = newPos;
    if (newPos > BOARD_SIZE) {
      s = { ...s, rngSeed: nextSeed, positions: newPositions, lastCard: card, winner: player, message: `Bot ${player} wins!` };
      break;
    }
    const nt = (s.turn + 1) % s.numPlayers;
    s = { ...s, rngSeed: nextSeed, positions: newPositions, lastCard: card, turn: nt, message: `Bot ${player}: ${msg}` };
  }
  return s;
}

export function reducer(state: CandyState, action: CandyAction): CandyState {
  if (state.winner !== null) return state;
  if (action.type !== "draw") return state;
  if (state.turn !== 0) return state;

  const { card, nextSeed } = drawCard(state.rngSeed);
  const { newPos, msg } = applyCard(state.positions[0]!, card);
  const newPositions = [...state.positions];
  newPositions[0] = newPos;

  if (newPos > BOARD_SIZE) {
    return { ...state, rngSeed: nextSeed, positions: newPositions, lastCard: card, winner: 0, message: "You win! Reached the end!" };
  }

  const nt = (0 + 1) % state.numPlayers;
  const next: CandyState = {
    ...state,
    rngSeed: nextSeed,
    positions: newPositions,
    lastCard: card,
    turn: nt,
    message: `You: ${msg}`,
  };
  return advanceBots(next);
}

export function isTerminal(state: CandyState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}

export { PATH_COLORS as pathColors };
