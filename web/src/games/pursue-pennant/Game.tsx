import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PursuePennantState, PursuePennantAction, PursuePennantSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function PursuePennantGame({ state, dispatch, onGameOver }: GameProps<PursuePennantState, PursuePennantSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="purpen-wrap">
        <div className="purpen-done">
          <h2>Inning</h2>
          <div className="purpen-final">{Math.max(0, state.score)} pts</div>
          
          <div className="purpen-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="purpen-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="purpen-wrap">
      <div className="purpen-head">
        <span className="purpen-round">Inning {state.round} / {TOTAL_ROUNDS}</span>
        <span className="purpen-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="purpen-dice-row">
          {state.dice.map((d, i) => <div key={i} className="purpen-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="purpen-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="purpen-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="purpen-log">{line}</div>)}
      </div>
      <div className="purpen-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-pursue-pennant-action" className="purpen-btn primary" onClick={() => dispatch({ type: "roll" } as PursuePennantAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="purpen-btn alt" onClick={() => dispatch({ type: "next" } as PursuePennantAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
