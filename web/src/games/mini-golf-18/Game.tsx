import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniGolf18State, MiniGolf18Action, MiniGolf18Settings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function MiniGolf18Game({ state, dispatch, onGameOver }: GameProps<MiniGolf18State, MiniGolf18Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="migo18-wrap">
        <div className="migo18-done">
          <h2>Hole</h2>
          <div className="migo18-final">{Math.max(0, state.score)} pts</div>
          
          <div className="migo18-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="migo18-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="migo18-wrap">
      <div className="migo18-head">
        <span className="migo18-round">Hole {state.round} / {TOTAL_ROUNDS}</span>
        <span className="migo18-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="migo18-dice-row">
          {state.dice.map((d, i) => <div key={i} className="migo18-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="migo18-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="migo18-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="migo18-log">{line}</div>)}
      </div>
      <div className="migo18-actions">
        {state.phase === "rolling" && (
          <button className="migo18-btn primary" onClick={() => dispatch({ type: "roll" } as MiniGolf18Action)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="migo18-btn alt" onClick={() => dispatch({ type: "next" } as MiniGolf18Action)}>Next</button>
        )}
      </div>
    </div>
  );
}
