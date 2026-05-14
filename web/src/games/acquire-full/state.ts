import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Acquire (Full) ──────────────────────────────────────────────────────────
// Sid Sackson's 1962 hotel-chain stock investment game.
//
// Tier L: solid playable scaffold (4 players vs CPU). Implemented:
//   • 12 × 9 grid of 108 tiles labeled A1..L9 (columns 1-9, rows A-I)
//   • 7 hotel chains (Worldwide, Sackson, Festival, Imperial, American,
//     Continental, Tower) with three tier price-ladders (per official rules)
//   • Each chain has 25 shares; price & majority/minority bonuses scale
//     with chain size (per official price chart)
//   • Turn: draw to 6 tiles → play tile (form/grow/merge) → buy up to 3 shares
//     of currently active chains → end turn (auto draw next turn)
//   • Founding a chain (placing adjacent to lone-tile + lone-tile): pick which
//     unused chain to found; you receive 1 founder share if available
//   • Growing a chain (placing tile adjacent to one chain)
//   • Merger: bigger chain stays, smaller folds; majority/minority bonus paid
//     to top shareholders of folded chain; folded shareholders may sell at
//     pre-merger price, trade 2-for-1 into bigger chain, or keep
//   • Two safe chains cannot merge (tile becomes unplayable, "dead tile")
//   • Game end: any chain ≥ 41 tiles OR all active chains are safe (≥ 11);
//     final bonuses paid to majority/minority shareholders of every active
//     chain, players cash in remaining shares at current price
//   • CPU heuristic: buy cheap shares of growing chains, prioritize majority
//
// Advanced rules OMITTED (noted in howToPlay):
//   • Player-driven merger order when 3+ chains converge (we auto-resolve
//     smallest-first, ties broken by chain index)
//   • Per-player tie-breaking on majority bonus (we split bonuses evenly
//     among tied players using floor division)
//   • Trading shares during the merger dialog (only sell / keep / trade-2-for-1
//     are exposed; partial trade-or-sell combos work via repeated dialog)
//   • Voluntary trade between players outside merger
//   • Drawing fresh tiles when a tile is permanently unplayable (we simply
//     return the tile to play if marked dead)

export const NUM_PLAYERS = 4;
export const BOARD_COLS = 12;          // numeric 1..12 (columns)
export const BOARD_ROWS = 9;           // letter rows A..I (rows)
export const BOARD_SIZE = BOARD_COLS * BOARD_ROWS; // 108
export const HAND_SIZE = 6;
export const STARTING_CASH = 6000;
export const CHAIN_SHARES = 25;
export const SAFE_THRESHOLD = 11;
export const END_THRESHOLD = 41;
export const BUYS_PER_TURN = 3;

export type ChainId =
  | "worldwide"
  | "sackson"
  | "festival"
  | "imperial"
  | "american"
  | "continental"
  | "tower";

export const CHAIN_IDS: readonly ChainId[] = [
  "worldwide",
  "sackson",
  "festival",
  "imperial",
  "american",
  "continental",
  "tower",
] as const;

// Tier 1 = cheap (Worldwide, Sackson), Tier 2 = mid (Festival, Imperial, American),
// Tier 3 = expensive (Continental, Tower).
export const CHAIN_TIER: Record<ChainId, 0 | 1 | 2> = {
  worldwide:   0,
  sackson:     0,
  festival:    1,
  imperial:    1,
  american:    1,
  continental: 2,
  tower:       2,
};

export const CHAIN_DISPLAY: Record<ChainId, string> = {
  worldwide:   "Worldwide",
  sackson:     "Sackson",
  festival:    "Festival",
  imperial:    "Imperial",
  american:    "American",
  continental: "Continental",
  tower:       "Tower",
};

export const CHAIN_COLOR: Record<ChainId, string> = {
  worldwide:   "#9a4dff",
  sackson:     "#e0457b",
  festival:    "#16a34a",
  imperial:    "#f59e0b",
  american:    "#2563eb",
  continental: "#0f766e",
  tower:       "#dc2626",
};

/** Standard Acquire price chart. Rows are size buckets; column = tier offset.
 *  Tier 0 = Worldwide/Sackson, Tier 1 = Festival/Imperial/American, Tier 2 = Continental/Tower.
 *  Buckets follow the rulebook's "Stock Market Status Indicator". */
function priceFor(size: number, tier: 0 | 1 | 2): number {
  if (size <= 0) return 0;
  // Bucket index by chain size:
  let bucket: number;
  if (size === 2)             bucket = 0;
  else if (size === 3)        bucket = 1;
  else if (size === 4)        bucket = 2;
  else if (size === 5)        bucket = 3;
  else if (size >= 6  && size <= 10)  bucket = 4;
  else if (size >= 11 && size <= 20)  bucket = 5;
  else if (size >= 21 && size <= 30)  bucket = 6;
  else if (size >= 31 && size <= 40)  bucket = 7;
  else                                bucket = 8; // 41+
  // Base prices at tier 0, increment per tier.
  const BASE = [200, 300, 400, 500, 600, 700, 800, 900, 1000];
  return BASE[bucket]! + tier * 100;
}

export function chainPrice(size: number, chain: ChainId): number {
  if (size < 2) return 0;
  return priceFor(size, CHAIN_TIER[chain]);
}

export function majorityBonus(size: number, chain: ChainId): number {
  return chainPrice(size, chain) * 10;
}

export function minorityBonus(size: number, chain: ChainId): number {
  return chainPrice(size, chain) * 5;
}

// ─── Tile coordinates ──────────────────────────────────────────────────────
/** Tile labels: column-letter row, e.g. "A1".."L9". We store as 0..107 index.
 *  Row = floor(idx / 12) (0..8 → A..I), Col = idx % 12 (0..11 → 1..12).
 *  But standard Acquire uses 1..12 cols and A..I rows (9 rows). The prompt
 *  said 12×9 grid with A1..L9, i.e. columns A..L (letters) and rows 1..9.
 *  We follow the prompt: 12 columns labeled A..L, 9 rows labeled 1..9. */
export function tileLabel(idx: number): string {
  const col = Math.floor(idx / BOARD_ROWS); // 0..11
  const row = idx % BOARD_ROWS;             // 0..8
  return String.fromCharCode("A".charCodeAt(0) + col) + String(row + 1);
}

export function tileIdx(col: number, row: number): number {
  // col 0..11, row 0..8
  return col * BOARD_ROWS + row;
}

export function tileColRow(idx: number): [number, number] {
  return [Math.floor(idx / BOARD_ROWS), idx % BOARD_ROWS];
}

/** Indices of the 4 orthogonal neighbors of tile idx (filter out-of-bounds). */
export function neighbors(idx: number): number[] {
  const [c, r] = tileColRow(idx);
  const out: number[] = [];
  if (c > 0)              out.push(tileIdx(c - 1, r));
  if (c < BOARD_COLS - 1) out.push(tileIdx(c + 1, r));
  if (r > 0)              out.push(tileIdx(c, r - 1));
  if (r < BOARD_ROWS - 1) out.push(tileIdx(c, r + 1));
  return out;
}

// ─── State types ──────────────────────────────────────────────────────────

/** Per-tile status on the board. */
export type TileStatus = "empty" | "lone" | ChainId;

export interface PlayerState {
  id: number;             // 0 = human, 1..3 = CPUs
  cash: number;
  hand: number[];         // tile indices in hand
  shares: Record<ChainId, number>;
  isCPU: boolean;
}

export type Phase =
  | "play-tile"
  | "choose-found"        // player must pick which chain to found
  | "merge-resolve"       // resolving folded-chain shareholder choices
  | "buy"
  | "cpu-turn"
  | "done";

export interface MergerContext {
  /** Index of placed tile that caused the merger. */
  tileIdx: number;
  /** Chain that survives (largest). */
  survivor: ChainId;
  /** Chain(s) being folded — order matters; we resolve folded[0] first. */
  folded: ChainId[];
  /** Pre-merger shares of folded[0] (per player). Used to pay bonuses & sell/trade. */
  preShares: number[];
  /** Players left to act on folded[0] (excluding initial bonuses payee — they always pay first). */
  pendingPlayers: number[];
  /** True once we've paid majority/minority bonuses for folded[0]. */
  bonusesPaid: boolean;
}

export interface AcquireFullSettings { _dummy: boolean; }

export interface AcquireFullState {
  rngSeed: number;
  /** Board: 108 tiles. status per cell. */
  board: TileStatus[];
  /** Tile pool (indices not yet drawn/placed). */
  pool: number[];
  /** Per-chain availability: shares remaining in the bank. */
  bankShares: Record<ChainId, number>;
  /** Per-chain size on the board (precomputed for speed). */
  chainSize: Record<ChainId, number>;
  players: PlayerState[];
  turn: number;
  current: number;        // 0..NUM_PLAYERS-1
  phase: Phase;
  buysLeft: number;
  /** Pending merger state when phase = "merge-resolve". */
  merger: MergerContext | null;
  /** Tile waiting to be placed once founding chain is picked. */
  pendingFoundTile: number | null;
  message: string;
  log: string[];
  winner: number | null;
  /** Final score breakdown set at game end (one row per player). */
  finalScores: number[] | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────

export type AcquireFullAction =
  | { type: "play-tile"; tileIdx: number }
  | { type: "choose-found"; chain: ChainId }
  | { type: "buy"; chain: ChainId }
  | { type: "end-buy" }
  | { type: "merge-sell"; sell: number; trade: number }
  | { type: "cpu-step" };

// ─── Helpers ──────────────────────────────────────────────────────────────

function pushLog(log: readonly string[], line: string): string[] {
  const next = [...log, line];
  return next.length > 14 ? next.slice(next.length - 14) : next;
}

function shuffleSeed(seed: number, length: number): number[] {
  const rng = mulberry32(seed >>> 0 || 1);
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!; arr[i] = arr[j]!; arr[j] = tmp;
  }
  return arr;
}

function emptyShares(): Record<ChainId, number> {
  return {
    worldwide: 0, sackson: 0, festival: 0,
    imperial: 0, american: 0, continental: 0, tower: 0,
  };
}

function fullBankShares(): Record<ChainId, number> {
  return {
    worldwide: CHAIN_SHARES, sackson: CHAIN_SHARES, festival: CHAIN_SHARES,
    imperial: CHAIN_SHARES, american: CHAIN_SHARES,
    continental: CHAIN_SHARES, tower: CHAIN_SHARES,
  };
}

function emptyChainSize(): Record<ChainId, number> {
  return {
    worldwide: 0, sackson: 0, festival: 0,
    imperial: 0, american: 0, continental: 0, tower: 0,
  };
}

/** Active chains (size > 0). */
export function activeChains(state: AcquireFullState): ChainId[] {
  return CHAIN_IDS.filter((c) => state.chainSize[c] > 0);
}

/** Inactive chains (size = 0) — available to found. */
export function inactiveChains(state: AcquireFullState): ChainId[] {
  return CHAIN_IDS.filter((c) => state.chainSize[c] === 0);
}

/** Compute connected component of empty/lone tiles + this idx, treating
 *  cells with chain status as "wall" (we'll classify those separately). */
function bfsLoneCluster(board: TileStatus[], start: number): number[] {
  // Only walks "lone" tiles + the start tile.
  const seen = new Set<number>();
  const stack: number[] = [start];
  const out: number[] = [];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    if (seen.has(cur)) continue;
    seen.add(cur);
    const st = board[cur];
    // Start is the just-placed tile (may be "empty" temporarily) — count it.
    if (cur === start || st === "lone") {
      out.push(cur);
      for (const n of neighbors(cur)) {
        const ns = board[n];
        if (!seen.has(n) && ns === "lone") stack.push(n);
      }
    }
  }
  return out;
}

/** Distinct adjacent chains at idx (touching the placed tile). */
export function adjacentChains(board: TileStatus[], idx: number): ChainId[] {
  const set = new Set<ChainId>();
  for (const n of neighbors(idx)) {
    const s = board[n];
    if (s !== undefined && s !== "empty" && s !== "lone") set.add(s);
  }
  return [...set];
}

/** Is this tile placement legal?
 *   - illegal if it would merge two already-safe chains
 *   - illegal if it would form a new chain (lone clusters) but no inactive chains remain
 */
export function classifyPlacement(
  state: AcquireFullState,
  idx: number,
): { kind: "lone" | "found" | "grow" | "merge"; chains?: ChainId[]; growChain?: ChainId; mergeChains?: ChainId[] } | "illegal" {
  if (state.board[idx] !== "empty") return "illegal";
  const adj = adjacentChains(state.board, idx);

  if (adj.length >= 2) {
    // Merger candidates. If two-or-more are safe, this is illegal (dead tile).
    const safes = adj.filter((c) => state.chainSize[c] >= SAFE_THRESHOLD);
    if (safes.length >= 2) return "illegal";
    return { kind: "merge", mergeChains: adj };
  }

  if (adj.length === 1) {
    return { kind: "grow", growChain: adj[0]! };
  }

  // No adjacent chain. Check if any adjacent lone tile → would found a new chain.
  let touchesLone = false;
  for (const n of neighbors(idx)) {
    if (state.board[n] === "lone") { touchesLone = true; break; }
  }
  if (touchesLone) {
    if (inactiveChains(state).length === 0) return "illegal"; // can't found
    return { kind: "found" };
  }
  // Just a lone placement.
  return { kind: "lone" };
}

/** Recompute chain sizes from board state (cheap O(108)). */
function recomputeChainSizes(board: TileStatus[]): Record<ChainId, number> {
  const out = emptyChainSize();
  for (let i = 0; i < board.length; i++) {
    const s = board[i];
    if (s !== undefined && s !== "empty" && s !== "lone") out[s]++;
  }
  return out;
}

/** Find the connected chain region containing idx (chain status). */
function chainRegion(board: TileStatus[], idx: number, chain: ChainId): number[] {
  const seen = new Set<number>();
  const stack: number[] = [idx];
  const out: number[] = [];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    if (seen.has(cur)) continue;
    seen.add(cur);
    if (board[cur] === chain) {
      out.push(cur);
      for (const n of neighbors(cur)) if (!seen.has(n)) stack.push(n);
    }
  }
  return out;
}

/** Place a tile, optionally with chain founding/growing pre-resolved. Returns
 *  new board after absorbing the tile (and any "lone" cluster) into chain
 *  if `intoChain` is provided, otherwise marks it as "lone". */
function placeTile(
  board: TileStatus[],
  idx: number,
  intoChain: ChainId | null,
): TileStatus[] {
  const out = board.slice();
  out[idx] = "empty";
  if (intoChain !== null) {
    // Absorb the placed tile + all connected lone tiles + all connected
    // tiles already belonging to intoChain.
    const seen = new Set<number>();
    const stack: number[] = [idx];
    while (stack.length > 0) {
      const cur = stack.pop()!;
      if (seen.has(cur)) continue;
      seen.add(cur);
      const s = out[cur];
      if (cur === idx || s === "lone" || s === intoChain) {
        out[cur] = intoChain;
        for (const n of neighbors(cur)) if (!seen.has(n)) stack.push(n);
      }
    }
  } else {
    // Mark as lone (or merge with existing lone cluster — same status).
    const cluster = bfsLoneCluster(out, idx);
    for (const c of cluster) out[c] = "lone";
  }
  return out;
}

/** Convert all tiles of `from` chain (connected to anchor) into `to` chain. */
function absorbChain(board: TileStatus[], anchorIdx: number, from: ChainId, to: ChainId): TileStatus[] {
  const out = board.slice();
  // Find all `from` tiles (the entire chain — easier than walking only the
  // touching region, since after a merge they'll all be `to` anyway).
  for (let i = 0; i < out.length; i++) {
    if (out[i] === from) out[i] = to;
  }
  // Also fold in any lone tile touching anchor (just-placed merge tile).
  const cluster = bfsLoneCluster(out, anchorIdx);
  for (const c of cluster) out[c] = to;
  void chainRegion; // referenced for future use
  return out;
}

/** Pay majority/minority bonuses for a folding chain. Returns updated players.
 *  Ties on majority are split evenly between tied top holders (floor div).
 *  Ties on minority similarly. */
function payFoldBonuses(
  players: PlayerState[],
  chain: ChainId,
  size: number,
  log: string[],
): { players: PlayerState[]; log: string[] } {
  const mb = majorityBonus(size, chain);
  const nb = minorityBonus(size, chain);
  const counts = players.map((p) => p.shares[chain]);
  const max = Math.max(...counts);
  if (max <= 0) return { players, log };
  const topPlayers = counts.map((c, i) => (c === max ? i : -1)).filter((i) => i >= 0);

  const next = players.map((p) => ({ ...p, shares: { ...p.shares } }));
  let nextLog = log;

  if (topPlayers.length >= 2) {
    // Split (majority+minority) evenly among ties.
    const share = Math.floor((mb + nb) / topPlayers.length);
    for (const i of topPlayers) {
      next[i]!.cash += share;
      nextLog = pushLog(nextLog, `P${i + 1} got $${share} (${CHAIN_DISPLAY[chain]} tied bonus).`);
    }
  } else {
    // Single majority holder.
    const majIdx = topPlayers[0]!;
    next[majIdx]!.cash += mb;
    nextLog = pushLog(nextLog, `P${majIdx + 1} got $${mb} (${CHAIN_DISPLAY[chain]} majority).`);

    // Minority: next-highest holders.
    const restCounts = counts.map((c, i) => (i === majIdx ? -1 : c));
    const secondMax = Math.max(...restCounts);
    if (secondMax > 0) {
      const minPlayers = restCounts
        .map((c, i) => (c === secondMax ? i : -1))
        .filter((i) => i >= 0);
      const minShare = Math.floor(nb / minPlayers.length);
      for (const i of minPlayers) {
        next[i]!.cash += minShare;
        nextLog = pushLog(nextLog, `P${i + 1} got $${minShare} (${CHAIN_DISPLAY[chain]} minority).`);
      }
    } else {
      // No minority holders — majority gets both bonuses.
      next[majIdx]!.cash += nb;
      nextLog = pushLog(nextLog, `P${majIdx + 1} got extra $${nb} (no minority).`);
    }
  }
  return { players: next, log: nextLog };
}

/** Sort folded chains in resolution order: smallest first. Ties broken by
 *  CHAIN_IDS index. */
function sortFolded(chains: ChainId[], sizes: Record<ChainId, number>): ChainId[] {
  return chains.slice().sort((a, b) => {
    const sa = sizes[a], sb = sizes[b];
    if (sa !== sb) return sa - sb;
    return CHAIN_IDS.indexOf(a) - CHAIN_IDS.indexOf(b);
  });
}

/** Pick the survivor chain among adj (largest). Ties: lowest CHAIN_IDS index. */
function pickSurvivor(adj: ChainId[], sizes: Record<ChainId, number>): ChainId {
  let best = adj[0]!;
  for (const c of adj) {
    if (sizes[c] > sizes[best] ||
        (sizes[c] === sizes[best] && CHAIN_IDS.indexOf(c) < CHAIN_IDS.indexOf(best))) {
      best = c;
    }
  }
  return best;
}

// ─── Game-flow helpers ────────────────────────────────────────────────────

function drawTiles(
  pool: number[],
  hand: number[],
  upTo: number,
): { pool: number[]; hand: number[] } {
  let p = pool.slice();
  const h = hand.slice();
  while (h.length < upTo && p.length > 0) {
    h.push(p.shift()!);
  }
  return { pool: p, hand: h };
}

function refillCurrentHand(state: AcquireFullState): AcquireFullState {
  const cur = state.current;
  const pl = state.players[cur]!;
  const { pool, hand } = drawTiles(state.pool, pl.hand, HAND_SIZE);
  const np = state.players.slice();
  np[cur] = { ...pl, hand };
  return { ...state, pool, players: np };
}

function advanceTurn(state: AcquireFullState): AcquireFullState {
  // Check terminal first.
  const term = checkTerminalCondition(state);
  if (term) return term;
  let s = state;
  s = { ...s, current: (s.current + 1) % NUM_PLAYERS, turn: s.turn + 1, buysLeft: BUYS_PER_TURN, merger: null, pendingFoundTile: null };
  s = refillCurrentHand(s);
  const np = s.players[s.current]!;
  s = { ...s, phase: np.isCPU ? "cpu-turn" : "play-tile",
        message: np.isCPU ? `CPU P${np.id + 1} is thinking…` : "Play a tile from your hand." };
  return s;
}

/** Returns terminal state if game should end, else null. */
function checkTerminalCondition(state: AcquireFullState): AcquireFullState | null {
  const actives = activeChains(state);
  const anyTooBig = actives.some((c) => state.chainSize[c] >= END_THRESHOLD);
  const allSafe = actives.length > 0 && actives.every((c) => state.chainSize[c] >= SAFE_THRESHOLD);
  if (!anyTooBig && !allSafe) return null;

  // Pay final bonuses on each active chain, then cash in all shares at current price.
  let players = state.players.map((p) => ({ ...p, shares: { ...p.shares } }));
  let log = state.log;
  log = pushLog(log, "GAME OVER — paying final bonuses & cashing out shares.");

  for (const c of actives) {
    const sz = state.chainSize[c];
    const res = payFoldBonuses(players, c, sz, log);
    players = res.players;
    log = res.log;
  }

  // Cash in shares at current price.
  for (let i = 0; i < players.length; i++) {
    const pl = players[i]!;
    let cashIn = 0;
    for (const c of actives) {
      const ct = pl.shares[c];
      if (ct > 0) {
        cashIn += ct * chainPrice(state.chainSize[c], c);
        pl.shares[c] = 0;
      }
    }
    if (cashIn > 0) {
      pl.cash += cashIn;
      log = pushLog(log, `P${i + 1} cashed in $${cashIn} from shares.`);
    }
  }

  const finalScores = players.map((p) => p.cash);
  let best = 0;
  for (let i = 1; i < finalScores.length; i++) {
    if (finalScores[i]! > finalScores[best]!) best = i;
  }

  return {
    ...state,
    players,
    phase: "done",
    winner: best,
    message: best === 0
      ? `You win with $${finalScores[0]}!`
      : `P${best + 1} (CPU) wins with $${finalScores[best]}.`,
    log: pushLog(log, `Winner: ${best === 0 ? "You" : `CPU P${best + 1}`} ($${finalScores[best]}).`),
    finalScores,
  };
}

// ─── initialState ─────────────────────────────────────────────────────────

export function initialState(seed: number, _s: AcquireFullSettings): AcquireFullState {
  const sd = seed >>> 0 || 1;
  const pool = shuffleSeed(sd, BOARD_SIZE);

  // Deal HAND_SIZE tiles to each player.
  const players: PlayerState[] = [];
  let p = pool;
  for (let i = 0; i < NUM_PLAYERS; i++) {
    const r = drawTiles(p, [], HAND_SIZE);
    p = r.pool;
    players.push({
      id: i,
      cash: STARTING_CASH,
      hand: r.hand,
      shares: emptyShares(),
      isCPU: i !== 0,
    });
  }

  return {
    rngSeed: sd,
    board: new Array<TileStatus>(BOARD_SIZE).fill("empty"),
    pool: p,
    bankShares: fullBankShares(),
    chainSize: emptyChainSize(),
    players,
    turn: 1,
    current: 0,
    phase: "play-tile",
    buysLeft: BUYS_PER_TURN,
    merger: null,
    pendingFoundTile: null,
    message: "Play a tile from your hand.",
    log: [`Acquire (Full): 4 players seated. You = P1.`],
    winner: null,
    finalScores: null,
  };
}

// ─── reducer ──────────────────────────────────────────────────────────────

export function reducer(state: AcquireFullState, action: AcquireFullAction): AcquireFullState {
  if (state.phase === "done") return state;

  // CPU step: drive CPU through its phases automatically.
  if (action.type === "cpu-step") {
    return cpuStep(state);
  }

  // Player plays a tile.
  if (action.type === "play-tile" && state.phase === "play-tile") {
    return handlePlayTile(state, action.tileIdx, state.current);
  }

  // Player picks chain to found.
  if (action.type === "choose-found" && state.phase === "choose-found" && state.pendingFoundTile !== null) {
    if (state.chainSize[action.chain] > 0) return state; // already exists
    return resolveFounding(state, state.pendingFoundTile, action.chain, state.current);
  }

  // Player buys a share during buy phase.
  if (action.type === "buy" && state.phase === "buy") {
    return handleBuy(state, action.chain, state.current);
  }

  if (action.type === "end-buy" && state.phase === "buy") {
    return advanceTurn(state);
  }

  // Player resolves their slice of a merger.
  if (action.type === "merge-sell" && state.phase === "merge-resolve" && state.merger) {
    return resolveMergerStep(state, action.sell, action.trade);
  }

  return state;
}

// ─── Play tile ────────────────────────────────────────────────────────────

function handlePlayTile(state: AcquireFullState, idx: number, playerIdx: number): AcquireFullState {
  const pl = state.players[playerIdx]!;
  if (!pl.hand.includes(idx)) return state;
  const cls = classifyPlacement(state, idx);
  if (cls === "illegal") return state;

  // Remove tile from hand.
  const newHand = pl.hand.filter((t) => t !== idx);
  const np = state.players.slice();
  np[playerIdx] = { ...pl, hand: newHand };
  let s: AcquireFullState = { ...state, players: np };

  if (cls.kind === "lone") {
    const board = placeTile(s.board, idx, null);
    s = {
      ...s,
      board,
      message: pl.isCPU ? `P${playerIdx + 1} placed ${tileLabel(idx)}.` : `Played ${tileLabel(idx)}. Now buy shares.`,
      log: pushLog(s.log, `P${playerIdx + 1} played ${tileLabel(idx)}.`),
    };
    return transitionToBuyOrAdvance(s, playerIdx);
  }

  if (cls.kind === "grow") {
    const into = cls.growChain!;
    const board = placeTile(s.board, idx, into);
    const chainSize = recomputeChainSizes(board);
    s = {
      ...s,
      board,
      chainSize,
      message: pl.isCPU
        ? `P${playerIdx + 1} grew ${CHAIN_DISPLAY[into]}.`
        : `Grew ${CHAIN_DISPLAY[into]} (${chainSize[into]} tiles).`,
      log: pushLog(s.log, `P${playerIdx + 1} played ${tileLabel(idx)} → ${CHAIN_DISPLAY[into]} (size ${chainSize[into]}).`),
    };
    return transitionToBuyOrAdvance(s, playerIdx);
  }

  if (cls.kind === "found") {
    // Need player to pick which chain (CPU will pick automatically in cpu-turn handler).
    s = {
      ...s,
      pendingFoundTile: idx,
      phase: pl.isCPU ? "cpu-turn" : "choose-found",
      message: pl.isCPU ? `P${playerIdx + 1} founding a new chain…` : "Pick which hotel chain to found.",
    };
    return s;
  }

  // Merge.
  if (cls.kind === "merge") {
    const adj = cls.mergeChains!;
    const survivor = pickSurvivor(adj, s.chainSize);
    const folded = sortFolded(adj.filter((c) => c !== survivor), s.chainSize);
    // Begin folding the first chain.
    return beginMerger(s, idx, survivor, folded, playerIdx);
  }

  return state;
}

function transitionToBuyOrAdvance(state: AcquireFullState, playerIdx: number): AcquireFullState {
  const term = checkTerminalCondition(state);
  if (term) return term;
  const actives = activeChains(state);
  const pl = state.players[playerIdx]!;
  if (actives.length === 0) {
    // No chains to buy from — advance directly.
    return advanceTurn(state);
  }
  return { ...state, phase: pl.isCPU ? "cpu-turn" : "buy", buysLeft: BUYS_PER_TURN };
}

function resolveFounding(
  state: AcquireFullState,
  tileIdxArg: number,
  chain: ChainId,
  playerIdx: number,
): AcquireFullState {
  const board = placeTile(state.board, tileIdxArg, chain);
  const chainSize = recomputeChainSizes(board);
  // Founder share: if bank has any, give 1 to player.
  let bank = state.bankShares;
  let players = state.players;
  if (bank[chain] > 0) {
    bank = { ...bank, [chain]: bank[chain] - 1 };
    const pl = players[playerIdx]!;
    players = players.slice();
    players[playerIdx] = {
      ...pl,
      shares: { ...pl.shares, [chain]: pl.shares[chain] + 1 },
    };
  }
  const s: AcquireFullState = {
    ...state,
    board,
    chainSize,
    bankShares: bank,
    players,
    pendingFoundTile: null,
    log: pushLog(state.log, `P${playerIdx + 1} founded ${CHAIN_DISPLAY[chain]} (size ${chainSize[chain]}).`),
    message: state.players[playerIdx]!.isCPU
      ? `P${playerIdx + 1} founded ${CHAIN_DISPLAY[chain]}.`
      : `Founded ${CHAIN_DISPLAY[chain]}! Now buy shares.`,
  };
  return transitionToBuyOrAdvance(s, playerIdx);
}

// ─── Merger ───────────────────────────────────────────────────────────────

function beginMerger(
  state: AcquireFullState,
  tileIdxArg: number,
  survivor: ChainId,
  folded: ChainId[],
  initiatorIdx: number,
): AcquireFullState {
  if (folded.length === 0) {
    // No folding needed — treat as growth into survivor.
    const board = placeTile(state.board, tileIdxArg, survivor);
    const chainSize = recomputeChainSizes(board);
    return transitionToBuyOrAdvance({
      ...state,
      board,
      chainSize,
      log: pushLog(state.log, `P${initiatorIdx + 1} played ${tileLabel(tileIdxArg)} → ${CHAIN_DISPLAY[survivor]}.`),
    }, initiatorIdx);
  }
  // Initiate folding the first chain.
  const folding = folded[0]!;
  const size = state.chainSize[folding];
  // Pay bonuses immediately.
  const bonusRes = payFoldBonuses(state.players, folding, size, state.log);
  // Save pre-merger shares for each player (for sell/trade UI).
  const preShares = bonusRes.players.map((p) => p.shares[folding]);

  // Player order to act: initiator first (most common rule), then clockwise.
  const order: number[] = [];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    order.push((initiatorIdx + i) % NUM_PLAYERS);
  }
  // Only include players who actually hold the folded chain.
  const pending = order.filter((p) => preShares[p]! > 0);

  const merger: MergerContext = {
    tileIdx: tileIdxArg,
    survivor,
    folded,
    preShares,
    pendingPlayers: pending,
    bonusesPaid: true,
  };

  let s: AcquireFullState = {
    ...state,
    players: bonusRes.players,
    log: pushLog(bonusRes.log, `${CHAIN_DISPLAY[folding]} folds into ${CHAIN_DISPLAY[survivor]} (size ${size}).`),
    merger,
  };

  // If no one needs to act, auto-finish this fold immediately.
  if (pending.length === 0) {
    return finalizeFoldedChain(s, initiatorIdx);
  }

  const nextP = pending[0]!;
  const nextPl = s.players[nextP]!;
  s = {
    ...s,
    phase: nextPl.isCPU ? "cpu-turn" : "merge-resolve",
    message: nextPl.isCPU
      ? `P${nextP + 1} (CPU) resolving ${CHAIN_DISPLAY[folding]} shares…`
      : `${CHAIN_DISPLAY[folding]} folds: choose sell/trade/keep for your ${preShares[nextP]} shares.`,
  };
  return s;
}

/** Resolve one player's sell/trade/keep decision on the current folded chain. */
function resolveMergerStep(
  state: AcquireFullState,
  sell: number,
  trade: number,
): AcquireFullState {
  const mg = state.merger!;
  const folding = mg.folded[0]!;
  const survivor = mg.survivor;
  const actingIdx = mg.pendingPlayers[0]!;
  const acting = state.players[actingIdx]!;
  const has = acting.shares[folding];
  // Sanitize. trade must be even (2-for-1) and we must have stock.
  const s2 = Math.max(0, Math.min(sell | 0, has));
  let tr = Math.max(0, Math.min(trade | 0, has - s2));
  // Round trade down to even.
  if (tr % 2 === 1) tr -= 1;
  const tradeGain = tr / 2;
  // Survivor shares may be depleted in bank; cap.
  const tradeCap = Math.min(tradeGain, state.bankShares[survivor]);
  const actualTrade = tradeCap * 2;
  const refundTrade = tr - actualTrade; // unused trade → leftover stays held

  // Calculate cash from sell at pre-merger price.
  const sellPrice = chainPrice(state.chainSize[folding], folding);
  const sellCash = s2 * sellPrice;

  const newPlayers = state.players.map((p) => ({ ...p, shares: { ...p.shares } }));
  const a = newPlayers[actingIdx]!;
  a.cash += sellCash;
  a.shares[folding] = has - s2 - actualTrade - refundTrade;
  // refundTrade is held by player — re-add (we already subtracted it).
  a.shares[folding] += refundTrade;
  a.shares[survivor] += tradeCap;

  // Update bank.
  const bank = {
    ...state.bankShares,
    [folding]: state.bankShares[folding] + s2 + actualTrade,
    [survivor]: state.bankShares[survivor] - tradeCap,
  };

  // Log.
  let log = state.log;
  if (s2 > 0)        log = pushLog(log, `P${actingIdx + 1} sold ${s2} ${CHAIN_DISPLAY[folding]} for $${sellCash}.`);
  if (tradeCap > 0)  log = pushLog(log, `P${actingIdx + 1} traded ${actualTrade} ${CHAIN_DISPLAY[folding]} for ${tradeCap} ${CHAIN_DISPLAY[survivor]}.`);
  if (s2 === 0 && tradeCap === 0 && a.shares[folding] > 0) {
    log = pushLog(log, `P${actingIdx + 1} kept ${a.shares[folding]} ${CHAIN_DISPLAY[folding]} shares.`);
  }

  const pending = mg.pendingPlayers.slice(1);
  let s: AcquireFullState = {
    ...state,
    players: newPlayers,
    bankShares: bank,
    log,
    merger: { ...mg, pendingPlayers: pending },
  };

  if (pending.length > 0) {
    const nextP = pending[0]!;
    const nextPl = s.players[nextP]!;
    return {
      ...s,
      phase: nextPl.isCPU ? "cpu-turn" : "merge-resolve",
      message: nextPl.isCPU
        ? `P${nextP + 1} (CPU) resolving shares…`
        : `${CHAIN_DISPLAY[folding]}: choose sell/trade/keep for your ${nextPl.shares[folding]} shares.`,
    };
  }

  // Everyone in this fold is done. Finalize this chain's absorption then
  // either fold next chain in the list, or absorb-into-survivor and continue
  // to buy phase.
  return finalizeFoldedChain(s, /*initiatorIdx*/ findInitiator(s));
}

function findInitiator(s: AcquireFullState): number {
  // We track initiator implicitly as the first in pendingPlayers; but pendingPlayers
  // is empty now. The initiator is just s.current.
  return s.current;
}

function finalizeFoldedChain(state: AcquireFullState, initiatorIdx: number): AcquireFullState {
  const mg = state.merger!;
  const folding = mg.folded[0]!;
  const survivor = mg.survivor;

  // Absorb folded chain into survivor on the board.
  const board = absorbChain(state.board, mg.tileIdx, folding, survivor);
  const chainSize = recomputeChainSizes(board);

  let s: AcquireFullState = {
    ...state,
    board,
    chainSize,
  };

  // Move to next folded chain in this merger event.
  const restFolded = mg.folded.slice(1);
  if (restFolded.length > 0) {
    // Folded[0] was just absorbed — the next chain folds into survivor too.
    // Begin folding it.
    const next = restFolded[0]!;
    const size = chainSize[next];
    const bonusRes = payFoldBonuses(s.players, next, size, s.log);
    const preShares = bonusRes.players.map((p) => p.shares[next]);
    const order: number[] = [];
    for (let i = 0; i < NUM_PLAYERS; i++) order.push((initiatorIdx + i) % NUM_PLAYERS);
    const pending = order.filter((p) => preShares[p]! > 0);

    const merger: MergerContext = {
      tileIdx: mg.tileIdx,
      survivor,
      folded: restFolded,
      preShares,
      pendingPlayers: pending,
      bonusesPaid: true,
    };
    s = {
      ...s,
      players: bonusRes.players,
      log: pushLog(bonusRes.log, `${CHAIN_DISPLAY[next]} folds into ${CHAIN_DISPLAY[survivor]} (size ${size}).`),
      merger,
    };
    if (pending.length === 0) {
      return finalizeFoldedChain(s, initiatorIdx);
    }
    const nextP = pending[0]!;
    const nextPl = s.players[nextP]!;
    return {
      ...s,
      phase: nextPl.isCPU ? "cpu-turn" : "merge-resolve",
      message: nextPl.isCPU
        ? `P${nextP + 1} (CPU) resolving shares…`
        : `${CHAIN_DISPLAY[next]}: choose sell/trade/keep for your ${preShares[nextP]} shares.`,
    };
  }

  // All folds done. Clear merger; move to buy phase.
  s = { ...s, merger: null };
  return transitionToBuyOrAdvance(s, initiatorIdx);
}

// ─── Buy ──────────────────────────────────────────────────────────────────

function handleBuy(state: AcquireFullState, chain: ChainId, playerIdx: number): AcquireFullState {
  if (state.chainSize[chain] === 0) return state;
  if (state.bankShares[chain] <= 0) return state;
  if (state.buysLeft <= 0) return state;
  const price = chainPrice(state.chainSize[chain], chain);
  const pl = state.players[playerIdx]!;
  if (pl.cash < price) return state;
  const np = state.players.slice();
  np[playerIdx] = {
    ...pl,
    cash: pl.cash - price,
    shares: { ...pl.shares, [chain]: pl.shares[chain] + 1 },
  };
  const bank = { ...state.bankShares, [chain]: state.bankShares[chain] - 1 };
  return {
    ...state,
    players: np,
    bankShares: bank,
    buysLeft: state.buysLeft - 1,
    log: pushLog(state.log, `P${playerIdx + 1} bought 1 ${CHAIN_DISPLAY[chain]} ($${price}).`),
    message: pl.isCPU
      ? `P${playerIdx + 1} bought ${CHAIN_DISPLAY[chain]} ($${price}). ${state.buysLeft - 1} buys left.`
      : `Bought 1 ${CHAIN_DISPLAY[chain]} ($${price}). ${state.buysLeft - 1} buys left.`,
  };
}

// ─── CPU AI ──────────────────────────────────────────────────────────────
/** CPU plays incrementally — each cpu-step does ONE micro-action so the UI
 *  can show progress and the test/state machine remains predictable. */
function cpuStep(state: AcquireFullState): AcquireFullState {
  const cur = state.current;
  const pl = state.players[cur]!;
  if (!pl.isCPU) return state;
  if (state.phase === "done") return state;

  if (state.phase === "cpu-turn" || state.phase === "play-tile") {
    // Pick a legal tile. Prefer: grow > lone > found > merge (we'll do merges if no choice).
    const candidates = pl.hand.map((t) => ({ t, cls: classifyPlacement(state, t) }));
    const legal = candidates.filter((c) => c.cls !== "illegal") as Array<{ t: number; cls: Exclude<ReturnType<typeof classifyPlacement>, "illegal"> }>;
    if (legal.length === 0) {
      // No legal play — discard hand and redraw (simplified). We discard a random tile.
      // For determinism, drop the first held tile.
      if (pl.hand.length > 0) {
        const dropped = pl.hand[0]!;
        const newHand = pl.hand.slice(1);
        const np = state.players.slice();
        np[cur] = { ...pl, hand: newHand };
        return {
          ...state,
          players: np,
          phase: "buy",
          buysLeft: BUYS_PER_TURN,
          log: pushLog(state.log, `P${cur + 1} discarded ${tileLabel(dropped)} (no legal play).`),
        };
      }
      // No tiles → end turn.
      return advanceTurn(state);
    }

    // Score each candidate.
    const rank = (c: { t: number; cls: Exclude<ReturnType<typeof classifyPlacement>, "illegal"> }) => {
      if (c.cls.kind === "grow") return 4;
      if (c.cls.kind === "lone") return 3;
      if (c.cls.kind === "found") return 2;
      return 1; // merge
    };
    legal.sort((a, b) => rank(b) - rank(a));
    const choice = legal[0]!;
    return handlePlayTile(state, choice.t, cur);
  }

  if (state.phase === "choose-found" && state.pendingFoundTile !== null) {
    // CPU picks: tier-2 first (Continental/Tower), then tier-1, then tier-0.
    const inact = inactiveChains(state);
    if (inact.length === 0) return state;
    inact.sort((a, b) => CHAIN_TIER[b] - CHAIN_TIER[a]);
    return resolveFounding(state, state.pendingFoundTile, inact[0]!, cur);
  }

  if (state.phase === "merge-resolve" && state.merger) {
    // CPU policy: sell everything (safer cash). Trade if survivor is much
    // bigger and chain price is high.
    const mg = state.merger;
    const folding = mg.folded[0]!;
    const has = pl.shares[folding];
    const survivorSize = state.chainSize[mg.survivor];
    const foldedSize = state.chainSize[folding];
    let sell = has, trade = 0;
    if (survivorSize > foldedSize * 2 && CHAIN_TIER[mg.survivor] >= CHAIN_TIER[folding]) {
      trade = Math.floor(has / 2) * 2;
      sell = has - trade;
    }
    return resolveMergerStep(state, sell, trade);
  }

  if (state.phase === "buy") {
    // CPU buy policy: each step buy 1 cheapest available share of growing chain.
    if (state.buysLeft <= 0) return advanceTurn(state);
    const actives = activeChains(state).filter((c) => state.bankShares[c] > 0);
    if (actives.length === 0) return advanceTurn(state);
    // Compute price & affordability.
    const available = actives.filter((c) => chainPrice(state.chainSize[c], c) <= pl.cash);
    if (available.length === 0) return advanceTurn(state);
    // Prefer chain in which CPU is close to majority.
    available.sort((a, b) => {
      const myA = pl.shares[a], myB = pl.shares[b];
      // Highest "approach to majority" score first.
      const scoreA = myA - chainPrice(state.chainSize[a], a) / 1000;
      const scoreB = myB - chainPrice(state.chainSize[b], b) / 1000;
      return scoreB - scoreA;
    });
    const pick = available[0]!;
    return handleBuy(state, pick, cur);
  }

  return state;
}

// ─── Terminal & score ────────────────────────────────────────────────────

export function isTerminal(s: AcquireFullState): { score: number } | null {
  if (s.phase !== "done") return null;
  if (s.finalScores === null) return { score: 0 };
  const youScore = s.finalScores[0]!;
  const cpuMax = Math.max(s.finalScores[1]!, s.finalScores[2]!, s.finalScores[3]!);
  // Score = clamp(your cash − best CPU's cash + 5000 baseline). Win bonus +5000.
  const baseline = 5000;
  const winBonus = s.winner === 0 ? 5000 : 0;
  return { score: Math.max(0, youScore - cpuMax + baseline + winBonus) };
}

export function netWorth(s: AcquireFullState, playerIdx: number): number {
  const p = s.players[playerIdx]!;
  let worth = p.cash;
  for (const c of CHAIN_IDS) {
    const ct = p.shares[c];
    if (ct > 0 && s.chainSize[c] >= 2) {
      worth += ct * chainPrice(s.chainSize[c], c);
    }
  }
  return worth;
}
