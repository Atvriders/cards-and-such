import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FaceCollectorState, FaceCollectorAction, FaceCollectorSettings } from "./state.js";
import { isTerminal, cardName, isRed, TARGET_LABELS, ROUNDS, DRAWS_PER_ROUND } from "./state.js";
import "./Game.css";

export function FaceCollectorGame({ state, dispatch, onGameOver }: GameProps<FaceCollectorState, FaceCollectorSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="col-wrap"><div className="col-done"><h2>Done!</h2><div className="col-final">{state.score} pts</div></div></div>;
  }
  const target = state.targets[state.round]!;
  const targetLabel = TARGET_LABELS[target]!;
  const remaining = DRAWS_PER_ROUND - state.draws.length;
  return (
    <div className="col-wrap">
      <div className="col-info">Round {state.round + 1} / {ROUNDS}</div>
      <div className="col-target">Target: {targetLabel}</div>
      <div className="col-score">{state.score} pts</div>
      <div className="col-row">
        {state.draws.map((c, i) => <div key={i} className={`col-card ${isRed(c) ? "red" : "black"} ${state.hits[i] ? "hit" : ""}`}>{cardName(c)}</div>)}
      </div>
      {remaining > 0 && (
        <button className="col-btn" onClick={() => dispatch({ type:"draw" } as FaceCollectorAction)}>Draw ({remaining} left)</button>
      )}
      {remaining === 0 && (
        <button className="col-btn alt" onClick={() => dispatch({ type:"next" } as FaceCollectorAction)}>{state.round + 1 >= ROUNDS ? "Finish" : "Next Round"}</button>
      )}
    </div>
  );
}
