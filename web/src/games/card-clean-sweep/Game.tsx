import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardCleanSweepState, CardCleanSweepAction, CardCleanSweepSettings } from "./state.js";
import { isTerminal, cardName, isRed, isFace, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CardCleanSweepGame({ state, dispatch, onGameOver }: GameProps<CardCleanSweepState, CardCleanSweepSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ccs-wrap"><div className="ccs-done"><h2>Done!</h2><div className="ccs-final">{state.score} pts</div></div></div>;
  }
  const last = state.drawn.length > 0 ? state.drawn[state.drawn.length - 1]! : null;
  return (
    <div className="ccs-wrap">
      <div className="ccs-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ccs-info">Pile: {state.pile.length} — Face cards: {state.faceFound}</div>
      <div className="ccs-score">{state.score} pts</div>
      {last !== null && (
        <div className={`ccs-card ${isRed(last) ? "red" : "black"} ${isFace(last) ? "face" : ""}`}>{cardName(last)}</div>
      )}
      {state.phase === "drawing" && (
        <button className="ccs-btn" onClick={() => dispatch({ type: "draw" } as CardCleanSweepAction)}>Draw</button>
      )}
      {state.phase === "roundDone" && (
        <>
          <div className="ccs-feedback">Round done. Face cards found: {state.faceFound}</div>
          <button className="ccs-btn alt" onClick={() => dispatch({ type: "next" } as CardCleanSweepAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next Round"}</button>
        </>
      )}
    </div>
  );
}
