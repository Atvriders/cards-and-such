import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StratHockeyState, StratHockeyAction, StratHockeySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function StratHockeyGame({ state, dispatch, onGameOver }: GameProps<StratHockeyState, StratHockeySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="strhoc-wrap">
        <div className="strhoc-done">
          <h2>Period</h2>
          <div className="strhoc-final">{Math.max(0, state.score)} pts</div>
          
          <div className="strhoc-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="strhoc-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="strhoc-wrap">
      <div className="strhoc-head">
        <span className="strhoc-round">Period {state.round} / {TOTAL_ROUNDS}</span>
        <span className="strhoc-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="strhoc-dice-row">
          {state.dice.map((d, i) => <div key={i} className="strhoc-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="strhoc-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="strhoc-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="strhoc-log">{line}</div>)}
      </div>
      <div className="strhoc-actions">
        {state.phase === "rolling" && (
          <button className="strhoc-btn primary" data-testid="hint-target-strat-hockey-roll" onClick={() => dispatch({ type: "roll" } as StratHockeyAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="strhoc-btn alt" data-testid="hint-target-strat-hockey-next" onClick={() => dispatch({ type: "next" } as StratHockeyAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
