import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Shared tile-placement engine.
 *
 * A bag of typed tiles is generated. Each turn the player draws the next tile
 * from the queue and places it on a small grid. Score by adjacency: every
 * orthogonal neighbor of the same type adds points.
 */

export interface TileConfig {
  gridSize: number;        // grid is gridSize x gridSize
  totalTiles: number;      // tiles to place (must be <= gridSize*gridSize)
  numTypes: number;        // distinct tile types
  /** Adjacency points per matching neighbor (default 2) */
  adjacencyPts?: number;
  /** Bonus points awarded when a same-type cluster reaches a size threshold */
  clusterBonus?: { size: number; pts: number }[];
  /** Pre-placed tiles (for variants like rivers, tower bases) */
  prePlaced?: { index: number; type: number }[];
  /** Additional bonus for filling the entire grid */
  completionBonus?: number;
}

export const DEFAULT_TILE_CONFIG: TileConfig = {
  gridSize: 6,
  totalTiles: 18,
  numTypes: 5,
  adjacencyPts: 2,
};

export interface TileState {
  rngSeed: number;
  cells: number[];         // -1 empty; 0..numTypes-1 tile type
  queue: number[];         // upcoming tile types
  placed: number;          // count of placed tiles (player-placed, excludes prePlaced)
  score: number;
  phase: "playing" | "done";
  config: TileConfig;
}

export type TileAction = { type: "place"; index: number };

export function genQueue(rng: () => number, cfg: TileConfig): number[] {
  const q: number[] = [];
  for (let i = 0; i < cfg.totalTiles; i++) q.push(Math.floor(rng() * cfg.numTypes));
  return q;
}

export function neighborsOf(idx: number, gridSize: number): number[] {
  const r = Math.floor(idx / gridSize);
  const c = idx % gridSize;
  const n: number[] = [];
  if (r > 0) n.push(idx - gridSize);
  if (r < gridSize - 1) n.push(idx + gridSize);
  if (c > 0) n.push(idx - 1);
  if (c < gridSize - 1) n.push(idx + 1);
  return n;
}

export function adjacencyScore(cells: number[], cfg: TileConfig): number {
  let score = 0;
  const adj = cfg.adjacencyPts ?? 2;
  for (let i = 0; i < cells.length; i++) {
    const v = cells[i];
    if (v === undefined || v < 0) continue;
    for (const n of neighborsOf(i, cfg.gridSize)) {
      if (n > i && cells[n] === v) score += adj;
    }
  }
  return score;
}

export function clusterBonusScore(cells: number[], cfg: TileConfig): number {
  if (!cfg.clusterBonus || cfg.clusterBonus.length === 0) return 0;
  const visited = new Array(cells.length).fill(false);
  const clusters: { type: number; size: number }[] = [];
  for (let i = 0; i < cells.length; i++) {
    if (visited[i] || cells[i] === undefined || (cells[i] ?? -1) < 0) continue;
    const t = cells[i]!;
    const stack = [i];
    let size = 0;
    while (stack.length) {
      const idx = stack.pop()!;
      if (visited[idx] || cells[idx] !== t) continue;
      visited[idx] = true;
      size++;
      for (const n of neighborsOf(idx, cfg.gridSize)) if (!visited[n] && cells[n] === t) stack.push(n);
    }
    clusters.push({ type: t, size });
  }
  let bonus = 0;
  for (const cl of clusters) {
    for (const b of cfg.clusterBonus) if (cl.size >= b.size) bonus += b.pts;
  }
  return bonus;
}

export function totalScore(cells: number[], cfg: TileConfig): number {
  let s = adjacencyScore(cells, cfg);
  s += clusterBonusScore(cells, cfg);
  return s;
}

export function initialTileState(seed: number, cfg: TileConfig = DEFAULT_TILE_CONFIG): TileState {
  const rng = mulberry32(seed);
  const queue = genQueue(rng, cfg);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const cells = new Array(cfg.gridSize * cfg.gridSize).fill(-1);
  if (cfg.prePlaced) for (const p of cfg.prePlaced) cells[p.index] = p.type;
  return {
    rngSeed: nextSeed,
    cells,
    queue,
    placed: 0,
    score: 0,
    phase: "playing",
    config: cfg,
  };
}

export function tileReducer(state: TileState, action: TileAction): TileState {
  if (state.phase === "done") return state;
  if (action.type === "place") {
    const i = action.index;
    if (i < 0 || i >= state.cells.length) return state;
    if ((state.cells[i] ?? -1) >= 0) return state;
    if (state.placed >= state.queue.length) return state;
    const tileType = state.queue[state.placed]!;
    const cells = state.cells.slice();
    cells[i] = tileType;
    const placed = state.placed + 1;
    const score = totalScore(cells, state.config);
    const isDone = placed >= state.queue.length;
    const completion = isDone ? (state.config.completionBonus ?? 0) : 0;
    return {
      ...state,
      cells,
      placed,
      score: score + completion,
      phase: isDone ? "done" : "playing",
    };
  }
  return state;
}

export function tileIsTerminal(s: TileState): { score: number } | null {
  return s.phase === "done" ? { score: Math.max(0, s.score) } : null;
}

/**
 * Return the index of the empty cell that, if the next queued tile were
 * placed there, would yield the highest adjacency contribution. Falls back
 * to the first empty cell. Returns null only if the game is done or no
 * empty cells remain.
 */
export function tileBestMoveIndex(s: TileState): number | null {
  if (s.phase === "done") return null;
  if (s.placed >= s.queue.length) return null;
  const t = s.queue[s.placed];
  if (t === undefined) return null;
  const cells = s.cells;
  const cfg = s.config;
  let bestIdx: number | null = null;
  let bestScore = -1;
  for (let i = 0; i < cells.length; i++) {
    if ((cells[i] ?? -1) >= 0) continue;
    let score = 0;
    for (const n of neighborsOf(i, cfg.gridSize)) {
      if (cells[n] === t) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Build a CSS selector that pulses the recommended empty cell for the next
 * tile placement. `gridClass` is the per-game grid container class (without
 * the leading dot), e.g. "carcb-grid". Returns null if no hint applies.
 */
export function tileHintSelector(s: TileState, gridClass: string): string | null {
  const idx = tileBestMoveIndex(s);
  if (idx === null) return null;
  return `.${gridClass} > button:nth-child(${idx + 1})`;
}
