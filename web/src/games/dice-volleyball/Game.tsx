import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceVolleyballState, DiceVolleyballAction, DiceVolleyballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceVolleyballGame({ state, dispatch, onGameOver }: GameProps<DiceVolleyballState, DiceVolleyballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicvol-wrap">
        <div className="dicvol-done">
          <h2>Rally</h2>
          <div className="dicvol-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicvol-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicvol-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicvol-wrap">
      <div className="dicvol-head">
        <span className="dicvol-round">Rally {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicvol-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicvol-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicvol-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicvol-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicvol-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicvol-log">{line}</div>)}
      </div>
      <div className="dicvol-actions">
        {state.phase === "rolling" && (
          <button className="dicvol-btn primary" onClick={() => dispatch({ type: "roll" } as DiceVolleyballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicvol-btn alt" onClick={() => dispatch({ type: "next" } as DiceVolleyballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
