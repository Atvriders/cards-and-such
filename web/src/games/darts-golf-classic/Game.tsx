import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DartsGolfClassicState, DartsGolfClassicAction, DartsGolfClassicSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DartsGolfClassicGame({ state, dispatch, onGameOver }: GameProps<DartsGolfClassicState, DartsGolfClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dagocl-wrap">
        <div className="dagocl-done">
          <h2>Hole</h2>
          <div className="dagocl-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dagocl-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dagocl-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dagocl-wrap">
      <div className="dagocl-head">
        <span className="dagocl-round">Hole {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dagocl-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dagocl-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dagocl-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dagocl-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dagocl-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dagocl-log">{line}</div>)}
      </div>
      <div className="dagocl-actions">
        {state.phase === "rolling" && (
          <button className="dagocl-btn primary" onClick={() => dispatch({ type: "roll" } as DartsGolfClassicAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dagocl-btn alt" onClick={() => dispatch({ type: "next" } as DartsGolfClassicAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
