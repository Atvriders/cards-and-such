import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Pool10ballState, Pool10ballAction, Pool10ballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function Pool10ballGame({ state, dispatch, onGameOver }: GameProps<Pool10ballState, Pool10ballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="poo10b-wrap">
        <div className="poo10b-done">
          <h2>Shot</h2>
          <div className="poo10b-final">{Math.max(0, state.score)} pts</div>
          
          <div className="poo10b-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="poo10b-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="poo10b-wrap">
      <div className="poo10b-head">
        <span className="poo10b-round">Shot {state.round} / {TOTAL_ROUNDS}</span>
        <span className="poo10b-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="poo10b-dice-row">
          {state.dice.map((d, i) => <div key={i} className="poo10b-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="poo10b-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="poo10b-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="poo10b-log">{line}</div>)}
      </div>
      <div className="poo10b-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-pool-10ball-action" className="poo10b-btn primary" onClick={() => dispatch({ type: "roll" } as Pool10ballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="poo10b-btn alt" onClick={() => dispatch({ type: "next" } as Pool10ballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
