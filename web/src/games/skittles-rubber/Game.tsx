import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SkittlesRubberState, SkittlesRubberAction, SkittlesRubberSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function SkittlesRubberGame({ state, dispatch, onGameOver }: GameProps<SkittlesRubberState, SkittlesRubberSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="skirub-wrap">
        <div className="skirub-done">
          <h2>Frame</h2>
          <div className="skirub-final">{Math.max(0, state.score)} pts</div>
          
          <div className="skirub-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="skirub-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="skirub-wrap">
      <div className="skirub-head">
        <span className="skirub-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="skirub-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="skirub-dice-row">
          {state.dice.map((d, i) => <div key={i} className="skirub-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="skirub-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="skirub-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="skirub-log">{line}</div>)}
      </div>
      <div className="skirub-actions">
        {state.phase === "rolling" && (
          <button className="skirub-btn primary" onClick={() => dispatch({ type: "roll" } as SkittlesRubberAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="skirub-btn alt" onClick={() => dispatch({ type: "next" } as SkittlesRubberAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
