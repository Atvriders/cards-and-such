import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StratFootballState, StratFootballAction, StratFootballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function StratFootballGame({ state, dispatch, onGameOver }: GameProps<StratFootballState, StratFootballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="strfoo-wrap">
        <div className="strfoo-done">
          <h2>Quarter</h2>
          <div className="strfoo-final">{Math.max(0, state.score)} pts</div>
          
          <div className="strfoo-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="strfoo-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="strfoo-wrap">
      <div className="strfoo-head">
        <span className="strfoo-round">Quarter {state.round} / {TOTAL_ROUNDS}</span>
        <span className="strfoo-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="strfoo-dice-row">
          {state.dice.map((d, i) => <div key={i} className="strfoo-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="strfoo-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="strfoo-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="strfoo-log">{line}</div>)}
      </div>
      <div className="strfoo-actions">
        {state.phase === "rolling" && (
          <button className="strfoo-btn primary" onClick={() => dispatch({ type: "roll" } as StratFootballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="strfoo-btn alt" onClick={() => dispatch({ type: "next" } as StratFootballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
