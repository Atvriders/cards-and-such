import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SkittlesLongAlleyState, SkittlesLongAlleyAction, SkittlesLongAlleySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function SkittlesLongAlleyGame({ state, dispatch, onGameOver }: GameProps<SkittlesLongAlleyState, SkittlesLongAlleySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="skloal-wrap">
        <div className="skloal-done">
          <h2>Frame</h2>
          <div className="skloal-final">{Math.max(0, state.score)} pts</div>
          
          <div className="skloal-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="skloal-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="skloal-wrap">
      <div className="skloal-head">
        <span className="skloal-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="skloal-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="skloal-dice-row">
          {state.dice.map((d, i) => <div key={i} className="skloal-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="skloal-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="skloal-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="skloal-log">{line}</div>)}
      </div>
      <div className="skloal-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-skittles-long-alley-action" className="skloal-btn primary" onClick={() => dispatch({ type: "roll" } as SkittlesLongAlleyAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="skloal-btn alt" onClick={() => dispatch({ type: "next" } as SkittlesLongAlleyAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
