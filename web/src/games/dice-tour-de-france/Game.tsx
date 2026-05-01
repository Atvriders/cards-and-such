import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTourDeFranceState, DiceTourDeFranceAction, DiceTourDeFranceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceTourDeFranceGame({ state, dispatch, onGameOver }: GameProps<DiceTourDeFranceState, DiceTourDeFranceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="ditodefr-wrap">
        <div className="ditodefr-done">
          <h2>Lap</h2>
          <div className="ditodefr-final">{Math.max(0, state.score)} pts</div>
          
          <div className="ditodefr-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="ditodefr-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="ditodefr-wrap">
      <div className="ditodefr-head">
        <span className="ditodefr-round">Lap {state.round} / {TOTAL_ROUNDS}</span>
        <span className="ditodefr-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="ditodefr-dice-row">
          {state.dice.map((d, i) => <div key={i} className="ditodefr-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="ditodefr-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="ditodefr-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="ditodefr-log">{line}</div>)}
      </div>
      <div className="ditodefr-actions">
        {state.phase === "rolling" && (
          <button className="ditodefr-btn primary" onClick={() => dispatch({ type: "roll" } as DiceTourDeFranceAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="ditodefr-btn alt" onClick={() => dispatch({ type: "next" } as DiceTourDeFranceAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
