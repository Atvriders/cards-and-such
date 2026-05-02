import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Bowling9pinState, Bowling9pinAction, Bowling9pinSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function Bowling9pinGame({ state, dispatch, onGameOver }: GameProps<Bowling9pinState, Bowling9pinSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="bow9pi-wrap">
        <div className="bow9pi-done">
          <h2>Frame</h2>
          <div className="bow9pi-final">{Math.max(0, state.score)} pts</div>
          
          <div className="bow9pi-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="bow9pi-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bow9pi-wrap">
      <div className="bow9pi-head">
        <span className="bow9pi-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="bow9pi-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="bow9pi-dice-row">
          {state.dice.map((d, i) => <div key={i} className="bow9pi-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="bow9pi-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="bow9pi-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="bow9pi-log">{line}</div>)}
      </div>
      <div className="bow9pi-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-bowling-9pin-action" className="bow9pi-btn primary" onClick={() => dispatch({ type: "roll" } as Bowling9pinAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="bow9pi-btn alt" onClick={() => dispatch({ type: "next" } as Bowling9pinAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
