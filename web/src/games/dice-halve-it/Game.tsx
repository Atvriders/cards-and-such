import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceHalveItState, DiceHalveItAction, DiceHalveItSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceHalveItGame({ state, dispatch, onGameOver }: GameProps<DiceHalveItState, DiceHalveItSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dihait-wrap">
        <div className="dihait-done">
          <h2>Round</h2>
          <div className="dihait-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dihait-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dihait-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dihait-wrap">
      <div className="dihait-head">
        <span className="dihait-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dihait-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dihait-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dihait-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dihait-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dihait-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dihait-log">{line}</div>)}
      </div>
      <div className="dihait-actions">
        {state.phase === "rolling" && (
          <button className="dihait-btn primary" data-testid="hint-target-dice-halve-it-roll" onClick={() => dispatch({ type: "roll" } as DiceHalveItAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dihait-btn alt" data-testid="hint-target-dice-halve-it-next" onClick={() => dispatch({ type: "next" } as DiceHalveItAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
