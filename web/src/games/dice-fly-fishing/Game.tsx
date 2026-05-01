import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFlyFishingState, DiceFlyFishingAction, DiceFlyFishingSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceFlyFishingGame({ state, dispatch, onGameOver }: GameProps<DiceFlyFishingState, DiceFlyFishingSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="diflfi-wrap">
        <div className="diflfi-done">
          <h2>Cast</h2>
          <div className="diflfi-final">{Math.max(0, state.score)} pts</div>
          
          <div className="diflfi-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="diflfi-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="diflfi-wrap">
      <div className="diflfi-head">
        <span className="diflfi-round">Cast {state.round} / {TOTAL_ROUNDS}</span>
        <span className="diflfi-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="diflfi-dice-row">
          {state.dice.map((d, i) => <div key={i} className="diflfi-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="diflfi-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="diflfi-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="diflfi-log">{line}</div>)}
      </div>
      <div className="diflfi-actions">
        {state.phase === "rolling" && (
          <button className="diflfi-btn primary" onClick={() => dispatch({ type: "roll" } as DiceFlyFishingAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="diflfi-btn alt" onClick={() => dispatch({ type: "next" } as DiceFlyFishingAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
