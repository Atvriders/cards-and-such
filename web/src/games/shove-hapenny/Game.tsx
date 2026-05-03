import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShoveHapennyState, ShoveHapennyAction, ShoveHapennySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function ShoveHapennyGame({ state, dispatch, onGameOver }: GameProps<ShoveHapennyState, ShoveHapennySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="shohap-wrap">
        <div className="shohap-done">
          <h2>Shove</h2>
          <div className="shohap-final">{Math.max(0, state.score)} pts</div>
          
          <div className="shohap-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="shohap-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="shohap-wrap">
      <div className="shohap-head">
        <span className="shohap-round">Shove {state.round} / {TOTAL_ROUNDS}</span>
        <span className="shohap-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="shohap-dice-row">
          {state.dice.map((d, i) => <div key={i} className="shohap-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="shohap-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="shohap-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="shohap-log">{line}</div>)}
      </div>
      <div className="shohap-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-shove-hapenny-action" className="shohap-btn primary" onClick={() => dispatch({ type: "roll" } as ShoveHapennyAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="shohap-btn alt" onClick={() => dispatch({ type: "next" } as ShoveHapennyAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
