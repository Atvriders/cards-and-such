import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBocciaState, DiceBocciaAction, DiceBocciaSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceBocciaGame({ state, dispatch, onGameOver }: GameProps<DiceBocciaState, DiceBocciaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicbcc-wrap">
        <div className="dicbcc-done bounce-in">
          <h2>End</h2>
          <div className="dicbcc-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicbcc-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicbcc-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicbcc-wrap fade-in">
      <div className="dicbcc-head">
        <span className="dicbcc-round">End {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicbcc-score pulse">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicbcc-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicbcc-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicbcc-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicbcc-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicbcc-log">{line}</div>)}
      </div>
      <div className="dicbcc-actions">
        {state.phase === "rolling" && (
          <button className="dicbcc-btn primary" data-testid="hint-target-dice-boccia-roll" onClick={() => dispatch({ type: "roll" } as DiceBocciaAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicbcc-btn alt" data-testid="hint-target-dice-boccia-next" onClick={() => dispatch({ type: "next" } as DiceBocciaAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
