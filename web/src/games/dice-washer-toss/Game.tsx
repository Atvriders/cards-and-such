import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceWasherTossState, DiceWasherTossAction, DiceWasherTossSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceWasherTossGame({ state, dispatch, onGameOver }: GameProps<DiceWasherTossState, DiceWasherTossSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="diwato-wrap">
        <div className="diwato-done">
          <h2>Round</h2>
          <div className="diwato-final">{Math.max(0, state.score)} pts</div>
          
          <div className="diwato-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="diwato-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="diwato-wrap">
      <div className="diwato-head">
        <span className="diwato-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="diwato-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="diwato-dice-row">
          {state.dice.map((d, i) => <div key={i} className="diwato-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="diwato-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="diwato-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="diwato-log">{line}</div>)}
      </div>
      <div className="diwato-actions">
        {state.phase === "rolling" && (
          <button className="diwato-btn primary" onClick={() => dispatch({ type: "roll" } as DiceWasherTossAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="diwato-btn alt" onClick={() => dispatch({ type: "next" } as DiceWasherTossAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
