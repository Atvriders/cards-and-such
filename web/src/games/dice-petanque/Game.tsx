import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePetanqueState, DicePetanqueAction, DicePetanqueSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DicePetanqueGame({ state, dispatch, onGameOver }: GameProps<DicePetanqueState, DicePetanqueSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicpet-wrap">
        <div className="dicpet-done">
          <h2>End</h2>
          <div className="dicpet-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicpet-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicpet-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicpet-wrap">
      <div className="dicpet-head">
        <span className="dicpet-round">End {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicpet-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicpet-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicpet-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicpet-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicpet-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicpet-log">{line}</div>)}
      </div>
      <div className="dicpet-actions">
        {state.phase === "rolling" && (
          <button className="dicpet-btn primary" data-testid="hint-target-dice-petanque-roll" onClick={() => dispatch({ type: "roll" } as DicePetanqueAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicpet-btn alt" data-testid="hint-target-dice-petanque-next" onClick={() => dispatch({ type: "next" } as DicePetanqueAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
