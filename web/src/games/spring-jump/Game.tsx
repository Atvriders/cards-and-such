import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpringJumpState, SpringJumpAction, SpringJumpSettings } from "./state.js";
import { isTerminal, TOTAL_JUMPS } from "./state.js";
import "./Game.css";
export function SpringJumpGame({ state, dispatch, onGameOver }: GameProps<SpringJumpState, SpringJumpSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const last = state.results[state.results.length - 1];
  if (state.phase === "done") return <div className="arc-wrap"><div className="arc-done"><h2>Done!</h2><p>Score: {state.score} pts</p><p>Jumps: {TOTAL_JUMPS}</p></div></div>;
  return (
    <div className="arc-wrap">
      <div className="arc-header"><span>Jump {state.jumpIndex+1}/{TOTAL_JUMPS}</span><span className="arc-score">{state.score} pts</span></div>
      <div className="arc-display">🐸</div>
      {state.phase==="aiming" && <>
        <div className="arc-slider-row"><span className="arc-slider-label">Tension</span><input type="range" className="arc-slider" min={1} max={100} value={state.tension} onChange={e=>dispatch({type:"setTension",value:+e.target.value} as SpringJumpAction)}/><span className="arc-slider-value">{state.tension}</span></div>
        <button data-testid="hint-target-spring-jump-action" className="arc-btn" onClick={()=>dispatch({type:"jump"} as SpringJumpAction)}>Jump!</button>
      </>}
      {state.phase==="jumped" && last && <><div className="arc-result">Distance: {last.distance.toFixed(1)} — +{last.pts} pts</div><button className="arc-btn" onClick={()=>dispatch({type:"next"} as SpringJumpAction)}>Next</button></>}
      <div className="arc-history">{state.results.map((r,i)=><div key={i} className={`arc-dot${r.pts<20?" miss":""}`}/>)}</div>
    </div>
  );
}
