import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Bao — simplified as an 8-pit mancala variant
// 2 rows × 8 pits (plus 2 stores). Each player has 8 pits and 1 store.
// Player 0 (bottom row) has pits 0-7 and store 8
// Player 1 (top row, bot) has pits 9-16 and store 17
// Total slots: 18
//
// Bao capture rule: if the last seed lands in a non-empty pit on your own side,
// you capture the seeds in the opposite opponent pit and continue sowing.
// If last seed lands in an empty pit: turn ends (no capture like Kalah).
// If last seed lands in your store: extra turn.

export const P0_PITS = [0,1,2,3,4,5,6,7] as const;
export const P0_STORE = 8;
export const P1_PITS = [9,10,11,12,13,14,15,16] as const;
export const P1_STORE = 17;
export const TOTAL = 18;
export const SEEDS_PER_PIT = 6;

// Opposite pit: pit i (0-7) opposite to pit (16-i) for p1 pits (col reversed)
function opposite(pit: number): number {
  if (pit >= 0 && pit <= 7) return 16 - pit; // p0 pit -> p1 pit
  if (pit >= 9 && pit <= 16) return 16 - pit; // p1 pit -> p0 pit
  return -1;
}

function myPits(seat: 0|1): readonly number[] { return seat===0?P0_PITS:P1_PITS; }
function myStore(seat: 0|1): number { return seat===0?P0_STORE:P1_STORE; }
function oppStore(seat: 0|1): number { return seat===0?P1_STORE:P0_STORE; }

export interface BaoSettings { dummy?: string }
export interface BaoState {
  board: readonly number[];
  turn: 0|1;
  winner: 0|1|"draw"|null;
  rngSeed: number;
  settings: BaoSettings;
  lastSow: number | null;
}

export type BaoAction = { type:"sow"; pit:number };

export function initialState(seed: number, settings: BaoSettings): BaoState {
  const board = new Array(TOTAL).fill(0);
  for (const p of P0_PITS) board[p] = SEEDS_PER_PIT;
  for (const p of P1_PITS) board[p] = SEEDS_PER_PIT;
  return { board, turn:0, winner:null, rngSeed:seed, settings, lastSow:null };
}

function isGameOver(board: readonly number[]): boolean {
  return P0_PITS.every(p=>board[p]===0) || P1_PITS.every(p=>board[p]===0);
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

// Bao sow: counterclockwise for p0 (pits 0..7 left to right, store, then p1 reversed)
// For simplicity: sow in index order 0..17, skipping opponent store
function applySow(board: readonly number[], pit: number, seat: 0|1): { board:number[]; extraTurn:boolean } {
  const b=[...board];
  let seeds=b[pit]!;
  b[pit]=0;
  const skip=oppStore(seat);
  let pos=pit;

  while(seeds>0){
    pos=(pos+1)%TOTAL;
    if(pos===skip) continue;
    b[pos]!+=1;
    seeds--;
  }

  const extraTurn=pos===myStore(seat);

  // Bao capture rule: if last seed landed in non-empty own pit (excluding the seed we just added making it non-empty from 0)
  // Actually: if before adding the seed the pit was non-empty (i.e. now >1), and it's an own pit => capture opp opposite
  if(!extraTurn && myPits(seat).includes(pos as typeof P0_PITS[number]|typeof P1_PITS[number])) {
    const oppPit=opposite(pos);
    if(b[pos]!>1 && oppPit>=0 && b[oppPit]!>0){
      b[myStore(seat)]!+=b[oppPit]!;
      b[oppPit]=0;
    }
  }

  return{board:b,extraTurn};
}

interface BotS { board:readonly number[];turn:0|1 }
function validPits(s: BotS): number[] { return myPits(s.turn).filter(p=>s.board[p]!>0) as number[]; }
function applyBotSow(s: BotS, pit:number): BotS {
  const{board:b,extraTurn}=applySow(s.board,pit,s.turn);
  if(isGameOver(b)){const fb=finalizeBoard([...b]);return{board:fb,turn:s.turn};}
  return{board:b,turn:extraTurn?s.turn:((s.turn===0?1:0)as 0|1)};
}
function botEval(s: BotS): number { return s.board[P1_STORE]!-s.board[P0_STORE]!; }

function getBotMove(state: BaoState): number|null {
  const s:BotS={board:state.board,turn:state.turn};
  const r=minimax<BotS,number>(s,{depth:4,moves:validPits,apply:applyBotSow,isTerminal:s=>isGameOver(s.board)||validPits(s).length===0,evaluate:botEval,maximizing:s=>s.turn===1});
  return r.move;
}

function applyPlayerMove(state: BaoState, pit:number, doBot:boolean): BaoState {
  const rng=mulberry32(state.rngSeed);const ns=Math.floor(rng()*2**31);
  const{board:nb,extraTurn}=applySow(state.board,pit,state.turn);
  const opp=(state.turn===0?1:0) as 0|1;
  if(isGameOver(nb)){
    const fb=finalizeBoard([...nb]);
    return{...state,board:fb,winner:computeWinner(fb),rngSeed:ns,lastSow:pit};
  }
  const nextTurn=extraTurn?state.turn:opp;
  let next:BaoState={...state,board:nb,turn:nextTurn,rngSeed:ns,lastSow:pit};
  if(doBot&&next.winner===null&&next.turn===1) next=runBotMoves(next);
  return next;
}

function runBotMoves(state: BaoState): BaoState {
  let s=state;let lim=20;
  while(s.winner===null&&s.turn===1&&lim-->0){
    const mv=getBotMove(s);
    if(mv===null) break;
    s=applyPlayerMove(s,mv,false);
  }
  return s;
}

export function reducer(state: BaoState, action: BaoAction): BaoState {
  if(action.type!=="sow") return state;
  if(state.winner!==null) return state;
  if(state.turn!==0) return state;
  const pit=action.pit;
  if(!(P0_PITS as readonly number[]).includes(pit)) return state;
  if(state.board[pit]===0) return state;
  return applyPlayerMove(state,pit,true);
}

export function isTerminal(state: BaoState): { score:number }|null {
  if(state.winner===null) return null;
  if(state.winner===0) return{score:100};
  if(state.winner==="draw") return{score:50};
  return{score:0};
}
