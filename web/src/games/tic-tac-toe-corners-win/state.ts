import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Corners Win: 3x3 board but you win by controlling 3 corners (no normal win condition)
export interface TicTacToeCornersWinSettings { aiStrength: "easy"|"hard" }
export type Cell = "X"|"O"|null;
export interface TicTacToeCornersWinState {
  rngSeed: number; board: Cell[]; currentPlayer: "X"|"O";
  winner: "X"|"O"|"draw"|null; phase: "playing"|"gameover";
}
export type TicTacToeCornersWinAction = { type:"move"; index:number } | { type:"reset" };
const CORNERS=[0,2,6,8];
function checkCornersWinner(board: Cell[]): Cell|"draw"|null {
  for(const p of ["X","O"] as const){
    const owned=CORNERS.filter(c=>board[c]===p);
    if(owned.length>=3) return p;
  }
  if(board.every(c=>c!==null)) return "draw";
  return null;
}
export { checkCornersWinner };
function aiMove(board: Cell[], rng: ()=>number): number {
  const empty=board.map((c,i)=>c===null?i:-1).filter(i=>i>=0);
  // prioritize corners
  const emptyCorners=CORNERS.filter(c=>board[c]===null);
  if(emptyCorners.length>0) return emptyCorners[Math.floor(rng()*emptyCorners.length)]!;
  return empty[Math.floor(rng()*empty.length)]!;
}
export function initialState(seed: number, _s: TicTacToeCornersWinSettings): TicTacToeCornersWinState {
  return { rngSeed:seed, board:Array(9).fill(null), currentPlayer:"X", winner:null, phase:"playing" };
}
export function reducer(state: TicTacToeCornersWinState, action: TicTacToeCornersWinAction): TicTacToeCornersWinState {
  switch(action.type){
    case "move": {
      if(state.phase==="gameover"||state.board[action.index]!==null||state.currentPlayer!=="X") return state;
      const board=[...state.board] as Cell[];board[action.index]="X";
      const w=checkCornersWinner(board);
      if(w) return {...state,board,winner:w,phase:"gameover"};
      const rng=mulberry32(state.rngSeed);const nextSeed=Math.floor(rng()*2**31);
      const aiIdx=aiMove(board,rng);board[aiIdx]="O";
      const w2=checkCornersWinner(board);
      return {...state,rngSeed:nextSeed,board,currentPlayer:"X",winner:w2??null,phase:w2?"gameover":"playing"};
    }
    case "reset": return initialState(state.rngSeed+1,{aiStrength:"easy"});
    default: return state;
  }
}
export function isTerminal(state: TicTacToeCornersWinState): { score:number }|null {
  if(state.phase!=="gameover") return null;
  return { score:state.winner==="X"?100:state.winner==="draw"?50:0 };
}
