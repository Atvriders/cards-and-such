import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TicTacToeCornersWinState, TicTacToeCornersWinAction, TicTacToeCornersWinSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const CORNERS=[0,2,6,8];
export function TicTacToeCornersWin({ state, dispatch, onGameOver }: GameProps<TicTacToeCornersWinState, TicTacToeCornersWinSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  return <div className="ttt-wrap">
    <div className="ttt-header">
      {state.phase==="gameover"?<span className="ttt-status">{state.winner==="X"?"You win! +100":state.winner==="draw"?"Draw! +50":"AI wins! +0"}</span>
        :<span className="ttt-status">Your turn (X) — control 3 corners to win</span>}
    </div>
    <div className="ttt-board corners">
      {state.board.map((cell,i)=>(
        <button key={i} className={`ttt-cell ${cell||""} ${CORNERS.includes(i)?"corner-cell":""}`}
          onClick={()=>dispatch({type:"move",index:i} as TicTacToeCornersWinAction)} disabled={!!cell||state.phase==="gameover"}
          style={{border:CORNERS.includes(i)?"3px solid #f39c12":"2px solid #bdc3c7"}}>
          {cell}
        </button>
      ))}
    </div>
    <p style={{fontSize:"0.85rem",color:"#888"}}>Corners highlighted in gold — get 3 of 4 corners!</p>
    {state.phase==="gameover"&&<button className="ttt-reset" onClick={()=>dispatch({type:"reset"} as TicTacToeCornersWinAction)}>New Game</button>}
  </div>;
}
