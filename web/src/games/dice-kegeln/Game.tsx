import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceKegelnState, DiceKegelnAction, DiceKegelnSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceKegelnGame({ state, dispatch, onGameOver }: GameProps<DiceKegelnState, DiceKegelnSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dickeg-wrap">
        <div className="dickeg-done">
          <h2>Frame</h2>
          <div className="dickeg-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dickeg-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dickeg-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dickeg-wrap">
      <div className="dickeg-head">
        <span className="dickeg-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dickeg-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dickeg-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dickeg-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dickeg-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dickeg-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dickeg-log">{line}</div>)}
      </div>
      <div className="dickeg-actions">
        {state.phase === "rolling" && (
          <button className="dickeg-btn primary" onClick={() => dispatch({ type: "roll" } as DiceKegelnAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dickeg-btn alt" onClick={() => dispatch({ type: "next" } as DiceKegelnAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
