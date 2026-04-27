import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NineNineState, NineNineAction, NineNineSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";

export function NineNineGame({ state, dispatch, onGameOver }: GameProps<NineNineState, NineNineSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div>Nines drawn: {state.ninesCount}</div><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.draw} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts (Nines: {state.ninesCount})</div>
      {state.card !== null && (
        <div className="cm-row">
          <div className={`cm-card ${isRed(state.card) ? "red" : "black"}`}>{cardName(state.card)}</div>
        </div>
      )}
      {state.phase === "drawing" && (
        <button className="cm-btn" onClick={() => dispatch({ type:"draw" } as NineNineAction)}>Draw</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">{state.lastPts >= 60 ? `Nine! +${state.lastPts}` : `+${state.lastPts}`}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as NineNineAction)}>{state.draw >= TOTAL_DRAWS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
