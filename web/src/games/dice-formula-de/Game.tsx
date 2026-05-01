import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFormulaDeState, DiceFormulaDeAction, DiceFormulaDeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceFormulaDeGame({ state, dispatch, onGameOver }: GameProps<DiceFormulaDeState, DiceFormulaDeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="difode-wrap">
        <div className="difode-done">
          <h2>Lap</h2>
          <div className="difode-final">{Math.max(0, state.score)} pts</div>
          
          <div className="difode-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="difode-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="difode-wrap">
      <div className="difode-head">
        <span className="difode-round">Lap {state.round} / {TOTAL_ROUNDS}</span>
        <span className="difode-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="difode-dice-row">
          {state.dice.map((d, i) => <div key={i} className="difode-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="difode-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="difode-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="difode-log">{line}</div>)}
      </div>
      <div className="difode-actions">
        {state.phase === "rolling" && (
          <button className="difode-btn primary" onClick={() => dispatch({ type: "roll" } as DiceFormulaDeAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="difode-btn alt" onClick={() => dispatch({ type: "next" } as DiceFormulaDeAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
