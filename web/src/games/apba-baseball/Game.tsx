import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ApbaBaseballState, ApbaBaseballAction, ApbaBaseballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function ApbaBaseballGame({ state, dispatch, onGameOver }: GameProps<ApbaBaseballState, ApbaBaseballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="apbbas-wrap">
        <div className="apbbas-done">
          <h2>Inning</h2>
          <div className="apbbas-final">{Math.max(0, state.score)} pts</div>
          
          <div className="apbbas-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="apbbas-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="apbbas-wrap">
      <div className="apbbas-head">
        <span className="apbbas-round">Inning {state.round} / {TOTAL_ROUNDS}</span>
        <span className="apbbas-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="apbbas-dice-row">
          {state.dice.map((d, i) => <div key={i} className="apbbas-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="apbbas-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="apbbas-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="apbbas-log">{line}</div>)}
      </div>
      <div className="apbbas-actions">
        {state.phase === "rolling" && (
          <button className="apbbas-btn primary" onClick={() => dispatch({ type: "roll" } as ApbaBaseballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="apbbas-btn alt" onClick={() => dispatch({ type: "next" } as ApbaBaseballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
