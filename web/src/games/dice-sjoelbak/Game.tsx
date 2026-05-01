import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSjoelbakState, DiceSjoelbakAction, DiceSjoelbakSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceSjoelbakGame({ state, dispatch, onGameOver }: GameProps<DiceSjoelbakState, DiceSjoelbakSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicsjo-wrap">
        <div className="dicsjo-done">
          <h2>Pass</h2>
          <div className="dicsjo-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicsjo-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicsjo-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicsjo-wrap">
      <div className="dicsjo-head">
        <span className="dicsjo-round">Pass {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicsjo-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicsjo-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicsjo-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicsjo-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicsjo-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicsjo-log">{line}</div>)}
      </div>
      <div className="dicsjo-actions">
        {state.phase === "rolling" && (
          <button className="dicsjo-btn primary" onClick={() => dispatch({ type: "roll" } as DiceSjoelbakAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicsjo-btn alt" onClick={() => dispatch({ type: "next" } as DiceSjoelbakAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
