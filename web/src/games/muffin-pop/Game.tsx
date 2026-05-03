import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MuffinPopState, MuffinPopAction, MuffinPopSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function MuffinPopGame({ state, dispatch, onGameOver }: GameProps<MuffinPopState, MuffinPopSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") {
    return <div className="muffin-wrap"><div className="muffin-done"><h2>All Done!</h2><div className="muffin-final">Score: {state.score}</div></div></div>;
  }
  return (
    <div className="muffin-wrap">
      <div className="muffin-info">Round {state.roundIndex + 1} / {state.targets.length}</div>
      <div className="muffin-score">Score: {state.score}</div>
      <div className="muffin-display">🧁</div>
      {state.phase === "aiming" ? (
        <>
          <input className="muffin-slider" type="range" min={0} max={100} value={state.power}
            onChange={e => dispatch({ type:"setPower", value:Number(e.target.value) } as MuffinPopAction)} />
          <div className="muffin-info">Power: {state.power}</div>
          <button data-testid="hint-target-muffin-pop-action" className="muffin-btn" onClick={() => dispatch({ type:"throw" } as MuffinPopAction)}>Go!</button>
        </>
      ) : (
        <>
          <div className="muffin-result">+{state.lastPts} pts (off by {state.lastDiff})</div>
          <button className="muffin-btn" onClick={() => dispatch({ type:"next" } as MuffinPopAction)}>Next</button>
        </>
      )}
    </div>
  );
}
