import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NoodleGrabState, NoodleGrabAction, NoodleGrabSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function NoodleGrabGame({ state, dispatch, onGameOver }: GameProps<NoodleGrabState, NoodleGrabSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") {
    return <div className="noodle-wrap"><div className="noodle-done"><h2>All Done!</h2><div className="noodle-final">Score: {state.score}</div></div></div>;
  }
  return (
    <div className="noodle-wrap">
      <div className="noodle-info">Round {state.roundIndex + 1} / {state.targets.length}</div>
      <div className="noodle-score">Score: {state.score}</div>
      <div className="noodle-display">🍲</div>
      {state.phase === "aiming" ? (
        <>
          <input className="noodle-slider" type="range" min={0} max={100} value={state.power}
            onChange={e => dispatch({ type:"setPower", value:Number(e.target.value) } as NoodleGrabAction)} />
          <div className="noodle-info">Power: {state.power}</div>
          <button data-testid="hint-target-noodle-grab-action" className="noodle-btn" onClick={() => dispatch({ type:"throw" } as NoodleGrabAction)}>Go!</button>
        </>
      ) : (
        <>
          <div className="noodle-result">+{state.lastPts} pts (off by {state.lastDiff})</div>
          <button className="noodle-btn" onClick={() => dispatch({ type:"next" } as NoodleGrabAction)}>Next</button>
        </>
      )}
    </div>
  );
}
