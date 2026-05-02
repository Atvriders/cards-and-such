import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCrokinoleState, DiceCrokinoleAction, DiceCrokinoleSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceCrokinoleGame({ state, dispatch, onGameOver }: GameProps<DiceCrokinoleState, DiceCrokinoleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="diccro-wrap">
        <div className="diccro-done">
          <h2>Round</h2>
          <div className="diccro-final">{Math.max(0, state.score)} pts</div>
          
          <div className="diccro-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="diccro-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="diccro-wrap">
      <div className="diccro-head">
        <span className="diccro-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="diccro-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="diccro-dice-row">
          {state.dice.map((d, i) => <div key={i} className="diccro-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="diccro-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="diccro-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="diccro-log">{line}</div>)}
      </div>
      <div className="diccro-actions">
        {state.phase === "rolling" && (
          <button className="diccro-btn primary" data-testid="hint-target-dice-crokinole-roll" onClick={() => dispatch({ type: "roll" } as DiceCrokinoleAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="diccro-btn alt" data-testid="hint-target-dice-crokinole-next" onClick={() => dispatch({ type: "next" } as DiceCrokinoleAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
