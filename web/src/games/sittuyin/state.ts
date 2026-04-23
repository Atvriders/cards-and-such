import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Sittuyin (Burmese Chess) — simplified
// 8×8 board. Auto-placed opening (skip setup phase).
// Player = "white" (bottom), Bot = "black" (top)
// Pieces: King (Sit-ke), General/Thida (queen-like), Elephant (Ein), Horse (Myin), Chariot (Yahhta), Pawn (Ne)
// Thida: moves one step diagonally
// Ein (elephant): moves one step diagonally or two steps diagonally (leaping)
// Myin (horse): L-shape
// Yahhta (chariot/rook): slides orthogonally
// Ne (pawn): moves one step forward, captures diagonally forward
// Promotion: pawn promotes to thida when it reaches last rank or diagonally adjacent to own thida

export type SittuyinColor = "white" | "black";
export type SittuyinPieceType = "king" | "thida" | "ein" | "myin" | "yahhta" | "ne" | "pne"; // pne = promoted pawn (becomes thida)

export interface SittuyinPiece {
  color: SittuyinColor;
  type: SittuyinPieceType;
}

export const ROWS = 8;
export const COLS = 8;

function idx(r: number, c: number): number { return r * COLS + c; }
function inBounds(r: number, c: number): boolean { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

export type SittuyinBoard = (SittuyinPiece | null)[];

function emptyBoard(): SittuyinBoard { return new Array(ROWS * COLS).fill(null); }
function pieceAt(b: SittuyinBoard, r: number, c: number): SittuyinPiece | null {
  if (!inBounds(r, c)) return null;
  return b[idx(r, c)] ?? null;
}

export function initialBoard(): SittuyinBoard {
  const b = emptyBoard();
  // Standard Sittuyin opening layout (auto-placed)
  // Black (top)
  b[idx(0,0)] = { color:"black", type:"yahhta" };
  b[idx(0,1)] = { color:"black", type:"myin" };
  b[idx(0,2)] = { color:"black", type:"ein" };
  b[idx(0,3)] = { color:"black", type:"thida" };
  b[idx(0,4)] = { color:"black", type:"king" };
  b[idx(0,5)] = { color:"black", type:"ein" };
  b[idx(0,6)] = { color:"black", type:"myin" };
  b[idx(0,7)] = { color:"black", type:"yahhta" };
  b[idx(2,1)] = { color:"black", type:"ne" };
  b[idx(2,3)] = { color:"black", type:"ne" };
  b[idx(2,5)] = { color:"black", type:"ne" };
  b[idx(2,7)] = { color:"black", type:"ne" };
  b[idx(3,0)] = { color:"black", type:"ne" };
  b[idx(3,2)] = { color:"black", type:"ne" };
  b[idx(3,4)] = { color:"black", type:"ne" };
  b[idx(3,6)] = { color:"black", type:"ne" };
  // White (bottom)
  b[idx(7,0)] = { color:"white", type:"yahhta" };
  b[idx(7,1)] = { color:"white", type:"myin" };
  b[idx(7,2)] = { color:"white", type:"ein" };
  b[idx(7,3)] = { color:"white", type:"thida" };
  b[idx(7,4)] = { color:"white", type:"king" };
  b[idx(7,5)] = { color:"white", type:"ein" };
  b[idx(7,6)] = { color:"white", type:"myin" };
  b[idx(7,7)] = { color:"white", type:"yahhta" };
  b[idx(5,0)] = { color:"white", type:"ne" };
  b[idx(5,2)] = { color:"white", type:"ne" };
  b[idx(5,4)] = { color:"white", type:"ne" };
  b[idx(5,6)] = { color:"white", type:"ne" };
  b[idx(4,1)] = { color:"white", type:"ne" };
  b[idx(4,3)] = { color:"white", type:"ne" };
  b[idx(4,5)] = { color:"white", type:"ne" };
  b[idx(4,7)] = { color:"white", type:"ne" };
  return b;
}

export function moveDests(b: SittuyinBoard, r: number, c: number): number[] {
  const piece = pieceAt(b, r, c);
  if (!piece) return [];
  const color = piece.color;
  const fwd = color === "white" ? -1 : 1;
  const dests: number[] = [];

  function addStep(dr: number, dc: number) {
    const nr=r+dr;const nc=c+dc;
    if(!inBounds(nr,nc)) return;
    const t=pieceAt(b,nr,nc);
    if(t&&t.color===color) return;
    dests.push(idx(nr,nc));
  }
  function addSlide(dr: number, dc: number) {
    let nr=r+dr;let nc=c+dc;
    while(inBounds(nr,nc)){
      const t=pieceAt(b,nr,nc);
      if(t){if(t.color!==color)dests.push(idx(nr,nc));break;}
      dests.push(idx(nr,nc));
      nr+=dr;nc+=dc;
    }
  }

  switch(piece.type){
    case "king":
      for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) if(dr||dc) addStep(dr,dc);
      break;
    case "thida": case "pne":
      // Thida moves one step diagonally
      addStep(-1,-1);addStep(-1,1);addStep(1,-1);addStep(1,1);
      break;
    case "ein":
      // Elephant moves one step diagonally or two steps diagonally (leaping)
      addStep(-1,-1);addStep(-1,1);addStep(1,-1);addStep(1,1);
      addStep(-2,-2);addStep(-2,2);addStep(2,-2);addStep(2,2);
      break;
    case "myin":
      for(const[dr,dc] of [[-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[-1,2],[1,-2],[1,2]] as [number,number][]) addStep(dr,dc);
      break;
    case "yahhta":
      addSlide(-1,0);addSlide(1,0);addSlide(0,-1);addSlide(0,1);
      break;
    case "ne":
      // Forward only (no two-step start)
      {const nr=r+fwd;const nc=c;if(inBounds(nr,nc)&&!pieceAt(b,nr,nc))dests.push(idx(nr,nc));}
      for(const dc of[-1,1]){const nr=r+fwd;const nc=c+dc;if(!inBounds(nr,nc))continue;const t=pieceAt(b,nr,nc);if(t&&t.color!==color)dests.push(idx(nr,nc));}
      break;
  }
  return dests;
}

function findKing(b: SittuyinBoard, color: SittuyinColor): number | null {
  for(let i=0;i<b.length;i++){const p=b[i];if(p&&p.color===color&&p.type==="king")return i;}
  return null;
}

export function isInCheck(b: SittuyinBoard, color: SittuyinColor): boolean {
  const ki=findKing(b,color);
  if(ki===null) return true;
  const opp:SittuyinColor=color==="white"?"black":"white";
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const p=pieceAt(b,r,c);
    if(!p||p.color!==opp) continue;
    if(moveDests(b,r,c).includes(ki)) return true;
  }
  return false;
}

export interface SittuyinMove { from: number; to: number }

export function applySittuyinMove(b: SittuyinBoard, mv: SittuyinMove, hasOwnThida: boolean): SittuyinBoard {
  const nb=[...b];
  const piece=nb[mv.from]!;
  nb[mv.from]=null;
  let nt=piece.type;
  // Pawn promotion: reaches back rank OR diagonal to own thida (simplified: just last rank)
  if(piece.type==="ne"){
    const tr=Math.floor(mv.to/COLS);
    if((piece.color==="white"&&tr===0)||(piece.color==="black"&&tr===7)) nt="pne";
  }
  nb[mv.to]={color:piece.color,type:nt};
  return nb;
}

export function allLegalMoves(b: SittuyinBoard, color: SittuyinColor): SittuyinMove[] {
  const hasThida=b.some(p=>p&&p.color===color&&p.type==="thida");
  const moves: SittuyinMove[] = [];
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const p=pieceAt(b,r,c);
    if(!p||p.color!==color) continue;
    for(const to of moveDests(b,r,c)){
      const nb=applySittuyinMove(b,{from:idx(r,c),to},hasThida);
      if(!isInCheck(nb,color)) moves.push({from:idx(r,c),to});
    }
  }
  return moves;
}

function materialVal(t: SittuyinPieceType): number {
  switch(t){case"king":return 10000;case"yahhta":return 5;case"myin":return 3;case"ein":return 3;case"thida":return 2;case"pne":return 2;case"ne":return 1;}
}

interface BotS { board: SittuyinBoard; turn: SittuyinColor }
function botMoves(s: BotS): SittuyinMove[] { return allLegalMoves(s.board,s.turn); }
function applyBotMove(s: BotS, mv: SittuyinMove): BotS {
  const ht=s.board.some(p=>p&&p.color===s.turn&&p.type==="thida");
  return{board:applySittuyinMove(s.board,mv,ht),turn:s.turn==="white"?"black":"white"};
}
function botEval(s: BotS): number {
  let score=0;
  for(const p of s.board){if(!p)continue;const v=materialVal(p.type);score+=p.color==="black"?v:-v;}
  return score;
}
function getBotMove(state: SittuyinState): SittuyinMove|null {
  const s:BotS={board:state.board,turn:"black"};
  const r=minimax<BotS,SittuyinMove>(s,{depth:2,moves:botMoves,apply:applyBotMove,isTerminal:s=>botMoves(s).length===0,evaluate:botEval,maximizing:s=>s.turn==="black"});
  return r.move;
}

export interface SittuyinSettings { dummy?: string }
export interface SittuyinState {
  board: SittuyinBoard;
  turn: SittuyinColor;
  selected: number | null;
  legalTargets: number[];
  winner: SittuyinColor | "draw" | null;
  rngSeed: number;
  settings: SittuyinSettings;
}
export type SittuyinAction = { type:"select";sq:number } | { type:"move";to:number };

export function initialState(seed: number, settings: SittuyinSettings): SittuyinState {
  return{board:initialBoard(),turn:"white",selected:null,legalTargets:[],winner:null,rngSeed:seed,settings};
}

function runBot(state: SittuyinState): SittuyinState {
  const mv=getBotMove(state);
  if(!mv) return{...state,winner:"white"};
  const ht=state.board.some(p=>p&&p.color==="black"&&p.type==="thida");
  const nb=applySittuyinMove(state.board,mv,ht);
  const rng=mulberry32(state.rngSeed);const ns=Math.floor(rng()*2**31);
  const wm=allLegalMoves(nb,"white");
  const winner=wm.length===0?(isInCheck(nb,"white")?"black":"draw"):null;
  return{...state,board:nb,turn:"white",selected:null,legalTargets:[],winner,rngSeed:ns};
}

export function reducer(state: SittuyinState, action: SittuyinAction): SittuyinState {
  if(state.winner!==null) return state;
  if(state.turn!=="white") return state;
  const rng=mulberry32(state.rngSeed);const ns=Math.floor(rng()*2**31);

  if(action.type==="select"){
    const p=state.board[action.sq];
    if(!p||p.color!=="white") return{...state,selected:null,legalTargets:[]};
    const targets=allLegalMoves(state.board,"white").filter(mv=>mv.from===action.sq).map(mv=>mv.to);
    return{...state,selected:action.sq,legalTargets:targets};
  }
  if(action.type==="move"){
    if(state.selected===null) return state;
    if(!state.legalTargets.includes(action.to)) return state;
    const ht=state.board.some(p=>p&&p.color==="white"&&p.type==="thida");
    const nb=applySittuyinMove(state.board,{from:state.selected,to:action.to},ht);
    const bm=allLegalMoves(nb,"black");
    if(bm.length===0){
      const winner=isInCheck(nb,"black")?"white":"draw";
      return{...state,board:nb,turn:"black",selected:null,legalTargets:[],winner,rngSeed:ns};
    }
    const bs:SittuyinState={...state,board:nb,turn:"black",selected:null,legalTargets:[],winner:null,rngSeed:ns};
    return runBot(bs);
  }
  return state;
}

export function isTerminal(state: SittuyinState): { score: number } | null {
  if(state.winner===null) return null;
  if(state.winner==="white") return{score:100};
  if(state.winner==="draw") return{score:50};
  return{score:0};
}
