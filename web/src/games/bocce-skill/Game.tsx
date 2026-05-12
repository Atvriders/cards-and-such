import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BocceSkillState, BocceSkillAction, BocceSkillSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BocceSkillGame({ state, dispatch, onGameOver }: GameProps<BocceSkillState, BocceSkillSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="bocski-wrap">
        <div className="bocski-done bounce-in">
          <h2>End</h2>
          <div className="bocski-final">{Math.max(0, state.score)} pts</div>
          
          <div className="bocski-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="bocski-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bocski-wrap fade-in">
      <div className="bocski-head">
        <span className="bocski-round">End {state.round} / {TOTAL_ROUNDS}</span>
        <span className="bocski-score pulse">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="bocski-dice-row">
          {state.dice.map((d, i) => <div key={i} className="bocski-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="bocski-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="bocski-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="bocski-log">{line}</div>)}
      </div>
      <div className="bocski-actions">
        {state.phase === "rolling" && (
          <button className="bocski-btn primary" data-testid="hint-target-bocce-skill-roll" onClick={() => dispatch({ type: "roll" } as BocceSkillAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="bocski-btn alt" data-testid="hint-target-bocce-skill-next" onClick={() => dispatch({ type: "next" } as BocceSkillAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
