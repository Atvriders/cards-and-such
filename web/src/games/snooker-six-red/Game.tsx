import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SnookerSixRedState, SnookerSixRedAction, SnookerSixRedSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function SnookerSixRedGame({ state, dispatch, onGameOver }: GameProps<SnookerSixRedState, SnookerSixRedSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="snsire-wrap">
        <div className="snsire-done">
          <h2>Shot</h2>
          <div className="snsire-final">{Math.max(0, state.score)} pts</div>
          
          <div className="snsire-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="snsire-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="snsire-wrap">
      <div className="snsire-head">
        <span className="snsire-round">Shot {state.round} / {TOTAL_ROUNDS}</span>
        <span className="snsire-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="snsire-dice-row">
          {state.dice.map((d, i) => <div key={i} className="snsire-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="snsire-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="snsire-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="snsire-log">{line}</div>)}
      </div>
      <div className="snsire-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-snooker-six-red-action" className="snsire-btn primary" onClick={() => dispatch({ type: "roll" } as SnookerSixRedAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="snsire-btn alt" onClick={() => dispatch({ type: "next" } as SnookerSixRedAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
