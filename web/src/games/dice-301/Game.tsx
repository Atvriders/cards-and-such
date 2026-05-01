import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Dice301State, Dice301Action, Dice301Settings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function Dice301Game({ state, dispatch, onGameOver }: GameProps<Dice301State, Dice301Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dic301-wrap">
        <div className="dic301-done">
          <h2>Throw</h2>
          <div className="dic301-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dic301-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dic301-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dic301-wrap">
      <div className="dic301-head">
        <span className="dic301-round">Throw {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dic301-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dic301-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dic301-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dic301-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dic301-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dic301-log">{line}</div>)}
      </div>
      <div className="dic301-actions">
        {state.phase === "rolling" && (
          <button className="dic301-btn primary" onClick={() => dispatch({ type: "roll" } as Dice301Action)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dic301-btn alt" onClick={() => dispatch({ type: "next" } as Dice301Action)}>Next</button>
        )}
      </div>
    </div>
  );
}
