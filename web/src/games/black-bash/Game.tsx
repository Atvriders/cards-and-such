import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlackBashState, BlackBashAction, BlackBashSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS, POINTS_PER_HIT } from "./state.js";
import "./Game.css";

export function BlackBashGame({ state, dispatch, onGameOver }: GameProps<BlackBashState, BlackBashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done bounce-in"><h2>Done!</h2><div>Hits: {state.hits} / {TOTAL_DRAWS}</div><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap fade-in">
      <div className="cm-info">Draw {state.draw} / {TOTAL_DRAWS}</div>
      <div className="cm-score pulse">{state.score} pts • Hits: {state.hits}</div>
      {state.card !== null && (
        <div className={`cm-card ${isRed(state.card) ? "red" : "black"}`}>{cardName(state.card)}</div>
      )}
      {state.phase === "drawing" && (
        <button data-testid="hint-target-black-bash-primary" className="cm-btn" onClick={() => dispatch({ type: "draw" } as BlackBashAction)}>Draw</button>
      )}
      {state.phase === "shown" && (
        <>
          <div className="cm-result">{state.lastWasHit ? `Black! +${POINTS_PER_HIT}` : `Red — 0`}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type: "next" } as BlackBashAction)}>Next</button>
        </>
      )}
    </div>
  );
}
