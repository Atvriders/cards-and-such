import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KebabStackState, KebabStackAction, KebabStackSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function KebabStackGame({ state, dispatch, onGameOver }: GameProps<KebabStackState, KebabStackSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") {
    return <div className="kebab-wrap"><div className="kebab-done"><h2>All Done!</h2><div className="kebab-final">Score: {state.score}</div></div></div>;
  }
  return (
    <div className="kebab-wrap">
      <div className="kebab-info">Round {state.roundIndex + 1} / {state.targets.length}</div>
      <div className="kebab-score">Score: {state.score}</div>
      <div className="kebab-display">🌯</div>
      {state.phase === "aiming" ? (
        <>
          <input className="kebab-slider" type="range" min={0} max={100} value={state.power}
            onChange={e => dispatch({ type:"setPower", value:Number(e.target.value) } as KebabStackAction)} />
          <div className="kebab-info">Power: {state.power}</div>
          <button className="kebab-btn" onClick={() => dispatch({ type:"throw" } as KebabStackAction)}>Go!</button>
        </>
      ) : (
        <>
          <div className="kebab-result">+{state.lastPts} pts (off by {state.lastDiff})</div>
          <button className="kebab-btn" onClick={() => dispatch({ type:"next" } as KebabStackAction)}>Next</button>
        </>
      )}
    </div>
  );
}
