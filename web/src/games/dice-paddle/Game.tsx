import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePaddleState, DicePaddleAction, DicePaddleSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DicePaddleGame({ state, dispatch, onGameOver }: GameProps<DicePaddleState, DicePaddleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dpdl-wrap dpdl-theme"><div className="dpdl-done"><h2>Done!</h2><div className="dpdl-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dpdl-wrap dpdl-theme">
      <div className="dpdl-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dpdl-score">{state.score} pts</div>
      {state.roll !== null && <div className="dpdl-die">{state.roll}</div>}
      {state.phase === "picking" && (
        <>
          <div className="dpdl-prompt">Pick your hit:</div>
          <div className="dpdl-row">
            <button className="dpdl-btn light" data-testid="hint-target-dice-paddle-roll" onClick={() => dispatch({ type: "pick", choice: "light" } as DicePaddleAction)}>Light (+r)</button>
            <button className="dpdl-btn med" onClick={() => dispatch({ type: "pick", choice: "medium" } as DicePaddleAction)}>Medium (+2r if 4+)</button>
            <button className="dpdl-btn heavy" onClick={() => dispatch({ type: "pick", choice: "heavy" } as DicePaddleAction)}>Heavy (+3r if 5+, else -r)</button>
          </div>
        </>
      )}
      {state.phase === "result" && (
        <>
          <div className={`dp-feedback ${state.delta > 0 ? "ok" : state.delta < 0 ? "no" : ""}`}>{state.pick} → roll {state.roll} → {state.delta >= 0 ? `+${state.delta}` : state.delta}</div>
          <button className="dpdl-btn alt" data-testid="hint-target-dice-paddle-next" onClick={() => dispatch({ type: "next" } as DicePaddleAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
