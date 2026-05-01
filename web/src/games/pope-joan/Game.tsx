import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PopeJoanState, PopeJoanAction, PopeJoanSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function PopeJoanGame({ state, dispatch, onGameOver }: GameProps<PopeJoanState, PopeJoanSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="popjoa-wrap">
        <div className="popjoa-done">
          <h2>Deal</h2>
          <div className="popjoa-final">{Math.max(0, state.score)} pts</div>
          
          <div className="popjoa-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="popjoa-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="popjoa-wrap">
      <div className="popjoa-head">
        <span className="popjoa-round">Deal {state.round} / {TOTAL_ROUNDS}</span>
        <span className="popjoa-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="popjoa-dice-row">
          {state.dice.map((d, i) => <div key={i} className="popjoa-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="popjoa-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="popjoa-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="popjoa-log">{line}</div>)}
      </div>
      <div className="popjoa-actions">
        {state.phase === "rolling" && (
          <button className="popjoa-btn primary" onClick={() => dispatch({ type: "roll" } as PopeJoanAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="popjoa-btn alt" onClick={() => dispatch({ type: "next" } as PopeJoanAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
