import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceKanjamState, DiceKanjamAction, DiceKanjamSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceKanjamGame({ state, dispatch, onGameOver }: GameProps<DiceKanjamState, DiceKanjamSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dickan-wrap">
        <div className="dickan-done">
          <h2>Round</h2>
          <div className="dickan-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dickan-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dickan-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dickan-wrap">
      <div className="dickan-head">
        <span className="dickan-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dickan-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dickan-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dickan-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dickan-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dickan-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dickan-log">{line}</div>)}
      </div>
      <div className="dickan-actions">
        {state.phase === "rolling" && (
          <button className="dickan-btn primary" onClick={() => dispatch({ type: "roll" } as DiceKanjamAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dickan-btn alt" onClick={() => dispatch({ type: "next" } as DiceKanjamAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
