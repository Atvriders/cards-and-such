import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KebabStackState, KebabStackAction, KebabStackSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function KebabStackGame({ state, dispatch, onGameOver }: GameProps<KebabStackState, KebabStackSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") {
    return <div className="arc-wrap"><div className="arc-done"><h2>All Done!</h2><div className="arc-final">Score: {state.score}</div></div></div>;
  }
  return (
    <div className="arc-wrap">
      <div className="arc-info">Round {state.roundIndex + 1} / {state.targets.length}</div>
      <div className="arc-score">Score: {state.score}</div>
      <div className="arc-display">🥙</div>
      {state.phase === "aiming" ? (
        <>
          <input className="arc-slider" type="range" min={0} max={100} value={state.power}
            onChange={e => dispatch({ type:"setPower", value:Number(e.target.value) } as KebabStackAction)} />
          <div className="arc-info">Power: {state.power}</div>
          <button className="arc-btn" onClick={() => dispatch({ type:"throw" } as KebabStackAction)}>Go!</button>
        </>
      ) : (
        <>
          <div className="arc-result">+{state.lastPts} pts (off by {state.lastDiff})</div>
          <button className="arc-btn" onClick={() => dispatch({ type:"next" } as KebabStackAction)}>Next</button>
        </>
      )}
    </div>
  );
}
