import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCurlingStonesState, DiceCurlingStonesAction, DiceCurlingStonesSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceCurlingStonesGame({ state, dispatch, onGameOver }: GameProps<DiceCurlingStonesState, DiceCurlingStonesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicust-wrap">
        <div className="dicust-done">
          <h2>End</h2>
          <div className="dicust-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicust-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicust-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicust-wrap">
      <div className="dicust-head">
        <span className="dicust-round">End {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicust-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicust-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicust-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicust-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicust-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicust-log">{line}</div>)}
      </div>
      <div className="dicust-actions">
        {state.phase === "rolling" && (
          <button className="dicust-btn primary" data-testid="hint-target-dice-curling-stones-roll" onClick={() => dispatch({ type: "roll" } as DiceCurlingStonesAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicust-btn alt" data-testid="hint-target-dice-curling-stones-next" onClick={() => dispatch({ type: "next" } as DiceCurlingStonesAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
