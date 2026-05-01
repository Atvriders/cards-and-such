import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuoitsTossState, QuoitsTossAction, QuoitsTossSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function QuoitsTossGame({ state, dispatch, onGameOver }: GameProps<QuoitsTossState, QuoitsTossSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="quotos-wrap">
        <div className="quotos-done">
          <h2>Round</h2>
          <div className="quotos-final">{Math.max(0, state.score)} pts</div>
          
          <div className="quotos-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="quotos-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="quotos-wrap">
      <div className="quotos-head">
        <span className="quotos-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="quotos-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="quotos-dice-row">
          {state.dice.map((d, i) => <div key={i} className="quotos-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="quotos-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="quotos-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="quotos-log">{line}</div>)}
      </div>
      <div className="quotos-actions">
        {state.phase === "rolling" && (
          <button className="quotos-btn primary" onClick={() => dispatch({ type: "roll" } as QuoitsTossAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="quotos-btn alt" onClick={() => dispatch({ type: "next" } as QuoitsTossAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
