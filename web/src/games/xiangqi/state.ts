import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Xiangqi (Chinese Chess) — simplified
// 9 cols × 10 rows. Row 0 = black side top, row 9 = red (player) bottom.
// River between rows 4 and 5.
// Palaces: red rows 7-9 cols 3-5, black rows 0-2 cols 3-5.

export type XqColor = "red" | "black";
export type XqPieceType = "general" | "advisor" | "elephant" | "horse" | "chariot" | "cannon" | "soldier";

export interface XqPiece {
  color: XqColor;
  type: XqPieceType;
}

export const ROWS = 10;
export const COLS = 9;

function idx(r: number, c: number): number { return r * COLS + c; }
function inBounds(r: number, c: number): boolean { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }
function inRedPalace(r: number, c: number): boolean { return r >= 7 && r <= 9 && c >= 3 && c <= 5; }
function inBlackPalace(r: number, c: number): boolean { return r >= 0 && r <= 2 && c >= 3 && c <= 5; }
function inOwnPalace(r: number, c: number, color: XqColor): boolean {
  return color === "red" ? inRedPalace(r, c) : inBlackPalace(r, c);
}
function crossedRiver(r: number, color: XqColor): boolean {
  return color === "red" ? r <= 4 : r >= 5;
}

export type XqBoard = (XqPiece | null)[];

function emptyBoard(): XqBoard { return new Array(ROWS * COLS).fill(null); }

function pieceAt(b: XqBoard, r: number, c: number): XqPiece | null {
  if (!inBounds(r, c)) return null;
  return b[idx(r, c)] ?? null;
}

export function initialBoard(): XqBoard {
  const b = emptyBoard();
  // Black pieces (top, row 0)
  const backRank: XqPieceType[] = ["chariot","horse","elephant","advisor","general","advisor","elephant","horse","chariot"];
  for (let c = 0; c < 9; c++) b[idx(0, c)] = { color: "black", type: backRank[c]! };
  b[idx(2, 1)] = { color: "black", type: "cannon" };
  b[idx(2, 7)] = { color: "black", type: "cannon" };
  for (let c = 0; c < 9; c += 2) b[idx(3, c)] = { color: "black", type: "soldier" };
  // Red pieces (bottom, row 9)
  for (let c = 0; c < 9; c++) b[idx(9, c)] = { color: "red", type: backRank[c]! };
  b[idx(7, 1)] = { color: "red", type: "cannon" };
  b[idx(7, 7)] = { color: "red", type: "cannon" };
  for (let c = 0; c < 9; c += 2) b[idx(6, c)] = { color: "red", type: "soldier" };
  return b;
}

export interface XqMove {
  from: number;
  to: number;
}

function countPiecesBetween(b: XqBoard, r1: number, c1: number, r2: number, c2: number): number {
  let count = 0;
  if (r1 === r2) {
    const minC = Math.min(c1, c2); const maxC = Math.max(c1, c2);
    for (let c = minC + 1; c < maxC; c++) if (b[idx(r1, c)] !== null) count++;
  } else if (c1 === c2) {
    const minR = Math.min(r1, r2); const maxR = Math.max(r1, r2);
    for (let r = minR + 1; r < maxR; r++) if (b[idx(r, c1)] !== null) count++;
  }
  return count;
}

export function legalMovesFrom(b: XqBoard, r: number, c: number): XqMove[] {
  const piece = pieceAt(b, r, c);
  if (!piece) return [];
  const from = idx(r, c);
  const pieceColor = piece.color;
  const moves: XqMove[] = [];

  function addIfValid(nr: number, nc: number) {
    if (!inBounds(nr, nc)) return;
    const t = pieceAt(b, nr, nc);
    if (t && t.color === pieceColor) return;
    moves.push({ from, to: idx(nr, nc) });
  }

  switch (piece.type) {
    case "general": {
      const dirs: [number,number][] = [[-1,0],[1,0],[0,-1],[0,1]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr; const nc = c + dc;
        if (inOwnPalace(nr, nc, pieceColor)) addIfValid(nr, nc);
      }
      break;
    }
    case "advisor": {
      const dirs: [number,number][] = [[-1,-1],[-1,1],[1,-1],[1,1]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr; const nc = c + dc;
        if (inOwnPalace(nr, nc, pieceColor)) addIfValid(nr, nc);
      }
      break;
    }
    case "elephant": {
      // Moves diagonally 2 steps, cannot cross river, blocked if "leg" occupied
      const dirs: [number,number][] = [[-2,-2],[-2,2],[2,-2],[2,2]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr; const nc = c + dc;
        if (!inBounds(nr, nc)) continue;
        // Can't cross river
        if (pieceColor === "red" && nr <= 4) continue;
        if (pieceColor === "black" && nr >= 5) continue;
        // Blocking piece at midpoint
        const mr = r + dr / 2; const mc = c + dc / 2;
        if (pieceAt(b, mr, mc) !== null) continue;
        addIfValid(nr, nc);
      }
      break;
    }
    case "horse": {
      // One orthogonal + one diagonal, blocked if first step occupied
      const dirs: [number,number,number,number][] = [
        [-1,0,-2,-1],[-1,0,-2,1],
        [1,0,2,-1],[1,0,2,1],
        [0,-1,-1,-2],[0,-1,1,-2],
        [0,1,-1,2],[0,1,1,2],
      ];
      for (const [br, bc, nr, nc] of dirs) {
        if (pieceAt(b, r + br, c + bc) !== null) continue;
        addIfValid(r + nr, c + nc);
      }
      break;
    }
    case "chariot": {
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]) {
        let nr = r + dr; let nc = c + dc;
        while (inBounds(nr, nc)) {
          const t = pieceAt(b, nr, nc);
          if (t) { if (t.color !== pieceColor) moves.push({ from, to: idx(nr, nc) }); break; }
          moves.push({ from, to: idx(nr, nc) });
          nr += dr; nc += dc;
        }
      }
      break;
    }
    case "cannon": {
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]) {
        let nr = r + dr; let nc = c + dc;
        let jumped = false;
        while (inBounds(nr, nc)) {
          const t = pieceAt(b, nr, nc);
          if (!jumped) {
            if (t) jumped = true;
            else moves.push({ from, to: idx(nr, nc) });
          } else {
            if (t) {
              if (t.color !== pieceColor) moves.push({ from, to: idx(nr, nc) });
              break;
            }
          }
          nr += dr; nc += dc;
        }
      }
      break;
    }
    case "soldier": {
      const fwd = pieceColor === "red" ? -1 : 1;
      // Forward always
      addIfValid(r + fwd, c);
      // Sideways only after crossing river
      if (crossedRiver(r, pieceColor)) {
        addIfValid(r, c - 1);
        addIfValid(r, c + 1);
      }
      break;
    }
  }

  // Filter: must not leave own general in check (flying general rule too)
  return moves.filter(mv => !isInCheck(applyXqMove(b, mv), piece.color));
}

export function allLegalMoves(b: XqBoard, color: XqColor): XqMove[] {
  const moves: XqMove[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = pieceAt(b, r, c);
      if (p && p.color === color) {
        moves.push(...legalMovesFrom(b, r, c));
      }
    }
  }
  return moves;
}

export function applyXqMove(b: XqBoard, mv: XqMove): XqBoard {
  const nb = [...b];
  nb[mv.to] = nb[mv.from] ?? null;
  nb[mv.from] = null;
  return nb;
}

function findGeneral(b: XqBoard, color: XqColor): number | null {
  for (let i = 0; i < b.length; i++) {
    const p = b[i];
    if (p && p.color === color && p.type === "general") return i;
  }
  return null;
}

export function isInCheck(b: XqBoard, color: XqColor): boolean {
  const genIdx = findGeneral(b, color);
  if (genIdx === null) return true;
  const gr = Math.floor(genIdx / COLS); const gc = genIdx % COLS;
  const opp: XqColor = color === "red" ? "black" : "red";
  // Check if any opponent piece attacks the general
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = pieceAt(b, r, c);
      if (!p || p.color !== opp) continue;
      const moves = legalMovesFromUnchecked(b, r, c);
      if (moves.some(mv => mv.to === genIdx)) return true;
    }
  }
  // Flying general rule: generals face each other with no pieces between
  const oppGenIdx = findGeneral(b, opp);
  if (oppGenIdx !== null) {
    const ogr = Math.floor(oppGenIdx / COLS); const ogc = oppGenIdx % COLS;
    if (gc === ogc) {
      const between = countPiecesBetween(b, gr, gc, ogr, ogc);
      if (between === 0) return true;
    }
  }
  return false;
}

// Unchecked version (no check filtering) to avoid infinite recursion
function legalMovesFromUnchecked(b: XqBoard, r: number, c: number): XqMove[] {
  const piece = pieceAt(b, r, c);
  if (!piece) return [];
  const from = idx(r, c);
  const pieceColor = piece.color;
  const moves: XqMove[] = [];

  function addIfValid(nr: number, nc: number) {
    if (!inBounds(nr, nc)) return;
    const t = pieceAt(b, nr, nc);
    if (t && t.color === pieceColor) return;
    moves.push({ from, to: idx(nr, nc) });
  }

  switch (piece.type) {
    case "general":
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]) {
        const nr = r + dr; const nc = c + dc;
        if (inOwnPalace(nr, nc, pieceColor)) addIfValid(nr, nc);
      }
      break;
    case "advisor":
      for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]] as [number,number][]) {
        const nr = r + dr; const nc = c + dc;
        if (inOwnPalace(nr, nc, pieceColor)) addIfValid(nr, nc);
      }
      break;
    case "elephant":
      for (const [dr, dc] of [[-2,-2],[-2,2],[2,-2],[2,2]] as [number,number][]) {
        const nr = r + dr; const nc = c + dc;
        if (!inBounds(nr, nc)) continue;
        if (pieceColor === "red" && nr <= 4) continue;
        if (pieceColor === "black" && nr >= 5) continue;
        if (pieceAt(b, r + dr/2, c + dc/2) !== null) continue;
        addIfValid(nr, nc);
      }
      break;
    case "horse":
      for (const [br, bc, nr, nc] of [[-1,0,-2,-1],[-1,0,-2,1],[1,0,2,-1],[1,0,2,1],[0,-1,-1,-2],[0,-1,1,-2],[0,1,-1,2],[0,1,1,2]] as [number,number,number,number][]) {
        if (pieceAt(b, r + br, c + bc) !== null) continue;
        addIfValid(r + nr, c + nc);
      }
      break;
    case "chariot":
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]) {
        let nr = r + dr; let nc = c + dc;
        while (inBounds(nr, nc)) {
          const t = pieceAt(b, nr, nc);
          if (t) { if (t.color !== pieceColor) moves.push({ from, to: idx(nr, nc) }); break; }
          moves.push({ from, to: idx(nr, nc) });
          nr += dr; nc += dc;
        }
      }
      break;
    case "cannon":
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]) {
        let nr = r + dr; let nc = c + dc; let jumped = false;
        while (inBounds(nr, nc)) {
          const t = pieceAt(b, nr, nc);
          if (!jumped) { if (t) jumped = true; else moves.push({ from, to: idx(nr, nc) }); }
          else { if (t) { if (t.color !== pieceColor) moves.push({ from, to: idx(nr, nc) }); break; } }
          nr += dr; nc += dc;
        }
      }
      break;
    case "soldier": {
      const fwd = pieceColor === "red" ? -1 : 1;
      addIfValid(r + fwd, c);
      if (crossedRiver(r, pieceColor)) { addIfValid(r, c - 1); addIfValid(r, c + 1); }
      break;
    }
  }
  return moves;
}

function materialValue(type: XqPieceType): number {
  switch (type) {
    case "general": return 10000;
    case "chariot": return 9;
    case "cannon": return 4;
    case "horse": return 4;
    case "advisor": return 2;
    case "elephant": return 2;
    case "soldier": return 1;
  }
}

function evaluate(b: XqBoard): number {
  // Black is maximizer (seat 1 / bot)
  let score = 0;
  for (const p of b) {
    if (!p) continue;
    const v = materialValue(p.type);
    if (p.color === "black") score += v;
    else score -= v;
  }
  return score;
}

interface BotS { board: XqBoard; turn: XqColor }

function botMoves(s: BotS): XqMove[] { return allLegalMoves(s.board, s.turn); }
function applyBotMove(s: BotS, mv: XqMove): BotS {
  return { board: applyXqMove(s.board, mv), turn: s.turn === "red" ? "black" : "red" };
}
function botIsTerminal(s: BotS): boolean { return botMoves(s).length === 0; }
function botEval(s: BotS): number { return evaluate(s.board); }

function getBotMove(b: XqBoard): XqMove | null {
  const s: BotS = { board: b, turn: "black" };
  const result = minimax<BotS, XqMove>(s, {
    depth: 2,
    moves: botMoves,
    apply: applyBotMove,
    isTerminal: botIsTerminal,
    evaluate: botEval,
    maximizing: (s) => s.turn === "black",
  });
  return result.move;
}

export interface XqSettings { dummy?: string }

export interface XqState {
  board: XqBoard;
  turn: XqColor;
  selected: number | null;
  winner: XqColor | "draw" | null;
  rngSeed: number;
  settings: XqSettings;
  legalTargets: number[];
}

export type XqAction =
  | { type: "select"; sq: number }
  | { type: "move"; to: number };

export function initialState(seed: number, settings: XqSettings): XqState {
  return {
    board: initialBoard(),
    turn: "red",
    selected: null,
    winner: null,
    rngSeed: seed,
    settings,
    legalTargets: [],
  };
}

function runBot(state: XqState): XqState {
  const mv = getBotMove(state.board);
  if (!mv) return { ...state, winner: "red" };
  const nb = applyXqMove(state.board, mv);
  const redMoves = allLegalMoves(nb, "red");
  const winner = redMoves.length === 0 ? "black" : null;
  return { ...state, board: nb, turn: "red", selected: null, legalTargets: [], winner };
}

export function reducer(state: XqState, action: XqAction): XqState {
  if (state.winner !== null) return state;
  if (state.turn !== "red") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (action.type === "select") {
    const sq = action.sq;
    const p = state.board[sq];
    if (!p || p.color !== "red") return { ...state, selected: null, legalTargets: [] };
    const r = Math.floor(sq / COLS); const c = sq % COLS;
    const targets = legalMovesFrom(state.board, r, c).map(m => m.to);
    return { ...state, selected: sq, legalTargets: targets };
  }

  if (action.type === "move") {
    if (state.selected === null) return state;
    if (!state.legalTargets.includes(action.to)) return state;
    const nb = applyXqMove(state.board, { from: state.selected, to: action.to });
    const rng2 = mulberry32(nextSeed);
    const ns2 = Math.floor(rng2() * 2 ** 31);
    const blackMoves = allLegalMoves(nb, "black");
    if (blackMoves.length === 0) {
      return { ...state, board: nb, turn: "black", selected: null, legalTargets: [], winner: "red", rngSeed: ns2 };
    }
    const botState: XqState = { ...state, board: nb, turn: "black", selected: null, legalTargets: [], winner: null, rngSeed: ns2 };
    return runBot(botState);
  }

  return state;
}

export function isTerminal(state: XqState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === "red") return { score: 100 };
  if (state.winner === "draw") return { score: 50 };
  return { score: 0 };
}
