import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OddOllieState, OddOllieAction, OddOllieSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS, POINTS_PER_HIT } from "./state.js";
import "./Game.css";

export function OddOllieGame({ state, dispatch, onGameOver }: GameProps<OddOllieState, OddOllieSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div>Hits: {state.hits} / {TOTAL_DRAWS}</div><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.draw} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts • Hits: {state.hits}</div>
      {state.card !== null && (
        <div className={`cm-card ${isRed(state.card) ? "red" : "black"}`}>{cardName(state.card)}</div>
      )}
      {state.phase === "drawing" && (
        <button data-testid="hint-target-odd-ollie-primary" className="cm-btn" onClick={() => dispatch({ type: "draw" } as OddOllieAction)}>Draw</button>
      )}
      {state.phase === "shown" && (
        <>
          <div className="cm-result">{state.lastWasHit ? `Odd! +${POINTS_PER_HIT}` : `Even — 0`}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type: "next" } as OddOllieAction)}>Next</button>
        </>
      )}
    </div>
  );
}
