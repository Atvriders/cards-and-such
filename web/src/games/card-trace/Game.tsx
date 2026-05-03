import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardTraceState, CardTraceAction, CardTraceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, CHOICES } from "./state.js";
import "./Game.css";

export function CardTraceGame({ state, dispatch, onGameOver }: GameProps<CardTraceState, CardTraceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="rg-wrap"><div className="rg-done"><h2>Done!</h2><div className="rg-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="rg-wrap">
      <div className="rg-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="rg-score">{state.score} pts</div>
      {state.display && <div className="rg-display">{state.display}</div>}
      {state.phase === "predict" && (
        <div className="rg-row">
          {CHOICES.map(c => (
            <button key={c} className="rg-btn" onClick={() => dispatch({ type:"go", choice:c } as CardTraceAction)}>{c}</button>
          ))}
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="rg-result">{state.lastWin ? `Correct! +${state.lastPts}` : "Wrong — 0"}</div>
          <button data-testid="hint-target-card-trace-next" className="rg-btn alt" onClick={() => dispatch({ type:"next" } as CardTraceAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
