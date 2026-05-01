import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSpikeballState, DiceSpikeballAction, DiceSpikeballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceSpikeballGame({ state, dispatch, onGameOver }: GameProps<DiceSpikeballState, DiceSpikeballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicspi-wrap">
        <div className="dicspi-done">
          <h2>Round</h2>
          <div className="dicspi-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicspi-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicspi-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicspi-wrap">
      <div className="dicspi-head">
        <span className="dicspi-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicspi-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicspi-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicspi-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicspi-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicspi-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicspi-log">{line}</div>)}
      </div>
      <div className="dicspi-actions">
        {state.phase === "rolling" && (
          <button className="dicspi-btn primary" onClick={() => dispatch({ type: "roll" } as DiceSpikeballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicspi-btn alt" onClick={() => dispatch({ type: "next" } as DiceSpikeballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
