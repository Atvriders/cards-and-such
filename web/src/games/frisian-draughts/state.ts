import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Frisian Draughts: 10x10, orthogonal + diagonal captures, flying kings
// Key Frisian rule: pieces may capture ORTHOGONALLY (not just diagonally)
// Men move diagonally forward (like international draughts) but capture diagonally AND orthogonally
// Kings fly any direction (8 directions including orthogonal for capture)
// Mandatory capture, max capture count preferred

export interface FDPiece { color: "W" | "B"; king: boolean; }
export type FDCell = FDPiece | null;
export type FDBoard = FDCell[][];

export interface FDSettings { dummy?: string; }

export interface FDState {
  board: FDBoard;
  turn: "W" | "B";
  selected: [number, number] | null;
  winner: "W" | "B" | null;
  rngSeed: number;
  settings: FDSettings;
  mustContinueFrom: [number, number] | null;
}

export type FDAction = { type: "click"; row: number; col: number };

function newBoard(): FDBoard {
  const b: FDBoard = Array.from({length:10}, () => new Array(10).fill(null));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 10; c++) {
      if ((r + c) % 2 === 1) b[r]![c] = { color: "B", king: false };
    }
  }
  for (let r = 6; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if ((r + c) % 2 === 1) b[r]![c] = { color: "W", king: false };
    }
  }
  return b;
}

export function initialState(seed: number, settings: FDSettings): FDState {
  return { board: newBoard(), turn: "W", selected: null, winner: null, rngSeed: seed, settings, mustContinueFrom: null };
}

function inBounds(r: number, c: number): boolean { return r >= 0 && r < 10 && c >= 0 && c < 10; }

function get(b: FDBoard, r: number, c: number): FDCell { return inBounds(r,c) ? (b[r]![c] ?? null) : null; }

export interface FDMove {
  from: [number, number];
  to: [number, number];
  captures: [number, number][];
}

function findJumps(b: FDBoard, r: number, c: number, piece: FDPiece, captured: Set<string>): FDMove[] {
  const results: FDMove[] = [];
  // Diagonal and orthogonal capture directions
  const dirs: [number,number][] = [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]];
  const opp = piece.color === "W" ? "B" : "W";

  if (piece.king) {
    for (const [dr, dc] of dirs) {
      let cr = r+dr, cc = c+dc;
      let foundEnemy: [number,number] | null = null;
      while (inBounds(cr, cc)) {
        const cell = get(b, cr, cc);
        if (cell !== null && cell.color !== opp) break;
        if (cell !== null && cell.color === opp) {
          const key = `${cr},${cc}`;
          if (captured.has(key)) break;
          foundEnemy = [cr, cc];
          cr += dr; cc += dc;
          while (inBounds(cr, cc) && get(b, cr, cc) === null) {
            const newCap = new Set(captured); newCap.add(`${foundEnemy[0]},${foundEnemy[1]}`);
            const chains = findJumps(b, cr, cc, piece, newCap);
            if (chains.length === 0) results.push({ from: [r,c], to: [cr,cc], captures: [foundEnemy] });
            else chains.forEach(ch => results.push({ from: [r,c], to: ch.to, captures: [foundEnemy!, ...ch.captures] }));
            cr += dr; cc += dc;
          }
          break;
        }
        cr += dr; cc += dc;
      }
    }
  } else {
    for (const [dr, dc] of dirs) {
      const mr = r+dr, mc = c+dc;
      const lr = r+2*dr, lc = c+2*dc;
      if (!inBounds(mr,mc) || !inBounds(lr,lc)) continue;
      const mid = get(b, mr, mc);
      const land = get(b, lr, lc);
      const key = `${mr},${mc}`;
      if (mid !== null && mid.color === opp && land === null && !captured.has(key)) {
        const newCap = new Set(captured); newCap.add(key);
        const chains = findJumps(b, lr, lc, piece, newCap);
        if (chains.length === 0) results.push({ from: [r,c], to: [lr,lc], captures: [[mr,mc]] });
        else chains.forEach(ch => results.push({ from: [r,c], to: ch.to, captures: [[mr,mc], ...ch.captures] }));
      }
    }
  }
  return results;
}

export function getLegalMoves(b: FDBoard, color: "W" | "B", mustFrom: [number,number] | null): FDMove[] {
  const allMoves: FDMove[] = [];
  const jumps: FDMove[] = [];
  const sources: [number,number][] = mustFrom ? [mustFrom] : [];
  if (!mustFrom) {
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
      const p = get(b, r, c);
      if (p && p.color === color) sources.push([r, c]);
    }
  }
  for (const [r, c] of sources) {
    const piece = get(b, r, c);
    if (!piece || piece.color !== color) continue;
    jumps.push(...findJumps(b, r, c, piece, new Set()));
    if (!mustFrom) {
      const fwdDirs: [number,number][] = piece.color === "W" ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]];
      const moveDirs: [number,number][] = piece.king ? [[-1,-1],[-1,1],[1,-1],[1,1]] : fwdDirs;
      if (piece.king) {
        for (const [dr,dc] of moveDirs) {
          let nr = r+dr, nc = c+dc;
          while (inBounds(nr,nc) && get(b,nr,nc) === null) { allMoves.push({from:[r,c],to:[nr,nc],captures:[]}); nr+=dr; nc+=dc; }
        }
      } else {
        for (const [dr,dc] of moveDirs) {
          const nr = r+dr, nc = c+dc;
          if (inBounds(nr,nc) && get(b,nr,nc) === null) allMoves.push({from:[r,c],to:[nr,nc],captures:[]});
        }
      }
    }
  }
  if (jumps.length > 0) {
    const maxCap = Math.max(...jumps.map(m => m.captures.length));
    return jumps.filter(m => m.captures.length === maxCap);
  }
  return allMoves;
}

function applyMove(b: FDBoard, move: FDMove, color: "W"|"B"): { board: FDBoard; becomesKing: boolean } {
  const nb: FDBoard = b.map(row => [...row]);
  const piece = get(nb, move.from[0], move.from[1])!;
  for (const [cr, cc] of move.captures) nb[cr]![cc] = null;
  nb[move.from[0]]![move.from[1]] = null;
  const king = piece.king || (color === "W" && move.to[0] === 0) || (color === "B" && move.to[0] === 9);
  nb[move.to[0]]![move.to[1]] = { color, king };
  return { board: nb, becomesKing: king && !piece.king };
}

function countPieces(b: FDBoard, color: "W"|"B"): number {
  let n = 0;
  for (let r=0;r<10;r++) for(let c=0;c<10;c++) { const p = get(b,r,c); if (p && p.color === color) n++; }
  return n;
}

interface BotS { board: FDBoard; turn: "W"|"B"; mustFrom: [number,number]|null; }

function evaluateBot(b: FDBoard): number {
  let score = 0;
  for(let r=0;r<10;r++) for(let c=0;c<10;c++){
    const p=get(b,r,c);
    if(!p) continue;
    const v = p.king ? 3 : 1;
    score += p.color==="B" ? v : -v;
  }
  return score;
}

function runBot(state: FDState): FDState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2**31);
  const bs: BotS = { board: state.board, turn: "B", mustFrom: null };
  const result = minimax<BotS, FDMove>(bs, {
    depth: 3,
    moves: (s) => getLegalMoves(s.board, s.turn, s.mustFrom),
    apply: (s, m) => {
      const { board, becomesKing } = applyMove(s.board, m, s.turn);
      const opp = s.turn === "W" ? "B" : "W" as const;
      if (m.captures.length > 0 && !becomesKing) {
        const cont = findJumps(board, m.to[0], m.to[1], get(board, m.to[0], m.to[1])!, new Set());
        if (cont.length > 0) return { board, turn: s.turn, mustFrom: m.to };
      }
      return { board, turn: opp, mustFrom: null };
    },
    isTerminal: (s) => countPieces(s.board, s.turn) === 0 || getLegalMoves(s.board, s.turn, s.mustFrom).length === 0,
    evaluate: (s) => evaluateBot(s.board),
    maximizing: (s) => s.turn === "B",
  });
  if (!result.move) return { ...state, winner: "W", rngSeed: nextSeed };
  const { board, becomesKing } = applyMove(state.board, result.move, "B");
  const oppMoves = getLegalMoves(board, "W", null);
  const winner: "W"|"B"|null = oppMoves.length === 0 || countPieces(board,"W") === 0 ? "B" : null;
  return { ...state, board, turn: "W", selected: null, mustContinueFrom: null, winner, rngSeed: nextSeed };
}

export function reducer(state: FDState, action: FDAction): FDState {
  if (state.winner !== null || state.turn !== "W") return state;
  const { row, col } = action;
  const cell = get(state.board, row, col);
  const legalMoves = getLegalMoves(state.board, "W", state.mustContinueFrom);

  if (state.selected === null) {
    if (cell && cell.color === "W") return { ...state, selected: [row, col] };
    return state;
  }

  const [sr, sc] = state.selected;
  if (cell && cell.color === "W") return { ...state, selected: [row, col] };

  const match = legalMoves.find(m => m.from[0]===sr && m.from[1]===sc && m.to[0]===row && m.to[1]===col);
  if (!match) return state;

  const { board, becomesKing } = applyMove(state.board, match, "W");
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2**31);

  if (match.captures.length > 0 && !becomesKing) {
    const cont = findJumps(board, row, col, get(board,row,col)!, new Set());
    if (cont.length > 0) {
      return { ...state, board, selected: [row,col], mustContinueFrom: [row,col], rngSeed: nextSeed };
    }
  }

  const oppMoves = getLegalMoves(board, "B", null);
  const winner: "W"|"B"|null = oppMoves.length === 0 || countPieces(board,"B")===0 ? "W" : null;
  let next: FDState = { ...state, board, turn: "B", selected: null, mustContinueFrom: null, winner, rngSeed: nextSeed };
  if (!winner) next = runBot(next);
  return next;
}

export function isTerminal(state: FDState): { score: number } | null {
  if (state.winner === null) return null;
  const remaining = countPieces(state.board, "W");
  if (state.winner === "W") return { score: 50 + remaining * 5 };
  return { score: 0 };
}
