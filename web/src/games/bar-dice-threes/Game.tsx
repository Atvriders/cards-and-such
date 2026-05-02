import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BarDiceThreesState, BarDiceThreesAction, BarDiceThreesSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BarDiceThreesGame({ state, dispatch, onGameOver }: GameProps<BarDiceThreesState, BarDiceThreesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="badith-wrap">
        <div className="badith-done">
          <h2>Roll</h2>
          <div className="badith-final">{Math.max(0, state.score)} pts</div>
          
          <div className="badith-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="badith-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="badith-wrap">
      <div className="badith-head">
        <span className="badith-round">Roll {state.round} / {TOTAL_ROUNDS}</span>
        <span className="badith-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="badith-dice-row">
          {state.dice.map((d, i) => <div key={i} className="badith-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="badith-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="badith-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="badith-log">{line}</div>)}
      </div>
      <div className="badith-actions">
        {state.phase === "rolling" && (
          <button className="badith-btn primary" data-testid="hint-target-bar-dice-threes-roll" onClick={() => dispatch({ type: "roll" } as BarDiceThreesAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="badith-btn alt" data-testid="hint-target-bar-dice-threes-next" onClick={() => dispatch({ type: "next" } as BarDiceThreesAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
