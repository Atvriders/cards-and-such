import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LobsterGrabState, LobsterGrabAction, LobsterGrabSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function LobsterGrabGame({ state, dispatch, onGameOver }: GameProps<LobsterGrabState, LobsterGrabSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") {
    return <div className="lobster-wrap"><div className="lobster-done"><h2>All Done!</h2><div className="lobster-final">Score: {state.score}</div></div></div>;
  }
  return (
    <div className="lobster-wrap">
      <div className="lobster-info">Round {state.roundIndex + 1} / {state.targets.length}</div>
      <div className="lobster-score">Score: {state.score}</div>
      <div className="lobster-display">🦞</div>
      {state.phase === "aiming" ? (
        <>
          <input className="lobster-slider" type="range" min={0} max={100} value={state.power}
            onChange={e => dispatch({ type:"setPower", value:Number(e.target.value) } as LobsterGrabAction)} />
          <div className="lobster-info">Power: {state.power}</div>
          <button data-testid="hint-target-lobster-grab-action" className="lobster-btn" onClick={() => dispatch({ type:"throw" } as LobsterGrabAction)}>Go!</button>
        </>
      ) : (
        <>
          <div className="lobster-result">+{state.lastPts} pts (off by {state.lastDiff})</div>
          <button className="lobster-btn" onClick={() => dispatch({ type:"next" } as LobsterGrabAction)}>Next</button>
        </>
      )}
    </div>
  );
}
