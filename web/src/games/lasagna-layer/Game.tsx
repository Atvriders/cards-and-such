import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LasagnaLayerState, LasagnaLayerAction, LasagnaLayerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function LasagnaLayerGame({ state, dispatch, onGameOver }: GameProps<LasagnaLayerState, LasagnaLayerSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") {
    return <div className="lasagna-wrap"><div className="lasagna-done"><h2>All Done!</h2><div className="lasagna-final">Score: {state.score}</div></div></div>;
  }
  return (
    <div className="lasagna-wrap">
      <div className="lasagna-info">Round {state.roundIndex + 1} / {state.targets.length}</div>
      <div className="lasagna-score">Score: {state.score}</div>
      <div className="lasagna-display">🍝</div>
      {state.phase === "aiming" ? (
        <>
          <input className="lasagna-slider" type="range" min={0} max={100} value={state.power}
            onChange={e => dispatch({ type:"setPower", value:Number(e.target.value) } as LasagnaLayerAction)} />
          <div className="lasagna-info">Power: {state.power}</div>
          <button data-testid="hint-target-lasagna-layer-action" className="lasagna-btn" onClick={() => dispatch({ type:"throw" } as LasagnaLayerAction)}>Go!</button>
        </>
      ) : (
        <>
          <div className="lasagna-result">+{state.lastPts} pts (off by {state.lastDiff})</div>
          <button className="lasagna-btn" onClick={() => dispatch({ type:"next" } as LasagnaLayerAction)}>Next</button>
        </>
      )}
    </div>
  );
}
