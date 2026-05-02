import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Dice701State, Dice701Action, Dice701Settings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function Dice701Game({ state, dispatch, onGameOver }: GameProps<Dice701State, Dice701Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dic701-wrap">
        <div className="dic701-done">
          <h2>Throw</h2>
          <div className="dic701-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dic701-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dic701-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dic701-wrap">
      <div className="dic701-head">
        <span className="dic701-round">Throw {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dic701-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dic701-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dic701-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dic701-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dic701-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dic701-log">{line}</div>)}
      </div>
      <div className="dic701-actions">
        {state.phase === "rolling" && (
          <button className="dic701-btn primary" data-testid="hint-target-dice-701-roll" onClick={() => dispatch({ type: "roll" } as Dice701Action)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dic701-btn alt" data-testid="hint-target-dice-701-next" onClick={() => dispatch({ type: "next" } as Dice701Action)}>Next</button>
        )}
      </div>
    </div>
  );
}
