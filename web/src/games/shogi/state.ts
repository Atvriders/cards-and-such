import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Shogi — simplified 9×9 Japanese chess
// Player = "sente" (black, moves upward, row 8 home), Bot = "gote" (white, moves downward, row 0 home)
// Promotion zone: sente = rows 0-2, gote = rows 6-8
// Drops: captured pieces enter your hand and can be placed on any empty square

export type ShogiColor = "sente" | "gote";
export type ShogiBase = "king" | "rook" | "bishop" | "gold" | "silver" | "knight" | "lance" | "pawn";
export type ShogiType = ShogiBase | "prook" | "pbishop" | "psilver" | "pknight" | "plance" | "ppawn";

export interface ShogiPiece {
  color: ShogiColor;
  type: ShogiType;
  promoted: boolean;
}

export const ROWS = 9;
export const COLS = 9;
export const TOTAL = ROWS * COLS;

function idx(r: number, c: number): number { return r * COLS + c; }
function inBounds(r: number, c: number): boolean { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

export type ShogiBoard = (ShogiPiece | null)[];
export type Hand = { [K in ShogiBase]?: number };

function emptyBoard(): ShogiBoard { return new Array(TOTAL).fill(null); }

function pieceAt(b: ShogiBoard, r: number, c: number): ShogiPiece | null {
  if (!inBounds(r, c)) return null;
  return b[idx(r, c)] ?? null;
}

function demote(t: ShogiType): ShogiBase {
  if (t === "prook") return "rook";
  if (t === "pbishop") return "bishop";
  if (t === "psilver") return "silver";
  if (t === "pknight") return "knight";
  if (t === "plance") return "lance";
  if (t === "ppawn") return "pawn";
  return t as ShogiBase;
}

function promote(t: ShogiBase): ShogiType {
  if (t === "rook") return "prook";
  if (t === "bishop") return "pbishop";
  if (t === "silver") return "psilver";
  if (t === "knight") return "pknight";
  if (t === "lance") return "plance";
  if (t === "pawn") return "ppawn";
  return t;
}

function inPromotionZone(r: number, color: ShogiColor): boolean {
  return color === "sente" ? r <= 2 : r >= 6;
}

function mustPromote(type: ShogiBase, r: number, color: ShogiColor): boolean {
  const fwd = color === "sente" ? -1 : 1;
  if (type === "pawn" || type === "lance") {
    const lastRow = color === "sente" ? 0 : 8;
    return r === lastRow;
  }
  if (type === "knight") {
    const s = color === "sente";
    return s ? r <= 1 : r >= 7;
  }
  return false;
}

export function initialBoard(): ShogiBoard {
  const b = emptyBoard();
  // Gote (bot/white) at top — rows 0-2
  b[idx(0,0)] = { color:"gote", type:"lance", promoted:false };
  b[idx(0,1)] = { color:"gote", type:"knight", promoted:false };
  b[idx(0,2)] = { color:"gote", type:"silver", promoted:false };
  b[idx(0,3)] = { color:"gote", type:"gold", promoted:false };
  b[idx(0,4)] = { color:"gote", type:"king", promoted:false };
  b[idx(0,5)] = { color:"gote", type:"gold", promoted:false };
  b[idx(0,6)] = { color:"gote", type:"silver", promoted:false };
  b[idx(0,7)] = { color:"gote", type:"knight", promoted:false };
  b[idx(0,8)] = { color:"gote", type:"lance", promoted:false };
  b[idx(1,1)] = { color:"gote", type:"bishop", promoted:false };
  b[idx(1,7)] = { color:"gote", type:"rook", promoted:false };
  for (let c=0;c<9;c++) b[idx(2,c)] = { color:"gote", type:"pawn", promoted:false };
  // Sente (player/black) at bottom — rows 6-8
  b[idx(8,0)] = { color:"sente", type:"lance", promoted:false };
  b[idx(8,1)] = { color:"sente", type:"knight", promoted:false };
  b[idx(8,2)] = { color:"sente", type:"silver", promoted:false };
  b[idx(8,3)] = { color:"sente", type:"gold", promoted:false };
  b[idx(8,4)] = { color:"sente", type:"king", promoted:false };
  b[idx(8,5)] = { color:"sente", type:"gold", promoted:false };
  b[idx(8,6)] = { color:"sente", type:"silver", promoted:false };
  b[idx(8,7)] = { color:"sente", type:"knight", promoted:false };
  b[idx(8,8)] = { color:"sente", type:"lance", promoted:false };
  b[idx(7,7)] = { color:"sente", type:"bishop", promoted:false };
  b[idx(7,1)] = { color:"sente", type:"rook", promoted:false };
  for (let c=0;c<9;c++) b[idx(6,c)] = { color:"sente", type:"pawn", promoted:false };
  return b;
}

// Generate move destinations for a piece
export function moveDests(b: ShogiBoard, r: number, c: number): number[] {
  const piece = pieceAt(b, r, c);
  if (!piece) return [];
  const color = piece.color;
  const fwd = color === "sente" ? -1 : 1; // sente moves up (decreasing row)
  const dests: number[] = [];

  function addSlide(dr: number, dc: number) {
    let nr = r + dr; let nc = c + dc;
    while (inBounds(nr, nc)) {
      const t = pieceAt(b, nr, nc);
      if (t) { if (t.color !== color) dests.push(idx(nr, nc)); break; }
      dests.push(idx(nr, nc));
      nr += dr; nc += dc;
    }
  }
  function addStep(dr: number, dc: number) {
    const nr = r + dr; const nc = c + dc;
    if (!inBounds(nr, nc)) return;
    const t = pieceAt(b, nr, nc);
    if (t && t.color === color) return;
    dests.push(idx(nr, nc));
  }

  const goldDirs = (f: number) => [[f,0],[0,-1],[0,1],[-f,0],[f,-1],[f,1]] as [number,number][];

  switch (piece.type) {
    case "king":
      for (let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) if(dr||dc) addStep(dr,dc);
      break;
    case "rook":
      addSlide(-1,0); addSlide(1,0); addSlide(0,-1); addSlide(0,1);
      break;
    case "prook":
      addSlide(-1,0); addSlide(1,0); addSlide(0,-1); addSlide(0,1);
      addStep(-1,-1); addStep(-1,1); addStep(1,-1); addStep(1,1);
      break;
    case "bishop":
      addSlide(-1,-1); addSlide(-1,1); addSlide(1,-1); addSlide(1,1);
      break;
    case "pbishop":
      addSlide(-1,-1); addSlide(-1,1); addSlide(1,-1); addSlide(1,1);
      addStep(-1,0); addStep(1,0); addStep(0,-1); addStep(0,1);
      break;
    case "gold": case "psilver": case "pknight": case "plance": case "ppawn":
      for (const [dr,dc] of goldDirs(fwd)) addStep(dr, dc);
      break;
    case "silver":
      for (const [dr,dc] of [[fwd,-1],[fwd,0],[fwd,1],[-fwd,-1],[-fwd,1]] as [number,number][]) addStep(dr,dc);
      break;
    case "psilver":
      for (const [dr,dc] of goldDirs(fwd)) addStep(dr,dc);
      break;
    case "knight":
      addStep(2*fwd, -1); addStep(2*fwd, 1);
      break;
    case "lance":
      addSlide(fwd, 0);
      break;
    case "pawn":
      addStep(fwd, 0);
      break;
  }
  return dests;
}

export interface ShogiMove {
  from: number | null; // null = drop
  to: number;
  dropType?: ShogiBase; // for drops
  promote?: boolean;
}

export function allLegalMoves(b: ShogiBoard, color: ShogiColor, hand: Hand): ShogiMove[] {
  const moves: ShogiMove[] = [];
  // Board moves
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = pieceAt(b, r, c);
      if (!p || p.color !== color) continue;
      for (const to of moveDests(b, r, c)) {
        const tr = Math.floor(to / COLS);
        const base = demote(p.type);
        const canProm = !p.promoted && (inPromotionZone(r, color) || inPromotionZone(tr, color))
          && base !== "gold" && base !== "king";
        const must = mustPromote(base, tr, color);
        if (must) {
          moves.push({ from: idx(r,c), to, promote: true });
        } else if (canProm) {
          moves.push({ from: idx(r,c), to, promote: true });
          moves.push({ from: idx(r,c), to, promote: false });
        } else {
          moves.push({ from: idx(r,c), to, promote: false });
        }
      }
    }
  }
  // Drop moves
  const empties: number[] = [];
  for (let i = 0; i < TOTAL; i++) if (!b[i]) empties.push(i);
  for (const [typeStr, count] of Object.entries(hand)) {
    if (!count || count <= 0) continue;
    const type = typeStr as ShogiBase;
    for (const sq of empties) {
      const r = Math.floor(sq / COLS);
      // Pawn: can't drop on last rank, can't drop in col with own pawn (simplified: just last rank)
      if (type === "pawn" && (color === "sente" ? r === 0 : r === 8)) continue;
      if (type === "lance" && (color === "sente" ? r === 0 : r === 8)) continue;
      if (type === "knight" && (color === "sente" ? r <= 1 : r >= 7)) continue;
      // No pawn drop checkmate (simplified: skip this rule)
      moves.push({ from: null, to: sq, dropType: type, promote: false });
    }
  }
  return moves;
}

function findKing(b: ShogiBoard, color: ShogiColor): number | null {
  for (let i = 0; i < TOTAL; i++) {
    const p = b[i];
    if (p && p.color === color && p.type === "king") return i;
  }
  return null;
}

export function isInCheck(b: ShogiBoard, color: ShogiColor): boolean {
  const kingIdx = findKing(b, color);
  if (kingIdx === null) return true;
  const opp: ShogiColor = color === "sente" ? "gote" : "sente";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = pieceAt(b, r, c);
      if (!p || p.color !== opp) continue;
      if (moveDests(b, r, c).includes(kingIdx)) return true;
    }
  }
  return false;
}

export function applyMove(b: ShogiBoard, hand: Hand, mv: ShogiMove, color: ShogiColor): { board: ShogiBoard; hand: Hand; capturedHand: Hand } {
  const nb = [...b];
  const nh = { ...hand };
  const opp: ShogiColor = color === "sente" ? "gote" : "sente";
  let capturedHand = { ...hand };

  if (mv.from === null && mv.dropType) {
    // Drop
    nb[mv.to] = { color, type: mv.dropType, promoted: false };
    nh[mv.dropType] = (nh[mv.dropType] ?? 0) - 1;
    capturedHand = nh;
  } else if (mv.from !== null) {
    const piece = nb[mv.from]!;
    const captured = nb[mv.to];
    nb[mv.from] = null;
    let newType: ShogiType = piece.type;
    if (mv.promote) {
      newType = promote(demote(piece.type));
    }
    nb[mv.to] = { color, type: newType, promoted: mv.promote ?? piece.promoted };
    if (captured) {
      const base = demote(captured.type);
      nh[base] = (nh[base] ?? 0) + 1;
    }
    capturedHand = nh;
  }
  return { board: nb, hand: capturedHand, capturedHand };
}

function materialVal(type: ShogiType): number {
  switch (type) {
    case "king": return 10000;
    case "prook": return 13;
    case "rook": return 10;
    case "pbishop": return 11;
    case "bishop": return 8;
    case "gold": case "psilver": case "pknight": case "plance": case "ppawn": return 6;
    case "silver": return 5;
    case "knight": return 3;
    case "lance": return 3;
    case "pawn": return 1;
  }
}

interface BotS { board: ShogiBoard; senteHand: Hand; goteHand: Hand; turn: ShogiColor }

function botMoves(s: BotS): ShogiMove[] {
  const h = s.turn === "sente" ? s.senteHand : s.goteHand;
  return allLegalMoves(s.board, s.turn, h).filter(mv => {
    const { board: nb } = applyMove(s.board, h, mv, s.turn);
    return !isInCheck(nb, s.turn);
  }).slice(0, 40); // limit branching for performance
}

function applyBotMove(s: BotS, mv: ShogiMove): BotS {
  const h = s.turn === "sente" ? s.senteHand : s.goteHand;
  const { board: nb, hand: nh } = applyMove(s.board, h, mv, s.turn);
  const opp: ShogiColor = s.turn === "sente" ? "gote" : "sente";
  return {
    board: nb,
    senteHand: s.turn === "sente" ? nh : s.senteHand,
    goteHand: s.turn === "gote" ? nh : s.goteHand,
    turn: opp,
  };
}

function botEval(s: BotS): number {
  let score = 0;
  for (const p of s.board) {
    if (!p) continue;
    const v = materialVal(p.type);
    score += p.color === "gote" ? v : -v;
  }
  // Hand material
  for (const [t, cnt] of Object.entries(s.goteHand)) if (cnt) score += cnt * materialVal(t as ShogiType) * 0.8;
  for (const [t, cnt] of Object.entries(s.senteHand)) if (cnt) score -= cnt * materialVal(t as ShogiType) * 0.8;
  return score;
}

function getBotMove(state: ShogiState): ShogiMove | null {
  const s: BotS = { board: state.board, senteHand: state.senteHand, goteHand: state.goteHand, turn: "gote" };
  const result = minimax<BotS, ShogiMove>(s, {
    depth: 2,
    moves: botMoves,
    apply: applyBotMove,
    isTerminal: (s) => botMoves(s).length === 0,
    evaluate: botEval,
    maximizing: (s) => s.turn === "gote",
  });
  return result.move;
}

export interface ShogiSettings { dummy?: string }

export interface ShogiState {
  board: ShogiBoard;
  senteHand: Hand; // player hand
  goteHand: Hand;  // bot hand
  turn: ShogiColor;
  selected: number | null;
  selectedDrop: ShogiBase | null;
  legalTargets: number[];
  winner: ShogiColor | null;
  rngSeed: number;
  settings: ShogiSettings;
}

export type ShogiAction =
  | { type: "select"; sq: number }
  | { type: "selectDrop"; piece: ShogiBase }
  | { type: "move"; to: number; promote: boolean }
  | { type: "drop"; to: number };

export function initialState(seed: number, settings: ShogiSettings): ShogiState {
  return {
    board: initialBoard(),
    senteHand: {}, goteHand: {},
    turn: "sente",
    selected: null, selectedDrop: null,
    legalTargets: [],
    winner: null,
    rngSeed: seed, settings,
  };
}

function legalMovesForSq(state: ShogiState, sq: number): ShogiMove[] {
  const r = Math.floor(sq / COLS); const c = sq % COLS;
  const p = pieceAt(state.board, r, c);
  if (!p || p.color !== "sente") return [];
  return allLegalMoves(state.board, "sente", state.senteHand)
    .filter(mv => mv.from === sq)
    .filter(mv => {
      const { board: nb } = applyMove(state.board, state.senteHand, mv, "sente");
      return !isInCheck(nb, "sente");
    });
}

function runBot(state: ShogiState): ShogiState {
  const mv = getBotMove(state);
  if (!mv) return { ...state, winner: "sente" };
  const h = state.goteHand;
  const { board: nb, hand: nh } = applyMove(state.board, h, mv, "gote");
  if (isInCheck(nb, "gote")) return { ...state, winner: "sente" };
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const senteMoves = allLegalMoves(nb, "sente", state.senteHand)
    .filter(m => { const { board: tb } = applyMove(nb, state.senteHand, m, "sente"); return !isInCheck(tb, "sente"); });
  const winner = senteMoves.length === 0 ? "gote" : null;
  return { ...state, board: nb, goteHand: nh, turn: "sente", selected: null, selectedDrop: null, legalTargets: [], winner, rngSeed: nextSeed };
}

export function reducer(state: ShogiState, action: ShogiAction): ShogiState {
  if (state.winner !== null) return state;
  if (state.turn !== "sente") return state;

  if (action.type === "selectDrop") {
    const count = state.senteHand[action.piece] ?? 0;
    if (count <= 0) return state;
    // Show all empty squares as targets
    const targets: number[] = [];
    for (let i = 0; i < TOTAL; i++) {
      if (!state.board[i]) {
        const r = Math.floor(i / COLS);
        if (action.piece === "pawn" && r === 0) continue;
        if (action.piece === "lance" && r === 0) continue;
        if (action.piece === "knight" && r <= 1) continue;
        targets.push(i);
      }
    }
    return { ...state, selectedDrop: action.piece, selected: null, legalTargets: targets };
  }

  if (action.type === "drop") {
    if (!state.selectedDrop) return state;
    if (!state.legalTargets.includes(action.to)) return state;
    const mv: ShogiMove = { from: null, to: action.to, dropType: state.selectedDrop, promote: false };
    const { board: nb, hand: nh } = applyMove(state.board, state.senteHand, mv, "sente");
    if (isInCheck(nb, "sente")) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const botState: ShogiState = { ...state, board: nb, senteHand: nh, turn: "gote", selected: null, selectedDrop: null, legalTargets: [], winner: null, rngSeed: nextSeed };
    return runBot(botState);
  }

  if (action.type === "select") {
    const sq = action.sq;
    const p = state.board[sq];
    if (!p || p.color !== "sente") return { ...state, selected: null, selectedDrop: null, legalTargets: [] };
    const moves = legalMovesForSq(state, sq);
    return { ...state, selected: sq, selectedDrop: null, legalTargets: moves.map(m => m.to) };
  }

  if (action.type === "move") {
    if (state.selected === null) return state;
    if (!state.legalTargets.includes(action.to)) return state;
    const sq = state.selected;
    const moves = legalMovesForSq(state, sq).filter(m => m.to === action.to);
    if (moves.length === 0) return state;
    // Pick promoted version if available, else non-promoted
    const mv = moves.find(m => m.promote) ?? moves[0]!;
    const { board: nb, hand: nh } = applyMove(state.board, state.senteHand, mv, "sente");
    if (isInCheck(nb, "sente")) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const botState: ShogiState = { ...state, board: nb, senteHand: nh, turn: "gote", selected: null, selectedDrop: null, legalTargets: [], winner: null, rngSeed: nextSeed };
    return runBot(botState);
  }

  return state;
}

export function isTerminal(state: ShogiState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "sente" ? 100 : 0 };
}
