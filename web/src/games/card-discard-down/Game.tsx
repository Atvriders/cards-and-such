import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardDiscardDownState, CardDiscardDownAction, CardDiscardDownSettings } from "./state.js";
import { isTerminal, cardName, isRed, pipValue, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CardDiscardDownGame({ state, dispatch, onGameOver }: GameProps<CardDiscardDownState, CardDiscardDownSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cdd-wrap"><div className="cdd-done"><h2>Done!</h2><div className="cdd-final">{state.score} pts</div></div></div>;
  }
  const handSum = state.hand.reduce((a, b) => a + pipValue(b), 0);
  return (
    <div className="cdd-wrap">
      <div className="cdd-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cdd-score">{state.score} pts</div>
      <div className="cdd-info">Hand sum: {handSum} (lower is better)</div>
      <div className="cdd-row">
        {state.hand.map((c, i) => {
          const sel = state.selected.includes(i);
          return (
            <button
              key={i}
              className={`cdd-card ${isRed(c) ? "red" : "black"} ${sel ? "selected" : ""}`}
              disabled={state.phase !== "selecting"}
              onClick={() => dispatch({ type: "toggle", index: i } as CardDiscardDownAction)}
            >{cardName(c)}<div className="cdd-pip">({pipValue(c)})</div></button>
          );
        })}
      </div>
      {state.phase === "selecting" && (
        <>
          <div className="cdd-info">Selected to discard: {state.selected.length} / 2</div>
          <button className="cdd-btn" onClick={() => dispatch({ type: "discard" } as CardDiscardDownAction)}>Discard & Draw</button>
        </>
      )}
      {state.phase === "result" && (
        <>
          <div className="cdd-feedback">Final sum: {state.finalSum}</div>
          <button className="cdd-btn alt" onClick={() => dispatch({ type: "next" } as CardDiscardDownAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
