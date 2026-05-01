import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Mini Xiangqi — simplified 5×5 board with King, Cannon (jumps over one piece),
// and 3 Soldiers. Capture opponent's King to win.

export const ROWS = 6;
export const COLS = 5;
export const TOTAL = ROWS * COLS;

export type Color = "P" | "C";
export type PieceKind = "K" | "Cn" | "S";  // King, Cannon, Soldier
export interface Piece { kind: PieceKind; color: Color; }
export type Cell = Piece | null;

export interface MiniXiangqiSettings { dummy: boolean; }
export type Phase = "playing" | "done";

export interface MiniXiangqiState {
  rngSeed: number;
  board: Cell[];
  turn: Color;
  selected: number | null;
  legalTargets: number[];
  result: "P" | "C" | "draw" | null;
  score: number;
  moves: number;
  log: string;
  phase: Phase;
}
export type MiniXiangqiAction =
  | { type: "select"; idx: number }
  | { type: "moveTo"; idx: number };

function startBoard(): Cell[] {
  // 6 rows × 5 cols; row 0 = top (CPU), row 5 = bottom (Player).
  const b: Cell[] = Array(TOTAL).fill(null);
  // CPU back rank: King + 2 Cannons
  b[0] = { kind: "Cn", color: "C" };
  b[2] = { kind: "K",  color: "C" };
  b[4] = { kind: "Cn", color: "C" };
  // CPU soldiers
  for (let c = 0; c < 5; c++) b[5 + c] = { kind: "S", color: "C" };
  // Player soldiers
  for (let c = 0; c < 5; c++) b[20 + c] = { kind: "S", color: "P" };
  // Player back rank
  b[25] = { kind: "Cn", color: "P" };
  b[27] = { kind: "K",  color: "P" };
  b[29] = { kind: "Cn", color: "P" };
  return b;
}

function rc(idx: number): [number, number] { return [Math.floor(idx / COLS), idx % COLS]; }
function inb(r: number, c: number): boolean { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

export function legalMoves(board: Cell[], idx: number): number[] {
  const p = board[idx]; if (!p) return [];
  const [r, c] = rc(idx);
  const out: number[] = [];
  if (p.kind === "S") {
    // Soldier moves forward 1 (P up = -row, C down = +row); also sideways once past midline.
    const fwd = p.color === "P" ? -1 : 1;
    const nr = r + fwd;
    if (inb(nr, c)) {
      const tgt = board[nr * COLS + c];
      if (!tgt || tgt.color !== p.color) out.push(nr * COLS + c);
    }
    const past = p.color === "P" ? r <= 2 : r >= 3;
    if (past) {
      for (const dc of [-1, 1]) {
        const nc = c + dc;
        if (inb(r, nc)) {
          const tgt = board[r * COLS + nc];
          if (!tgt || tgt.color !== p.color) out.push(r * COLS + nc);
        }
      }
    }
  } else if (p.kind === "K") {
    // King: orthogonal 1
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as const) {
      const nr = r + dr, nc = c + dc;
      if (!inb(nr, nc)) continue;
      const tgt = board[nr * COLS + nc];
      if (!tgt || tgt.color !== p.color) out.push(nr * COLS + nc);
    }
  } else if (p.kind === "Cn") {
    // Cannon: orthogonal slide. Move freely; capture by jumping exactly one screen.
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as const) {
      let nr = r + dr, nc = c + dc;
      // empty squares
      while (inb(nr, nc) && board[nr * COLS + nc] === null) {
        out.push(nr * COLS + nc);
        nr += dr; nc += dc;
      }
      // first piece (screen). Jump it to capture.
      if (inb(nr, nc)) {
        let mr = nr + dr, mc = nc + dc;
        while (inb(mr, mc) && board[mr * COLS + mc] === null) { mr += dr; mc += dc; }
        if (inb(mr, mc)) {
          const tgt = board[mr * COLS + mc];
          if (tgt && tgt.color !== p.color) out.push(mr * COLS + mc);
        }
      }
    }
  }
  return out;
}

function findKing(board: Cell[], color: Color): number {
  for (let i = 0; i < board.length; i++) { const p = board[i]; if (p && p.kind === "K" && p.color === color) return i; }
  return -1;
}

function allMoves(board: Cell[], color: Color): { from: number; to: number }[] {
  const out: { from: number; to: number }[] = [];
  for (let i = 0; i < board.length; i++) {
    const p = board[i]; if (!p || p.color !== color) continue;
    for (const t of legalMoves(board, i)) out.push({ from: i, to: t });
  }
  return out;
}

function cpuMove(board: Cell[], rng: () => number): { from: number; to: number } | null {
  const moves = allMoves(board, "C");
  if (moves.length === 0) return null;
  // Prefer captures of King first
  const kingCaps = moves.filter(m => { const t = board[m.to]; return t && t.kind === "K" && t.color === "P"; });
  if (kingCaps.length > 0) return kingCaps[0]!;
  const caps = moves.filter(m => { const t = board[m.to]; return t && t.color === "P"; });
  if (caps.length > 0) return caps[Math.floor(rng() * caps.length)]!;
  return moves[Math.floor(rng() * moves.length)]!;
}

export function initialState(seed: number, _s: MiniXiangqiSettings): MiniXiangqiState {
  return {
    rngSeed: seed,
    board: startBoard(),
    turn: "P",
    selected: null,
    legalTargets: [],
    result: null,
    score: 0,
    moves: 0,
    log: "Your turn. Click a piece, then a destination.",
    phase: "playing",
  };
}

function applyMove(board: Cell[], from: number, to: number): Cell[] {
  const nb = board.slice();
  nb[to] = nb[from];
  nb[from] = null;
  return nb;
}

export function reducer(state: MiniXiangqiState, action: MiniXiangqiAction): MiniXiangqiState {
  if (state.phase === "done") return state;
  if (state.turn !== "P") return state;

  if (action.type === "select") {
    const p = state.board[action.idx];
    if (!p || p.color !== "P") {
      // tap empty/enemy: if it's a legal target, treat as moveTo
      if (state.selected !== null && state.legalTargets.includes(action.idx)) {
        return reducer(state, { type: "moveTo", idx: action.idx });
      }
      return state;
    }
    return { ...state, selected: action.idx, legalTargets: legalMoves(state.board, action.idx) };
  }

  if (action.type === "moveTo" && state.selected !== null) {
    if (!state.legalTargets.includes(action.idx)) return state;
    const target = state.board[action.idx];
    let board = applyMove(state.board, state.selected, action.idx);
    let log = "";
    let result: "P" | "C" | "draw" | null = null;
    let score = state.score;
    if (target && target.kind === "K") {
      result = "P"; score = 100 + (5 - state.moves > 0 ? (5 - state.moves) * 10 : 0); log = "You captured the King! ";
    }
    if (!result) {
      // CPU's turn
      const rng = mulberry32(state.rngSeed);
      const cpu = cpuMove(board, rng);
      if (cpu) {
        const tgt = board[cpu.to];
        board = applyMove(board, cpu.from, cpu.to);
        if (tgt && tgt.kind === "K") { result = "C"; log = "CPU captured your King."; score = 0; }
      } else {
        result = "P"; score += 50; log = "CPU has no moves. You win.";
      }
    }
    const moves = state.moves + 1;
    if (moves >= 30 && !result) {
      const yourK = findKing(board, "P"); const cpuK = findKing(board, "C");
      if (yourK >= 0 && cpuK < 0) result = "P";
      else if (cpuK >= 0 && yourK < 0) result = "C";
      else result = "draw";
    }
    return {
      ...state,
      rngSeed: Math.floor((state.rngSeed * 1103515245 + 12345) & 0x7fffffff),
      board,
      selected: null,
      legalTargets: [],
      moves,
      result,
      score,
      log: log || "Your turn.",
      phase: result ? "done" : "playing",
    };
  }
  return state;
}

export function isTerminal(s: MiniXiangqiState): { score: number } | null {
  return s.phase === "done" ? { score: s.score } : null;
}
