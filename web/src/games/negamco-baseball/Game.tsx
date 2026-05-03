import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NegamcoBaseballState, NegamcoBaseballAction, NegamcoBaseballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function NegamcoBaseballGame({ state, dispatch, onGameOver }: GameProps<NegamcoBaseballState, NegamcoBaseballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="negbas-wrap">
        <div className="negbas-done">
          <h2>Inning</h2>
          <div className="negbas-final">{Math.max(0, state.score)} pts</div>
          
          <div className="negbas-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="negbas-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="negbas-wrap">
      <div className="negbas-head">
        <span className="negbas-round">Inning {state.round} / {TOTAL_ROUNDS}</span>
        <span className="negbas-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="negbas-dice-row">
          {state.dice.map((d, i) => <div key={i} className="negbas-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="negbas-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="negbas-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="negbas-log">{line}</div>)}
      </div>
      <div className="negbas-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-negamco-baseball-action" className="negbas-btn primary" onClick={() => dispatch({ type: "roll" } as NegamcoBaseballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="negbas-btn alt" onClick={() => dispatch({ type: "next" } as NegamcoBaseballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
