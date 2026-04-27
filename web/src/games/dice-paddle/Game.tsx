import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePaddleState, DicePaddleAction, DicePaddleSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DicePaddleGame({ state, dispatch, onGameOver }: GameProps<DicePaddleState, DicePaddleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dp-wrap"><div className="dp-done"><h2>Done!</h2><div className="dp-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dp-wrap">
      <div className="dp-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dp-score">{state.score} pts</div>
      {state.roll !== null && <div className="dp-die">{state.roll}</div>}
      {state.phase === "picking" && (
        <>
          <div className="dp-prompt">Pick your hit:</div>
          <div className="dp-row">
            <button className="dp-btn light" onClick={() => dispatch({ type: "pick", choice: "light" } as DicePaddleAction)}>Light (+r)</button>
            <button className="dp-btn med" onClick={() => dispatch({ type: "pick", choice: "medium" } as DicePaddleAction)}>Medium (+2r if 4+)</button>
            <button className="dp-btn heavy" onClick={() => dispatch({ type: "pick", choice: "heavy" } as DicePaddleAction)}>Heavy (+3r if 5+, else -r)</button>
          </div>
        </>
      )}
      {state.phase === "result" && (
        <>
          <div className={`dp-feedback ${state.delta > 0 ? "ok" : state.delta < 0 ? "no" : ""}`}>{state.pick} → roll {state.roll} → {state.delta >= 0 ? `+${state.delta}` : state.delta}</div>
          <button className="dp-btn alt" onClick={() => dispatch({ type: "next" } as DicePaddleAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
