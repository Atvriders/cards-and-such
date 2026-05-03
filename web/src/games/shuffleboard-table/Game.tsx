import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShuffleboardTableState, ShuffleboardTableAction, ShuffleboardTableSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function ShuffleboardTableGame({ state, dispatch, onGameOver }: GameProps<ShuffleboardTableState, ShuffleboardTableSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="shutab-wrap">
        <div className="shutab-done">
          <h2>Round</h2>
          <div className="shutab-final">{Math.max(0, state.score)} pts</div>
          
          <div className="shutab-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="shutab-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="shutab-wrap">
      <div className="shutab-head">
        <span className="shutab-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="shutab-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="shutab-dice-row">
          {state.dice.map((d, i) => <div key={i} className="shutab-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="shutab-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="shutab-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="shutab-log">{line}</div>)}
      </div>
      <div className="shutab-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-shuffleboard-table-action" className="shutab-btn primary" onClick={() => dispatch({ type: "roll" } as ShuffleboardTableAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="shutab-btn alt" onClick={() => dispatch({ type: "next" } as ShuffleboardTableAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
