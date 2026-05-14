import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { isWord, WORDS } from "./words.js";

// ============================================================================
// Constants
// ============================================================================

export const BOARD_SIZE = 15;
export const RACK_SIZE = 7;
export const BINGO_BONUS = 50;

// Standard Scrabble letter point values
export const LETTER_VALUES: Record<string, number> = {
  a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1, j: 8,
  k: 5, l: 1, m: 3, n: 1, o: 1, p: 3, q: 10, r: 1, s: 1, t: 1,
  u: 1, v: 4, w: 4, x: 8, y: 4, z: 10,
};

// Standard 100-tile bag: 98 letter tiles + 2 blanks ("_")
export const TILE_FREQUENCIES: Record<string, number> = {
  a: 9, b: 2, c: 2, d: 4, e: 12, f: 2, g: 3, h: 2, i: 9, j: 1,
  k: 1, l: 4, m: 2, n: 6, o: 8, p: 2, q: 1, r: 6, s: 4, t: 6,
  u: 4, v: 2, w: 2, x: 1, y: 2, z: 1, "_": 2,
};

// Premium-square types
export type PremiumType = "tw" | "dw" | "tl" | "dl" | null;

/** Build the 15x15 premium-square layout for a standard Scrabble board. */
export function buildPremiumGrid(): PremiumType[][] {
  const g: PremiumType[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array<PremiumType>(BOARD_SIZE).fill(null),
  );
  // Triple Word Squares
  const tw: [number, number][] = [
    [0, 0], [0, 7], [0, 14],
    [7, 0], [7, 14],
    [14, 0], [14, 7], [14, 14],
  ];
  // Double Word Squares (including center)
  const dw: [number, number][] = [
    [1, 1], [2, 2], [3, 3], [4, 4],
    [10, 10], [11, 11], [12, 12], [13, 13],
    [1, 13], [2, 12], [3, 11], [4, 10],
    [10, 4], [11, 3], [12, 2], [13, 1],
    [7, 7], // center
  ];
  // Triple Letter Squares
  const tl: [number, number][] = [
    [1, 5], [1, 9],
    [5, 1], [5, 5], [5, 9], [5, 13],
    [9, 1], [9, 5], [9, 9], [9, 13],
    [13, 5], [13, 9],
  ];
  // Double Letter Squares
  const dl: [number, number][] = [
    [0, 3], [0, 11],
    [2, 6], [2, 8],
    [3, 0], [3, 7], [3, 14],
    [6, 2], [6, 6], [6, 8], [6, 12],
    [7, 3], [7, 11],
    [8, 2], [8, 6], [8, 8], [8, 12],
    [11, 0], [11, 7], [11, 14],
    [12, 6], [12, 8],
    [14, 3], [14, 11],
  ];
  for (const [r, c] of tw) g[r]![c] = "tw";
  for (const [r, c] of dw) g[r]![c] = "dw";
  for (const [r, c] of tl) g[r]![c] = "tl";
  for (const [r, c] of dl) g[r]![c] = "dl";
  return g;
}

export const PREMIUM_GRID: PremiumType[][] = buildPremiumGrid();
export const CENTER = 7;

// ============================================================================
// Types
// ============================================================================

/** A tile. `letter` is the displayed letter (a-z). If `isBlank` is true the
 *  tile was originally a blank and scores 0. */
export interface Tile {
  letter: string; // lowercase a-z; for blanks this is the user-assigned letter
  isBlank: boolean;
}

/** A cell on the board. null = empty. */
export type BoardCell = Tile | null;

export type Phase = "playing" | "done";

export type Player = "human" | "cpu";

export interface ScrabbleSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface ScrabbleState {
  board: BoardCell[][]; // 15x15
  bag: Tile[]; // shuffled remaining
  humanRack: Tile[];
  cpuRack: Tile[];
  humanScore: number;
  cpuScore: number;
  /** Tiles placed by the current human turn but not yet submitted. Each entry
   *  records the position on the board AND which rack index the tile came
   *  from (so we can undo). */
  pending: Array<{ r: number; c: number; tile: Tile; rackIdx: number }>;
  /** Selected rack index (the next click on the board places it). */
  selectedRackIdx: number | null;
  /** "human" goes first. */
  turn: Player;
  phase: Phase;
  /** Consecutive scoreless turns. If this hits 6, the game ends. */
  consecutivePasses: number;
  /** Last action message — surfaced in the UI as feedback. */
  lastMessage: string;
  /** Tracks if the player has rack-emptied at end of game (for bonus). */
  winnerNote: string;
}

export type ScrabbleAction =
  | { type: "selectRack"; idx: number }
  | { type: "placeTile"; r: number; c: number }
  | { type: "recallTile"; r: number; c: number }
  | { type: "recallAll" }
  | { type: "submit" }
  | { type: "pass" }
  | { type: "exchange"; idxs: number[] }
  | { type: "cpuTurn" }
  | { type: "setBlank"; r: number; c: number; letter: string };

// ============================================================================
// Helpers
// ============================================================================

function buildBag(rng: () => number): Tile[] {
  const bag: Tile[] = [];
  for (const [letter, count] of Object.entries(TILE_FREQUENCIES)) {
    for (let i = 0; i < count; i++) {
      bag.push({ letter, isBlank: letter === "_" });
    }
  }
  // Fisher-Yates shuffle
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [bag[i], bag[j]] = [bag[j]!, bag[i]!];
  }
  return bag;
}

function drawTiles(bag: Tile[], n: number): { drawn: Tile[]; bag: Tile[] } {
  const drawn: Tile[] = [];
  const newBag = [...bag];
  for (let i = 0; i < n && newBag.length > 0; i++) {
    drawn.push(newBag.pop()!);
  }
  return { drawn, bag: newBag };
}

function cloneBoard(b: BoardCell[][]): BoardCell[][] {
  return b.map((row) => [...row]);
}

function tilePoints(t: Tile): number {
  if (t.isBlank) return 0;
  return LETTER_VALUES[t.letter] ?? 0;
}

function rackPoints(rack: Tile[]): number {
  return rack.reduce((s, t) => s + tilePoints(t), 0);
}

/** Returns true if the placement is on a straight line (all same row OR same
 *  column) AND on the board AND all squares are empty. */
function isStraightLine(pending: Array<{ r: number; c: number }>): { dir: "h" | "v" | "single" | null } {
  if (pending.length === 0) return { dir: null };
  if (pending.length === 1) return { dir: "single" };
  const rows = new Set(pending.map((p) => p.r));
  const cols = new Set(pending.map((p) => p.c));
  if (rows.size === 1) return { dir: "h" };
  if (cols.size === 1) return { dir: "v" };
  return { dir: null };
}

/** Reads the full word formed on row r through column c (horizontal). */
function readHorizontalWord(
  board: BoardCell[][],
  r: number,
  c: number,
): { word: string; tiles: Array<{ r: number; c: number; tile: Tile }> } {
  let start = c;
  while (start > 0 && board[r]![start - 1]) start--;
  let end = c;
  while (end < BOARD_SIZE - 1 && board[r]![end + 1]) end++;
  let word = "";
  const tiles: Array<{ r: number; c: number; tile: Tile }> = [];
  for (let i = start; i <= end; i++) {
    const t = board[r]![i]!;
    word += t.letter;
    tiles.push({ r, c: i, tile: t });
  }
  return { word, tiles };
}

function readVerticalWord(
  board: BoardCell[][],
  r: number,
  c: number,
): { word: string; tiles: Array<{ r: number; c: number; tile: Tile }> } {
  let start = r;
  while (start > 0 && board[start - 1]![c]) start--;
  let end = r;
  while (end < BOARD_SIZE - 1 && board[end + 1]![c]) end++;
  let word = "";
  const tiles: Array<{ r: number; c: number; tile: Tile }> = [];
  for (let i = start; i <= end; i++) {
    const t = board[i]![c]!;
    word += t.letter;
    tiles.push({ r: i, c, tile: t });
  }
  return { word, tiles };
}

/** Score a word's tiles, applying premium-letter and premium-word bonuses
 *  ONLY for squares where the tile was newly placed this turn. */
function scoreWord(
  tiles: Array<{ r: number; c: number; tile: Tile }>,
  newlyPlaced: Set<string>,
): number {
  let raw = 0;
  let wordMult = 1;
  for (const { r, c, tile } of tiles) {
    let pts = tilePoints(tile);
    const key = `${r},${c}`;
    if (newlyPlaced.has(key)) {
      const prem = PREMIUM_GRID[r]![c];
      if (prem === "dl") pts *= 2;
      else if (prem === "tl") pts *= 3;
      else if (prem === "dw") wordMult *= 2;
      else if (prem === "tw") wordMult *= 3;
    }
    raw += pts;
  }
  return raw * wordMult;
}

/** Validates a fully placed pending move and computes its score. Returns
 *  { ok: false, reason } or { ok: true, score, words }. */
export function validateAndScore(
  board: BoardCell[][],
  pending: Array<{ r: number; c: number; tile: Tile }>,
  isFirstMove: boolean,
): { ok: true; score: number; words: string[] } | { ok: false; reason: string } {
  if (pending.length === 0) return { ok: false, reason: "No tiles placed." };
  // Build a working board with pending applied
  const work = cloneBoard(board);
  for (const p of pending) {
    if (work[p.r]![p.c]) return { ok: false, reason: "Cell already occupied." };
    work[p.r]![p.c] = p.tile;
  }
  // Straight-line check
  const line = isStraightLine(pending);
  if (!line.dir) return { ok: false, reason: "Tiles must form a straight line." };

  // First move must cover the center
  if (isFirstMove) {
    const onCenter = pending.some((p) => p.r === CENTER && p.c === CENTER);
    if (!onCenter) return { ok: false, reason: "First move must cover the center star." };
    if (pending.length < 2) return { ok: false, reason: "First word must be at least 2 letters." };
  }

  // Contiguity check + connectivity to existing tiles (or center for first move)
  if (line.dir === "h" || (line.dir === "single" && pending.length === 1)) {
    // Sort horizontally. For "single" we'll handle below.
  }
  const sortedPending = [...pending].sort((a, b) => (a.r - b.r) || (a.c - b.c));
  // Check contiguity along the play direction (with possible existing tiles filling gaps)
  if (line.dir === "h") {
    const r = sortedPending[0]!.r;
    const cMin = sortedPending[0]!.c;
    const cMax = sortedPending[sortedPending.length - 1]!.c;
    for (let c = cMin; c <= cMax; c++) {
      if (!work[r]![c]) return { ok: false, reason: "Gap in word." };
    }
  } else if (line.dir === "v") {
    const c = sortedPending[0]!.c;
    const rMin = sortedPending[0]!.r;
    const rMax = sortedPending[sortedPending.length - 1]!.r;
    for (let r = rMin; r <= rMax; r++) {
      if (!work[r]![c]) return { ok: false, reason: "Gap in word." };
    }
  }

  // Connectivity: at least one newly placed tile must be adjacent to an
  // existing tile (unless it's the first move, in which case center suffices).
  if (!isFirstMove) {
    let connected = false;
    for (const p of pending) {
      const neighbors = [
        [p.r - 1, p.c], [p.r + 1, p.c], [p.r, p.c - 1], [p.r, p.c + 1],
      ];
      for (const [nr, nc] of neighbors) {
        if (nr! < 0 || nr! >= BOARD_SIZE || nc! < 0 || nc! >= BOARD_SIZE) continue;
        const existing = board[nr!]![nc!];
        if (existing) { connected = true; break; }
      }
      if (connected) break;
    }
    if (!connected) return { ok: false, reason: "Word must touch an existing tile." };
  }

  // Collect all words formed
  const newlyPlaced = new Set(pending.map((p) => `${p.r},${p.c}`));
  const wordsFormed: Array<{ word: string; tiles: Array<{ r: number; c: number; tile: Tile }> }> = [];

  // Main word
  const main = line.dir === "v"
    ? readVerticalWord(work, sortedPending[0]!.r, sortedPending[0]!.c)
    : readHorizontalWord(work, sortedPending[0]!.r, sortedPending[0]!.c);
  if (main.word.length >= 2) wordsFormed.push(main);

  // Cross-words for each newly placed tile
  for (const p of pending) {
    const cross = line.dir === "v"
      ? readHorizontalWord(work, p.r, p.c)
      : readVerticalWord(work, p.r, p.c);
    if (cross.word.length >= 2) {
      // Avoid duplicating the main word for single-tile placements
      if (!(line.dir !== "v" && cross.word === main.word && main.word.length > 1)) {
        // The main word for "single" placements is ambiguous — handle below
        wordsFormed.push(cross);
      }
    }
  }
  // Dedupe (single-tile placements can read main word twice)
  const seen = new Set<string>();
  const unique: typeof wordsFormed = [];
  for (const w of wordsFormed) {
    const key = w.tiles.map((t) => `${t.r},${t.c}`).join("|");
    if (!seen.has(key)) { seen.add(key); unique.push(w); }
  }
  if (unique.length === 0) return { ok: false, reason: "No valid word formed." };

  // Dictionary check
  for (const w of unique) {
    if (!isWord(w.word)) return { ok: false, reason: `"${w.word.toUpperCase()}" is not in the dictionary.` };
  }

  // Score
  let total = 0;
  const wordStrings: string[] = [];
  for (const w of unique) {
    total += scoreWord(w.tiles, newlyPlaced);
    wordStrings.push(w.word.toUpperCase());
  }
  if (pending.length === RACK_SIZE) total += BINGO_BONUS;

  return { ok: true, score: total, words: wordStrings };
}

// ============================================================================
// CPU strategy — greedy highest-score legal move
// ============================================================================

/** Generate candidate moves for the CPU using a brute-force greedy approach:
 *  for each anchor (empty cell adjacent to existing tile, or center for first
 *  move), try placing a small subset of rack tiles in both directions and
 *  picking the highest scoring legal move. Bounded to keep things fast. */
function cpuChooseMove(state: ScrabbleState, rng: () => number): {
  pending: Array<{ r: number; c: number; tile: Tile; rackIdx: number }>;
  score: number;
} | null {
  const rack = state.cpuRack;
  if (rack.length === 0) return null;
  const board = state.board;
  const isFirstMove = !boardHasTiles(board);

  // Build set of anchors. For first move, anchor is the center.
  const anchors: Array<{ r: number; c: number }> = [];
  if (isFirstMove) {
    anchors.push({ r: CENTER, c: CENTER });
  } else {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r]![c]) continue;
        const adj = [
          [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
        ].some(([ar, ac]) => ar! >= 0 && ar! < BOARD_SIZE && ac! >= 0 && ac! < BOARD_SIZE && board[ar!]![ac!]);
        if (adj) anchors.push({ r, c });
      }
    }
  }

  let best: { pending: Array<{ r: number; c: number; tile: Tile; rackIdx: number }>; score: number } | null = null;
  // Build candidate words from rack: try every word in dictionary that is
  // composed of rack letters (with blanks). Cap to keep this fast.
  const rackLetters = rack.map((t) => t.letter);
  const blankCount = rack.filter((t) => t.isBlank).length;
  const candidates: string[] = [];
  for (const w of WORDS) {
    if (w.length < 2 || w.length > rack.length) continue;
    if (canFormFromRack(w, rackLetters, blankCount)) candidates.push(w);
    if (candidates.length > 800) break;
  }

  // For each candidate, try placing it at each anchor in both orientations.
  for (const word of candidates) {
    for (const anchor of anchors) {
      for (const dir of ["h", "v"] as const) {
        // Try every offset such that the anchor cell is covered by one of the
        // word's tiles. For first move we require center covered.
        for (let offset = 0; offset < word.length; offset++) {
          const startR = dir === "h" ? anchor.r : anchor.r - offset;
          const startC = dir === "h" ? anchor.c - offset : anchor.c;
          if (startR < 0 || startC < 0) continue;
          if (dir === "h" && startC + word.length > BOARD_SIZE) continue;
          if (dir === "v" && startR + word.length > BOARD_SIZE) continue;

          // Build the pending placement (skip cells already filled with that letter)
          const pending: Array<{ r: number; c: number; tile: Tile; rackIdx: number }> = [];
          const usedRackIdxs = new Set<number>();
          let ok = true;
          for (let i = 0; i < word.length; i++) {
            const rr = dir === "h" ? startR : startR + i;
            const cc = dir === "h" ? startC + i : startC;
            const existing = board[rr]![cc];
            const letter = word[i]!;
            if (existing) {
              if (existing.letter !== letter) { ok = false; break; }
              continue;
            }
            // Find a rack tile we can use
            let idx = -1;
            for (let j = 0; j < rack.length; j++) {
              if (usedRackIdxs.has(j)) continue;
              if (rack[j]!.letter === letter && !rack[j]!.isBlank) { idx = j; break; }
            }
            if (idx < 0) {
              // Use a blank
              for (let j = 0; j < rack.length; j++) {
                if (usedRackIdxs.has(j)) continue;
                if (rack[j]!.isBlank) { idx = j; break; }
              }
            }
            if (idx < 0) { ok = false; break; }
            usedRackIdxs.add(idx);
            const original = rack[idx]!;
            const tile: Tile = original.isBlank
              ? { letter, isBlank: true }
              : { letter: original.letter, isBlank: false };
            pending.push({ r: rr, c: cc, tile, rackIdx: idx });
          }
          if (!ok) continue;
          if (pending.length === 0) continue; // word already on board

          // Validate
          const pendingForValidate = pending.map((p) => ({ r: p.r, c: p.c, tile: p.tile }));
          const result = validateAndScore(board, pendingForValidate, isFirstMove);
          if (!result.ok) continue;
          if (!best || result.score > best.score) {
            best = { pending, score: result.score };
          }
        }
      }
    }
  }
  // Tie-break with a tiny rng nudge to add variety (no-op here, just consume)
  void rng;
  return best;
}

function canFormFromRack(word: string, rackLetters: string[], blankCount: number): boolean {
  const need: Record<string, number> = {};
  for (const ch of word) need[ch] = (need[ch] ?? 0) + 1;
  const have: Record<string, number> = {};
  let blanks = blankCount;
  for (const l of rackLetters) if (l !== "_") have[l] = (have[l] ?? 0) + 1;
  for (const [ch, n] of Object.entries(need)) {
    const h = have[ch] ?? 0;
    if (h >= n) continue;
    const deficit = n - h;
    if (deficit > blanks) return false;
    blanks -= deficit;
  }
  return true;
}

function boardHasTiles(board: BoardCell[][]): boolean {
  for (const row of board) for (const cell of row) if (cell) return true;
  return false;
}

// ============================================================================
// initialState, reducer, isTerminal
// ============================================================================

export function initialState(seed: number, _settings: ScrabbleSettings): ScrabbleState {
  void _settings;
  const rng = mulberry32(seed);
  const fullBag = buildBag(rng);
  const draw1 = drawTiles(fullBag, RACK_SIZE);
  const draw2 = drawTiles(draw1.bag, RACK_SIZE);
  const board: BoardCell[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array<BoardCell>(BOARD_SIZE).fill(null),
  );
  return {
    board,
    bag: draw2.bag,
    humanRack: draw1.drawn,
    cpuRack: draw2.drawn,
    humanScore: 0,
    cpuScore: 0,
    pending: [],
    selectedRackIdx: null,
    turn: "human",
    phase: "playing",
    consecutivePasses: 0,
    lastMessage: "",
    winnerNote: "",
  };
}

function endGameAdjust(state: ScrabbleState, lastPlayerEmptied: Player | null): ScrabbleState {
  // Subtract unplayed rack points; if a player went out, they receive the
  // sum of all opponents' rack points.
  const hPts = rackPoints(state.humanRack);
  const cPts = rackPoints(state.cpuRack);
  let humanScore = state.humanScore - hPts;
  let cpuScore = state.cpuScore - cPts;
  if (lastPlayerEmptied === "human") humanScore += cPts;
  else if (lastPlayerEmptied === "cpu") cpuScore += hPts;
  return { ...state, humanScore, cpuScore, phase: "done" };
}

export function reducer(state: ScrabbleState, action: ScrabbleAction): ScrabbleState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "selectRack": {
      if (state.turn !== "human") return state;
      if (action.idx < 0 || action.idx >= state.humanRack.length) return state;
      return { ...state, selectedRackIdx: action.idx };
    }

    case "placeTile": {
      if (state.turn !== "human") return state;
      if (state.selectedRackIdx === null) return state;
      const { r, c } = action;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return state;
      // Disallow placing on a filled cell (board or pending)
      if (state.board[r]![c]) return state;
      if (state.pending.some((p) => p.r === r && p.c === c)) return state;
      const idx = state.selectedRackIdx;
      // Disallow placing the same rack idx twice
      if (state.pending.some((p) => p.rackIdx === idx)) return state;
      const tile = state.humanRack[idx];
      if (!tile) return state;
      const placedTile: Tile = tile.isBlank
        ? { letter: tile.letter === "_" ? "a" : tile.letter, isBlank: true }
        : { letter: tile.letter, isBlank: false };
      const newPending = [...state.pending, { r, c, tile: placedTile, rackIdx: idx }];
      // Auto-advance selection to next unused rack tile (or clear)
      let nextSel: number | null = null;
      for (let i = 0; i < state.humanRack.length; i++) {
        if (i === idx) continue;
        if (newPending.some((p) => p.rackIdx === i)) continue;
        nextSel = i;
        break;
      }
      return { ...state, pending: newPending, selectedRackIdx: nextSel };
    }

    case "setBlank": {
      if (state.turn !== "human") return state;
      const { r, c, letter } = action;
      const idx = state.pending.findIndex((p) => p.r === r && p.c === c);
      if (idx < 0) return state;
      const p = state.pending[idx]!;
      if (!p.tile.isBlank) return state;
      if (!/^[a-z]$/.test(letter)) return state;
      const newPending = [...state.pending];
      newPending[idx] = { ...p, tile: { letter, isBlank: true } };
      return { ...state, pending: newPending };
    }

    case "recallTile": {
      if (state.turn !== "human") return state;
      const { r, c } = action;
      const idx = state.pending.findIndex((p) => p.r === r && p.c === c);
      if (idx < 0) return state;
      const newPending = state.pending.filter((_, i) => i !== idx);
      return { ...state, pending: newPending };
    }

    case "recallAll": {
      if (state.turn !== "human") return state;
      if (state.pending.length === 0) return state;
      return { ...state, pending: [], selectedRackIdx: null };
    }

    case "submit": {
      if (state.turn !== "human") return state;
      if (state.pending.length === 0) return state;
      const isFirstMove = !boardHasTiles(state.board);
      const pendingForValidate = state.pending.map((p) => ({ r: p.r, c: p.c, tile: p.tile }));
      const result = validateAndScore(state.board, pendingForValidate, isFirstMove);
      if (!result.ok) {
        return { ...state, lastMessage: result.reason };
      }
      // Commit
      const newBoard = cloneBoard(state.board);
      for (const p of state.pending) newBoard[p.r]![p.c] = p.tile;
      // Remove used tiles from rack and draw replacements
      const usedIdxs = new Set(state.pending.map((p) => p.rackIdx));
      const remainingRack = state.humanRack.filter((_, i) => !usedIdxs.has(i));
      const refill = drawTiles(state.bag, RACK_SIZE - remainingRack.length);
      const newRack = [...remainingRack, ...refill.drawn];
      const newScore = state.humanScore + result.score;

      // Check end-of-game: rack out + bag empty
      if (newRack.length === 0 && refill.bag.length === 0) {
        // `endGameAdjust` already transfers the opponent's leftover rack
        // points to the rack-outer (and subtracts them from the opponent).
        // The previous version added the same bonus a SECOND time here,
        // doubling the rack-out reward and producing wrong final scores
        // whenever the margin lived inside the bonus.
        const adjusted = endGameAdjust({
          ...state,
          board: newBoard,
          bag: refill.bag,
          humanRack: newRack,
          humanScore: newScore,
          pending: [],
          selectedRackIdx: null,
          lastMessage: `Played: ${result.words.join(", ")} (+${result.score}). Rack empty — game over!`,
          consecutivePasses: 0,
        }, "human");
        return { ...adjusted, winnerNote: "Human rack-out bonus" };
      }
      return {
        ...state,
        board: newBoard,
        bag: refill.bag,
        humanRack: newRack,
        humanScore: newScore,
        pending: [],
        selectedRackIdx: null,
        turn: "cpu",
        lastMessage: `You played ${result.words.join(", ")} for +${result.score}.`,
        consecutivePasses: 0,
      };
    }

    case "pass": {
      if (state.turn !== "human") return state;
      const passes = state.consecutivePasses + 1;
      if (passes >= 6) {
        return endGameAdjust({ ...state, lastMessage: "Game ended (6 consecutive passes).", consecutivePasses: passes }, null);
      }
      return {
        ...state,
        pending: [],
        selectedRackIdx: null,
        turn: "cpu",
        consecutivePasses: passes,
        lastMessage: "You passed.",
      };
    }

    case "exchange": {
      if (state.turn !== "human") return state;
      // L-tier: skip edge-case validation. Just allow exchange if bag has >= idxs.length.
      if (state.bag.length < action.idxs.length) {
        return { ...state, lastMessage: "Not enough tiles left in the bag to exchange." };
      }
      const idxSet = new Set(action.idxs);
      const toReturn = state.humanRack.filter((_, i) => idxSet.has(i));
      const keep = state.humanRack.filter((_, i) => !idxSet.has(i));
      const drawn = drawTiles(state.bag, action.idxs.length);
      // Put the returned tiles back at the start of the bag
      const newBag = [...toReturn, ...drawn.bag];
      const passes = state.consecutivePasses + 1;
      // Exchanges count toward the 6-consecutive-scoreless-turn end-of-game
      // rule the same way passes do; without this guard the game can loop
      // indefinitely on alternating exchanges with no scoring play.
      if (passes >= 6) {
        return endGameAdjust(
          { ...state, bag: newBag, humanRack: [...keep, ...drawn.drawn], pending: [], selectedRackIdx: null, lastMessage: `You exchanged ${action.idxs.length} tile(s). Game ended (6 consecutive scoreless turns).`, consecutivePasses: passes },
          null,
        );
      }
      return {
        ...state,
        bag: newBag,
        humanRack: [...keep, ...drawn.drawn],
        pending: [],
        selectedRackIdx: null,
        turn: "cpu",
        consecutivePasses: passes,
        lastMessage: `You exchanged ${action.idxs.length} tile(s).`,
      };
    }

    case "cpuTurn": {
      if (state.turn !== "cpu") return state;
      const rng = mulberry32(state.bag.length + state.humanScore * 7 + state.cpuScore * 13 + 1);
      const move = cpuChooseMove(state, rng);
      if (!move) {
        // Pass
        const passes = state.consecutivePasses + 1;
        if (passes >= 6) {
          return endGameAdjust({ ...state, lastMessage: "CPU passed — game ended (6 consecutive passes).", consecutivePasses: passes }, null);
        }
        return { ...state, turn: "human", consecutivePasses: passes, lastMessage: "CPU passed." };
      }
      // Apply CPU move
      const newBoard = cloneBoard(state.board);
      for (const p of move.pending) newBoard[p.r]![p.c] = p.tile;
      const usedIdxs = new Set(move.pending.map((p) => p.rackIdx));
      const remainingRack = state.cpuRack.filter((_, i) => !usedIdxs.has(i));
      const refill = drawTiles(state.bag, RACK_SIZE - remainingRack.length);
      const newRack = [...remainingRack, ...refill.drawn];
      const newScore = state.cpuScore + move.score;

      if (newRack.length === 0 && refill.bag.length === 0) {
        const adjusted = endGameAdjust({
          ...state,
          board: newBoard,
          bag: refill.bag,
          cpuRack: newRack,
          cpuScore: newScore,
          turn: "human",
          consecutivePasses: 0,
          lastMessage: `CPU played for +${move.score}. Game over!`,
        }, "cpu");
        const extraBonus = rackPoints(state.humanRack);
        return { ...adjusted, cpuScore: adjusted.cpuScore + extraBonus, winnerNote: "CPU rack-out bonus" };
      }
      return {
        ...state,
        board: newBoard,
        bag: refill.bag,
        cpuRack: newRack,
        cpuScore: newScore,
        turn: "human",
        consecutivePasses: 0,
        lastMessage: `CPU played for +${move.score}.`,
      };
    }
  }
  return state;
}

export function isTerminal(state: ScrabbleState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score = max(0, humanScore - cpuScore) so a loss = 0 (not leaderboard-worthy)
  const diff = state.humanScore - state.cpuScore;
  return { score: Math.max(0, diff) };
}
