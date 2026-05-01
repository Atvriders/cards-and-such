import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DartsBaseballClassicState, DartsBaseballClassicAction, DartsBaseballClassicSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DartsBaseballClassicGame({ state, dispatch, onGameOver }: GameProps<DartsBaseballClassicState, DartsBaseballClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dabacl-wrap">
        <div className="dabacl-done">
          <h2>Inning</h2>
          <div className="dabacl-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dabacl-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dabacl-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dabacl-wrap">
      <div className="dabacl-head">
        <span className="dabacl-round">Inning {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dabacl-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dabacl-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dabacl-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dabacl-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dabacl-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dabacl-log">{line}</div>)}
      </div>
      <div className="dabacl-actions">
        {state.phase === "rolling" && (
          <button className="dabacl-btn primary" onClick={() => dispatch({ type: "roll" } as DartsBaseballClassicAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dabacl-btn alt" onClick={() => dispatch({ type: "next" } as DartsBaseballClassicAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
