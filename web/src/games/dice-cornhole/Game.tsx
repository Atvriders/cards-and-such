import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCornholeState, DiceCornholeAction, DiceCornholeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceCornholeGame({ state, dispatch, onGameOver }: GameProps<DiceCornholeState, DiceCornholeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="diccor-wrap">
        <div className="diccor-done">
          <h2>Round</h2>
          <div className="diccor-final">{Math.max(0, state.score)} pts</div>
          
          <div className="diccor-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="diccor-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="diccor-wrap">
      <div className="diccor-head">
        <span className="diccor-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="diccor-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="diccor-dice-row">
          {state.dice.map((d, i) => <div key={i} className="diccor-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="diccor-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="diccor-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="diccor-log">{line}</div>)}
      </div>
      <div className="diccor-actions">
        {state.phase === "rolling" && (
          <button className="diccor-btn primary" data-testid="hint-target-dice-cornhole-roll" onClick={() => dispatch({ type: "roll" } as DiceCornholeAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="diccor-btn alt" data-testid="hint-target-dice-cornhole-next" onClick={() => dispatch({ type: "next" } as DiceCornholeAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
