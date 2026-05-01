import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ApbaFootballState, ApbaFootballAction, ApbaFootballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function ApbaFootballGame({ state, dispatch, onGameOver }: GameProps<ApbaFootballState, ApbaFootballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="apbfoo-wrap">
        <div className="apbfoo-done">
          <h2>Quarter</h2>
          <div className="apbfoo-final">{Math.max(0, state.score)} pts</div>
          
          <div className="apbfoo-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="apbfoo-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="apbfoo-wrap">
      <div className="apbfoo-head">
        <span className="apbfoo-round">Quarter {state.round} / {TOTAL_ROUNDS}</span>
        <span className="apbfoo-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="apbfoo-dice-row">
          {state.dice.map((d, i) => <div key={i} className="apbfoo-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="apbfoo-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="apbfoo-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="apbfoo-log">{line}</div>)}
      </div>
      <div className="apbfoo-actions">
        {state.phase === "rolling" && (
          <button className="apbfoo-btn primary" onClick={() => dispatch({ type: "roll" } as ApbaFootballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="apbfoo-btn alt" onClick={() => dispatch({ type: "next" } as ApbaFootballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
