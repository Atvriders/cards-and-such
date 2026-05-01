import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BragThreeCardState, BragThreeCardAction, BragThreeCardSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BragThreeCardGame({ state, dispatch, onGameOver }: GameProps<BragThreeCardState, BragThreeCardSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="brthca-wrap">
        <div className="brthca-done">
          <h2>Hand</h2>
          <div className="brthca-final">{Math.max(0, state.score)} pts</div>
          
          <div className="brthca-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="brthca-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="brthca-wrap">
      <div className="brthca-head">
        <span className="brthca-round">Hand {state.round} / {TOTAL_ROUNDS}</span>
        <span className="brthca-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="brthca-dice-row">
          {state.dice.map((d, i) => <div key={i} className="brthca-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="brthca-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="brthca-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="brthca-log">{line}</div>)}
      </div>
      <div className="brthca-actions">
        {state.phase === "rolling" && (
          <button className="brthca-btn primary" onClick={() => dispatch({ type: "roll" } as BragThreeCardAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="brthca-btn alt" onClick={() => dispatch({ type: "next" } as BragThreeCardAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
