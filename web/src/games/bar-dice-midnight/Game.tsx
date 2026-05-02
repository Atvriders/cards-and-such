import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BarDiceMidnightState, BarDiceMidnightAction, BarDiceMidnightSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BarDiceMidnightGame({ state, dispatch, onGameOver }: GameProps<BarDiceMidnightState, BarDiceMidnightSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="badimi-wrap">
        <div className="badimi-done">
          <h2>Roll</h2>
          <div className="badimi-final">{Math.max(0, state.score)} pts</div>
          
          <div className="badimi-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="badimi-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="badimi-wrap">
      <div className="badimi-head">
        <span className="badimi-round">Roll {state.round} / {TOTAL_ROUNDS}</span>
        <span className="badimi-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="badimi-dice-row">
          {state.dice.map((d, i) => <div key={i} className="badimi-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="badimi-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="badimi-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="badimi-log">{line}</div>)}
      </div>
      <div className="badimi-actions">
        {state.phase === "rolling" && (
          <button className="badimi-btn primary" data-testid="hint-target-bar-dice-midnight-roll" onClick={() => dispatch({ type: "roll" } as BarDiceMidnightAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="badimi-btn alt" data-testid="hint-target-bar-dice-midnight-next" onClick={() => dispatch({ type: "next" } as BarDiceMidnightAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
