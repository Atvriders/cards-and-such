import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MangoTossState, MangoTossAction, MangoTossSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function MangoTossGame({ state, dispatch, onGameOver }: GameProps<MangoTossState, MangoTossSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") {
    return <div className="mangotoss-wrap"><div className="mangotoss-done"><h2>All Done!</h2><div className="mangotoss-final">Score: {state.score}</div></div></div>;
  }
  return (
    <div className="mangotoss-wrap">
      <div className="mangotoss-info">Round {state.roundIndex + 1} / {state.targets.length}</div>
      <div className="mangotoss-score">Score: {state.score}</div>
      <div className="mangotoss-display">🥭</div>
      {state.phase === "aiming" ? (
        <>
          <input className="mangotoss-slider" type="range" min={0} max={100} value={state.power}
            onChange={e => dispatch({ type:"setPower", value:Number(e.target.value) } as MangoTossAction)} />
          <div className="mangotoss-info">Power: {state.power}</div>
          <button data-testid="hint-target-mango-toss-action" className="mangotoss-btn" onClick={() => dispatch({ type:"throw" } as MangoTossAction)}>Go!</button>
        </>
      ) : (
        <>
          <div className="mangotoss-result">+{state.lastPts} pts (off by {state.lastDiff})</div>
          <button className="mangotoss-btn" onClick={() => dispatch({ type:"next" } as MangoTossAction)}>Next</button>
        </>
      )}
    </div>
  );
}
