import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TopSpinState, TopSpinAction, TopSpinSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function TopSpinGame({ state, dispatch, onGameOver }: GameProps<TopSpinState, TopSpinSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") return <div className="arc-wrap"><div className="arc-done"><h2>Done!</h2><p>Score: {state.score}</p></div></div>;
  return (
    <div className="arc-wrap">
      <div className="arc-header"><span>Round {state.roundIndex+1}/{TOTAL_ROUNDS}</span><span className="arc-score">{state.score} pts</span></div>
      <div className="arc-display">🌀</div>
      {state.phase==="aiming" && <>
        <div className="arc-slider-row"><span className="arc-slider-label">Spin Rate</span><input type="range" className="arc-slider" min={0} max={100} value={state.power} onChange={e=>dispatch({type:"setPower",value:+e.target.value} as TopSpinAction)}/><span className="arc-slider-value">{state.power}</span></div>
        <button data-testid="hint-target-top-spin-action" className="arc-btn" onClick={()=>dispatch({type:"throw"} as TopSpinAction)}>Go!</button>
      </>}
      {state.phase==="result" && <><div className="arc-result">+{state.lastPts} pts (off by {state.lastDiff})</div><button className="arc-btn" onClick={()=>dispatch({type:"next"} as TopSpinAction)}>Next</button></>}
    </div>
  );
}
