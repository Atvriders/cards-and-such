import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DartsKillerClassicState, DartsKillerClassicAction, DartsKillerClassicSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DartsKillerClassicGame({ state, dispatch, onGameOver }: GameProps<DartsKillerClassicState, DartsKillerClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dakicl-wrap">
        <div className="dakicl-done bounce-in">
          <h2>Throw</h2>
          <div className="dakicl-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dakicl-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dakicl-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dakicl-wrap fade-in">
      <div className="dakicl-head">
        <span className="dakicl-round">Throw {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dakicl-score pulse">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dakicl-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dakicl-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dakicl-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dakicl-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dakicl-log">{line}</div>)}
      </div>
      <div className="dakicl-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-darts-killer-classic-action" className="dakicl-btn primary" onClick={() => dispatch({ type: "roll" } as DartsKillerClassicAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dakicl-btn alt" onClick={() => dispatch({ type: "next" } as DartsKillerClassicAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
