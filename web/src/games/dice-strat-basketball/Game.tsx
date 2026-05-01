import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStratBasketballState, DiceStratBasketballAction, DiceStratBasketballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceStratBasketballGame({ state, dispatch, onGameOver }: GameProps<DiceStratBasketballState, DiceStratBasketballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="distba-wrap">
        <div className="distba-done">
          <h2>Quarter</h2>
          <div className="distba-final">{Math.max(0, state.score)} pts</div>
          
          <div className="distba-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="distba-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="distba-wrap">
      <div className="distba-head">
        <span className="distba-round">Quarter {state.round} / {TOTAL_ROUNDS}</span>
        <span className="distba-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="distba-dice-row">
          {state.dice.map((d, i) => <div key={i} className="distba-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="distba-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="distba-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="distba-log">{line}</div>)}
      </div>
      <div className="distba-actions">
        {state.phase === "rolling" && (
          <button className="distba-btn primary" onClick={() => dispatch({ type: "roll" } as DiceStratBasketballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="distba-btn alt" onClick={() => dispatch({ type: "next" } as DiceStratBasketballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
