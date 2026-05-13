import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Azul (Full) — canonical 3-seat edition: 1 human + 2 CPU opponents.
 *
 * Components per round:
 *   - 5 factory displays (with 3 players, official Azul uses 5 factories).
 *   - 1 center area (initially holds the "first player" marker which acts as
 *     a -1 floor penalty for whoever takes from an empty center first).
 *   - 100 tiles total — 5 colors × 20 tiles each — drawn from a bag; the
 *     discard pile is reshuffled into the bag when the bag empties.
 *
 * Each round (in order):
 *   1. Factory offer: deal 4 tiles to each factory from the bag.
 *   2. Drafting (turns rotate): on your turn pick all tiles of one color
 *      from either a factory (remaining factory tiles slide to the center)
 *      OR from the center (the first such pick of the round also takes the
 *      "first player" marker into your floor row and sets next-round start).
 *      Place the drafted tiles onto exactly one of your 5 pattern rows
 *      (rows of size 1, 2, 3, 4, 5). The row must be empty or already
 *      contain tiles of that same color, AND the wall cell for that color
 *      in that row must not yet be filled. Excess tiles spill onto the
 *      floor line (broken tiles, capacity 7, surplus discarded).
 *   3. Round ends when factories and center are empty. Wall-tiling phase:
 *      every fully-filled pattern row places exactly one tile on the wall
 *      in that row's designated column for the color, scoring 1 +
 *      orthogonally-connected neighbor count (rules: if the placed tile has
 *      any horizontal neighbors, score the full contiguous horizontal run
 *      including itself; same for vertical; if both, sum both; if neither
 *      score 1). Unused tiles from the same row return to the discard
 *      pile. Then floor penalties are applied (-1, -1, -2, -2, -2, -3, -3)
 *      and the floor is cleared.
 *   4. Game-end check: if any player has at least one complete horizontal
 *      wall row, the game ends after the current wall-tiling phase.
 *      Otherwise advance to the next round; first player to act is the one
 *      who took the first-player marker.
 *
 * End bonuses: +2 per complete row, +7 per complete column, +10 per color
 * (set of 5) entirely on the wall. Scores cannot drop below 0.
 *
 * Wall pattern (canonical Azul):
 *   row 0: B Y R K W
 *   row 1: W B Y R K
 *   row 2: K W B Y R
 *   row 3: R K W B Y
 *   row 4: Y R K W B
 *
 *   where B=Blue, Y=Yellow, R=Red, K=Black, W=White (cyan).
 *
 * CPU strategy: greedy "max immediate placement score − floor penalty".
 * For every legal (source, color, targetRow) combination the CPU estimates
 * the placement score now (using the wall-projection bonus if it would
 * complete the row this round) minus the floor-penalty cost, with light
 * preference for higher-value future rows.
 */

export const NUM_COLORS = 5;
export const TILES_PER_COLOR = 20;
export const TOTAL_TILES = NUM_COLORS * TILES_PER_COLOR; // 100
export const NUM_PLAYERS = 3;
export const NUM_FACTORIES = 5;
export const TILES_PER_FACTORY = 4;
export const WALL_SIZE = 5;
export const FLOOR_CAPACITY = 7;
export const FLOOR_PENALTIES: readonly number[] = [-1, -1, -2, -2, -2, -3, -3];

/** Color id: 0=Blue, 1=Yellow, 2=Red, 3=Black, 4=White. */
export type Color = 0 | 1 | 2 | 3 | 4;
export const COLOR_NAMES = ["Blue", "Yellow", "Red", "Black", "White"] as const;

/** Canonical 5×5 wall pattern: wall[row][col] -> color id. */
export const WALL_PATTERN: readonly (readonly Color[])[] = [
  [0, 1, 2, 3, 4],
  [4, 0, 1, 2, 3],
  [3, 4, 0, 1, 2],
  [2, 3, 4, 0, 1],
  [1, 2, 3, 4, 0],
] as const;

/** Pre-computed column index of `color` on row `row`. */
export function wallCol(row: number, color: Color): number {
  for (let c = 0; c < WALL_SIZE; c++) {
    if (WALL_PATTERN[row]?.[c] === color) return c;
  }
  return -1;
}

export interface PlayerBoard {
  /** Pattern rows: rows[r] has capacity r+1. Entries are color ids; -1 for empty slots. */
  rows: (Color | -1)[][];
  /** Wall: 5×5 boolean grid — wall[row][col] true if filled. */
  wall: boolean[][];
  /** Floor line tiles (color ids) plus optional first-player marker token (-2). */
  floor: number[];
  score: number;
}

export type Phase = "drafting" | "tiling" | "done";

export interface AzulFullSettings {
  cpuLevel: "easy" | "normal";
}

export interface AzulFullState {
  settings: AzulFullSettings;
  rngSeed: number;
  /** Bag and discard tile counts (by color id). */
  bag: number[];           // length 5, count per color
  discard: number[];       // length 5
  /** Factory displays: each is a length-5 vector of counts per color. */
  factories: number[][];
  /** Center: length-5 vector of counts per color. */
  center: number[];
  /** Does the center still hold the first-player marker? */
  firstPlayerMarkerInCenter: boolean;
  players: PlayerBoard[];
  active: number;          // 0=human, 1..=CPU
  /** Player who'll start next round (set by first center pick of the round). */
  nextRoundStarter: number;
  round: number;
  phase: Phase;
  lastEvent: string;
}

export type Source =
  | { kind: "factory"; index: number }
  | { kind: "center" };

export type AzulFullAction =
  | { type: "pick"; player: number; source: Source; color: Color; targetRow: number }
  | { type: "cpuStep" }
  | { type: "advanceTiling" };

/** -2 is the first-player marker sentinel on the floor line. */
const FIRST_PLAYER_MARKER = -2;

function nextSeed(s: number): number {
  return ((s * 1664525) + 1013904223) >>> 0;
}

function emptyVec(): number[] {
  return [0, 0, 0, 0, 0];
}

function emptyBoard(): PlayerBoard {
  const rows: (Color | -1)[][] = [];
  for (let r = 0; r < WALL_SIZE; r++) {
    rows.push(Array<Color | -1>(r + 1).fill(-1));
  }
  const wall: boolean[][] = [];
  for (let r = 0; r < WALL_SIZE; r++) {
    wall.push(Array<boolean>(WALL_SIZE).fill(false));
  }
  return { rows, wall, floor: [], score: 0 };
}

/** Draw one tile (color id) from the bag, reshuffling discard if needed.
 *  Returns -1 if no tile is available anywhere. */
function drawOne(bag: number[], discard: number[], rng: () => number): number {
  let total = 0;
  for (const n of bag) total += n;
  if (total === 0) {
    // Reshuffle discard into bag.
    let dtot = 0;
    for (let i = 0; i < NUM_COLORS; i++) {
      bag[i] = (bag[i] ?? 0) + (discard[i] ?? 0);
      dtot += discard[i] ?? 0;
      discard[i] = 0;
    }
    total = dtot;
    if (total === 0) return -1;
  }
  let pick = Math.floor(rng() * total);
  for (let c = 0; c < NUM_COLORS; c++) {
    const n = bag[c] ?? 0;
    if (pick < n) {
      bag[c] = n - 1;
      return c;
    }
    pick -= n;
  }
  return -1;
}

function refillFactories(state: AzulFullState): AzulFullState {
  const bag = state.bag.slice();
  const discard = state.discard.slice();
  const rng = mulberry32(state.rngSeed);
  let seed = state.rngSeed;
  const factories: number[][] = [];
  for (let f = 0; f < NUM_FACTORIES; f++) {
    const fac = emptyVec();
    for (let i = 0; i < TILES_PER_FACTORY; i++) {
      const c = drawOne(bag, discard, rng);
      if (c < 0) break;
      fac[c] = (fac[c] ?? 0) + 1;
    }
    factories.push(fac);
    seed = nextSeed(seed);
  }
  return {
    ...state,
    bag,
    discard,
    factories,
    center: emptyVec(),
    firstPlayerMarkerInCenter: true,
    rngSeed: seed,
  };
}

export function initialState(seed: number, settings: AzulFullSettings): AzulFullState {
  const players: PlayerBoard[] = [];
  for (let p = 0; p < NUM_PLAYERS; p++) players.push(emptyBoard());
  const bag = [TILES_PER_COLOR, TILES_PER_COLOR, TILES_PER_COLOR, TILES_PER_COLOR, TILES_PER_COLOR];
  const base: AzulFullState = {
    settings,
    rngSeed: seed >>> 0,
    bag,
    discard: emptyVec(),
    factories: [],
    center: emptyVec(),
    firstPlayerMarkerInCenter: true,
    players,
    active: 0,
    nextRoundStarter: 0,
    round: 1,
    phase: "drafting",
    lastEvent: "",
  };
  return refillFactories(base);
}

function isFactoriesAndCenterEmpty(state: AzulFullState): boolean {
  for (const f of state.factories) {
    for (const n of f) if (n > 0) return false;
  }
  for (const n of state.center) if (n > 0) return false;
  return true;
}

function rowAccepts(board: PlayerBoard, row: number, color: Color): boolean {
  if (row < 0 || row >= WALL_SIZE) return false;
  const r = board.rows[row];
  if (!r) return false;
  // Wall cell for this color on this row must not already be filled.
  const col = wallCol(row, color);
  if (col < 0) return false;
  if (board.wall[row]?.[col]) return false;
  // Row must be empty or filled with the same color (and not yet full).
  let firstEmpty = -1;
  for (let i = 0; i < r.length; i++) {
    const v = r[i];
    if (v === -1) {
      if (firstEmpty < 0) firstEmpty = i;
    } else if (v !== color) {
      return false;
    }
  }
  return firstEmpty >= 0;
}

/** Validate a "floor only" (row index -1) target as well. */
function isLegalTarget(board: PlayerBoard, targetRow: number, color: Color): boolean {
  if (targetRow === -1) return true; // dump straight into floor — always legal.
  return rowAccepts(board, targetRow, color);
}

function countSource(state: AzulFullState, src: Source, color: Color): number {
  if (src.kind === "factory") {
    const f = state.factories[src.index];
    return f ? (f[color] ?? 0) : 0;
  }
  return state.center[color] ?? 0;
}

function placeOnBoard(
  board: PlayerBoard,
  targetRow: number,
  color: Color,
  count: number,
  tookFirstPlayerMarker: boolean,
): PlayerBoard {
  let newRows = board.rows;
  let newFloor = board.floor.slice();
  let overflow = count;

  if (targetRow >= 0 && targetRow < WALL_SIZE) {
    const r = board.rows[targetRow];
    if (r) {
      const newRow = r.slice();
      let placed = 0;
      for (let i = 0; i < newRow.length && overflow > 0; i++) {
        if (newRow[i] === -1) {
          newRow[i] = color;
          placed++;
          overflow--;
        }
      }
      void placed;
      newRows = board.rows.map((row, i) => (i === targetRow ? newRow : row));
    }
  }

  for (let i = 0; i < overflow; i++) newFloor.push(color);
  if (tookFirstPlayerMarker) newFloor.unshift(FIRST_PLAYER_MARKER);

  return { ...board, rows: newRows, floor: newFloor };
}

function applyPickInternal(
  state: AzulFullState,
  playerIdx: number,
  source: Source,
  color: Color,
  targetRow: number,
): AzulFullState | null {
  if (state.phase !== "drafting") return null;
  if (playerIdx !== state.active) return null;
  const board = state.players[playerIdx];
  if (!board) return null;
  if (!isLegalTarget(board, targetRow, color)) return null;
  const count = countSource(state, source, color);
  if (count <= 0) return null;

  const factories = state.factories.map((f) => f.slice());
  const center = state.center.slice();
  let firstMarker = state.firstPlayerMarkerInCenter;
  let tookMarker = false;
  let nextStarter = state.nextRoundStarter;

  if (source.kind === "factory") {
    const fac = factories[source.index];
    if (!fac) return null;
    fac[color] = 0;
    // Remaining factory tiles go to center.
    for (let c = 0; c < NUM_COLORS; c++) {
      const n = fac[c] ?? 0;
      if (n > 0) {
        center[c] = (center[c] ?? 0) + n;
        fac[c] = 0;
      }
    }
  } else {
    // Center pick: take all of the color from center; if marker still here, take it.
    center[color] = 0;
    if (firstMarker) {
      firstMarker = false;
      tookMarker = true;
      nextStarter = playerIdx;
    }
  }

  const newBoard = placeOnBoard(board, targetRow, color, count, tookMarker);
  const players = state.players.map((p, i) => (i === playerIdx ? newBoard : p));

  let next: AzulFullState = {
    ...state,
    factories,
    center,
    firstPlayerMarkerInCenter: firstMarker,
    players,
    nextRoundStarter: nextStarter,
    lastEvent: describePick(playerIdx, source, color, count, targetRow),
  };

  if (isFactoriesAndCenterEmpty(next)) {
    // Switch to tiling phase; the UI/engine can call advanceTiling to run it.
    next = { ...next, phase: "tiling", active: 0 };
  } else {
    next = { ...next, active: (next.active + 1) % NUM_PLAYERS };
  }
  return next;
}

function describePick(
  player: number,
  source: Source,
  color: Color,
  count: number,
  targetRow: number,
): string {
  const who = player === 0 ? "You" : `CPU ${player}`;
  const where = source.kind === "factory" ? `factory ${source.index + 1}` : "center";
  const tgt = targetRow === -1 ? "floor" : `row ${targetRow + 1}`;
  return `${who} took ${count}×${COLOR_NAMES[color]} from ${where} → ${tgt}`;
}

/** Score one tile that was just placed at (row,col) on the wall. */
function scorePlacement(wall: readonly boolean[][], row: number, col: number): number {
  // Horizontal run including (row,col).
  let h = 1;
  for (let c = col - 1; c >= 0; c--) {
    if (wall[row]?.[c]) h++;
    else break;
  }
  for (let c = col + 1; c < WALL_SIZE; c++) {
    if (wall[row]?.[c]) h++;
    else break;
  }
  // Vertical run.
  let v = 1;
  for (let r = row - 1; r >= 0; r--) {
    if (wall[r]?.[col]) v++;
    else break;
  }
  for (let r = row + 1; r < WALL_SIZE; r++) {
    if (wall[r]?.[col]) v++;
    else break;
  }
  if (h > 1 && v > 1) return h + v;
  if (h > 1) return h;
  if (v > 1) return v;
  return 1;
}

function applyFloorPenalty(board: PlayerBoard): PlayerBoard {
  let penalty = 0;
  for (let i = 0; i < board.floor.length && i < FLOOR_PENALTIES.length; i++) {
    penalty += FLOOR_PENALTIES[i] ?? 0;
  }
  const newScore = Math.max(0, board.score + penalty);
  return { ...board, floor: [], score: newScore };
}

/** Wall-tile phase: for each board, transfer completed pattern rows to wall,
 *  score them, then dump unused row tiles + leftover floor tiles to discard. */
function runTiling(state: AzulFullState): AzulFullState {
  const discard = state.discard.slice();
  const players = state.players.map((b) => {
    let wall = b.wall.map((r) => r.slice());
    let score = b.score;
    const newRows: (Color | -1)[][] = [];
    for (let r = 0; r < WALL_SIZE; r++) {
      const row = b.rows[r];
      if (!row) {
        newRows.push([]);
        continue;
      }
      const isFull = row.length > 0 && row.every((v) => v !== -1);
      if (isFull) {
        const color = row[row.length - 1];
        if (color === undefined || (color as number) === -1) {
          newRows.push(row.slice());
          continue;
        }
        const col = wallCol(r, color as Color);
        const wr = wall[r];
        if (col >= 0 && wr && !wr[col]) {
          wr[col] = true;
          score += scorePlacement(wall, r, col);
        }
        // r tiles were used to fill the row, but only one goes to wall.
        // The remaining (row.length - 1) tiles go to discard.
        discard[color] = (discard[color] ?? 0) + Math.max(0, row.length - 1);
        newRows.push(Array<Color | -1>(row.length).fill(-1));
      } else {
        // Incomplete row remains as-is.
        newRows.push(row.slice());
      }
    }
    // Floor: discard real-tile floor entries, drop first-player marker.
    for (const t of b.floor) {
      if (t >= 0 && t < NUM_COLORS) {
        discard[t] = (discard[t] ?? 0) + 1;
      }
    }
    const board2: PlayerBoard = { rows: newRows, wall, floor: b.floor, score };
    return applyFloorPenalty(board2);
  });

  return { ...state, players, discard, phase: "drafting" };
}

function hasCompleteRow(board: PlayerBoard): boolean {
  for (let r = 0; r < WALL_SIZE; r++) {
    const wr = board.wall[r];
    if (wr && wr.every((v) => v)) return true;
  }
  return false;
}

function applyEndBonuses(board: PlayerBoard): PlayerBoard {
  let bonus = 0;
  for (let r = 0; r < WALL_SIZE; r++) {
    const wr = board.wall[r];
    if (wr && wr.every((v) => v)) bonus += 2;
  }
  for (let c = 0; c < WALL_SIZE; c++) {
    let full = true;
    for (let r = 0; r < WALL_SIZE; r++) {
      if (!board.wall[r]?.[c]) { full = false; break; }
    }
    if (full) bonus += 7;
  }
  // Color sets: each color has exactly one cell per row, so 5 tiles per color.
  for (let color = 0; color < NUM_COLORS; color++) {
    let n = 0;
    for (let r = 0; r < WALL_SIZE; r++) {
      const col = wallCol(r, color as Color);
      if (col >= 0 && board.wall[r]?.[col]) n++;
    }
    if (n === WALL_SIZE) bonus += 10;
  }
  return { ...board, score: board.score + bonus };
}

/** Advance from tiling phase: score wall-tiling, then either end the game
 *  (with end bonuses) or refill factories for the next round. */
function advanceFromTiling(state: AzulFullState): AzulFullState {
  if (state.phase !== "tiling") return state;
  let next = runTiling(state);

  const someoneFinished = next.players.some(hasCompleteRow);
  if (someoneFinished) {
    const players = next.players.map(applyEndBonuses);
    return { ...next, players, phase: "done", lastEvent: "Game over — final bonuses applied." };
  }

  // Setup next round.
  const refilled = refillFactories({ ...next, round: next.round + 1 });
  return {
    ...refilled,
    active: refilled.nextRoundStarter,
    lastEvent: `Round ${refilled.round} begins.`,
  };
}

/* ─── CPU player ─────────────────────────────────────────────────────────── */

/** Estimate the score gained by placing `count` tiles of `color` on
 *  pattern row `targetRow` for `board`. Considers wall placement if row
 *  becomes full this turn. */
function estimatePlacement(
  board: PlayerBoard,
  color: Color,
  targetRow: number,
  count: number,
): { placeGain: number; overflow: number } {
  if (targetRow === -1) return { placeGain: 0, overflow: count };
  const r = board.rows[targetRow];
  if (!r) return { placeGain: 0, overflow: count };
  // Verify legality of placement (else "overflow" floods to floor).
  if (!rowAccepts(board, targetRow, color)) {
    return { placeGain: 0, overflow: count };
  }
  let free = 0;
  for (const v of r) if (v === -1) free++;
  const placed = Math.min(free, count);
  const overflow = count - placed;
  let placeGain = 0;
  const willComplete = placed === free && r.length === free + r.filter((v) => v === color).length;
  // Row will be complete (i.e., currently we filled the last empties).
  const actuallyFull = (placed === free);
  if (actuallyFull) {
    void willComplete;
    const col = wallCol(targetRow, color);
    if (col >= 0) {
      // Simulate placing on the wall.
      const wallCopy = board.wall.map((wr) => wr.slice());
      const wrow = wallCopy[targetRow];
      if (wrow) wrow[col] = true;
      placeGain = scorePlacement(wallCopy, targetRow, col);
    } else {
      placeGain = 1;
    }
  }
  return { placeGain, overflow };
}

function estimateFloorPenalty(board: PlayerBoard, overflow: number): number {
  let cost = 0;
  for (let i = 0; i < overflow; i++) {
    const idx = board.floor.length + i;
    if (idx < FLOOR_PENALTIES.length) cost += FLOOR_PENALTIES[idx] ?? 0;
  }
  return cost; // already negative.
}

interface CpuMove {
  source: Source;
  color: Color;
  targetRow: number;
  ev: number;
}

function enumerateLegalMoves(state: AzulFullState, playerIdx: number): CpuMove[] {
  const board = state.players[playerIdx];
  if (!board) return [];
  const moves: CpuMove[] = [];

  const sources: Source[] = [];
  for (let i = 0; i < state.factories.length; i++) {
    const f = state.factories[i];
    if (!f) continue;
    let total = 0;
    for (const n of f) total += n;
    if (total > 0) sources.push({ kind: "factory", index: i });
  }
  let centerTotal = 0;
  for (const n of state.center) centerTotal += n;
  if (centerTotal > 0) sources.push({ kind: "center" });

  for (const src of sources) {
    for (let color = 0 as Color; color < NUM_COLORS; color = (color + 1) as Color) {
      const count = countSource(state, src, color);
      if (count <= 0) continue;
      // For each pattern row, plus the floor-dump option.
      for (let row = -1; row < WALL_SIZE; row++) {
        if (row >= 0 && !rowAccepts(board, row, color)) continue;
        const { placeGain, overflow } = estimatePlacement(board, color, row, count);
        let floorPen = estimateFloorPenalty(board, overflow);
        // Center pick incurs first-player marker if it's still there.
        if (src.kind === "center" && state.firstPlayerMarkerInCenter) {
          const idx = board.floor.length; // marker goes to position 0 in floor (-1) — approximate.
          if (idx < FLOOR_PENALTIES.length) floorPen += FLOOR_PENALTIES[idx] ?? 0;
        }
        // Soft preference: bigger pattern rows are more valuable future-equity.
        const futureBias = row >= 0 ? (row + 1) * 0.15 : 0;
        const ev = placeGain + floorPen + futureBias;
        moves.push({ source: src, color, targetRow: row, ev });
      }
    }
  }
  // Sort high to low.
  moves.sort((a, b) => b.ev - a.ev);
  return moves;
}

function cpuChoose(state: AzulFullState): AzulFullState {
  const playerIdx = state.active;
  if (playerIdx === 0) return state;
  const moves = enumerateLegalMoves(state, playerIdx);
  if (moves.length === 0) return state;
  let mv = moves[0];
  if (!mv) return state;
  // Easy difficulty: occasionally pick a worse move so it's not super sharp.
  if (state.settings.cpuLevel === "easy" && moves.length > 1) {
    const rng = mulberry32(state.rngSeed ^ ((playerIdx + 1) * 2654435761));
    if (rng() < 0.4) {
      mv = moves[Math.min(moves.length - 1, 1 + Math.floor(rng() * Math.min(2, moves.length - 1)))] ?? mv;
    }
  }
  const after = applyPickInternal(state, playerIdx, mv.source, mv.color, mv.targetRow);
  return after ?? state;
}

/* ─── Reducer ────────────────────────────────────────────────────────────── */

export function reducer(state: AzulFullState, action: AzulFullAction): AzulFullState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "pick": {
      const { player, source, color, targetRow } = action;
      const after = applyPickInternal(state, player, source, color, targetRow);
      return after ?? state;
    }
    case "cpuStep": {
      if (state.phase === "drafting") {
        if (state.active === 0) return state;
        return cpuChoose(state);
      }
      if (state.phase === "tiling") {
        return advanceFromTiling(state);
      }
      return state;
    }
    case "advanceTiling": {
      if (state.phase !== "tiling") return state;
      return advanceFromTiling(state);
    }
    default:
      return state;
  }
}

export function isTerminal(state: AzulFullState): { score: number } | null {
  if (state.phase !== "done") return null;
  const me = state.players[0];
  if (!me) return { score: 0 };
  return { score: Math.max(0, me.score) };
}

/* ─── Convenience exports for tests / UI ─────────────────────────────────── */

export function legalRowsFor(board: PlayerBoard, color: Color): number[] {
  const out: number[] = [];
  for (let r = 0; r < WALL_SIZE; r++) {
    if (rowAccepts(board, r, color)) out.push(r);
  }
  return out;
}

export function totalTilesRemaining(state: AzulFullState): number {
  let n = 0;
  for (const f of state.factories) for (const c of f) n += c;
  for (const c of state.center) n += c;
  return n;
}

export {
  rowAccepts,
  countSource,
  applyEndBonuses,
  runTiling,
  advanceFromTiling,
  scorePlacement,
  hasCompleteRow,
  estimatePlacement,
};
