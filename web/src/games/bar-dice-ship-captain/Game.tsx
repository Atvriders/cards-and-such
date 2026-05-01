import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BarDiceShipCaptainState, BarDiceShipCaptainAction, BarDiceShipCaptainSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BarDiceShipCaptainGame({ state, dispatch, onGameOver }: GameProps<BarDiceShipCaptainState, BarDiceShipCaptainSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="badishca-wrap">
        <div className="badishca-done">
          <h2>Roll</h2>
          <div className="badishca-final">{Math.max(0, state.score)} pts</div>
          
          <div className="badishca-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="badishca-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="badishca-wrap">
      <div className="badishca-head">
        <span className="badishca-round">Roll {state.round} / {TOTAL_ROUNDS}</span>
        <span className="badishca-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="badishca-dice-row">
          {state.dice.map((d, i) => <div key={i} className="badishca-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="badishca-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="badishca-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="badishca-log">{line}</div>)}
      </div>
      <div className="badishca-actions">
        {state.phase === "rolling" && (
          <button className="badishca-btn primary" onClick={() => dispatch({ type: "roll" } as BarDiceShipCaptainAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="badishca-btn alt" onClick={() => dispatch({ type: "next" } as BarDiceShipCaptainAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
