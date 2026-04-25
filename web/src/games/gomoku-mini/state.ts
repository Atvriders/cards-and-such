import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Gomoku Mini: 9x9 board, need 5 in a row. Player vs simple AI.
export interface GomokuMiniSettings { aiStrength: "easy"|"hard" }
export type Cell = "X"|"O"|null;
export interface GomokuMiniState {
  rngSeed: number; board: Cell[];
  winner: "X"|"O"|"draw"|null; phase: "playing"|"gameover";
}
export type GomokuMiniAction = { type:"move"; index:number } | { type:"reset" };
const SIZE=9;
function check5(board: Cell[]): Cell|"draw"|null {
  const need=5;
  const lines: number[][] = [];
  for(let r=0;r<SIZE;r++) for(let c=0;c<=SIZE-need;c++){const l=[];for(let k=0;k<need;k++)l.push(r*SIZE+c+k);lines.push(l);}
  for(let r=0;r<=SIZE-need;r++) for(let c=0;c<SIZE;c++){const l=[];for(let k=0;k<need;k++)l.push((r+k)*SIZE+c);lines.push(l);}
  for(let r=0;r<=SIZE-need;r++) for(let c=0;c<=SIZE-need;c++){const l=[];for(let k=0;k<need;k++)l.push((r+k)*SIZE+c+k);lines.push(l);}
  for(let r=0;r<=SIZE-need;r++) for(let c=need-1;c<SIZE;c++){const l=[];for(let k=0;k<need;k++)l.push((r+k)*SIZE+c-k);lines.push(l);}
  for(const line of lines){const v=board[line[0]!];if(v&&line.every(i=>board[i]===v))return v;}
  if(board.every(c=>c!==null)) return "draw";
  return null;
}
export { check5 };
function aiMove(board: Cell[], rng: ()=>number): number {
  const empty=board.map((c,i)=>c===null?i:-1).filter(i=>i>=0);
  // try to win first
  for(const p of ["O","X"] as const){
    for(const idx of empty.slice(0,30)){
      const test=[...board];test[idx]=p;
      const w=check5(test);
      if(w===p) return idx;
    }
  }
  const center=40;
  if(board[center]===null) return center;
  return empty[Math.floor(rng()*Math.min(empty.length,20))]!;
}
export function initialState(seed: number, _s: GomokuMiniSettings): GomokuMiniState {
  return { rngSeed:seed, board:Array(81).fill(null), winner:null, phase:"playing" };
}
export function reducer(state: GomokuMiniState, action: GomokuMiniAction): GomokuMiniState {
  switch(action.type){
    case "move": {
      if(state.phase==="gameover"||state.board[action.index]!==null) return state;
      const board=[...state.board] as Cell[];board[action.index]="X";
      const w=check5(board);
      if(w) return {...state,board,winner:w,phase:"gameover"};
      const rng=mulberry32(state.rngSeed);const nextSeed=Math.floor(rng()*2**31);
      const aiIdx=aiMove(board,rng);board[aiIdx]="O";
      const w2=check5(board);
      return {...state,rngSeed:nextSeed,board,winner:w2??null,phase:w2?"gameover":"playing"};
    }
    case "reset": return initialState(state.rngSeed+1,{aiStrength:"easy"});
    default: return state;
  }
}
export function isTerminal(state: GomokuMiniState): { score:number }|null {
  if(state.phase!=="gameover") return null;
  return { score:state.winner==="X"?100:state.winner==="draw"?50:0 };
}
