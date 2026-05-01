import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStratFootballState, DiceStratFootballAction, DiceStratFootballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceStratFootballGame({ state, dispatch, onGameOver }: GameProps<DiceStratFootballState, DiceStratFootballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="distfo-wrap">
        <div className="distfo-done">
          <h2>Quarter</h2>
          <div className="distfo-final">{Math.max(0, state.score)} pts</div>
          
          <div className="distfo-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="distfo-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="distfo-wrap">
      <div className="distfo-head">
        <span className="distfo-round">Quarter {state.round} / {TOTAL_ROUNDS}</span>
        <span className="distfo-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="distfo-dice-row">
          {state.dice.map((d, i) => <div key={i} className="distfo-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="distfo-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="distfo-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="distfo-log">{line}</div>)}
      </div>
      <div className="distfo-actions">
        {state.phase === "rolling" && (
          <button className="distfo-btn primary" onClick={() => dispatch({ type: "roll" } as DiceStratFootballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="distfo-btn alt" onClick={() => dispatch({ type: "next" } as DiceStratFootballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
