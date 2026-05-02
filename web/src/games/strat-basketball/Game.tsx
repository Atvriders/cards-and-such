import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StratBasketballState, StratBasketballAction, StratBasketballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function StratBasketballGame({ state, dispatch, onGameOver }: GameProps<StratBasketballState, StratBasketballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="strbsk-wrap">
        <div className="strbsk-done">
          <h2>Quarter</h2>
          <div className="strbsk-final">{Math.max(0, state.score)} pts</div>
          
          <div className="strbsk-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="strbsk-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="strbsk-wrap">
      <div className="strbsk-head">
        <span className="strbsk-round">Quarter {state.round} / {TOTAL_ROUNDS}</span>
        <span className="strbsk-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="strbsk-dice-row">
          {state.dice.map((d, i) => <div key={i} className="strbsk-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="strbsk-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="strbsk-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="strbsk-log">{line}</div>)}
      </div>
      <div className="strbsk-actions">
        {state.phase === "rolling" && (
          <button className="strbsk-btn primary" data-testid="hint-target-strat-basketball-roll" onClick={() => dispatch({ type: "roll" } as StratBasketballAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="strbsk-btn alt" data-testid="hint-target-strat-basketball-next" onClick={() => dispatch({ type: "next" } as StratBasketballAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
