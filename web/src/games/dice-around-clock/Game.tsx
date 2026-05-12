import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceAroundClockState, DiceAroundClockAction, DiceAroundClockSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceAroundClockGame({ state, dispatch, onGameOver }: GameProps<DiceAroundClockState, DiceAroundClockSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="diarcl-wrap">
        <div className="diarcl-done bounce-in">
          <h2>Throw</h2>
          <div className="diarcl-final">{Math.max(0, state.score)} pts</div>
          
          <div className="diarcl-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="diarcl-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="diarcl-wrap fade-in">
      <div className="diarcl-head">
        <span className="diarcl-round">Throw {state.round} / {TOTAL_ROUNDS}</span>
        <span className="diarcl-score pulse">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="diarcl-dice-row">
          {state.dice.map((d, i) => <div key={i} className="diarcl-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="diarcl-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="diarcl-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="diarcl-log">{line}</div>)}
      </div>
      <div className="diarcl-actions">
        {state.phase === "rolling" && (
          <button className="diarcl-btn primary" data-testid="hint-target-dice-around-clock-roll" onClick={() => dispatch({ type: "roll" } as DiceAroundClockAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="diarcl-btn alt" data-testid="hint-target-dice-around-clock-next" onClick={() => dispatch({ type: "next" } as DiceAroundClockAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
