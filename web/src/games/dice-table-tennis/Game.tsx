import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTableTennisState, DiceTableTennisAction, DiceTableTennisSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceTableTennisGame({ state, dispatch, onGameOver }: GameProps<DiceTableTennisState, DiceTableTennisSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="ditate-wrap">
        <div className="ditate-done">
          <h2>Rally</h2>
          <div className="ditate-final">{Math.max(0, state.score)} pts</div>
          
          <div className="ditate-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="ditate-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="ditate-wrap">
      <div className="ditate-head">
        <span className="ditate-round">Rally {state.round} / {TOTAL_ROUNDS}</span>
        <span className="ditate-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="ditate-dice-row">
          {state.dice.map((d, i) => <div key={i} className="ditate-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="ditate-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="ditate-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="ditate-log">{line}</div>)}
      </div>
      <div className="ditate-actions">
        {state.phase === "rolling" && (
          <button className="ditate-btn primary" onClick={() => dispatch({ type: "roll" } as DiceTableTennisAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="ditate-btn alt" onClick={() => dispatch({ type: "next" } as DiceTableTennisAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
