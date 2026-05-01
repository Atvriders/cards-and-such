import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBelmontStakesState, DiceBelmontStakesAction, DiceBelmontStakesSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceBelmontStakesGame({ state, dispatch, onGameOver }: GameProps<DiceBelmontStakesState, DiceBelmontStakesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dibest-wrap">
        <div className="dibest-done">
          <h2>Lap</h2>
          <div className="dibest-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dibest-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dibest-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dibest-wrap">
      <div className="dibest-head">
        <span className="dibest-round">Lap {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dibest-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dibest-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dibest-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dibest-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dibest-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dibest-log">{line}</div>)}
      </div>
      <div className="dibest-actions">
        {state.phase === "rolling" && (
          <button className="dibest-btn primary" onClick={() => dispatch({ type: "roll" } as DiceBelmontStakesAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dibest-btn alt" onClick={() => dispatch({ type: "next" } as DiceBelmontStakesAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
