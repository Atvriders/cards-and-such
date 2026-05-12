import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NineMensMorrisPubState, NineMensMorrisPubAction, NineMensMorrisPubSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function NineMensMorrisPubGame({ state, dispatch, onGameOver }: GameProps<NineMensMorrisPubState, NineMensMorrisPubSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="nimemopu-wrap">
        <div className="nimemopu-done bounce-in">
          <h2>Move</h2>
          <div className="nimemopu-final">{Math.max(0, state.score)} pts</div>
          
          <div className="nimemopu-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="nimemopu-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="nimemopu-wrap fade-in">
      <div className="nimemopu-head">
        <span className="nimemopu-round">Move {state.round} / {TOTAL_ROUNDS}</span>
        <span className="nimemopu-score pulse">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="nimemopu-dice-row">
          {state.dice.map((d, i) => <div key={i} className="nimemopu-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="nimemopu-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="nimemopu-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="nimemopu-log">{line}</div>)}
      </div>
      <div className="nimemopu-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-nine-mens-morris-pub-action" className="nimemopu-btn primary" onClick={() => dispatch({ type: "roll" } as NineMensMorrisPubAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="nimemopu-btn alt" onClick={() => dispatch({ type: "next" } as NineMensMorrisPubAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
