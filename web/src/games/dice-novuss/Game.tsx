import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceNovussState, DiceNovussAction, DiceNovussSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceNovussGame({ state, dispatch, onGameOver }: GameProps<DiceNovussState, DiceNovussSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicnov-wrap">
        <div className="dicnov-done">
          <h2>Round</h2>
          <div className="dicnov-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicnov-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicnov-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicnov-wrap">
      <div className="dicnov-head">
        <span className="dicnov-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicnov-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicnov-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicnov-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicnov-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicnov-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicnov-log">{line}</div>)}
      </div>
      <div className="dicnov-actions">
        {state.phase === "rolling" && (
          <button className="dicnov-btn primary" onClick={() => dispatch({ type: "roll" } as DiceNovussAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicnov-btn alt" onClick={() => dispatch({ type: "next" } as DiceNovussAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
