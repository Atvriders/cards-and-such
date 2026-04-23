import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { isValidWord } from "./words.js";

export interface BananagramsSettings {
  tileCount: "15" | "21" | "30";
}

export interface PlacedTile {
  id: number;
  letter: string;
  row: number;
  col: number;
}

export interface BananagramsState {
  settings: BananagramsSettings;
  tiles: string[];        // all tiles (letters)
  placed: PlacedTile[];  // tiles placed on grid
  hand: number[];         // tile indices still in hand
  selectedHandTile: number | null;
  timeLeft: number;
  score: number;
  gameOver: boolean;
  message: string;
  validationResult: "valid" | "invalid" | null;
}

export type BananagramsAction =
  | { type: "selectHandTile"; tileId: number }
  | { type: "placeOnGrid"; row: number; col: number }
  | { type: "pickUpTile"; tileId: number }   // move placed tile back to hand
  | { type: "validate" }
  | { type: "tick" };

const LETTER_FREQ: Record<string, number> = {
  A:13, B:3, C:3, D:6, E:18, F:3, G:4, H:3, I:12, J:2, K:2, L:5, M:3,
  N:8, O:11, P:3, Q:2, R:9, S:6, T:9, U:6, V:3, W:3, X:2, Y:3, Z:2,
};

function buildTilePool(seed: number, count: number): string[] {
  const rng = mulberry32(seed);
  const pool: string[] = [];
  for (const [letter, freq] of Object.entries(LETTER_FREQ)) {
    for (let i = 0; i < freq; i++) pool.push(letter);
  }
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, count);
}

export function initialState(seed: number, settings: BananagramsSettings): BananagramsState {
  const count = parseInt(settings.tileCount, 10);
  const tiles = buildTilePool(seed, count);
  const hand = Array.from({ length: count }, (_, i) => i);
  return {
    settings,
    tiles,
    placed: [],
    hand,
    selectedHandTile: null,
    timeLeft: 300, // 5 minutes
    score: 0,
    gameOver: false,
    message: "Click a tile from your hand, then click a grid cell to place it.",
    validationResult: null,
  };
}

// Check all horizontal/vertical runs of 2+ letters in grid
function validateGrid(placed: PlacedTile[]): { valid: boolean; message: string } {
  if (placed.length === 0) return { valid: false, message: "No tiles placed" };

  // Build coordinate map
  const map = new Map<string, string>();
  for (const t of placed) {
    map.set(`${t.row},${t.col}`, t.letter);
  }

  // Check connectivity: BFS from first tile
  const start = placed[0]!;
  const visited = new Set<string>();
  const queue = [`${start.row},${start.col}`];
  while (queue.length) {
    const key = queue.shift()!;
    if (visited.has(key)) continue;
    visited.add(key);
    const [r, c] = key.split(",").map(Number);
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nk = `${r!+dr!},${c!+dc!}`;
      if (map.has(nk) && !visited.has(nk)) queue.push(nk);
    }
  }
  if (visited.size !== placed.length) return { valid: false, message: "Grid not fully connected" };

  // Check all runs
  const invalidWords: string[] = [];

  // Horizontal runs
  const rows = [...new Set(placed.map(t => t.row))].sort((a,b) => a-b);
  for (const row of rows) {
    const cols = placed.filter(t => t.row === row).map(t => t.col).sort((a,b) => a-b);
    let run = "";
    let prev = -999;
    for (const col of cols) {
      if (col === prev + 1) {
        run += map.get(`${row},${col}`) ?? "";
      } else {
        if (run.length >= 2 && !isValidWord(run)) invalidWords.push(run);
        run = map.get(`${row},${col}`) ?? "";
      }
      prev = col;
    }
    if (run.length >= 2 && !isValidWord(run)) invalidWords.push(run);
  }

  // Vertical runs
  const cols = [...new Set(placed.map(t => t.col))].sort((a,b) => a-b);
  for (const col of cols) {
    const rowsInCol = placed.filter(t => t.col === col).map(t => t.row).sort((a,b) => a-b);
    let run = "";
    let prev = -999;
    for (const row of rowsInCol) {
      if (row === prev + 1) {
        run += map.get(`${row},${col}`) ?? "";
      } else {
        if (run.length >= 2 && !isValidWord(run)) invalidWords.push(run);
        run = map.get(`${row},${col}`) ?? "";
      }
      prev = row;
    }
    if (run.length >= 2 && !isValidWord(run)) invalidWords.push(run);
  }

  if (invalidWords.length > 0) {
    return { valid: false, message: `Invalid words: ${invalidWords.slice(0, 3).join(", ")}` };
  }
  return { valid: true, message: "All words valid!" };
}

export function reducer(state: BananagramsState, action: BananagramsAction): BananagramsState {
  if (state.gameOver && action.type !== "tick") return state;

  switch (action.type) {
    case "selectHandTile": {
      if (!state.hand.includes(action.tileId)) return state;
      return { ...state, selectedHandTile: action.tileId, message: "Now click a grid cell to place the tile." };
    }
    case "placeOnGrid": {
      if (state.selectedHandTile === null) return { ...state, message: "Select a tile from your hand first." };
      const tileId = state.selectedHandTile;
      // Check cell not occupied
      const occupied = state.placed.some(t => t.row === action.row && t.col === action.col);
      if (occupied) return { ...state, message: "Cell already occupied." };

      const newPlaced: PlacedTile[] = [...state.placed, {
        id: tileId,
        letter: state.tiles[tileId]!,
        row: action.row,
        col: action.col,
      }];
      const newHand = state.hand.filter(id => id !== tileId);
      return {
        ...state,
        placed: newPlaced,
        hand: newHand,
        selectedHandTile: null,
        message: newHand.length === 0 ? "All tiles placed! Click Validate." : "Tile placed.",
        validationResult: null,
      };
    }
    case "pickUpTile": {
      const tile = state.placed.find(t => t.id === action.tileId);
      if (!tile) return state;
      const newPlaced = state.placed.filter(t => t.id !== action.tileId);
      const newHand = [...state.hand, action.tileId].sort((a,b) => a-b);
      return { ...state, placed: newPlaced, hand: newHand, validationResult: null, message: "Tile returned to hand." };
    }
    case "validate": {
      const { valid, message } = validateGrid(state.placed);
      const allPlaced = state.hand.length === 0;
      if (valid && allPlaced) {
        const bonus = 50;
        const score = state.placed.length * 10 + bonus;
        return { ...state, validationResult: "valid", score, gameOver: true, message: `All ${state.placed.length} tiles placed correctly! +${bonus} bonus` };
      } else if (valid && !allPlaced) {
        const score = state.placed.length * 10;
        return { ...state, validationResult: "valid", score, message: `Valid so far! ${state.hand.length} tiles still in hand.` };
      }
      return { ...state, validationResult: "invalid", message };
    }
    case "tick": {
      if (state.gameOver) return state;
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) {
        const { valid } = validateGrid(state.placed);
        const score = valid ? state.placed.length * 10 : 0;
        return { ...state, timeLeft: 0, gameOver: true, score, message: "Time's up!" };
      }
      return { ...state, timeLeft: newTime };
    }
    default:
      return state;
  }
}

export function isTerminal(state: BananagramsState): { score: number } | null {
  if (state.gameOver) return { score: state.score };
  return null;
}
