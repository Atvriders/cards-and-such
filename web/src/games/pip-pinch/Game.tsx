import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PipPinchState, PipPinchAction, PipPinchSettings } from "./state.js";
import { isTerminal, cardName, isRed, isLow, MAX_PINCHES } from "./state.js";
import "./Game.css";

export function PipPinchGame({ state, dispatch, onGameOver }: GameProps<PipPinchState, PipPinchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="pp-wrap"><div className="pp-done"><h2>Done!</h2><div className="pp-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="pp-wrap">
      <div className="pp-info">Pinches: {state.pinches} / {MAX_PINCHES}</div>
      <div className="pp-grid">
        {state.cards.map((c, i) => {
          const isRemoved = state.removed[i];
          const cls = `pp-card ${isRed(c) ? "red" : "black"} ${isRemoved ? "removed" : ""} ${isLow(c) ? "low" : "high"}`;
          return (
            <button key={i} className={cls} disabled={isRemoved || state.pinches >= MAX_PINCHES} onClick={() => dispatch({ type:"pinch", index:i } as PipPinchAction)}>
              {cardName(c)}
            </button>
          );
        })}
      </div>
      <button className="pp-btn" onClick={() => dispatch({ type:"finish" } as PipPinchAction)}>Finish & Score</button>
    </div>
  );
}
