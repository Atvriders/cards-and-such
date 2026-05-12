import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceDuckpinState, DiceDuckpinAction, DiceDuckpinSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceDuckpinGame({ state, dispatch, onGameOver }: GameProps<DiceDuckpinState, DiceDuckpinSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicduc-wrap">
        <div className="dicduc-done bounce-in">
          <h2>Frame</h2>
          <div className="dicduc-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicduc-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicduc-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicduc-wrap fade-in">
      <div className="dicduc-head">
        <span className="dicduc-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicduc-score pulse">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicduc-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicduc-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicduc-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicduc-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicduc-log">{line}</div>)}
      </div>
      <div className="dicduc-actions">
        {state.phase === "rolling" && (
          <button className="dicduc-btn primary" data-testid="hint-target-dice-duckpin-roll" onClick={() => dispatch({ type: "roll" } as DiceDuckpinAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicduc-btn alt" data-testid="hint-target-dice-duckpin-next" onClick={() => dispatch({ type: "next" } as DiceDuckpinAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
