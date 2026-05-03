import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SnookerSkillState, SnookerSkillAction, SnookerSkillSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function SnookerSkillGame({ state, dispatch, onGameOver }: GameProps<SnookerSkillState, SnookerSkillSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="snoski-wrap">
        <div className="snoski-done">
          <h2>Shot</h2>
          <div className="snoski-final">{Math.max(0, state.score)} pts</div>
          
          <div className="snoski-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="snoski-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="snoski-wrap">
      <div className="snoski-head">
        <span className="snoski-round">Shot {state.round} / {TOTAL_ROUNDS}</span>
        <span className="snoski-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="snoski-dice-row">
          {state.dice.map((d, i) => <div key={i} className="snoski-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="snoski-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="snoski-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="snoski-log">{line}</div>)}
      </div>
      <div className="snoski-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-snooker-skill-action" className="snoski-btn primary" onClick={() => dispatch({ type: "roll" } as SnookerSkillAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="snoski-btn alt" onClick={() => dispatch({ type: "next" } as SnookerSkillAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
