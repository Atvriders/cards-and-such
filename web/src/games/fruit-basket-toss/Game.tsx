import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FruitBasketTossState, FruitBasketTossAction, FruitBasketTossSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function FruitBasketTossGame({ state, dispatch, onGameOver }: GameProps<FruitBasketTossState, FruitBasketTossSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") return <div className="arc-wrap"><div className="arc-done"><h2>Done!</h2><p>Score: {state.score}</p></div></div>;
  return (
    <div className="arc-wrap">
      <div className="arc-header"><span>Round {state.roundIndex+1}/{TOTAL_ROUNDS}</span><span className="arc-score">{state.score} pts</span></div>
      <div className="arc-display">🧺</div>
      {state.phase==="aiming" && <>
        <div className="arc-slider-row"><span className="arc-slider-label">Power</span><input type="range" className="arc-slider" min={0} max={100} value={state.power} onChange={e=>dispatch({type:"setPower",value:+e.target.value} as FruitBasketTossAction)}/><span className="arc-slider-value">{state.power}</span></div>
        <button className="arc-btn" onClick={()=>dispatch({type:"throw"} as FruitBasketTossAction)}>Go!</button>
      </>}
      {state.phase==="result" && <><div className="arc-result">+{state.lastPts} pts (off by {state.lastDiff})</div><button className="arc-btn" onClick={()=>dispatch({type:"next"} as FruitBasketTossAction)}>Next</button></>}
    </div>
  );
}
