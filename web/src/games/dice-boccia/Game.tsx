import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBocciaState, DiceBocciaAction, DiceBocciaSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceBocciaGame({ state, dispatch, onGameOver }: GameProps<DiceBocciaState, DiceBocciaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicboc-wrap">
        <div className="dicboc-done">
          <h2>End</h2>
          <div className="dicboc-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicboc-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicboc-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicboc-wrap">
      <div className="dicboc-head">
        <span className="dicboc-round">End {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicboc-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicboc-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicboc-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicboc-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicboc-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicboc-log">{line}</div>)}
      </div>
      <div className="dicboc-actions">
        {state.phase === "rolling" && (
          <button className="dicboc-btn primary" onClick={() => dispatch({ type: "roll" } as DiceBocciaAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicboc-btn alt" onClick={() => dispatch({ type: "next" } as DiceBocciaAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
