import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Tic-Tac-Toe Large: 5x5 board, need 4-in-a-row. Player vs simple AI.
export interface TicTacToeLargeSettings { aiStrength: "easy"|"hard" }
export type Cell = "X"|"O"|null;
export interface TicTacToeLargeState {
  rngSeed: number; board: Cell[]; // 25 cells, 5x5
  currentPlayer: "X"|"O"; winner: "X"|"O"|"draw"|null;
  phase: "playing"|"gameover";
}
export type TicTacToeLargeAction = { type:"move"; index:number } | { type:"reset" };

function checkWinner(board: Cell[], size=5, need=4): Cell|"draw"|null {
  const lines: number[][] = [];
  for(let r=0;r<size;r++) for(let c=0;c<=size-need;c++){const l=[];for(let k=0;k<need;k++)l.push(r*size+c+k);lines.push(l);}
  for(let r=0;r<=size-need;r++) for(let c=0;c<size;c++){const l=[];for(let k=0;k<need;k++)l.push((r+k)*size+c);lines.push(l);}
  for(let r=0;r<=size-need;r++) for(let c=0;c<=size-need;c++){const l=[];for(let k=0;k<need;k++)l.push((r+k)*size+c+k);lines.push(l);}
  for(let r=0;r<=size-need;r++) for(let c=need-1;c<size;c++){const l=[];for(let k=0;k<need;k++)l.push((r+k)*size+c-k);lines.push(l);}
  for(const line of lines){const v=board[line[0]!];if(v&&line.every(i=>board[i]===v))return v;}
  if(board.every(c=>c!==null)) return "draw";
  return null;
}
export { checkWinner };

function aiMove(board: Cell[], rng: ()=>number): number {
  const empty=board.map((c,i)=>c===null?i:-1).filter(i=>i>=0);
  // try to win or block
  for(const player of ["O","X"] as const){
    for(const idx of empty){
      const test=[...board];test[idx]=player;
      if(checkWinner(test)==="O"||checkWinner(test)==="X"){if(checkWinner(test)===player)return idx;}
    }
  }
  // center
  if(board[12]===null) return 12;
  return empty[Math.floor(rng()*empty.length)]!;
}

export function initialState(seed: number, _settings: TicTacToeLargeSettings): TicTacToeLargeState {
  return { rngSeed:seed, board:Array(25).fill(null), currentPlayer:"X", winner:null, phase:"playing" };
}

export function reducer(state: TicTacToeLargeState, action: TicTacToeLargeAction): TicTacToeLargeState {
  switch(action.type){
    case "move": {
      if(state.phase==="gameover"||state.board[action.index]!==null||state.currentPlayer!=="X") return state;
      const board=[...state.board] as Cell[];board[action.index]="X";
      const w=checkWinner(board);
      if(w) return {...state,board,winner:w,phase:"gameover"};
      // AI move
      const rng=mulberry32(state.rngSeed);const nextSeed=Math.floor(rng()*2**31);
      const aiIdx=aiMove(board,rng);
      board[aiIdx]="O";
      const w2=checkWinner(board);
      return {...state,rngSeed:nextSeed,board,currentPlayer:"X",winner:w2??null,phase:w2?"gameover":"playing"};
    }
    case "reset": return initialState(state.rngSeed+1,{aiStrength:"easy"});
    default: return state;
  }
}

export function isTerminal(state: TicTacToeLargeState): { score:number }|null {
  if(state.phase!=="gameover") return null;
  return { score: state.winner==="X"?100:state.winner==="draw"?50:0 };
}
