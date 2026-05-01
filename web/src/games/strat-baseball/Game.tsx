import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StratBaseballState, StratBaseballAction, StratBaseballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function StratBaseballGame({ state, dispatch, onGameOver }: GameProps<StratBaseballState, StratBaseballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="strbas-wrap">
        <div className="strbas-done">
          <h2>Inning</h2>
          <div className="strbas-final">{Math.max(0, state.score)} pts</div>
          
          <div className="strbas-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="strbas-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="strbas-wrap">
      <div className="strbas-head">
        <span className="strbas-round">Inning {state.round} / {TOTAL_ROUNDS}</span>
        <span className="strbas-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="strbas-dice-row">
          {state.dice.map((d, i) => <div key={i} className="strbas-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="strbas-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="strbas-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="strbas-log">{line}</div>)}
      </div>
      <div className="strbas-actions">
        {state.phase === "rolling" && (
          <button className="strbas-btn primary" onClick={() => dispatch({ type: "roll" } as StratBaseballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="strbas-btn alt" onClick={() => dispatch({ type: "next" } as StratBaseballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
