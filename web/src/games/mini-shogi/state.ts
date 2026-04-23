import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Mini Shogi (Minishogi) — 5×5 board
// Pieces: King, Gold, Silver, Bishop, Rook, Pawn (one each per player)
// Promotion zone: top/bottom row. Same drop rules as Shogi.
// Player = "sente" (bottom, moves up), Bot = "gote" (top, moves down)

export type MiniColor = "sente" | "gote";
export type MiniBase = "king" | "gold" | "silver" | "bishop" | "rook" | "pawn";
export type MiniType = MiniBase | "prook" | "pbishop" | "psilver" | "ppawn";

export interface MiniPiece {
  color: MiniColor;
  type: MiniType;
  promoted: boolean;
}

export const ROWS = 5;
export const COLS = 5;
export const TOTAL = ROWS * COLS;

function idx(r: number, c: number): number { return r * COLS + c; }
function inBounds(r: number, c: number): boolean { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

export type MiniBoard = (MiniPiece | null)[];
export type MiniHand = { [K in MiniBase]?: number };

function emptyBoard(): MiniBoard { return new Array(TOTAL).fill(null); }
function pieceAt(b: MiniBoard, r: number, c: number): MiniPiece | null {
  if (!inBounds(r, c)) return null;
  return b[idx(r, c)] ?? null;
}

function demote(t: MiniType): MiniBase {
  if (t === "prook") return "rook";
  if (t === "pbishop") return "bishop";
  if (t === "psilver") return "silver";
  if (t === "ppawn") return "pawn";
  return t as MiniBase;
}
function promoteType(t: MiniBase): MiniType {
  if (t === "rook") return "prook";
  if (t === "bishop") return "pbishop";
  if (t === "silver") return "psilver";
  if (t === "pawn") return "ppawn";
  return t;
}

function inPromZone(r: number, color: MiniColor): boolean {
  return color === "sente" ? r === 0 : r === 4;
}

export function initialBoard(): MiniBoard {
  const b = emptyBoard();
  // Gote at top (row 0): R B S G K from left
  b[idx(0,0)] = { color:"gote", type:"rook", promoted:false };
  b[idx(0,1)] = { color:"gote", type:"bishop", promoted:false };
  b[idx(0,2)] = { color:"gote", type:"silver", promoted:false };
  b[idx(0,3)] = { color:"gote", type:"gold", promoted:false };
  b[idx(0,4)] = { color:"gote", type:"king", promoted:false };
  b[idx(1,4)] = { color:"gote", type:"pawn", promoted:false };
  // Sente at bottom (row 4): K G S B R from left
  b[idx(4,0)] = { color:"sente", type:"king", promoted:false };
  b[idx(4,1)] = { color:"sente", type:"gold", promoted:false };
  b[idx(4,2)] = { color:"sente", type:"silver", promoted:false };
  b[idx(4,3)] = { color:"sente", type:"bishop", promoted:false };
  b[idx(4,4)] = { color:"sente", type:"rook", promoted:false };
  b[idx(3,0)] = { color:"sente", type:"pawn", promoted:false };
  return b;
}

export function moveDests(b: MiniBoard, r: number, c: number): number[] {
  const piece = pieceAt(b, r, c);
  if (!piece) return [];
  const color = piece.color;
  const fwd = color === "sente" ? -1 : 1;
  const dests: number[] = [];

  function addSlide(dr: number, dc: number) {
    let nr = r+dr; let nc = c+dc;
    while (inBounds(nr,nc)) {
      const t = pieceAt(b,nr,nc);
      if (t) { if (t.color!==color) dests.push(idx(nr,nc)); break; }
      dests.push(idx(nr,nc));
      nr+=dr; nc+=dc;
    }
  }
  function addStep(dr: number, dc: number) {
    const nr=r+dr; const nc=c+dc;
    if (!inBounds(nr,nc)) return;
    const t=pieceAt(b,nr,nc);
    if (t&&t.color===color) return;
    dests.push(idx(nr,nc));
  }
  function goldMoves() {
    addStep(fwd,0); addStep(fwd,-1); addStep(fwd,1);
    addStep(0,-1); addStep(0,1); addStep(-fwd,0);
  }

  switch (piece.type) {
    case "king": for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) if(dr||dc) addStep(dr,dc); break;
    case "rook": addSlide(-1,0);addSlide(1,0);addSlide(0,-1);addSlide(0,1); break;
    case "prook": addSlide(-1,0);addSlide(1,0);addSlide(0,-1);addSlide(0,1); addStep(-1,-1);addStep(-1,1);addStep(1,-1);addStep(1,1); break;
    case "bishop": addSlide(-1,-1);addSlide(-1,1);addSlide(1,-1);addSlide(1,1); break;
    case "pbishop": addSlide(-1,-1);addSlide(-1,1);addSlide(1,-1);addSlide(1,1); addStep(-1,0);addStep(1,0);addStep(0,-1);addStep(0,1); break;
    case "gold": case "psilver": case "ppawn": goldMoves(); break;
    case "silver": addStep(fwd,-1);addStep(fwd,0);addStep(fwd,1);addStep(-fwd,-1);addStep(-fwd,1); break;
    case "pawn": addStep(fwd,0); break;
  }
  return dests;
}

function findKing(b: MiniBoard, color: MiniColor): number | null {
  for (let i=0;i<TOTAL;i++) { const p=b[i]; if(p&&p.color===color&&p.type==="king") return i; }
  return null;
}

export function isInCheck(b: MiniBoard, color: MiniColor): boolean {
  const ki = findKing(b, color);
  if (ki===null) return true;
  const opp: MiniColor = color==="sente"?"gote":"sente";
  for (let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) {
    const p=pieceAt(b,r,c);
    if (!p||p.color!==opp) continue;
    if (moveDests(b,r,c).includes(ki)) return true;
  }
  return false;
}

export interface MiniMove {
  from: number | null;
  to: number;
  dropType?: MiniBase;
  promote?: boolean;
}

export function applyMove(b: MiniBoard, hand: MiniHand, mv: MiniMove, color: MiniColor): { board: MiniBoard; hand: MiniHand } {
  const nb = [...b];
  const nh = { ...hand };
  if (mv.from === null && mv.dropType) {
    nb[mv.to] = { color, type: mv.dropType, promoted: false };
    nh[mv.dropType] = (nh[mv.dropType]??0) - 1;
  } else if (mv.from !== null) {
    const piece = nb[mv.from]!;
    const captured = nb[mv.to];
    nb[mv.from] = null;
    let nt: MiniType = piece.type;
    if (mv.promote && !piece.promoted) nt = promoteType(demote(piece.type));
    nb[mv.to] = { color, type: nt, promoted: mv.promote ? true : piece.promoted };
    if (captured) { const base=demote(captured.type); nh[base]=(nh[base]??0)+1; }
  }
  return { board: nb, hand: nh };
}

export function allLegalMoves(b: MiniBoard, color: MiniColor, hand: MiniHand): MiniMove[] {
  const moves: MiniMove[] = [];
  for (let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) {
    const p=pieceAt(b,r,c);
    if (!p||p.color!==color) continue;
    for (const to of moveDests(b,r,c)) {
      const tr=Math.floor(to/COLS);
      const base=demote(p.type);
      const canProm=!p.promoted&&(inPromZone(r,color)||inPromZone(tr,color))&&base!=="gold"&&base!=="king";
      if (canProm) { moves.push({from:idx(r,c),to,promote:true}); moves.push({from:idx(r,c),to,promote:false}); }
      else moves.push({from:idx(r,c),to,promote:false});
    }
  }
  // Drops
  for (const [typeStr, cnt] of Object.entries(hand)) {
    if (!cnt||cnt<=0) continue;
    const type=typeStr as MiniBase;
    for (let i=0;i<TOTAL;i++) {
      if (b[i]) continue;
      const r=Math.floor(i/COLS);
      if (type==="pawn"&&(color==="sente"?r===0:r===4)) continue;
      moves.push({from:null,to:i,dropType:type,promote:false});
    }
  }
  return moves;
}

function materialVal(t: MiniType): number {
  switch(t){case"king":return 10000;case"prook":return 13;case"rook":return 10;case"pbishop":return 11;case"bishop":return 8;case"gold":case"psilver":case"ppawn":return 6;case"silver":return 5;case"pawn":return 1;}
}

interface BotS { board: MiniBoard; sh: MiniHand; gh: MiniHand; turn: MiniColor }

function botMoves(s: BotS): MiniMove[] {
  const h=s.turn==="sente"?s.sh:s.gh;
  return allLegalMoves(s.board,s.turn,h).filter(mv=>{const{board:nb}=applyMove(s.board,h,mv,s.turn);return !isInCheck(nb,s.turn);}).slice(0,30);
}
function applyBotMove(s: BotS, mv: MiniMove): BotS {
  const h=s.turn==="sente"?s.sh:s.gh;
  const{board:nb,hand:nh}=applyMove(s.board,h,mv,s.turn);
  const opp:MiniColor=s.turn==="sente"?"gote":"sente";
  return{board:nb,sh:s.turn==="sente"?nh:s.sh,gh:s.turn==="gote"?nh:s.gh,turn:opp};
}
function botEval(s: BotS): number {
  let score=0;
  for(const p of s.board){if(!p)continue;const v=materialVal(p.type);score+=p.color==="gote"?v:-v;}
  return score;
}

function getBotMove(state: MiniShogiState): MiniMove|null {
  const s:BotS={board:state.board,sh:state.senteHand,gh:state.goteHand,turn:"gote"};
  const r=minimax<BotS,MiniMove>(s,{depth:2,moves:botMoves,apply:applyBotMove,isTerminal:s=>botMoves(s).length===0,evaluate:botEval,maximizing:s=>s.turn==="gote"});
  return r.move;
}

export interface MiniShogiSettings { dummy?: string }

export interface MiniShogiState {
  board: MiniBoard;
  senteHand: MiniHand;
  goteHand: MiniHand;
  turn: MiniColor;
  selected: number | null;
  selectedDrop: MiniBase | null;
  legalTargets: number[];
  winner: MiniColor | null;
  rngSeed: number;
  settings: MiniShogiSettings;
}

export type MiniShogiAction =
  | { type: "select"; sq: number }
  | { type: "selectDrop"; piece: MiniBase }
  | { type: "move"; to: number }
  | { type: "drop"; to: number };

export function initialState(seed: number, settings: MiniShogiSettings): MiniShogiState {
  return { board: initialBoard(), senteHand:{}, goteHand:{}, turn:"sente", selected:null, selectedDrop:null, legalTargets:[], winner:null, rngSeed:seed, settings };
}

function legalBoardMoves(state: MiniShogiState, sq: number): MiniMove[] {
  return allLegalMoves(state.board, "sente", state.senteHand)
    .filter(mv=>mv.from===sq)
    .filter(mv=>{const{board:nb}=applyMove(state.board,state.senteHand,mv,"sente");return !isInCheck(nb,"sente");});
}

function runBot(state: MiniShogiState): MiniShogiState {
  const mv=getBotMove(state);
  if(!mv) return {...state,winner:"sente"};
  const{board:nb,hand:nh}=applyMove(state.board,state.goteHand,mv,"gote");
  const rng=mulberry32(state.rngSeed); const ns=Math.floor(rng()*2**31);
  const sm=allLegalMoves(nb,"sente",state.senteHand).filter(m=>{const{board:tb}=applyMove(nb,state.senteHand,m,"sente");return !isInCheck(tb,"sente");});
  const winner=sm.length===0?"gote":null;
  return{...state,board:nb,goteHand:nh,turn:"sente",selected:null,selectedDrop:null,legalTargets:[],winner,rngSeed:ns};
}

export function reducer(state: MiniShogiState, action: MiniShogiAction): MiniShogiState {
  if(state.winner!==null) return state;
  if(state.turn!=="sente") return state;

  if(action.type==="selectDrop"){
    const cnt=state.senteHand[action.piece]??0;
    if(cnt<=0) return state;
    const targets:number[]=[];
    for(let i=0;i<TOTAL;i++){
      if(state.board[i]) continue;
      const r=Math.floor(i/COLS);
      if(action.piece==="pawn"&&r===0) continue;
      targets.push(i);
    }
    return{...state,selectedDrop:action.piece,selected:null,legalTargets:targets};
  }

  if(action.type==="drop"){
    if(!state.selectedDrop) return state;
    if(!state.legalTargets.includes(action.to)) return state;
    const mv:MiniMove={from:null,to:action.to,dropType:state.selectedDrop,promote:false};
    const{board:nb,hand:nh}=applyMove(state.board,state.senteHand,mv,"sente");
    if(isInCheck(nb,"sente")) return state;
    const rng=mulberry32(state.rngSeed); const ns=Math.floor(rng()*2**31);
    const bs:MiniShogiState={...state,board:nb,senteHand:nh,turn:"gote",selected:null,selectedDrop:null,legalTargets:[],winner:null,rngSeed:ns};
    return runBot(bs);
  }

  if(action.type==="select"){
    const p=state.board[action.sq];
    if(!p||p.color!=="sente") return{...state,selected:null,selectedDrop:null,legalTargets:[]};
    const moves=legalBoardMoves(state,action.sq);
    return{...state,selected:action.sq,selectedDrop:null,legalTargets:moves.map(m=>m.to)};
  }

  if(action.type==="move"){
    if(state.selected===null) return state;
    if(!state.legalTargets.includes(action.to)) return state;
    const moves=legalBoardMoves(state,state.selected).filter(m=>m.to===action.to);
    if(!moves.length) return state;
    const mv=moves.find(m=>m.promote)??moves[0]!;
    const{board:nb,hand:nh}=applyMove(state.board,state.senteHand,mv,"sente");
    if(isInCheck(nb,"sente")) return state;
    const rng=mulberry32(state.rngSeed); const ns=Math.floor(rng()*2**31);
    const bs:MiniShogiState={...state,board:nb,senteHand:nh,turn:"gote",selected:null,selectedDrop:null,legalTargets:[],winner:null,rngSeed:ns};
    return runBot(bs);
  }

  return state;
}

export function isTerminal(state: MiniShogiState): { score: number } | null {
  if(state.winner===null) return null;
  return{score:state.winner==="sente"?100:0};
}
