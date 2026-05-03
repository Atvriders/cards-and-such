import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AcesUpMiniState, AcesUpMiniAction, AcesUpMiniSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";

export function AcesUpMiniGame({ state, dispatch, onGameOver }: GameProps<AcesUpMiniState, AcesUpMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap aum-wrap"><div className="cm-done"><h2>Done!</h2><div>Aces found: {state.acesFound}</div><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap aum-wrap">
      <div className="cm-info">Draw {state.draw} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts • Aces: {state.acesFound}</div>
      {state.card !== null && (
        <div className={`cm-card ${isRed(state.card) ? "red" : "black"}`}>{cardName(state.card)}</div>
      )}
      {state.phase === "drawing" && (
        <button data-testid="hint-target-aces-up-mini-primary" className="cm-btn" onClick={() => dispatch({ type: "draw" } as AcesUpMiniAction)}>Draw</button>
      )}
      {state.phase === "shown" && (
        <>
          <div className="cm-result">{state.lastWasAce ? "Ace! +50" : "Not an Ace — 0"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type: "next" } as AcesUpMiniAction)}>Next</button>
        </>
      )}
    </div>
  );
}
