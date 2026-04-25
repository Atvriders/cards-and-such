import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TicTacToe3InRowState, TicTacToe3InRowAction, TicTacToe3InRowSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
export function TicTacToe3InRow({ state, dispatch, onGameOver }: GameProps<TicTacToe3InRowState, TicTacToe3InRowSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  const winner=state.scoreX>state.scoreO?"X":state.scoreO>state.scoreX?"O":"tie";
  return <div className="ttt-wrap">
    <div className="ttt-header">
      <span>X (you): {state.scoreX} 3-in-rows</span>
      <span>O (AI): {state.scoreO} 3-in-rows</span>
    </div>
    <div className="ttt-board" style={{display:"grid",gridTemplateColumns:"repeat(4,60px)",gap:"4px"}}>
      {state.board.map((cell,i)=>(
        <button key={i} className={`ttt-cell ${cell||""}`} onClick={()=>dispatch({type:"move",index:i} as TicTacToe3InRowAction)} disabled={!!cell||state.phase==="gameover"}>{cell}</button>
      ))}
    </div>
    {state.phase==="playing"&&<p style={{fontSize:"0.9rem",color:"#888"}}>4x4 board — score points for each 3-in-a-row you make</p>}
    {state.phase==="gameover"&&<div>
      <p style={{fontWeight:700}}>{winner==="X"?"You win! +100":winner==="tie"?"Tie! +50":"AI wins! +0"}</p>
      <button className="ttt-reset" onClick={()=>dispatch({type:"reset"} as TicTacToe3InRowAction)}>New Game</button>
    </div>}
  </div>;
}
