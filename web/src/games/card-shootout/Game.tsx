import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardShootoutState, CardShootoutAction, CardShootoutSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, CHOICES } from "./state.js";
import "./Game.css";

export function CardShootoutGame({ state, dispatch, onGameOver }: GameProps<CardShootoutState, CardShootoutSettings>): JSX.Element {
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
            <button data-testid="hint-target-card-shootout-action" key={c} className="rg-btn" onClick={() => dispatch({ type:"go", choice:c } as CardShootoutAction)}>{c}</button>
          ))}
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="rg-result">{state.lastWin ? `Correct! +${state.lastPts}` : "Wrong — 0"}</div>
          <button className="rg-btn alt" onClick={() => dispatch({ type:"next" } as CardShootoutAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
