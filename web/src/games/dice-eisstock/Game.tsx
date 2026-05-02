import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceEisstockState, DiceEisstockAction, DiceEisstockSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceEisstockGame({ state, dispatch, onGameOver }: GameProps<DiceEisstockState, DiceEisstockSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="diceis-wrap">
        <div className="diceis-done">
          <h2>End</h2>
          <div className="diceis-final">{Math.max(0, state.score)} pts</div>
          
          <div className="diceis-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="diceis-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="diceis-wrap">
      <div className="diceis-head">
        <span className="diceis-round">End {state.round} / {TOTAL_ROUNDS}</span>
        <span className="diceis-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="diceis-dice-row">
          {state.dice.map((d, i) => <div key={i} className="diceis-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="diceis-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="diceis-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="diceis-log">{line}</div>)}
      </div>
      <div className="diceis-actions">
        {state.phase === "rolling" && (
          <button className="diceis-btn primary" data-testid="hint-target-dice-eisstock-roll" onClick={() => dispatch({ type: "roll" } as DiceEisstockAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="diceis-btn alt" data-testid="hint-target-dice-eisstock-next" onClick={() => dispatch({ type: "next" } as DiceEisstockAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
