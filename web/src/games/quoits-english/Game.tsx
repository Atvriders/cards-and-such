import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuoitsEnglishState, QuoitsEnglishAction, QuoitsEnglishSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function QuoitsEnglishGame({ state, dispatch, onGameOver }: GameProps<QuoitsEnglishState, QuoitsEnglishSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="quoeng-wrap">
        <div className="quoeng-done">
          <h2>Round</h2>
          <div className="quoeng-final">{Math.max(0, state.score)} pts</div>
          
          <div className="quoeng-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="quoeng-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="quoeng-wrap">
      <div className="quoeng-head">
        <span className="quoeng-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="quoeng-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="quoeng-dice-row">
          {state.dice.map((d, i) => <div key={i} className="quoeng-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="quoeng-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="quoeng-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="quoeng-log">{line}</div>)}
      </div>
      <div className="quoeng-actions">
        {state.phase === "rolling" && (
          <button className="quoeng-btn primary" onClick={() => dispatch({ type: "roll" } as QuoitsEnglishAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="quoeng-btn alt" onClick={() => dispatch({ type: "next" } as QuoitsEnglishAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
