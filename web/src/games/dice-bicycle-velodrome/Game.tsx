import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBicycleVelodromeState, DiceBicycleVelodromeAction, DiceBicycleVelodromeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceBicycleVelodromeGame({ state, dispatch, onGameOver }: GameProps<DiceBicycleVelodromeState, DiceBicycleVelodromeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dibive-wrap">
        <div className="dibive-done">
          <h2>Lap</h2>
          <div className="dibive-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dibive-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dibive-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dibive-wrap">
      <div className="dibive-head">
        <span className="dibive-round">Lap {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dibive-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dibive-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dibive-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dibive-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dibive-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dibive-log">{line}</div>)}
      </div>
      <div className="dibive-actions">
        {state.phase === "rolling" && (
          <button className="dibive-btn primary" onClick={() => dispatch({ type: "roll" } as DiceBicycleVelodromeAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dibive-btn alt" onClick={() => dispatch({ type: "next" } as DiceBicycleVelodromeAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
