import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingsCourtState, KingsCourtAction, KingsCourtSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";

export function KingsCourtGame({ state, dispatch, onGameOver }: GameProps<KingsCourtState, KingsCourtSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.draw} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.hand.length > 0 && (
        <div className="cm-row">
          {state.hand.map((c, i) => {
            const matched = state.matchedIdx.includes(i);
            return <div key={i} className={`cm-card ${isRed(c) ? "red" : "black"}${matched ? " match" : ""}`}>{cardName(c)}</div>;
          })}
        </div>
      )}
      {state.phase === "dealing" && (
        <button className="cm-btn" onClick={() => dispatch({ type:"deal" } as KingsCourtAction)}>Deal</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">{state.lastPts > 0 ? `+${state.lastPts} pts` : "No matches"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as KingsCourtAction)}>{state.draw >= TOTAL_DRAWS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
