import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFivePinState, DiceFivePinAction, DiceFivePinSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceFivePinGame({ state, dispatch, onGameOver }: GameProps<DiceFivePinState, DiceFivePinSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="difipi-wrap">
        <div className="difipi-done">
          <h2>Frame</h2>
          <div className="difipi-final">{Math.max(0, state.score)} pts</div>
          
          <div className="difipi-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="difipi-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="difipi-wrap">
      <div className="difipi-head">
        <span className="difipi-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="difipi-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="difipi-dice-row">
          {state.dice.map((d, i) => <div key={i} className="difipi-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="difipi-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="difipi-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="difipi-log">{line}</div>)}
      </div>
      <div className="difipi-actions">
        {state.phase === "rolling" && (
          <button className="difipi-btn primary" onClick={() => dispatch({ type: "roll" } as DiceFivePinAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="difipi-btn alt" onClick={() => dispatch({ type: "next" } as DiceFivePinAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
