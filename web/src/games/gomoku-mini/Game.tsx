import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GomokuMiniState, GomokuMiniAction, GomokuMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
export function GomokuMini({ state, dispatch, onGameOver }: GameProps<GomokuMiniState, GomokuMiniSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  return <div className="ttt-wrap">
    <div className="ttt-header">
      {state.phase==="gameover"?<span className="ttt-status">{state.winner==="X"?"You win! +100":state.winner==="draw"?"Draw! +50":"AI wins! +0"}</span>
        :<span className="ttt-status">Your turn (X) — 5 in a row wins</span>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(9,36px)",gap:"2px"}}>
      {state.board.map((cell,i)=>(
        <button key={i} className={`ttt-cell ${cell||""}`} onClick={()=>dispatch({type:"move",index:i} as GomokuMiniAction)}
          disabled={!!cell||state.phase==="gameover"} style={{width:"36px",height:"36px",fontSize:"0.9rem"}}>
          {cell}
        </button>
      ))}
    </div>
    {state.phase==="gameover"&&<button className="ttt-reset" onClick={()=>dispatch({type:"reset"} as GomokuMiniAction)}>New Game</button>}
  </div>;
}
