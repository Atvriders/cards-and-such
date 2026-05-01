import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSquashState, DiceSquashAction, DiceSquashSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceSquashGame({ state, dispatch, onGameOver }: GameProps<DiceSquashState, DiceSquashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicsqu-wrap">
        <div className="dicsqu-done">
          <h2>Rally</h2>
          <div className="dicsqu-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicsqu-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicsqu-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicsqu-wrap">
      <div className="dicsqu-head">
        <span className="dicsqu-round">Rally {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicsqu-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicsqu-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicsqu-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicsqu-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicsqu-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicsqu-log">{line}</div>)}
      </div>
      <div className="dicsqu-actions">
        {state.phase === "rolling" && (
          <button className="dicsqu-btn primary" onClick={() => dispatch({ type: "roll" } as DiceSquashAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicsqu-btn alt" onClick={() => dispatch({ type: "next" } as DiceSquashAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
