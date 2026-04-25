import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Russian Draughts: 8×8 board, 12 pieces per side
// Men capture forward AND backward (unlike American checkers)
// Flying kings (damki) slide multiple squares
// Promotion mid-chain: if man reaches back row during capture, it becomes king and continues jumping
// Mandatory capture (but NOT necessarily max-count)

export type RDCell = { color: "W"|"B"; king: boolean } | null;
export type RDBoard = RDCell[][];

export interface RDSettings { dummy?: string; }

export interface RDState {
  board: RDBoard;
  turn: "W"|"B";
  selected: [number,number] | null;
  winner: "W"|"B" | null;
  rngSeed: number;
  settings: RDSettings;
  mustContinueFrom: [number,number] | null;
}

export type RDAction = { type: "click"; row: number; col: number };

function newBoard(): RDBoard {
  const b: RDBoard = Array.from({length:8}, () => new Array(8).fill(null));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) b[r]![c] = { color: "B", king: false };
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) b[r]![c] = { color: "W", king: false };
    }
  }
  return b;
}

export function initialState(seed: number, settings: RDSettings): RDState {
  return { board: newBoard(), turn: "W", selected: null, winner: null, rngSeed: seed, settings, mustContinueFrom: null };
}

function inBounds(r: number, c: number): boolean { return r >= 0 && r < 8 && c >= 0 && c < 8; }
function get(b: RDBoard, r: number, c: number): RDCell { return inBounds(r,c) ? (b[r]![c] ?? null) : null; }

export interface RDMove { from: [number,number]; to: [number,number]; captures: [number,number][]; }

function findJumps(b: RDBoard, r: number, c: number, piece: NonNullable<RDCell>, captured: Set<string>): RDMove[] {
  const results: RDMove[] = [];
  const opp = piece.color === "W" ? "B" : "W";
  const dirs: [number,number][] = [[-1,-1],[-1,1],[1,-1],[1,1]];

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
            const nc = new Set(captured); nc.add(`${foundEnemy![0]},${foundEnemy![1]}`);
            const ch = findJumps(b, cr, cc, piece, nc);
            if (ch.length === 0) results.push({ from: [r,c], to: [cr,cc], captures: [foundEnemy!] });
            else ch.forEach(x => results.push({ from:[r,c], to: x.to, captures: [foundEnemy!, ...x.captures] }));
            cr += dr; cc += dc;
          }
          break;
        }
        cr += dr; cc += dc;
      }
    }
  } else {
    // Men jump in all 4 diagonal directions (Russian rule: backward capture allowed)
    for (const [dr, dc] of dirs) {
      const mr = r+dr, mc = c+dc;
      const lr = r+2*dr, lc = c+2*dc;
      if (!inBounds(mr,mc) || !inBounds(lr,lc)) continue;
      const mid = get(b, mr, mc);
      const land = get(b, lr, lc);
      const key = `${mr},${mc}`;
      if (mid !== null && mid.color === opp && land === null && !captured.has(key)) {
        // Check if becomes king on landing (Russian: becomes king mid-chain)
        const becomesKing = (piece.color === "W" && lr === 0) || (piece.color === "B" && lr === 7);
        const movedPiece: NonNullable<RDCell> = becomesKing ? { ...piece, king: true } : piece;
        const nc = new Set(captured); nc.add(key);
        const ch = findJumps(b, lr, lc, movedPiece, nc);
        if (ch.length === 0) results.push({ from:[r,c], to:[lr,lc], captures:[[mr,mc]] });
        else ch.forEach(x => results.push({ from:[r,c], to: x.to, captures:[[mr,mc],...x.captures] }));
      }
    }
  }
  return results;
}

export function getLegalMoves(b: RDBoard, color: "W"|"B", mustFrom: [number,number]|null): RDMove[] {
  const jumps: RDMove[] = [];
  const simples: RDMove[] = [];
  const sources: [number,number][] = mustFrom ? [mustFrom] : [];
  if (!mustFrom) {
    for (let r=0;r<8;r++) for(let c=0;c<8;c++) { const p=get(b,r,c); if(p&&p.color===color) sources.push([r,c]); }
  }
  for (const [r,c] of sources) {
    const piece = get(b,r,c);
    if (!piece || piece.color !== color) continue;
    jumps.push(...findJumps(b, r, c, piece, new Set()));
    if (!mustFrom) {
      const fwdDirs: [number,number][] = color==="W" ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]];
      const dirs = piece.king ? [[-1,-1],[-1,1],[1,-1],[1,1]] as [number,number][] : fwdDirs;
      if (piece.king) {
        for (const [dr,dc] of dirs) {
          let nr=r+dr, nc=c+dc;
          while(inBounds(nr,nc) && get(b,nr,nc)===null){ simples.push({from:[r,c],to:[nr,nc],captures:[]}); nr+=dr; nc+=dc; }
        }
      } else {
        for (const [dr,dc] of dirs) {
          const nr=r+dr, nc=c+dc;
          if(inBounds(nr,nc) && get(b,nr,nc)===null) simples.push({from:[r,c],to:[nr,nc],captures:[]});
        }
      }
    }
  }
  return jumps.length > 0 ? jumps : simples;
}

function applyMove(b: RDBoard, m: RDMove, color: "W"|"B"): RDBoard {
  const nb = b.map(row => [...row]) as RDBoard;
  const piece = get(nb, m.from[0], m.from[1])!;
  for (const [cr,cc] of m.captures) nb[cr]![cc] = null;
  nb[m.from[0]]![m.from[1]] = null;
  const king = piece.king || (color==="W"&&m.to[0]===0) || (color==="B"&&m.to[0]===7);
  nb[m.to[0]]![m.to[1]] = { color, king };
  return nb;
}

function countPieces(b: RDBoard, color: "W"|"B"): number {
  let n=0; for(const row of b) for(const c of row) { if(c?.color===color) n++; } return n;
}

function evaluateBot(b: RDBoard): number {
  let s=0;
  for(const row of b) for(const c of row) {
    if(!c) continue;
    const v = c.king ? 3 : 1;
    s += c.color==="B" ? v : -v;
  }
  return s;
}

interface BotS { board: RDBoard; turn: "W"|"B"; mustFrom:[number,number]|null; }

function runBot(state: RDState): RDState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2**31);
  const bs: BotS = { board: state.board, turn: "B", mustFrom: null };
  const result = minimax<BotS, RDMove>(bs, {
    depth: 4,
    moves: s => getLegalMoves(s.board, s.turn, s.mustFrom),
    apply: (s, m) => {
      const nb = applyMove(s.board, m, s.turn);
      if (m.captures.length > 0) {
        const piece = get(nb, m.to[0], m.to[1]);
        const cont = piece ? findJumps(nb, m.to[0], m.to[1], piece, new Set()) : [];
        if (cont.length > 0) return { board: nb, turn: s.turn, mustFrom: m.to };
      }
      return { board: nb, turn: s.turn==="W"?"B":"W", mustFrom: null };
    },
    isTerminal: s => countPieces(s.board, s.turn)===0 || getLegalMoves(s.board, s.turn, s.mustFrom).length===0,
    evaluate: s => evaluateBot(s.board),
    maximizing: s => s.turn==="B",
  });
  if (!result.move) return { ...state, winner: "W", rngSeed: nextSeed };
  const nb = applyMove(state.board, result.move, "B");
  const oppMoves = getLegalMoves(nb, "W", null);
  const winner: "W"|"B"|null = oppMoves.length===0||countPieces(nb,"W")===0 ? "B" : null;
  return { ...state, board: nb, turn: "W", selected: null, mustContinueFrom: null, winner, rngSeed: nextSeed };
}

export function reducer(state: RDState, action: RDAction): RDState {
  if (state.winner!==null || state.turn!=="W") return state;
  const {row, col} = action;
  const cell = get(state.board, row, col);
  const legalMoves = getLegalMoves(state.board, "W", state.mustContinueFrom);

  if (state.selected===null) {
    if (cell?.color==="W") return { ...state, selected: [row,col] };
    return state;
  }

  const [sr,sc] = state.selected;
  if (cell?.color==="W") return { ...state, selected:[row,col] };

  const match = legalMoves.find(m => m.from[0]===sr&&m.from[1]===sc&&m.to[0]===row&&m.to[1]===col);
  if (!match) return state;

  const nb = applyMove(state.board, match, "W");
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2**31);

  if (match.captures.length > 0) {
    const piece = get(nb, row, col);
    const cont = piece ? findJumps(nb, row, col, piece, new Set()) : [];
    if (cont.length > 0) {
      return { ...state, board: nb, selected:[row,col], mustContinueFrom:[row,col], rngSeed: nextSeed };
    }
  }

  const oppMoves = getLegalMoves(nb, "B", null);
  const winner: "W"|"B"|null = oppMoves.length===0||countPieces(nb,"B")===0 ? "W" : null;
  let next: RDState = { ...state, board: nb, turn: "B", selected: null, mustContinueFrom: null, winner, rngSeed: nextSeed };
  if (!winner) next = runBot(next);
  return next;
}

export function isTerminal(state: RDState): { score: number } | null {
  if (state.winner===null) return null;
  if (state.winner==="W") return { score: 50 + countPieces(state.board,"W")*5 };
  return { score: 0 };
}
