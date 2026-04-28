import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardVolcanoState, CardVolcanoAction, CardVolcanoSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function CardVolcanoGame({ state, dispatch, onGameOver }: GameProps<CardVolcanoState, CardVolcanoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Volcano — Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.card !== null && (
        <div className="cm-row">
          <div className={`cm-card ${isRed(state.card) ? "red" : "black"}`}>{cardName(state.card)}</div>
        </div>
      )}
      {state.phase === "draw" && (
        <button className="cm-btn" onClick={() => dispatch({ type:"draw" } as CardVolcanoAction)}>Draw</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">{state.lastPts > 0 ? `+${state.lastPts}` : "No points"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardVolcanoAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
