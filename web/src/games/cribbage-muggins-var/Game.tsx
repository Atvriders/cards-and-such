import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CribbageMugginsVarState, CribbageMugginsVarAction, CribbageMugginsVarSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CribbageMugginsVarGame({ state, dispatch, onGameOver }: GameProps<CribbageMugginsVarState, CribbageMugginsVarSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="crmuva-wrap">
        <div className="crmuva-done">
          <h2>Hand</h2>
          <div className="crmuva-final">{Math.max(0, state.score)} pts</div>
          
          <div className="crmuva-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="crmuva-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="crmuva-wrap">
      <div className="crmuva-head">
        <span className="crmuva-round">Hand {state.round} / {TOTAL_ROUNDS}</span>
        <span className="crmuva-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="crmuva-dice-row">
          {state.dice.map((d, i) => <div key={i} className="crmuva-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="crmuva-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="crmuva-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="crmuva-log">{line}</div>)}
      </div>
      <div className="crmuva-actions">
        {state.phase === "rolling" && (
          <button className="crmuva-btn primary" onClick={() => dispatch({ type: "roll" } as CribbageMugginsVarAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="crmuva-btn alt" onClick={() => dispatch({ type: "next" } as CribbageMugginsVarAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
