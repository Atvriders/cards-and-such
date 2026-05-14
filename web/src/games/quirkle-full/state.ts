import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ============================================================================
// Constants
// ============================================================================

export const COLORS = ["red", "orange", "yellow", "green", "blue", "purple"] as const;
export const SHAPES = ["circle", "square", "diamond", "club", "starburst", "sparkle"] as const;
export type Color = (typeof COLORS)[number];
export type Shape = (typeof SHAPES)[number];

export const COPIES_PER_TILE = 3;
export const HAND_SIZE = 6;
export const QWIRKLE_BONUS = 6;
export const FINAL_BONUS = 6;
export const LINE_LIMIT = 6;

/** A tile has a color and a shape. */
export interface Tile {
  color: Color;
  shape: Shape;
  /** Stable id so React keys are unique. */
  id: number;
}

/** A placed tile on the board. */
export interface BoardCell {
  tile: Tile;
}

export type Phase = "playing" | "done";

export interface QwirkleSettings {
  _dummy: boolean;
}

export interface Player {
  /** "human" or "cpu-1" etc. */
  id: string;
  /** Display name. */
  name: string;
  /** Is this seat controlled by the CPU? */
  isCpu: boolean;
  /** Current hand. */
  hand: Tile[];
  /** Cumulative score. */
  score: number;
  /** True once this player has emptied their hand at end of bag. */
  outOfTiles: boolean;
}

/** Sparse board indexed by `${r},${c}`. The origin (0,0) is the centre of the
 *  conceptual plane. We keep a bounding box for rendering. */
export interface QwirkleState {
  /** Map of "r,c" -> placed tile. */
  board: Record<string, BoardCell>;
  bag: Tile[];
  players: Player[];
  /** Index of the player whose turn it is. */
  currentPlayer: number;
  /** Tiles the human has pending on the board this turn. */
  pending: Array<{ r: number; c: number; tile: Tile; handIdx: number }>;
  /** Selected hand index for the next click on the board. */
  selectedHandIdx: number | null;
  phase: Phase;
  /** Last action message. */
  lastMessage: string;
  /** Bounding box of the board (inclusive). */
  bounds: { rMin: number; rMax: number; cMin: number; cMax: number };
}

export type QwirkleAction =
  | { type: "selectHand"; idx: number }
  | { type: "placeTile"; r: number; c: number }
  | { type: "recallTile"; r: number; c: number }
  | { type: "recallAll" }
  | { type: "submit" }
  | { type: "swap"; idxs: number[] }
  | { type: "cpuTurn" };

// ============================================================================
// Helpers
// ============================================================================

function buildBag(rng: () => number): Tile[] {
  const bag: Tile[] = [];
  let id = 0;
  for (const color of COLORS) {
    for (const shape of SHAPES) {
      for (let k = 0; k < COPIES_PER_TILE; k++) {
        bag.push({ color, shape, id: id++ });
      }
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

export function keyOf(r: number, c: number): string {
  return `${r},${c}`;
}

function tileAt(
  board: Record<string, BoardCell>,
  pending: Array<{ r: number; c: number; tile: Tile }>,
  r: number,
  c: number,
): Tile | null {
  const p = pending.find((q) => q.r === r && q.c === c);
  if (p) return p.tile;
  const existing = board[keyOf(r, c)];
  return existing ? existing.tile : null;
}

/** Read the run of contiguous tiles in a given direction starting from (r,c),
 *  considering both `board` and `pending`. Includes (r,c) itself if present. */
function readLine(
  board: Record<string, BoardCell>,
  pending: Array<{ r: number; c: number; tile: Tile }>,
  r: number,
  c: number,
  dr: number,
  dc: number,
): Tile[] {
  // Walk backward to start
  let sr = r;
  let sc = c;
  while (tileAt(board, pending, sr - dr, sc - dc)) {
    sr -= dr;
    sc -= dc;
  }
  // Walk forward collecting
  const out: Tile[] = [];
  let cr = sr;
  let cc = sc;
  while (true) {
    const t = tileAt(board, pending, cr, cc);
    if (!t) break;
    out.push(t);
    cr += dr;
    cc += dc;
  }
  return out;
}

/** Returns true if a set of tiles forms a valid Qwirkle line: all share color
 *  with distinct shapes, OR all share shape with distinct colors. Length must
 *  be <= LINE_LIMIT (6). A single tile is trivially valid. */
export function isValidLine(tiles: Tile[]): boolean {
  if (tiles.length <= 1) return true;
  if (tiles.length > LINE_LIMIT) return false;
  const colors = new Set(tiles.map((t) => t.color));
  const shapes = new Set(tiles.map((t) => t.shape));
  // All same color, distinct shapes
  if (colors.size === 1 && shapes.size === tiles.length) return true;
  // All same shape, distinct colors
  if (shapes.size === 1 && colors.size === tiles.length) return true;
  return false;
}

/** Returns true if (r,c) is adjacent to at least one already-placed tile
 *  (in board or pending) — used to enforce connectivity. */
function hasNeighbor(
  board: Record<string, BoardCell>,
  pending: Array<{ r: number; c: number; tile: Tile }>,
  r: number,
  c: number,
): boolean {
  const neigh = [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ];
  for (const [nr, nc] of neigh) {
    if (tileAt(board, pending, nr!, nc!)) return true;
  }
  return false;
}

function boardHasTiles(board: Record<string, BoardCell>): boolean {
  for (const _k in board) return true;
  return false;
}

/** Validate a complete pending move and compute its score. */
export function validateAndScore(
  board: Record<string, BoardCell>,
  pending: Array<{ r: number; c: number; tile: Tile }>,
  isFirstMove: boolean,
): { ok: true; score: number } | { ok: false; reason: string } {
  if (pending.length === 0) return { ok: false, reason: "No tiles placed." };

  // No duplicate squares
  const seen = new Set<string>();
  for (const p of pending) {
    const k = keyOf(p.r, p.c);
    if (seen.has(k)) return { ok: false, reason: "Duplicate placement." };
    if (board[k]) return { ok: false, reason: "Cell already occupied." };
    seen.add(k);
  }

  // All pending in one straight line (same row OR same col)
  const rows = new Set(pending.map((p) => p.r));
  const cols = new Set(pending.map((p) => p.c));
  let dir: "h" | "v" | "single";
  if (pending.length === 1) {
    dir = "single";
  } else if (rows.size === 1) {
    dir = "h";
  } else if (cols.size === 1) {
    dir = "v";
  } else {
    return { ok: false, reason: "Tiles must form a straight line." };
  }

  // Contiguity along play direction (with pending+board filling)
  const sorted = [...pending].sort((a, b) => (a.r - b.r) || (a.c - b.c));
  if (dir === "h") {
    const r = sorted[0]!.r;
    const cMin = sorted[0]!.c;
    const cMax = sorted[sorted.length - 1]!.c;
    for (let c = cMin; c <= cMax; c++) {
      if (!tileAt(board, pending, r, c)) return { ok: false, reason: "Gap in line." };
    }
  } else if (dir === "v") {
    const c = sorted[0]!.c;
    const rMin = sorted[0]!.r;
    const rMax = sorted[sorted.length - 1]!.r;
    for (let r = rMin; r <= rMax; r++) {
      if (!tileAt(board, pending, r, c)) return { ok: false, reason: "Gap in line." };
    }
  }

  // Connectivity: if board is non-empty, at least one pending tile must touch
  // an existing tile.
  if (!isFirstMove) {
    let connected = false;
    for (const p of pending) {
      const neigh = [
        [p.r - 1, p.c],
        [p.r + 1, p.c],
        [p.r, p.c - 1],
        [p.r, p.c + 1],
      ];
      for (const [nr, nc] of neigh) {
        if (board[keyOf(nr!, nc!)]) {
          connected = true;
          break;
        }
      }
      if (connected) break;
    }
    if (!connected) return { ok: false, reason: "Must touch an existing tile." };
  }

  // Validate every line touched. The MAIN line runs along play direction; for
  // each pending tile we ALSO check the cross-line. Single-tile placements
  // check both directions.
  const linesToCheck: Tile[][] = [];

  function pushLine(line: Tile[]) {
    if (line.length >= 2) linesToCheck.push(line);
  }

  if (dir === "h" || dir === "single") {
    // Horizontal line through first pending tile spans all pending tiles
    const r0 = sorted[0]!.r;
    const c0 = sorted[0]!.c;
    const hLine = readLine(board, pending, r0, c0, 0, 1);
    pushLine(hLine);
    // Vertical cross-line for EACH pending tile
    for (const p of pending) {
      const v = readLine(board, pending, p.r, p.c, 1, 0);
      pushLine(v);
    }
  }
  if (dir === "v" || dir === "single") {
    const r0 = sorted[0]!.r;
    const c0 = sorted[0]!.c;
    const vLine = readLine(board, pending, r0, c0, 1, 0);
    pushLine(vLine);
    for (const p of pending) {
      const h = readLine(board, pending, p.r, p.c, 0, 1);
      pushLine(h);
    }
  }

  // Dedup lines by their tile-id sequence
  const lineKeySet = new Set<string>();
  const uniqueLines: Tile[][] = [];
  for (const line of linesToCheck) {
    const key = line.map((t) => t.id).join("|");
    if (!lineKeySet.has(key)) {
      lineKeySet.add(key);
      uniqueLines.push(line);
    }
  }

  // Every line must be valid
  for (const line of uniqueLines) {
    if (!isValidLine(line)) {
      return { ok: false, reason: "Line breaks Qwirkle match rule." };
    }
  }

  // Every pending tile must participate in at least one line of length >=1
  // (trivially true) — but for scoring we need at least one line of length>=2
  // that contains the pending tile, unless the only move is a 1-tile move
  // adjacent to nothing (impossible after first move).
  // For the first move with a single tile, we still allow it (rare opening).
  if (uniqueLines.length === 0 && !isFirstMove) {
    return { ok: false, reason: "Tile must extend an existing line." };
  }

  // Score: sum of line lengths; +6 bonus per completed (length 6) line
  let score = 0;
  for (const line of uniqueLines) {
    score += line.length;
    if (line.length === LINE_LIMIT) score += QWIRKLE_BONUS;
  }
  // If a pending tile is isolated (no lines >=2 around it), it counts for 1.
  // This only happens on the very first move with a single tile.
  if (uniqueLines.length === 0 && isFirstMove && pending.length === 1) {
    score = 1;
  }

  return { ok: true, score };
}

// ============================================================================
// CPU strategy — greedy highest-scoring placement
// ============================================================================

/** All anchor cells where a new tile could legally connect. */
function anchorCells(board: Record<string, BoardCell>): Array<{ r: number; c: number }> {
  if (!boardHasTiles(board)) return [{ r: 0, c: 0 }];
  const anchors: Array<{ r: number; c: number }> = [];
  const seen = new Set<string>();
  for (const k of Object.keys(board)) {
    const [r, c] = k.split(",").map(Number);
    const candidates = [
      [r! - 1, c!],
      [r! + 1, c!],
      [r!, c! - 1],
      [r!, c! + 1],
    ];
    for (const [nr, nc] of candidates) {
      const nk = keyOf(nr!, nc!);
      if (board[nk]) continue;
      if (seen.has(nk)) continue;
      seen.add(nk);
      anchors.push({ r: nr!, c: nc! });
    }
  }
  return anchors;
}

/** Greedy CPU: enumerate single-tile placements at every anchor for each hand
 *  tile, then try to extend along the best-scoring direction with additional
 *  matching tiles from hand. Picks the highest-scoring legal move. */
export function cpuChooseMove(
  state: QwirkleState,
  playerIdx: number,
): {
  pending: Array<{ r: number; c: number; tile: Tile; handIdx: number }>;
  score: number;
} | null {
  const player = state.players[playerIdx]!;
  const hand = player.hand;
  if (hand.length === 0) return null;
  const board = state.board;
  const isFirstMove = !boardHasTiles(board);
  const anchors = anchorCells(board);

  let best: {
    pending: Array<{ r: number; c: number; tile: Tile; handIdx: number }>;
    score: number;
  } | null = null;

  // First pass: single-tile placements
  const singleCandidates: Array<{
    anchor: { r: number; c: number };
    handIdx: number;
    score: number;
  }> = [];
  for (const anchor of anchors) {
    for (let h = 0; h < hand.length; h++) {
      const tile = hand[h]!;
      const pending = [{ r: anchor.r, c: anchor.c, tile, handIdx: h }];
      const validate = pending.map((p) => ({ r: p.r, c: p.c, tile: p.tile }));
      const res = validateAndScore(board, validate, isFirstMove);
      if (!res.ok) continue;
      singleCandidates.push({ anchor, handIdx: h, score: res.score });
      if (!best || res.score > best.score) {
        best = { pending, score: res.score };
      }
    }
  }

  // Second pass: try to extend the best single-tile placements with additional
  // tiles from hand along both directions. Bounded to keep things fast.
  // Sort top single-placements by score and explore up to 12 seeds.
  singleCandidates.sort((a, b) => b.score - a.score);
  const seeds = singleCandidates.slice(0, 12);

  for (const seed of seeds) {
    for (const dir of ["h", "v"] as const) {
      // Try a greedy extension: place additional tiles next to the seed,
      // walking outward in both directions of the line.
      const used = new Set<number>([seed.handIdx]);
      const pending: Array<{ r: number; c: number; tile: Tile; handIdx: number }> = [
        { r: seed.anchor.r, c: seed.anchor.c, tile: hand[seed.handIdx]!, handIdx: seed.handIdx },
      ];

      const tryStep = (dr: number, dc: number, startR: number, startC: number) => {
        let cr = startR + dr;
        let cc = startC + dc;
        // Skip over existing board tiles
        while (board[keyOf(cr, cc)]) {
          cr += dr;
          cc += dc;
        }
        // Now try to place additional tiles at this empty cell
        // and continue stepping
        let progress = true;
        while (progress) {
          progress = false;
          // Don't extend if there's already pending at this cell
          if (pending.some((p) => p.r === cr && p.c === cc)) break;
          for (let h = 0; h < hand.length; h++) {
            if (used.has(h)) continue;
            const tile = hand[h]!;
            const trial = [...pending, { r: cr, c: cc, tile, handIdx: h }];
            const v = trial.map((p) => ({ r: p.r, c: p.c, tile: p.tile }));
            const res = validateAndScore(board, v, isFirstMove);
            if (res.ok) {
              pending.push({ r: cr, c: cc, tile, handIdx: h });
              used.add(h);
              if (!best || res.score > best.score) {
                best = {
                  pending: [...pending],
                  score: res.score,
                };
              }
              cr += dr;
              cc += dc;
              while (board[keyOf(cr, cc)]) {
                cr += dr;
                cc += dc;
              }
              progress = true;
              break;
            }
          }
        }
      };

      const [dr, dc] = dir === "h" ? [0, 1] : [1, 0];
      // Forward
      tryStep(dr, dc, seed.anchor.r, seed.anchor.c);
      // Backward
      tryStep(-dr, -dc, seed.anchor.r, seed.anchor.c);
    }
  }

  return best;
}

// ============================================================================
// initialState, reducer, isTerminal
// ============================================================================

const NUM_PLAYERS = 3;

export function initialState(seed: number, _settings: QwirkleSettings): QwirkleState {
  void _settings;
  const rng = mulberry32(seed);
  let bag = buildBag(rng);
  const players: Player[] = [];
  const names = ["You", "CPU 1", "CPU 2"];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    const draw = drawTiles(bag, HAND_SIZE);
    bag = draw.bag;
    players.push({
      id: i === 0 ? "human" : `cpu-${i}`,
      name: names[i]!,
      isCpu: i !== 0,
      hand: draw.drawn,
      score: 0,
      outOfTiles: false,
    });
  }
  return {
    board: {},
    bag,
    players,
    currentPlayer: 0,
    pending: [],
    selectedHandIdx: null,
    phase: "playing",
    lastMessage: "Place tiles that share color OR shape in a line.",
    bounds: { rMin: 0, rMax: 0, cMin: 0, cMax: 0 },
  };
}

function expandBounds(
  bounds: QwirkleState["bounds"],
  placements: Array<{ r: number; c: number }>,
): QwirkleState["bounds"] {
  let { rMin, rMax, cMin, cMax } = bounds;
  for (const p of placements) {
    if (p.r < rMin) rMin = p.r;
    if (p.r > rMax) rMax = p.r;
    if (p.c < cMin) cMin = p.c;
    if (p.c > cMax) cMax = p.c;
  }
  return { rMin, rMax, cMin, cMax };
}

/** Game ends when the bag is empty AND at least one player has emptied their
 *  hand. The player who emptied their hand gets +6 final bonus. */
function checkEndGame(state: QwirkleState): QwirkleState {
  if (state.bag.length !== 0) return state;
  const anyOut = state.players.some((p) => p.hand.length === 0);
  if (!anyOut) return state;
  return { ...state, phase: "done" };
}

export function reducer(state: QwirkleState, action: QwirkleAction): QwirkleState {
  if (state.phase === "done") return state;

  const current = state.players[state.currentPlayer]!;

  switch (action.type) {
    case "selectHand": {
      if (current.isCpu) return state;
      if (action.idx < 0 || action.idx >= current.hand.length) return state;
      // Disallow selecting a tile already pending
      if (state.pending.some((p) => p.handIdx === action.idx)) return state;
      return { ...state, selectedHandIdx: action.idx };
    }

    case "placeTile": {
      if (current.isCpu) return state;
      if (state.selectedHandIdx === null) return state;
      const { r, c } = action;
      if (state.board[keyOf(r, c)]) return state;
      if (state.pending.some((p) => p.r === r && p.c === c)) return state;
      const idx = state.selectedHandIdx;
      const tile = current.hand[idx];
      if (!tile) return state;
      // Optimistic validity: if pending so far is on a row/col, enforce that
      // the new tile is on the same row OR col.
      if (state.pending.length >= 1) {
        const rows = new Set([...state.pending.map((p) => p.r), r]);
        const cols = new Set([...state.pending.map((p) => p.c), c]);
        if (rows.size > 1 && cols.size > 1) {
          return { ...state, lastMessage: "Tiles must share a row or column." };
        }
      }
      const newPending = [...state.pending, { r, c, tile, handIdx: idx }];
      // Advance selection to next non-pending hand tile
      let nextSel: number | null = null;
      for (let i = 0; i < current.hand.length; i++) {
        if (newPending.some((p) => p.handIdx === i)) continue;
        nextSel = i;
        break;
      }
      return {
        ...state,
        pending: newPending,
        selectedHandIdx: nextSel,
        lastMessage: "",
      };
    }

    case "recallTile": {
      if (current.isCpu) return state;
      const { r, c } = action;
      const idx = state.pending.findIndex((p) => p.r === r && p.c === c);
      if (idx < 0) return state;
      const newPending = state.pending.filter((_, i) => i !== idx);
      return { ...state, pending: newPending };
    }

    case "recallAll": {
      if (current.isCpu) return state;
      if (state.pending.length === 0) return state;
      return { ...state, pending: [], selectedHandIdx: null, lastMessage: "" };
    }

    case "submit": {
      if (current.isCpu) return state;
      if (state.pending.length === 0) return state;
      const isFirstMove = !boardHasTiles(state.board);
      const pendingForValidate = state.pending.map((p) => ({
        r: p.r,
        c: p.c,
        tile: p.tile,
      }));
      const result = validateAndScore(state.board, pendingForValidate, isFirstMove);
      if (!result.ok) {
        return { ...state, lastMessage: result.reason };
      }
      // Commit board
      const newBoard = { ...state.board };
      for (const p of state.pending) {
        newBoard[keyOf(p.r, p.c)] = { tile: p.tile };
      }
      // Remove used tiles from hand and refill from bag
      const usedIdxs = new Set(state.pending.map((p) => p.handIdx));
      const remainingHand = current.hand.filter((_, i) => !usedIdxs.has(i));
      const refill = drawTiles(state.bag, HAND_SIZE - remainingHand.length);
      const newHand = [...remainingHand, ...refill.drawn];

      let bonusMsg = "";
      let finalBonus = 0;
      const handEmpty = newHand.length === 0;
      const bagEmpty = refill.bag.length === 0;
      const gameEnding = handEmpty && bagEmpty;
      if (gameEnding) {
        finalBonus = FINAL_BONUS;
        bonusMsg = ` +${FINAL_BONUS} final bonus!`;
      }

      const newPlayers = state.players.map((p, i) =>
        i === state.currentPlayer
          ? {
              ...p,
              hand: newHand,
              score: p.score + result.score + finalBonus,
              outOfTiles: handEmpty,
            }
          : p,
      );

      const nextPlayer = (state.currentPlayer + 1) % state.players.length;
      const newBounds = expandBounds(state.bounds, state.pending);

      let next: QwirkleState = {
        ...state,
        board: newBoard,
        bag: refill.bag,
        players: newPlayers,
        pending: [],
        selectedHandIdx: null,
        currentPlayer: nextPlayer,
        bounds: newBounds,
        lastMessage: `${current.name} scored ${result.score}${bonusMsg}`,
      };
      next = checkEndGame(next);
      return next;
    }

    case "swap": {
      if (current.isCpu) return state;
      if (action.idxs.length === 0) return state;
      if (state.bag.length < action.idxs.length) {
        return { ...state, lastMessage: "Not enough tiles in the bag to swap." };
      }
      const idxSet = new Set(action.idxs);
      const toReturn = current.hand.filter((_, i) => idxSet.has(i));
      const keep = current.hand.filter((_, i) => !idxSet.has(i));
      const drawn = drawTiles(state.bag, action.idxs.length);
      // Put returned tiles back at the bottom of the bag (we pop from end, so
      // prepend to keep them out of immediate reach).
      const newBag = [...toReturn, ...drawn.bag];
      const newPlayers = state.players.map((p, i) =>
        i === state.currentPlayer ? { ...p, hand: [...keep, ...drawn.drawn] } : p,
      );
      const nextPlayer = (state.currentPlayer + 1) % state.players.length;
      return {
        ...state,
        bag: newBag,
        players: newPlayers,
        pending: [],
        selectedHandIdx: null,
        currentPlayer: nextPlayer,
        lastMessage: `${current.name} swapped ${action.idxs.length} tile(s).`,
      };
    }

    case "cpuTurn": {
      if (!current.isCpu) return state;
      const move = cpuChooseMove(state, state.currentPlayer);
      if (!move) {
        // No legal placement: swap entire hand if possible, else pass.
        if (state.bag.length > 0) {
          const idxs = current.hand.map((_, i) => i);
          const idxSet = new Set(idxs);
          const toReturn = current.hand.filter((_, i) => idxSet.has(i));
          const keep = current.hand.filter((_, i) => !idxSet.has(i));
          const drawn = drawTiles(state.bag, Math.min(idxs.length, state.bag.length));
          const newBag = [...toReturn, ...drawn.bag];
          const newPlayers = state.players.map((p, i) =>
            i === state.currentPlayer ? { ...p, hand: [...keep, ...drawn.drawn] } : p,
          );
          const nextPlayer = (state.currentPlayer + 1) % state.players.length;
          return {
            ...state,
            bag: newBag,
            players: newPlayers,
            currentPlayer: nextPlayer,
            lastMessage: `${current.name} swapped tiles.`,
          };
        }
        // Just pass
        const nextPlayer = (state.currentPlayer + 1) % state.players.length;
        return {
          ...state,
          currentPlayer: nextPlayer,
          lastMessage: `${current.name} passed.`,
        };
      }
      // Apply the move
      const newBoard = { ...state.board };
      for (const p of move.pending) {
        newBoard[keyOf(p.r, p.c)] = { tile: p.tile };
      }
      const usedIdxs = new Set(move.pending.map((p) => p.handIdx));
      const remainingHand = current.hand.filter((_, i) => !usedIdxs.has(i));
      const refill = drawTiles(state.bag, HAND_SIZE - remainingHand.length);
      const newHand = [...remainingHand, ...refill.drawn];
      let finalBonus = 0;
      let bonusMsg = "";
      const handEmpty = newHand.length === 0;
      const bagEmpty = refill.bag.length === 0;
      if (handEmpty && bagEmpty) {
        finalBonus = FINAL_BONUS;
        bonusMsg = ` +${FINAL_BONUS} final bonus!`;
      }
      const newPlayers = state.players.map((p, i) =>
        i === state.currentPlayer
          ? {
              ...p,
              hand: newHand,
              score: p.score + move.score + finalBonus,
              outOfTiles: handEmpty,
            }
          : p,
      );
      const nextPlayer = (state.currentPlayer + 1) % state.players.length;
      const newBounds = expandBounds(state.bounds, move.pending);
      let next: QwirkleState = {
        ...state,
        board: newBoard,
        bag: refill.bag,
        players: newPlayers,
        currentPlayer: nextPlayer,
        bounds: newBounds,
        lastMessage: `${current.name} scored ${move.score}${bonusMsg}`,
      };
      next = checkEndGame(next);
      return next;
    }
  }
  return state;
}

/** Game over when phase === "done". Score = human's tile points + win bonus.
 *  Returns 0 on loss/tie. */
export function isTerminal(state: QwirkleState): { score: number } | null {
  if (state.phase !== "done") return null;
  const human = state.players[0]!;
  const max = Math.max(...state.players.map((p) => p.score));
  const isWin = human.score === max && state.players.filter((p) => p.score === max).length === 1;
  if (!isWin) return { score: 0 };
  // Win bonus: 25 + spread over CPUs
  const winBonus = 25 + (human.score - Math.max(...state.players.slice(1).map((p) => p.score)));
  return { score: human.score + winBonus };
}
