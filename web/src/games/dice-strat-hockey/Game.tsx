import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStratHockeyState, DiceStratHockeyAction, DiceStratHockeySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceStratHockeyGame({ state, dispatch, onGameOver }: GameProps<DiceStratHockeyState, DiceStratHockeySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="distho-wrap">
        <div className="distho-done">
          <h2>Period</h2>
          <div className="distho-final">{Math.max(0, state.score)} pts</div>
          
          <div className="distho-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="distho-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="distho-wrap">
      <div className="distho-head">
        <span className="distho-round">Period {state.round} / {TOTAL_ROUNDS}</span>
        <span className="distho-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="distho-dice-row">
          {state.dice.map((d, i) => <div key={i} className="distho-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="distho-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="distho-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="distho-log">{line}</div>)}
      </div>
      <div className="distho-actions">
        {state.phase === "rolling" && (
          <button className="distho-btn primary" onClick={() => dispatch({ type: "roll" } as DiceStratHockeyAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="distho-btn alt" onClick={() => dispatch({ type: "next" } as DiceStratHockeyAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
