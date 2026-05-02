import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardTrainTrackState, CardTrainTrackAction, CardTrainTrackSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CardTrainTrackGame({ state, dispatch, onGameOver }: GameProps<CardTrainTrackState, CardTrainTrackSettings>): JSX.Element {
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
      {state.phase === "draw" && (
        <button data-testid="hint-target-card-train-track-primary" className="cm-btn" onClick={() => dispatch({ type:"draw" } as CardTrainTrackAction)}>Lay</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">Tie: +{state.lastPts}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardTrainTrackAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
