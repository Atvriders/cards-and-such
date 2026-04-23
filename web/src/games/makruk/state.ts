import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Makruk (Thai Chess) — 8×8 board
// Player = "white" (bottom, row 7), Bot = "black" (top, row 0)
// Pieces: King (Khun), Queen/Met, Bishop/Khon, Knight/Ma, Rook/Ruea, Pawn/Bia
// Met (queen-like): moves one step diagonally or one step forward
// Khon (bishop-like): moves one step diagonally or one step forward
// Ma (knight): standard L-shape
// Ruea (rook): slides orthogonally
// Bia (pawn): moves one step forward, captures diagonally; promotes at rank 6 (row 2 for white)

export type MakrukColor = "white" | "black";
export type MakrukPieceType = "king" | "met" | "khon" | "ma" | "ruea" | "bia" | "pbia"; // pbia = promoted bia (becomes met)

export interface MakrukPiece {
  color: MakrukColor;
  type: MakrukPieceType;
}

export const ROWS = 8;
export const COLS = 8;

function idx(r: number, c: number): number { return r * COLS + c; }
function inBounds(r: number, c: number): boolean { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

export type MakrukBoard = (MakrukPiece | null)[];

function emptyBoard(): MakrukBoard { return new Array(ROWS * COLS).fill(null); }
function pieceAt(b: MakrukBoard, r: number, c: number): MakrukPiece | null {
  if (!inBounds(r, c)) return null;
  return b[idx(r, c)] ?? null;
}

export function initialBoard(): MakrukBoard {
  const b = emptyBoard();
  // Black (top)
  b[idx(0,0)] = { color:"black", type:"ruea" };
  b[idx(0,1)] = { color:"black", type:"ma" };
  b[idx(0,2)] = { color:"black", type:"khon" };
  b[idx(0,3)] = { color:"black", type:"met" };
  b[idx(0,4)] = { color:"black", type:"king" };
  b[idx(0,5)] = { color:"black", type:"khon" };
  b[idx(0,6)] = { color:"black", type:"ma" };
  b[idx(0,7)] = { color:"black", type:"ruea" };
  for (let c=0;c<8;c++) b[idx(1,c)] = { color:"black", type:"bia" };
  // White (bottom)
  for (let c=0;c<8;c++) b[idx(6,c)] = { color:"white", type:"bia" };
  b[idx(7,0)] = { color:"white", type:"ruea" };
  b[idx(7,1)] = { color:"white", type:"ma" };
  b[idx(7,2)] = { color:"white", type:"khon" };
  b[idx(7,3)] = { color:"white", type:"met" };
  b[idx(7,4)] = { color:"white", type:"king" };
  b[idx(7,5)] = { color:"white", type:"khon" };
  b[idx(7,6)] = { color:"white", type:"ma" };
  b[idx(7,7)] = { color:"white", type:"ruea" };
  return b;
}

export function moveDests(b: MakrukBoard, r: number, c: number): number[] {
  const piece = pieceAt(b, r, c);
  if (!piece) return [];
  const color = piece.color;
  const fwd = color === "white" ? -1 : 1;
  const dests: number[] = [];

  function addStep(dr: number, dc: number) {
    const nr=r+dr; const nc=c+dc;
    if (!inBounds(nr,nc)) return;
    const t=pieceAt(b,nr,nc);
    if (t&&t.color===color) return;
    dests.push(idx(nr,nc));
  }
  function addSlide(dr: number, dc: number) {
    let nr=r+dr; let nc=c+dc;
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
    case "met": case "pbia":
      // Met: one step diagonal + one step forward
      addStep(fwd,-1); addStep(fwd,1); addStep(-fwd,-1); addStep(-fwd,1);
      addStep(fwd,0);
      break;
    case "khon":
      // Khon: one step diagonal + one step forward
      addStep(fwd,-1); addStep(fwd,1); addStep(-fwd,-1); addStep(-fwd,1);
      addStep(fwd,0);
      break;
    case "ma":
      for (const [dr,dc] of [[-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[-1,2],[1,-2],[1,2]] as [number,number][]) addStep(dr,dc);
      break;
    case "ruea":
      addSlide(-1,0); addSlide(1,0); addSlide(0,-1); addSlide(0,1);
      break;
    case "bia":
      // Move forward
      { const nr=r+fwd; const nc=c;
        if(inBounds(nr,nc)&&!pieceAt(b,nr,nc)) dests.push(idx(nr,nc)); }
      // Capture diagonally
      for(const dc of [-1,1]){
        const nr=r+fwd; const nc=c+dc;
        if(!inBounds(nr,nc)) continue;
        const t=pieceAt(b,nr,nc);
        if(t&&t.color!==color) dests.push(idx(nr,nc));
      }
      break;
  }
  return dests;
}

function findKing(b: MakrukBoard, color: MakrukColor): number | null {
  for(let i=0;i<b.length;i++){const p=b[i];if(p&&p.color===color&&p.type==="king")return i;}
  return null;
}

export function isInCheck(b: MakrukBoard, color: MakrukColor): boolean {
  const ki=findKing(b,color);
  if(ki===null) return true;
  const opp:MakrukColor=color==="white"?"black":"white";
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const p=pieceAt(b,r,c);
    if(!p||p.color!==opp) continue;
    if(moveDests(b,r,c).includes(ki)) return true;
  }
  return false;
}

export interface MakrukMove { from: number; to: number }

export function applyMakrukMove(b: MakrukBoard, mv: MakrukMove): MakrukBoard {
  const nb=[...b];
  const piece=nb[mv.from]!;
  nb[mv.from]=null;
  let newType=piece.type;
  // Pawn promotion: white at row 2, black at row 5
  if(piece.type==="bia"){
    const tr=Math.floor(mv.to/COLS);
    if((piece.color==="white"&&tr<=2)||(piece.color==="black"&&tr>=5)) newType="pbia";
  }
  nb[mv.to]={color:piece.color,type:newType};
  return nb;
}

export function allLegalMoves(b: MakrukBoard, color: MakrukColor): MakrukMove[] {
  const moves: MakrukMove[] = [];
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const p=pieceAt(b,r,c);
    if(!p||p.color!==color) continue;
    for(const to of moveDests(b,r,c)){
      const nb=applyMakrukMove(b,{from:idx(r,c),to});
      if(!isInCheck(nb,color)) moves.push({from:idx(r,c),to});
    }
  }
  return moves;
}

function materialVal(t: MakrukPieceType): number {
  switch(t){case"king":return 10000;case"ruea":return 5;case"ma":return 3;case"met":case"pbia":return 2;case"khon":return 2;case"bia":return 1;}
}

interface BotS { board: MakrukBoard; turn: MakrukColor }
function botMoves(s: BotS): MakrukMove[] { return allLegalMoves(s.board,s.turn); }
function applyBotMove(s: BotS, mv: MakrukMove): BotS {
  return{board:applyMakrukMove(s.board,mv),turn:s.turn==="white"?"black":"white"};
}
function botEval(s: BotS): number {
  let score=0;
  for(const p of s.board){if(!p)continue;const v=materialVal(p.type);score+=p.color==="black"?v:-v;}
  return score;
}
function getBotMove(state: MakrukState): MakrukMove|null {
  const s:BotS={board:state.board,turn:"black"};
  const r=minimax<BotS,MakrukMove>(s,{depth:2,moves:botMoves,apply:applyBotMove,isTerminal:s=>botMoves(s).length===0,evaluate:botEval,maximizing:s=>s.turn==="black"});
  return r.move;
}

export interface MakrukSettings { dummy?: string }
export interface MakrukState {
  board: MakrukBoard;
  turn: MakrukColor;
  selected: number | null;
  legalTargets: number[];
  winner: MakrukColor | "draw" | null;
  rngSeed: number;
  settings: MakrukSettings;
}
export type MakrukAction = { type:"select";sq:number } | { type:"move";to:number };

export function initialState(seed: number, settings: MakrukSettings): MakrukState {
  return{board:initialBoard(),turn:"white",selected:null,legalTargets:[],winner:null,rngSeed:seed,settings};
}

function runBot(state: MakrukState): MakrukState {
  const mv=getBotMove(state);
  if(!mv) return{...state,winner:"white"};
  const nb=applyMakrukMove(state.board,mv);
  const rng=mulberry32(state.rngSeed);const ns=Math.floor(rng()*2**31);
  const wm=allLegalMoves(nb,"white");
  const winner=wm.length===0?(isInCheck(nb,"white")?"black":"draw"):null;
  return{...state,board:nb,turn:"white",selected:null,legalTargets:[],winner,rngSeed:ns};
}

export function reducer(state: MakrukState, action: MakrukAction): MakrukState {
  if(state.winner!==null) return state;
  if(state.turn!=="white") return state;
  const rng=mulberry32(state.rngSeed);const ns=Math.floor(rng()*2**31);

  if(action.type==="select"){
    const p=state.board[action.sq];
    if(!p||p.color!=="white") return{...state,selected:null,legalTargets:[]};
    const r=Math.floor(action.sq/COLS);const c=action.sq%COLS;
    const targets=allLegalMoves(state.board,"white").filter(mv=>mv.from===action.sq).map(mv=>mv.to);
    return{...state,selected:action.sq,legalTargets:targets};
  }
  if(action.type==="move"){
    if(state.selected===null) return state;
    if(!state.legalTargets.includes(action.to)) return state;
    const nb=applyMakrukMove(state.board,{from:state.selected,to:action.to});
    const bm=allLegalMoves(nb,"black");
    if(bm.length===0){
      const winner=isInCheck(nb,"black")?"white":"draw";
      return{...state,board:nb,turn:"black",selected:null,legalTargets:[],winner,rngSeed:ns};
    }
    const botState:MakrukState={...state,board:nb,turn:"black",selected:null,legalTargets:[],winner:null,rngSeed:ns};
    return runBot(botState);
  }
  return state;
}

export function isTerminal(state: MakrukState): { score: number } | null {
  if(state.winner===null) return null;
  if(state.winner==="white") return{score:100};
  if(state.winner==="draw") return{score:50};
  return{score:0};
}
