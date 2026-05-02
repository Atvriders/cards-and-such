import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceMmaState, DiceMmaAction, DiceMmaSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceMmaGame({ state, dispatch, onGameOver }: GameProps<DiceMmaState, DiceMmaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicmma-wrap">
        <div className="dicmma-done">
          <h2>Round</h2>
          <div className="dicmma-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicmma-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicmma-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicmma-wrap">
      <div className="dicmma-head">
        <span className="dicmma-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicmma-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicmma-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicmma-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicmma-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicmma-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicmma-log">{line}</div>)}
      </div>
      <div className="dicmma-actions">
        {state.phase === "rolling" && (
          <button className="dicmma-btn primary" data-testid="hint-target-dice-mma-roll" onClick={() => dispatch({ type: "roll" } as DiceMmaAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicmma-btn alt" data-testid="hint-target-dice-mma-next" onClick={() => dispatch({ type: "next" } as DiceMmaAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
