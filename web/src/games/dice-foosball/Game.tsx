import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFoosballState, DiceFoosballAction, DiceFoosballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceFoosballGame({ state, dispatch, onGameOver }: GameProps<DiceFoosballState, DiceFoosballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicfoo-wrap">
        <div className="dicfoo-done">
          <h2>Rally</h2>
          <div className="dicfoo-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicfoo-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicfoo-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicfoo-wrap">
      <div className="dicfoo-head">
        <span className="dicfoo-round">Rally {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicfoo-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicfoo-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicfoo-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicfoo-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicfoo-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicfoo-log">{line}</div>)}
      </div>
      <div className="dicfoo-actions">
        {state.phase === "rolling" && (
          <button className="dicfoo-btn primary" data-testid="hint-target-dice-foosball-roll" onClick={() => dispatch({ type: "roll" } as DiceFoosballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicfoo-btn alt" data-testid="hint-target-dice-foosball-next" onClick={() => dispatch({ type: "next" } as DiceFoosballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
