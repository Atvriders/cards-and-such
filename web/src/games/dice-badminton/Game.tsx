import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBadmintonState, DiceBadmintonAction, DiceBadmintonSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceBadmintonGame({ state, dispatch, onGameOver }: GameProps<DiceBadmintonState, DiceBadmintonSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dicbad-wrap">
        <div className="dicbad-done">
          <h2>Rally</h2>
          <div className="dicbad-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dicbad-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dicbad-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dicbad-wrap">
      <div className="dicbad-head">
        <span className="dicbad-round">Rally {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dicbad-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dicbad-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dicbad-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dicbad-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dicbad-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dicbad-log">{line}</div>)}
      </div>
      <div className="dicbad-actions">
        {state.phase === "rolling" && (
          <button className="dicbad-btn primary" data-testid="hint-target-dice-badminton-roll" onClick={() => dispatch({ type: "roll" } as DiceBadmintonAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dicbad-btn alt" data-testid="hint-target-dice-badminton-next" onClick={() => dispatch({ type: "next" } as DiceBadmintonAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
