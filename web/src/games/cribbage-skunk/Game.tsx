import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CribbageSkunkState, CribbageSkunkAction, CribbageSkunkSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CribbageSkunkGame({ state, dispatch, onGameOver }: GameProps<CribbageSkunkState, CribbageSkunkSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="crisku-wrap">
        <div className="crisku-done">
          <h2>Hand</h2>
          <div className="crisku-final">{Math.max(0, state.score)} pts</div>
          
          <div className="crisku-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="crisku-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="crisku-wrap">
      <div className="crisku-head">
        <span className="crisku-round">Hand {state.round} / {TOTAL_ROUNDS}</span>
        <span className="crisku-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="crisku-dice-row">
          {state.dice.map((d, i) => <div key={i} className="crisku-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="crisku-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="crisku-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="crisku-log">{line}</div>)}
      </div>
      <div className="crisku-actions">
        {state.phase === "rolling" && (
          <button className="crisku-btn primary" onClick={() => dispatch({ type: "roll" } as CribbageSkunkAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="crisku-btn alt" onClick={() => dispatch({ type: "next" } as CribbageSkunkAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
