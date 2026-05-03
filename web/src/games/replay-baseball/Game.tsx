import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ReplayBaseballState, ReplayBaseballAction, ReplayBaseballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function ReplayBaseballGame({ state, dispatch, onGameOver }: GameProps<ReplayBaseballState, ReplayBaseballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="repbas-wrap">
        <div className="repbas-done">
          <h2>Inning</h2>
          <div className="repbas-final">{Math.max(0, state.score)} pts</div>
          
          <div className="repbas-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="repbas-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="repbas-wrap">
      <div className="repbas-head">
        <span className="repbas-round">Inning {state.round} / {TOTAL_ROUNDS}</span>
        <span className="repbas-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="repbas-dice-row">
          {state.dice.map((d, i) => <div key={i} className="repbas-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="repbas-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="repbas-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="repbas-log">{line}</div>)}
      </div>
      <div className="repbas-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-replay-baseball-action" className="repbas-btn primary" onClick={() => dispatch({ type: "roll" } as ReplayBaseballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="repbas-btn alt" onClick={() => dispatch({ type: "next" } as ReplayBaseballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
