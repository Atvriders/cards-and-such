import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PoolCutthroatState, PoolCutthroatAction, PoolCutthroatSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function PoolCutthroatGame({ state, dispatch, onGameOver }: GameProps<PoolCutthroatState, PoolCutthroatSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="poocut-wrap">
        <div className="poocut-done">
          <h2>Shot</h2>
          <div className="poocut-final">{Math.max(0, state.score)} pts</div>
          
          <div className="poocut-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="poocut-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="poocut-wrap">
      <div className="poocut-head">
        <span className="poocut-round">Shot {state.round} / {TOTAL_ROUNDS}</span>
        <span className="poocut-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="poocut-dice-row">
          {state.dice.map((d, i) => <div key={i} className="poocut-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="poocut-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="poocut-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="poocut-log">{line}</div>)}
      </div>
      <div className="poocut-actions">
        {state.phase === "rolling" && (
          <button className="poocut-btn primary" onClick={() => dispatch({ type: "roll" } as PoolCutthroatAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="poocut-btn alt" onClick={() => dispatch({ type: "next" } as PoolCutthroatAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
