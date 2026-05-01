import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LemonPopState, LemonPopAction, LemonPopSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function LemonPopGame({ state, dispatch, onGameOver }: GameProps<LemonPopState, LemonPopSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") {
    return <div className="lemonpop-wrap"><div className="lemonpop-done"><h2>All Done!</h2><div className="lemonpop-final">Score: {state.score}</div></div></div>;
  }
  return (
    <div className="lemonpop-wrap">
      <div className="lemonpop-info">Round {state.roundIndex + 1} / {state.targets.length}</div>
      <div className="lemonpop-score">Score: {state.score}</div>
      <div className="lemonpop-display">🍋</div>
      {state.phase === "aiming" ? (
        <>
          <input className="lemonpop-slider" type="range" min={0} max={100} value={state.power}
            onChange={e => dispatch({ type:"setPower", value:Number(e.target.value) } as LemonPopAction)} />
          <div className="lemonpop-info">Power: {state.power}</div>
          <button className="lemonpop-btn" onClick={() => dispatch({ type:"throw" } as LemonPopAction)}>Go!</button>
        </>
      ) : (
        <>
          <div className="lemonpop-result">+{state.lastPts} pts (off by {state.lastDiff})</div>
          <button className="lemonpop-btn" onClick={() => dispatch({ type:"next" } as LemonPopAction)}>Next</button>
        </>
      )}
    </div>
  );
}
