import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BowlingDuckpinState, BowlingDuckpinAction, BowlingDuckpinSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BowlingDuckpinGame({ state, dispatch, onGameOver }: GameProps<BowlingDuckpinState, BowlingDuckpinSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="bowduc-wrap">
        <div className="bowduc-done">
          <h2>Frame</h2>
          <div className="bowduc-final">{Math.max(0, state.score)} pts</div>
          
          <div className="bowduc-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="bowduc-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bowduc-wrap">
      <div className="bowduc-head">
        <span className="bowduc-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="bowduc-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="bowduc-dice-row">
          {state.dice.map((d, i) => <div key={i} className="bowduc-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="bowduc-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="bowduc-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="bowduc-log">{line}</div>)}
      </div>
      <div className="bowduc-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-bowling-duckpin-action" className="bowduc-btn primary" onClick={() => dispatch({ type: "roll" } as BowlingDuckpinAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="bowduc-btn alt" onClick={() => dispatch({ type: "next" } as BowlingDuckpinAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
