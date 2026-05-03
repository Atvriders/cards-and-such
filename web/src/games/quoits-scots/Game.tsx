import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuoitsScotsState, QuoitsScotsAction, QuoitsScotsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function QuoitsScotsGame({ state, dispatch, onGameOver }: GameProps<QuoitsScotsState, QuoitsScotsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="quosco-wrap">
        <div className="quosco-done">
          <h2>Round</h2>
          <div className="quosco-final">{Math.max(0, state.score)} pts</div>
          
          <div className="quosco-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="quosco-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="quosco-wrap">
      <div className="quosco-head">
        <span className="quosco-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="quosco-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="quosco-dice-row">
          {state.dice.map((d, i) => <div key={i} className="quosco-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="quosco-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="quosco-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="quosco-log">{line}</div>)}
      </div>
      <div className="quosco-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-quoits-scots-action" className="quosco-btn primary" onClick={() => dispatch({ type: "roll" } as QuoitsScotsAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="quosco-btn alt" onClick={() => dispatch({ type: "next" } as QuoitsScotsAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
