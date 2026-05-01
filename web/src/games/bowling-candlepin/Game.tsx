import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BowlingCandlepinState, BowlingCandlepinAction, BowlingCandlepinSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BowlingCandlepinGame({ state, dispatch, onGameOver }: GameProps<BowlingCandlepinState, BowlingCandlepinSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="bowcan-wrap">
        <div className="bowcan-done">
          <h2>Frame</h2>
          <div className="bowcan-final">{Math.max(0, state.score)} pts</div>
          
          <div className="bowcan-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="bowcan-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bowcan-wrap">
      <div className="bowcan-head">
        <span className="bowcan-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="bowcan-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="bowcan-dice-row">
          {state.dice.map((d, i) => <div key={i} className="bowcan-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="bowcan-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="bowcan-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="bowcan-log">{line}</div>)}
      </div>
      <div className="bowcan-actions">
        {state.phase === "rolling" && (
          <button className="bowcan-btn primary" onClick={() => dispatch({ type: "roll" } as BowlingCandlepinAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="bowcan-btn alt" onClick={() => dispatch({ type: "next" } as BowlingCandlepinAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
