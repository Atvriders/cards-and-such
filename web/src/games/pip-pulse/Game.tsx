import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PipPulseState, PipPulseAction, PipPulseSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function PipPulseGame({ state, dispatch, onGameOver }: GameProps<PipPulseState, PipPulseSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.card !== null && (
        <div className="cm-row">
          <div className={`cm-card ${isRed(state.card) ? "red" : "black"}`}>{cardName(state.card)}</div>
        </div>
      )}
      {state.phase === "predict" && (
        <div className="cm-row">
          <button className="cm-btn alt" onClick={() => dispatch({ type:"predict", choice:"low" } as PipPulseAction)}>Pip ≤ 7</button>
          <button data-testid="hint-target-pip-pulse-primary" className="cm-btn" onClick={() => dispatch({ type:"predict", choice:"high" } as PipPulseAction)}>Pip &gt; 7</button>
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="cm-result">Pip: {state.pip} — {state.lastWin ? "Correct! +10" : "Wrong."}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as PipPulseAction)}>Next</button>
        </>
      )}
    </div>
  );
}
