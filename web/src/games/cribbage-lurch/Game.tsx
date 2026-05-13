import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CribbageLurchState, CribbageLurchAction, CribbageLurchSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CribbageLurchGame({ state, dispatch, onGameOver }: GameProps<CribbageLurchState, CribbageLurchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="crilur-wrap">
        <div className="crilur-done bounce-in">
          <h2>Hand</h2>
          <div className="crilur-final">{Math.max(0, state.score)} pts</div>
          
          <div className="crilur-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="crilur-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="crilur-wrap fade-in">
      <div className="crilur-head">
        <span className="crilur-round">Hand {state.round} / {TOTAL_ROUNDS}</span>
        <span className="crilur-score pulse">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="crilur-dice-row">
          {state.dice.map((d, i) => <div key={i} className="crilur-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="crilur-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="crilur-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="crilur-log">{line}</div>)}
      </div>
      <div className="crilur-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-cribbage-lurch-action" className="crilur-btn primary" onClick={() => dispatch({ type: "roll" } as CribbageLurchAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="crilur-btn alt" onClick={() => dispatch({ type: "next" } as CribbageLurchAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
