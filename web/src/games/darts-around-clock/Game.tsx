import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DartsAroundClockState, DartsAroundClockAction, DartsAroundClockSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DartsAroundClockGame({ state, dispatch, onGameOver }: GameProps<DartsAroundClockState, DartsAroundClockSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="daarcl-wrap">
        <div className="daarcl-done">
          <h2>Throw</h2>
          <div className="daarcl-final">{Math.max(0, state.score)} pts</div>
          
          <div className="daarcl-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="daarcl-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="daarcl-wrap">
      <div className="daarcl-head">
        <span className="daarcl-round">Throw {state.round} / {TOTAL_ROUNDS}</span>
        <span className="daarcl-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="daarcl-dice-row">
          {state.dice.map((d, i) => <div key={i} className="daarcl-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="daarcl-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="daarcl-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="daarcl-log">{line}</div>)}
      </div>
      <div className="daarcl-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-darts-around-clock-action" className="daarcl-btn primary" onClick={() => dispatch({ type: "roll" } as DartsAroundClockAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="daarcl-btn alt" onClick={() => dispatch({ type: "next" } as DartsAroundClockAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
