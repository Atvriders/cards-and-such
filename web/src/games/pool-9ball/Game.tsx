import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Pool9ballState, Pool9ballAction, Pool9ballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function Pool9ballGame({ state, dispatch, onGameOver }: GameProps<Pool9ballState, Pool9ballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="poo9ba-wrap">
        <div className="poo9ba-done">
          <h2>Shot</h2>
          <div className="poo9ba-final">{Math.max(0, state.score)} pts</div>
          
          <div className="poo9ba-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="poo9ba-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="poo9ba-wrap">
      <div className="poo9ba-head">
        <span className="poo9ba-round">Shot {state.round} / {TOTAL_ROUNDS}</span>
        <span className="poo9ba-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="poo9ba-dice-row">
          {state.dice.map((d, i) => <div key={i} className="poo9ba-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="poo9ba-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="poo9ba-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="poo9ba-log">{line}</div>)}
      </div>
      <div className="poo9ba-actions">
        {state.phase === "rolling" && (
          <button className="poo9ba-btn primary" onClick={() => dispatch({ type: "roll" } as Pool9ballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="poo9ba-btn alt" onClick={() => dispatch({ type: "next" } as Pool9ballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
