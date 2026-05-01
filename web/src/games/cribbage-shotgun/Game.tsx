import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CribbageShotgunState, CribbageShotgunAction, CribbageShotgunSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CribbageShotgunGame({ state, dispatch, onGameOver }: GameProps<CribbageShotgunState, CribbageShotgunSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="crisho-wrap">
        <div className="crisho-done">
          <h2>Hand</h2>
          <div className="crisho-final">{Math.max(0, state.score)} pts</div>
          
          <div className="crisho-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="crisho-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="crisho-wrap">
      <div className="crisho-head">
        <span className="crisho-round">Hand {state.round} / {TOTAL_ROUNDS}</span>
        <span className="crisho-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="crisho-dice-row">
          {state.dice.map((d, i) => <div key={i} className="crisho-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="crisho-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="crisho-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="crisho-log">{line}</div>)}
      </div>
      <div className="crisho-actions">
        {state.phase === "rolling" && (
          <button className="crisho-btn primary" onClick={() => dispatch({ type: "roll" } as CribbageShotgunAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="crisho-btn alt" onClick={() => dispatch({ type: "next" } as CribbageShotgunAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
