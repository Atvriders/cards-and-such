import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CribbageDoubleSkunkState, CribbageDoubleSkunkAction, CribbageDoubleSkunkSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CribbageDoubleSkunkGame({ state, dispatch, onGameOver }: GameProps<CribbageDoubleSkunkState, CribbageDoubleSkunkSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="crdosk-wrap">
        <div className="crdosk-done">
          <h2>Hand</h2>
          <div className="crdosk-final">{Math.max(0, state.score)} pts</div>
          
          <div className="crdosk-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="crdosk-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="crdosk-wrap">
      <div className="crdosk-head">
        <span className="crdosk-round">Hand {state.round} / {TOTAL_ROUNDS}</span>
        <span className="crdosk-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="crdosk-dice-row">
          {state.dice.map((d, i) => <div key={i} className="crdosk-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="crdosk-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="crdosk-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="crdosk-log">{line}</div>)}
      </div>
      <div className="crdosk-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-cribbage-double-skunk-action" className="crdosk-btn primary" onClick={() => dispatch({ type: "roll" } as CribbageDoubleSkunkAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="crdosk-btn alt" onClick={() => dispatch({ type: "next" } as CribbageDoubleSkunkAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
