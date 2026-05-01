import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NapBlucherState, NapBlucherAction, NapBlucherSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function NapBlucherGame({ state, dispatch, onGameOver }: GameProps<NapBlucherState, NapBlucherSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="napblu-wrap">
        <div className="napblu-done">
          <h2>Deal</h2>
          <div className="napblu-final">{Math.max(0, state.score)} pts</div>
          
          <div className="napblu-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="napblu-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="napblu-wrap">
      <div className="napblu-head">
        <span className="napblu-round">Deal {state.round} / {TOTAL_ROUNDS}</span>
        <span className="napblu-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="napblu-dice-row">
          {state.dice.map((d, i) => <div key={i} className="napblu-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="napblu-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="napblu-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="napblu-log">{line}</div>)}
      </div>
      <div className="napblu-actions">
        {state.phase === "rolling" && (
          <button className="napblu-btn primary" onClick={() => dispatch({ type: "roll" } as NapBlucherAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="napblu-btn alt" onClick={() => dispatch({ type: "next" } as NapBlucherAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
