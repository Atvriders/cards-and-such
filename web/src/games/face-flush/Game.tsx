import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FaceFlushState, FaceFlushAction, FaceFlushSettings } from "./state.js";
import { isTerminal, cardName, isRed, isFace, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function FaceFlushGame({ state, dispatch, onGameOver }: GameProps<FaceFlushState, FaceFlushSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS} — Find Face Cards</div>
      <div className="cm-score">{state.score} pts</div>
      {state.hand.length > 0 && (
        <div className="cm-row">
          {state.hand.map((c, i) => <div key={i} className={`cm-card ${isRed(c) ? "red" : "black"} ${isFace(c) ? "face" : ""}`}>{cardName(c)}</div>)}
        </div>
      )}
      {state.phase === "dealing" && (
        <button data-testid="hint-target-face-flush-primary" className="cm-btn" onClick={() => dispatch({ type:"deal" } as FaceFlushAction)}>Deal 5</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">Faces: {state.faceCount}/5 — +{state.lastPts}{state.bonus ? " (FLUSH BONUS!)" : ""}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as FaceFlushAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
