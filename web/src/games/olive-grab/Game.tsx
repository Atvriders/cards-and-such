import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OliveGrabState, OliveGrabAction, OliveGrabSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function OliveGrabGame({ state, dispatch, onGameOver }: GameProps<OliveGrabState, OliveGrabSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") {
    return <div className="olive-wrap"><div className="olive-done"><h2>All Done!</h2><div className="olive-final">Score: {state.score}</div></div></div>;
  }
  return (
    <div className="olive-wrap">
      <div className="olive-info">Round {state.roundIndex + 1} / {state.targets.length}</div>
      <div className="olive-score">Score: {state.score}</div>
      <div className="olive-display">🫒</div>
      {state.phase === "aiming" ? (
        <>
          <input className="olive-slider" type="range" min={0} max={100} value={state.power}
            onChange={e => dispatch({ type:"setPower", value:Number(e.target.value) } as OliveGrabAction)} />
          <div className="olive-info">Power: {state.power}</div>
          <button className="olive-btn" onClick={() => dispatch({ type:"throw" } as OliveGrabAction)}>Go!</button>
        </>
      ) : (
        <>
          <div className="olive-result">+{state.lastPts} pts (off by {state.lastDiff})</div>
          <button className="olive-btn" onClick={() => dispatch({ type:"next" } as OliveGrabAction)}>Next</button>
        </>
      )}
    </div>
  );
}
