import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceIceFishingState, DiceIceFishingAction, DiceIceFishingSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceIceFishingGame({ state, dispatch, onGameOver }: GameProps<DiceIceFishingState, DiceIceFishingSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="diicfi-wrap">
        <div className="diicfi-done">
          <h2>Cast</h2>
          <div className="diicfi-final">{Math.max(0, state.score)} pts</div>
          
          <div className="diicfi-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="diicfi-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="diicfi-wrap">
      <div className="diicfi-head">
        <span className="diicfi-round">Cast {state.round} / {TOTAL_ROUNDS}</span>
        <span className="diicfi-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="diicfi-dice-row">
          {state.dice.map((d, i) => <div key={i} className="diicfi-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="diicfi-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="diicfi-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="diicfi-log">{line}</div>)}
      </div>
      <div className="diicfi-actions">
        {state.phase === "rolling" && (
          <button className="diicfi-btn primary" onClick={() => dispatch({ type: "roll" } as DiceIceFishingAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="diicfi-btn alt" onClick={() => dispatch({ type: "next" } as DiceIceFishingAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
