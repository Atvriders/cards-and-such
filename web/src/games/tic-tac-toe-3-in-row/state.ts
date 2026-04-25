import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// 3-in-a-row Score: 4x4 board, score points for each 3-in-a-row you make
export interface TicTacToe3InRowSettings { aiStrength: "easy"|"hard" }
export type Cell = "X"|"O"|null;
export interface TicTacToe3InRowState {
  rngSeed: number; board: Cell[];
  scoreX: number; scoreO: number;
  currentPlayer: "X"|"O"; phase: "playing"|"gameover";
}
export type TicTacToe3InRowAction = { type:"move"; index:number } | { type:"reset" };
const SIZE=4;
function count3InRow(board: Cell[], player: Cell): number {
  const lines: number[][] = [];
  for(let r=0;r<SIZE;r++) for(let c=0;c<=SIZE-3;c++){const l=[];for(let k=0;k<3;k++)l.push(r*SIZE+c+k);lines.push(l);}
  for(let r=0;r<=SIZE-3;r++) for(let c=0;c<SIZE;c++){const l=[];for(let k=0;k<3;k++)l.push((r+k)*SIZE+c);lines.push(l);}
  for(let r=0;r<=SIZE-3;r++) for(let c=0;c<=SIZE-3;c++){const l=[];for(let k=0;k<3;k++)l.push((r+k)*SIZE+c+k);lines.push(l);}
  for(let r=0;r<=SIZE-3;r++) for(let c=2;c<SIZE;c++){const l=[];for(let k=0;k<3;k++)l.push((r+k)*SIZE+c-k);lines.push(l);}
  return lines.filter(line=>line.every(i=>board[i]===player)).length;
}
export { count3InRow };
function aiMove(board: Cell[], rng: ()=>number): number {
  const empty=board.map((c,i)=>c===null?i:-1).filter(i=>i>=0);
  return empty[Math.floor(rng()*empty.length)]!;
}
export function initialState(seed: number, _s: TicTacToe3InRowSettings): TicTacToe3InRowState {
  return { rngSeed:seed, board:Array(16).fill(null), scoreX:0, scoreO:0, currentPlayer:"X", phase:"playing" };
}
export function reducer(state: TicTacToe3InRowState, action: TicTacToe3InRowAction): TicTacToe3InRowState {
  switch(action.type){
    case "move": {
      if(state.phase==="gameover"||state.board[action.index]!==null||state.currentPlayer!=="X") return state;
      const board=[...state.board] as Cell[];board[action.index]="X";
      const newScoreX=count3InRow(board,"X");
      const rng=mulberry32(state.rngSeed);const nextSeed=Math.floor(rng()*2**31);
      const aiIdx=aiMove(board,rng);board[aiIdx]="O";
      const newScoreO=count3InRow(board,"O");
      const full=board.every(c=>c!==null);
      return {...state,rngSeed:nextSeed,board,scoreX:newScoreX,scoreO:newScoreO,currentPlayer:"X",phase:full?"gameover":"playing"};
    }
    case "reset": return initialState(state.rngSeed+1,{aiStrength:"easy"});
    default: return state;
  }
}
export function isTerminal(state: TicTacToe3InRowState): { score:number }|null {
  if(state.phase!=="gameover") return null;
  const pts=state.scoreX>state.scoreO?100:state.scoreX===state.scoreO?50:0;
  return { score:pts };
}
