import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FaceFlipState, FaceFlipAction, FaceFlipSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function FaceFlipGame({ state, dispatch, onGameOver }: GameProps<FaceFlipState, FaceFlipSettings>): JSX.Element {
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
          <button data-testid="hint-target-face-flip-primary" className="cm-btn" onClick={() => dispatch({ type:"predict", choice:"face" } as FaceFlipAction)}>Face card (J/Q/K)</button>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"predict", choice:"notface" } as FaceFlipAction)}>Not a face</button>
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="cm-result">{state.lastWin ? "Correct! +10" : `Wrong. ${state.isFace ? "It was a face." : "It was not a face."}`}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as FaceFlipAction)}>Next</button>
        </>
      )}
    </div>
  );
}
