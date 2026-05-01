import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePursuePennantState, DicePursuePennantAction, DicePursuePennantSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DicePursuePennantGame({ state, dispatch, onGameOver }: GameProps<DicePursuePennantState, DicePursuePennantSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dipupe-wrap">
        <div className="dipupe-done">
          <h2>Inning</h2>
          <div className="dipupe-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dipupe-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dipupe-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dipupe-wrap">
      <div className="dipupe-head">
        <span className="dipupe-round">Inning {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dipupe-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dipupe-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dipupe-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dipupe-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dipupe-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dipupe-log">{line}</div>)}
      </div>
      <div className="dipupe-actions">
        {state.phase === "rolling" && (
          <button className="dipupe-btn primary" onClick={() => dispatch({ type: "roll" } as DicePursuePennantAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dipupe-btn alt" onClick={() => dispatch({ type: "next" } as DicePursuePennantAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
