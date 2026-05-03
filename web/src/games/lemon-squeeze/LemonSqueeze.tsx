import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LemonSqueezeState, LemonSqueezeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./LemonSqueeze.css";
export function LemonSqueeze({ state, dispatch, onGameOver }:GameProps<LemonSqueezeState,LemonSqueezeSettings>):JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  return (
    <div className="arc-wrap">
      <div className="arc-info"><span>Round {state.round}/{state.totalRounds}</span><span>Score: {state.score}</span></div>
      {!terminal?(<>
        <div className="arc-display">🍋</div>
        <div className="arc-target">Tap {state.target} times!</div>
        <div style={{fontSize:"1.5rem",fontWeight:"bold",color:"#4a6fa5"}}>{state.current}/{state.target}</div>
        {state.feedback && <div className="arc-feedback good">{state.feedback}</div>}
        <button data-testid="hint-target-lemon-squeeze-action" className="arc-btn" onClick={()=>dispatch({type:"tap"})}>Tap!</button>
      </>):(<div className="arc-done"><h2>Game Over!</h2><div className="arc-final">Score: {state.score}</div></div>)}
    </div>
  );
}
