import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Sungka (Filipino mancala)
// 2 rows × 7 pits + 2 head (store) pits
// Layout (index):
//   Head0 (store for p0) = index 0
//   P0 pits = indices 1..7 (bottom row, left to right)
//   Head1 (store for p1) = index 8
//   P1 pits = indices 9..15 (top row, right to left in play order)
//
// Sow counterclockwise:
//   P0's turn: from chosen pit, sow 1..7, Head0, then 15..9 (p1 pits reversed), then skip Head1, back to p0 pits
//   Actually: standard Sungka sow order from p0's pit going left:
//   We use index order: 1,2,3,4,5,6,7,0,15,14,13,12,11,10,9 then repeat
//
// Capture rule (Sungka): if last seed lands in an empty pit on YOUR side, capture that pit's seeds AND the opposite pit's seeds

export const P0_STORE = 0;
export const P0_PITS = [1,2,3,4,5,6,7] as const;
export const P1_STORE = 8;
export const P1_PITS = [9,10,11,12,13,14,15] as const;
export const TOTAL = 16;
export const SEEDS_PER_PIT = 7;

// Sow order for player 0 starting at pit p (1-7): go counterclockwise
// Order: ...p-1, p-2, ... 1, 0(store), 15, 14, ... 9, skip 8, 7, 6...
// We define a circular order for sowing:
const SOW_ORDER_P0 = [1,2,3,4,5,6,7,0,15,14,13,12,11,10,9]; // p0 sows, skip p1 store (8)
const SOW_ORDER_P1 = [15,14,13,12,11,10,9,8,7,6,5,4,3,2,1]; // p1 sows, skip p0 store (0)

function myPits(seat: 0|1): readonly number[] { return seat===0?P0_PITS:P1_PITS; }
function myStore(seat: 0|1): number { return seat===0?P0_STORE:P1_STORE; }

// Opposite pit for capture
const OPPOSITE: Record<number,number> = {1:15,2:14,3:13,4:12,5:11,6:10,7:9,9:7,10:6,11:5,12:4,13:3,14:2,15:1};

export interface SungkaSettings { dummy?: string }
export interface SungkaState {
  board: readonly number[];
  turn: 0|1;
  winner: 0|1|"draw"|null;
  rngSeed: number;
  settings: SungkaSettings;
  lastSow: number | null;
}
export type SungkaAction = { type:"sow"; pit:number };

export function initialState(seed: number, settings: SungkaSettings): SungkaState {
  const board = new Array(TOTAL).fill(0);
  for(const p of P0_PITS) board[p]=SEEDS_PER_PIT;
  for(const p of P1_PITS) board[p]=SEEDS_PER_PIT;
  return{board,turn:0,winner:null,rngSeed:seed,settings,lastSow:null};
}

function isGameOver(board: readonly number[]): boolean {
  return P0_PITS.every(p=>board[p]===0)||P1_PITS.every(p=>board[p]===0);
}

function finalizeBoard(board: number[]): number[] {
  const b=[...board];
  for(const p of P0_PITS){b[P0_STORE]=(b[P0_STORE]??0)+(b[p]??0);b[p]=0;}
  for(const p of P1_PITS){b[P1_STORE]=(b[P1_STORE]??0)+(b[p]??0);b[p]=0;}
  return b;
}

function computeWinner(board: readonly number[]): 0|1|"draw" {
  const p0=board[P0_STORE]!;const p1=board[P1_STORE]!;
  if(p0>p1) return 0;
  if(p1>p0) return 1;
  return "draw";
}

function applySow(board: readonly number[], pit: number, seat: 0|1): { board:number[];extraTurn:boolean } {
  const b=[...board];
  let seeds=b[pit]!;
  b[pit]=0;
  const sowOrder=seat===0?SOW_ORDER_P0:SOW_ORDER_P1;
  const startIdx=sowOrder.indexOf(pit);
  if(startIdx<0) return{board:b,extraTurn:false};

  let pos=-1;
  let i=(startIdx+1)%sowOrder.length;
  while(seeds>0){
    pos=sowOrder[i]!;
    b[pos]!+=1;
    seeds--;
    i=(i+1)%sowOrder.length;
  }

  const extraTurn=pos===myStore(seat);

  // Sungka capture: last seed in empty own pit (now has 1) -> capture opposite
  if(!extraTurn && (myPits(seat) as readonly number[]).includes(pos)){
    if(b[pos]===1){
      const opp=OPPOSITE[pos];
      if(opp!==undefined&&b[opp]!>0){
        b[myStore(seat)]!+=b[pos]!+b[opp]!;
        b[pos]=0;b[opp]=0;
      }
    }
  }

  return{board:b,extraTurn};
}

interface BotS { board:readonly number[];turn:0|1 }
function validPits(s: BotS): number[] { return (myPits(s.turn) as readonly number[]).filter(p=>s.board[p]!>0) as number[]; }
function applyBotSow(s: BotS, pit:number): BotS {
  const{board:b,extraTurn}=applySow(s.board,pit,s.turn);
  if(isGameOver(b)){const fb=finalizeBoard([...b]);return{board:fb,turn:s.turn};}
  return{board:b,turn:extraTurn?s.turn:((s.turn===0?1:0)as 0|1)};
}
function botEval(s: BotS): number { return s.board[P1_STORE]!-s.board[P0_STORE]!; }

function getBotMove(state: SungkaState): number|null {
  const s:BotS={board:state.board,turn:state.turn};
  const r=minimax<BotS,number>(s,{depth:4,moves:validPits,apply:applyBotSow,isTerminal:s=>isGameOver(s.board)||validPits(s).length===0,evaluate:botEval,maximizing:s=>s.turn===1});
  return r.move;
}

function applyPlayerMove(state: SungkaState, pit:number, doBot:boolean): SungkaState {
  const rng=mulberry32(state.rngSeed);const ns=Math.floor(rng()*2**31);
  const{board:nb,extraTurn}=applySow(state.board,pit,state.turn);
  const opp=(state.turn===0?1:0) as 0|1;
  if(isGameOver(nb)){
    const fb=finalizeBoard([...nb]);
    return{...state,board:fb,winner:computeWinner(fb),rngSeed:ns,lastSow:pit};
  }
  const nextTurn=extraTurn?state.turn:opp;
  let next:SungkaState={...state,board:nb,turn:nextTurn,rngSeed:ns,lastSow:pit};
  if(doBot&&next.winner===null&&next.turn===1) next=runBotMoves(next);
  return next;
}

function runBotMoves(state: SungkaState): SungkaState {
  let s=state;let lim=20;
  while(s.winner===null&&s.turn===1&&lim-->0){
    const mv=getBotMove(s);
    if(mv===null) break;
    s=applyPlayerMove(s,mv,false);
  }
  return s;
}

export function reducer(state: SungkaState, action: SungkaAction): SungkaState {
  if(action.type!=="sow") return state;
  if(state.winner!==null) return state;
  if(state.turn!==0) return state;
  const pit=action.pit;
  if(!(P0_PITS as readonly number[]).includes(pit)) return state;
  if(state.board[pit]===0) return state;
  return applyPlayerMove(state,pit,true);
}

export function isTerminal(state: SungkaState): { score:number }|null {
  if(state.winner===null) return null;
  if(state.winner===0) return{score:100};
  if(state.winner==="draw") return{score:50};
  return{score:0};
}
