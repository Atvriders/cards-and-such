import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FaceFeastState, FaceFeastAction, FaceFeastSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";

export function FaceFeastGame({ state, dispatch, onGameOver }: GameProps<FaceFeastState, FaceFeastSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.drawNumber} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.card !== null && (
        <div className="cm-row">
          <div className={`cm-card ${isRed(state.card) ? "red" : "black"}`}>{cardName(state.card)}</div>
        </div>
      )}
      {state.phase === "ready" && (
        <button data-testid="hint-target-face-feast-primary" className="cm-btn" onClick={() => dispatch({ type:"draw" } as FaceFeastAction)}>Draw 1</button>
      )}
      {state.phase === "revealed" && (
        <>
          <div className="cm-result">+{state.lastPts}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as FaceFeastAction)}>Next</button>
        </>
      )}
    </div>
  );
}
