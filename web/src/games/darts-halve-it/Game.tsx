import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DartsHalveItState, DartsHalveItAction, DartsHalveItSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DartsHalveItGame({ state, dispatch, onGameOver }: GameProps<DartsHalveItState, DartsHalveItSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dahait-wrap">
        <div className="dahait-done">
          <h2>Round</h2>
          <div className="dahait-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dahait-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dahait-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dahait-wrap">
      <div className="dahait-head">
        <span className="dahait-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dahait-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dahait-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dahait-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dahait-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dahait-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dahait-log">{line}</div>)}
      </div>
      <div className="dahait-actions">
        {state.phase === "rolling" && (
          <button className="dahait-btn primary" onClick={() => dispatch({ type: "roll" } as DartsHalveItAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dahait-btn alt" onClick={() => dispatch({ type: "next" } as DartsHalveItAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
