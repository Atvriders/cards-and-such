import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SkittlesWestCountryState, SkittlesWestCountryAction, SkittlesWestCountrySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function SkittlesWestCountryGame({ state, dispatch, onGameOver }: GameProps<SkittlesWestCountryState, SkittlesWestCountrySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="skweco-wrap">
        <div className="skweco-done">
          <h2>Frame</h2>
          <div className="skweco-final">{Math.max(0, state.score)} pts</div>
          
          <div className="skweco-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="skweco-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="skweco-wrap">
      <div className="skweco-head">
        <span className="skweco-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="skweco-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="skweco-dice-row">
          {state.dice.map((d, i) => <div key={i} className="skweco-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="skweco-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="skweco-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="skweco-log">{line}</div>)}
      </div>
      <div className="skweco-actions">
        {state.phase === "rolling" && (
          <button className="skweco-btn primary" onClick={() => dispatch({ type: "roll" } as SkittlesWestCountryAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="skweco-btn alt" onClick={() => dispatch({ type: "next" } as SkittlesWestCountryAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
