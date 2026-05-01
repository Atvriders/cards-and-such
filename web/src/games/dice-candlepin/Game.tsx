import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCandlepinState, DiceCandlepinAction, DiceCandlepinSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceCandlepinGame({ state, dispatch, onGameOver }: GameProps<DiceCandlepinState, DiceCandlepinSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="diccan-wrap">
        <div className="diccan-done">
          <h2>Frame</h2>
          <div className="diccan-final">{Math.max(0, state.score)} pts</div>
          
          <div className="diccan-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="diccan-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="diccan-wrap">
      <div className="diccan-head">
        <span className="diccan-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="diccan-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="diccan-dice-row">
          {state.dice.map((d, i) => <div key={i} className="diccan-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="diccan-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="diccan-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="diccan-log">{line}</div>)}
      </div>
      <div className="diccan-actions">
        {state.phase === "rolling" && (
          <button className="diccan-btn primary" onClick={() => dispatch({ type: "roll" } as DiceCandlepinAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="diccan-btn alt" onClick={() => dispatch({ type: "next" } as DiceCandlepinAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
