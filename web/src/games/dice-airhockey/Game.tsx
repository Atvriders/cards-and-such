import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceAirhockeyState, DiceAirhockeyAction, DiceAirhockeySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceAirhockeyGame({ state, dispatch, onGameOver }: GameProps<DiceAirhockeyState, DiceAirhockeySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicair-wrap">
        <div className="dicair-done">
          <h2>Rally</h2>
          <div className="dicair-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicair-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicair-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicair-wrap">
      <div className="dicair-head">
        <span className="dicair-round">Rally {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicair-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicair-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicair-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicair-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicair-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicair-log">{line}</div>)}
      </div>
      <div className="dicair-actions">
        {state.phase === "rolling" && (
          <button className="dicair-btn primary" onClick={() => dispatch({ type: "roll" } as DiceAirhockeyAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicair-btn alt" onClick={() => dispatch({ type: "next" } as DiceAirhockeyAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
