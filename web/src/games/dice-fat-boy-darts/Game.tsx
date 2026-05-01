import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFatBoyDartsState, DiceFatBoyDartsAction, DiceFatBoyDartsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceFatBoyDartsGame({ state, dispatch, onGameOver }: GameProps<DiceFatBoyDartsState, DiceFatBoyDartsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="difaboda-wrap">
        <div className="difaboda-done">
          <h2>Round</h2>
          <div className="difaboda-final">{Math.max(0, state.score)} pts</div>
          
          <div className="difaboda-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="difaboda-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="difaboda-wrap">
      <div className="difaboda-head">
        <span className="difaboda-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="difaboda-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="difaboda-dice-row">
          {state.dice.map((d, i) => <div key={i} className="difaboda-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="difaboda-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="difaboda-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="difaboda-log">{line}</div>)}
      </div>
      <div className="difaboda-actions">
        {state.phase === "rolling" && (
          <button className="difaboda-btn primary" onClick={() => dispatch({ type: "roll" } as DiceFatBoyDartsAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="difaboda-btn alt" onClick={() => dispatch({ type: "next" } as DiceFatBoyDartsAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
