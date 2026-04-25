import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TicTacToeLargeState, TicTacToeLargeAction, TicTacToeLargeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
export function TicTacToeLarge({ state, dispatch, onGameOver }: GameProps<TicTacToeLargeState, TicTacToeLargeSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  return <div className="ttt-wrap">
    <div className="ttt-header">
      {state.phase==="gameover"?<span className="ttt-status">{state.winner==="X"?"You win! +100":state.winner==="draw"?"Draw! +50":"AI wins! +0"}</span>
        :<span className="ttt-status">Your turn (X) — 4 in a row wins</span>}
    </div>
    <div className="ttt-board large">
      {state.board.map((cell,i)=>(
        <button key={i} className={`ttt-cell ${cell||""}`} onClick={()=>dispatch({type:"move",index:i} as TicTacToeLargeAction)} disabled={!!cell||state.phase==="gameover"}>
          {cell}
        </button>
      ))}
    </div>
    {state.phase==="gameover"&&<button className="ttt-reset" onClick={()=>dispatch({type:"reset"} as TicTacToeLargeAction)}>New Game</button>}
  </div>;
}
