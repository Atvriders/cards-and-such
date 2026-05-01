import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStratArenaState, DiceStratArenaAction, DiceStratArenaSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceStratArenaGame({ state, dispatch, onGameOver }: GameProps<DiceStratArenaState, DiceStratArenaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="distar-wrap">
        <div className="distar-done">
          <h2>Quarter</h2>
          <div className="distar-final">{Math.max(0, state.score)} pts</div>
          
          <div className="distar-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="distar-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="distar-wrap">
      <div className="distar-head">
        <span className="distar-round">Quarter {state.round} / {TOTAL_ROUNDS}</span>
        <span className="distar-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="distar-dice-row">
          {state.dice.map((d, i) => <div key={i} className="distar-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="distar-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="distar-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="distar-log">{line}</div>)}
      </div>
      <div className="distar-actions">
        {state.phase === "rolling" && (
          <button className="distar-btn primary" onClick={() => dispatch({ type: "roll" } as DiceStratArenaAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="distar-btn alt" onClick={() => dispatch({ type: "next" } as DiceStratArenaAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
