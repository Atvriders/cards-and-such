import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CribbageSkunkedRubberState, CribbageSkunkedRubberAction, CribbageSkunkedRubberSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CribbageSkunkedRubberGame({ state, dispatch, onGameOver }: GameProps<CribbageSkunkedRubberState, CribbageSkunkedRubberSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="crskru-wrap">
        <div className="crskru-done">
          <h2>Hand</h2>
          <div className="crskru-final">{Math.max(0, state.score)} pts</div>
          
          <div className="crskru-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="crskru-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="crskru-wrap">
      <div className="crskru-head">
        <span className="crskru-round">Hand {state.round} / {TOTAL_ROUNDS}</span>
        <span className="crskru-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="crskru-dice-row">
          {state.dice.map((d, i) => <div key={i} className="crskru-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="crskru-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="crskru-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="crskru-log">{line}</div>)}
      </div>
      <div className="crskru-actions">
        {state.phase === "rolling" && (
          <button className="crskru-btn primary" onClick={() => dispatch({ type: "roll" } as CribbageSkunkedRubberAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="crskru-btn alt" onClick={() => dispatch({ type: "next" } as CribbageSkunkedRubberAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
