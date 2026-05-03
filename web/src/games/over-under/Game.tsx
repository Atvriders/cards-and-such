import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OverUnderState, OverUnderAction, OverUnderSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function OverUnderGame({ state, dispatch, onGameOver }: GameProps<OverUnderState, OverUnderSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap over-under-theme"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap over-under-theme">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && (
        <div className="dm-row">
          <div className="dm-die">{state.dice[0]}</div>
          <div className="dm-die">{state.dice[1]}</div>
        </div>
      )}
      {state.phase === "predict" && (
        <div className="dm-row">
          <button className="dm-btn" onClick={() => dispatch({ type:"predict", choice:"under" } as OverUnderAction)} data-testid="hint-target-overunder-predict">Under 7</button>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"predict", choice:"over" } as OverUnderAction)}>Over 7</button>
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="dm-result">{state.push ? "Push (sum = 7) — 0" : state.lastWin ? "Correct! +10" : "Wrong — 0"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as OverUnderAction)} data-testid="hint-target-overunder-next">Next</button>
        </>
      )}
    </div>
  );
}
