import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Janggi (Korean Chess) — simplified
// 9×10 board (same as Xiangqi). Player = "blue" (bottom), Bot = "red" (top)
// Palaces: blue rows 7-9 cols 3-5, red rows 0-2 cols 3-5
// Key differences from Xiangqi:
// - General can move diagonally within palace (along diagonal lines)
// - Horse and Elephant move differently (elephant = 1 ortho + 2 diag)
// - Cannon cannot jump over another cannon, cannot capture another cannon
// - Soldier (Jol/Byung) can move sideways from start (not just after crossing river)

export type JanggiColor = "blue" | "red";
export type JanggiPieceType = "general" | "advisor" | "elephant" | "horse" | "chariot" | "cannon" | "soldier";

export interface JanggiPiece {
  color: JanggiColor;
  type: JanggiPieceType;
}

export const ROWS = 10;
export const COLS = 9;

function idx(r: number, c: number): number { return r * COLS + c; }
function inBounds(r: number, c: number): boolean { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

export type JanggiBoard = (JanggiPiece | null)[];

function emptyBoard(): JanggiBoard { return new Array(ROWS * COLS).fill(null); }
function pieceAt(b: JanggiBoard, r: number, c: number): JanggiPiece | null {
  if (!inBounds(r, c)) return null;
  return b[idx(r, c)] ?? null;
}

// Palace squares and their diagonal connections
function inBluePalace(r: number, c: number): boolean { return r >= 7 && r <= 9 && c >= 3 && c <= 5; }
function inRedPalace(r: number, c: number): boolean { return r >= 0 && r <= 2 && c >= 3 && c <= 5; }
function inOwnPalace(r: number, c: number, color: JanggiColor): boolean {
  return color === "blue" ? inBluePalace(r, c) : inRedPalace(r, c);
}

// Diagonal moves within palace (along palace diagonal lines)
// Palace has 4 diagonal lines from corners to center
const PALACE_DIAG: [number,number,number,number][] = [
  [0,0,2,2],[0,2,2,0],[7,3,9,5],[7,5,9,3],
  [0,3,2,5],[0,5,2,3],[7,0,9,2],[7,2,9,0], // Not needed — stick to the inner palace diagonals
];

function isOnPalaceDiag(r: number, c: number, palace: "blue"|"red"): boolean {
  if (palace === "blue") {
    const br = r - 7; const bc = c - 3;
    return (br === bc) || (br + bc === 2); // diagonals of the 3x3 palace
  } else {
    const br = r; const bc = c - 3;
    return (br === bc) || (br + bc === 2);
  }
}

// General and advisor diagonal moves within palace
function palaceDiagDests(b: JanggiBoard, r: number, c: number, color: JanggiColor): number[] {
  const palace = color === "blue" ? "blue" : "red";
  if (!isOnPalaceDiag(r, c, palace)) return [];
  const dests: number[] = [];
  for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]] as [number,number][]) {
    const nr = r+dr; const nc = c+dc;
    if (!inOwnPalace(nr, nc, color)) continue;
    if (!isOnPalaceDiag(nr, nc, palace)) continue;
    const t = pieceAt(b, nr, nc);
    if (t && t.color === color) continue;
    dests.push(idx(nr, nc));
  }
  return dests;
}

export function initialBoard(): JanggiBoard {
  const b = emptyBoard();
  // Red (top)
  b[idx(0,0)] = { color:"red", type:"chariot" };
  b[idx(0,1)] = { color:"red", type:"elephant" };
  b[idx(0,2)] = { color:"red", type:"horse" };
  b[idx(0,3)] = { color:"red", type:"advisor" };
  b[idx(0,4)] = { color:"red", type:"general" };
  b[idx(0,5)] = { color:"red", type:"advisor" };
  b[idx(0,6)] = { color:"red", type:"horse" };
  b[idx(0,7)] = { color:"red", type:"elephant" };
  b[idx(0,8)] = { color:"red", type:"chariot" };
  b[idx(2,1)] = { color:"red", type:"cannon" };
  b[idx(2,7)] = { color:"red", type:"cannon" };
  for (let c=0;c<9;c+=2) b[idx(3,c)] = { color:"red", type:"soldier" };
  // Blue (bottom)
  b[idx(9,0)] = { color:"blue", type:"chariot" };
  b[idx(9,1)] = { color:"blue", type:"elephant" };
  b[idx(9,2)] = { color:"blue", type:"horse" };
  b[idx(9,3)] = { color:"blue", type:"advisor" };
  b[idx(9,4)] = { color:"blue", type:"general" };
  b[idx(9,5)] = { color:"blue", type:"advisor" };
  b[idx(9,6)] = { color:"blue", type:"horse" };
  b[idx(9,7)] = { color:"blue", type:"elephant" };
  b[idx(9,8)] = { color:"blue", type:"chariot" };
  b[idx(7,1)] = { color:"blue", type:"cannon" };
  b[idx(7,7)] = { color:"blue", type:"cannon" };
  for (let c=0;c<9;c+=2) b[idx(6,c)] = { color:"blue", type:"soldier" };
  return b;
}

export function moveDests(b: JanggiBoard, r: number, c: number): number[] {
  const piece = pieceAt(b, r, c);
  if (!piece) return [];
  const color = piece.color;
  const opp: JanggiColor = color === "blue" ? "red" : "blue";
  const fwd = color === "blue" ? -1 : 1;
  const dests: number[] = [];

  function addStep(nr: number, nc: number) {
    if (!inBounds(nr,nc)) return;
    const t = pieceAt(b,nr,nc);
    if (t&&t.color===color) return;
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
    case "general":
      // Orthogonal within palace + diagonal on palace diag lines
      for(const[dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]){
        const nr=r+dr;const nc=c+dc;
        if(inOwnPalace(nr,nc,color)) addStep(nr,nc);
      }
      dests.push(...palaceDiagDests(b,r,c,color));
      break;
    case "advisor":
      for(const[dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]){
        const nr=r+dr;const nc=c+dc;
        if(inOwnPalace(nr,nc,color)) addStep(nr,nc);
      }
      dests.push(...palaceDiagDests(b,r,c,color));
      break;
    case "elephant":
      // One ortho + two diag: blocked if any intermediate occupied
      for(const[br,bc,dr1,dc1,dr2,dc2] of [
        [-1,0,-1,-1,-1,-1],[-1,0,-1,1,-1,1],
        [1,0,1,-1,1,-1],[1,0,1,1,1,1],
        [0,-1,-1,-1,-1,-1],[0,-1,1,-1,1,-1],
        [0,1,-1,1,-1,1],[0,1,1,1,1,1],
      ] as [number,number,number,number,number,number][]){
        const mr=r+br;const mc=c+bc;
        if(!inBounds(mr,mc)||pieceAt(b,mr,mc)) continue;
        const m2r=mr+dr1;const m2c=mc+dc1;
        if(!inBounds(m2r,m2c)||pieceAt(b,m2r,m2c)) continue;
        addStep(m2r+dr2,m2c+dc2);
      }
      break;
    case "horse":
      // One ortho + one diag: blocked if first step occupied
      for(const[br,bc,nr,nc] of [
        [-1,0,-2,-1],[-1,0,-2,1],
        [1,0,2,-1],[1,0,2,1],
        [0,-1,-1,-2],[0,-1,1,-2],
        [0,1,-1,2],[0,1,1,2],
      ] as [number,number,number,number][]){
        if(pieceAt(b,r+br,c+bc)) continue;
        addStep(r+nr,c+nc);
      }
      break;
    case "chariot":
      addSlide(-1,0);addSlide(1,0);addSlide(0,-1);addSlide(0,1);
      // Palace diagonal slides for chariot — simplified: skip
      break;
    case "cannon":
      // Must jump exactly one non-cannon piece; cannot capture cannon
      for(const[dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]){
        let nr=r+dr;let nc=c+dc;
        let jumped=false;
        while(inBounds(nr,nc)){
          const t=pieceAt(b,nr,nc);
          if(!jumped){
            if(t){
              if(t.type==="cannon"){break;} // can't jump cannon
              jumped=true;
            } else dests.push(idx(nr,nc));
          } else {
            if(t){
              if(t.color!==color&&t.type!=="cannon") dests.push(idx(nr,nc));
              break;
            }
          }
          nr+=dr;nc+=dc;
        }
      }
      break;
    case "soldier":
      // Blue: forward = up. Can move sideways always
      addStep(r+fwd,c);
      addStep(r,c-1);addStep(r,c+1);
      break;
  }
  return [...new Set(dests)];
}

function findGeneral(b: JanggiBoard, color: JanggiColor): number | null {
  for(let i=0;i<b.length;i++){const p=b[i];if(p&&p.color===color&&p.type==="general")return i;}
  return null;
}

export function isInCheck(b: JanggiBoard, color: JanggiColor): boolean {
  const gi=findGeneral(b,color);
  if(gi===null) return true;
  const opp:JanggiColor=color==="blue"?"red":"blue";
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const p=pieceAt(b,r,c);
    if(!p||p.color!==opp) continue;
    if(moveDests(b,r,c).includes(gi)) return true;
  }
  return false;
}

export interface JanggiMove { from: number; to: number }

export function applyJanggiMove(b: JanggiBoard, mv: JanggiMove): JanggiBoard {
  const nb=[...b];
  nb[mv.to]=nb[mv.from] ?? null;
  nb[mv.from]=null;
  return nb;
}

export function allLegalMoves(b: JanggiBoard, color: JanggiColor): JanggiMove[] {
  const moves: JanggiMove[] = [];
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const p=pieceAt(b,r,c);
    if(!p||p.color!==color) continue;
    for(const to of moveDests(b,r,c)){
      const nb=applyJanggiMove(b,{from:idx(r,c),to});
      if(!isInCheck(nb,color)) moves.push({from:idx(r,c),to});
    }
  }
  return moves;
}

function materialVal(t: JanggiPieceType): number {
  switch(t){case"general":return 10000;case"chariot":return 13;case"cannon":return 7;case"elephant":return 5;case"horse":return 5;case"advisor":return 3;case"soldier":return 2;}
}

interface BotS { board: JanggiBoard; turn: JanggiColor }
function botMoves(s: BotS): JanggiMove[] { return allLegalMoves(s.board,s.turn); }
function applyBotMove(s: BotS, mv: JanggiMove): BotS {
  return{board:applyJanggiMove(s.board,mv),turn:s.turn==="blue"?"red":"blue"};
}
function botEval(s: BotS): number {
  let sc=0;
  for(const p of s.board){if(!p)continue;const v=materialVal(p.type);sc+=p.color==="red"?v:-v;}
  return sc;
}
function getBotMove(state: JanggiState): JanggiMove|null {
  const s:BotS={board:state.board,turn:"red"};
  const r=minimax<BotS,JanggiMove>(s,{depth:2,moves:botMoves,apply:applyBotMove,isTerminal:s=>botMoves(s).length===0,evaluate:botEval,maximizing:s=>s.turn==="red"});
  return r.move;
}

export interface JanggiSettings { dummy?: string }
export interface JanggiState {
  board: JanggiBoard;
  turn: JanggiColor;
  selected: number | null;
  legalTargets: number[];
  winner: JanggiColor | null;
  rngSeed: number;
  settings: JanggiSettings;
}
export type JanggiAction = { type:"select";sq:number } | { type:"move";to:number };

export function initialState(seed: number, settings: JanggiSettings): JanggiState {
  return{board:initialBoard(),turn:"blue",selected:null,legalTargets:[],winner:null,rngSeed:seed,settings};
}

function runBot(state: JanggiState): JanggiState {
  const mv=getBotMove(state);
  if(!mv) return{...state,winner:"blue"};
  const nb=applyJanggiMove(state.board,mv);
  const rng=mulberry32(state.rngSeed);const ns=Math.floor(rng()*2**31);
  const bm=allLegalMoves(nb,"blue");
  const winner=bm.length===0?"red":null;
  return{...state,board:nb,turn:"blue",selected:null,legalTargets:[],winner,rngSeed:ns};
}

export function reducer(state: JanggiState, action: JanggiAction): JanggiState {
  if(state.winner!==null) return state;
  if(state.turn!=="blue") return state;
  const rng=mulberry32(state.rngSeed);const ns=Math.floor(rng()*2**31);

  if(action.type==="select"){
    const p=state.board[action.sq];
    if(!p||p.color!=="blue") return{...state,selected:null,legalTargets:[]};
    const targets=allLegalMoves(state.board,"blue").filter(mv=>mv.from===action.sq).map(mv=>mv.to);
    return{...state,selected:action.sq,legalTargets:targets};
  }
  if(action.type==="move"){
    if(state.selected===null) return state;
    if(!state.legalTargets.includes(action.to)) return state;
    const nb=applyJanggiMove(state.board,{from:state.selected,to:action.to});
    const rm=allLegalMoves(nb,"red");
    if(rm.length===0){
      return{...state,board:nb,turn:"red",selected:null,legalTargets:[],winner:"blue",rngSeed:ns};
    }
    const bs:JanggiState={...state,board:nb,turn:"red",selected:null,legalTargets:[],winner:null,rngSeed:ns};
    return runBot(bs);
  }
  return state;
}

export function isTerminal(state: JanggiState): { score: number } | null {
  if(state.winner===null) return null;
  return{score:state.winner==="blue"?100:0};
}
