import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PoolBankState, PoolBankAction, PoolBankSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function PoolBankGame({ state, dispatch, onGameOver }: GameProps<PoolBankState, PoolBankSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="pooban-wrap">
        <div className="pooban-done">
          <h2>Shot</h2>
          <div className="pooban-final">{Math.max(0, state.score)} pts</div>
          
          <div className="pooban-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="pooban-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="pooban-wrap">
      <div className="pooban-head">
        <span className="pooban-round">Shot {state.round} / {TOTAL_ROUNDS}</span>
        <span className="pooban-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="pooban-dice-row">
          {state.dice.map((d, i) => <div key={i} className="pooban-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="pooban-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="pooban-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="pooban-log">{line}</div>)}
      </div>
      <div className="pooban-actions">
        {state.phase === "rolling" && (
          <button className="pooban-btn primary" onClick={() => dispatch({ type: "roll" } as PoolBankAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="pooban-btn alt" onClick={() => dispatch({ type: "next" } as PoolBankAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
