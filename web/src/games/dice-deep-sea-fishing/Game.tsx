import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceDeepSeaFishingState, DiceDeepSeaFishingAction, DiceDeepSeaFishingSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceDeepSeaFishingGame({ state, dispatch, onGameOver }: GameProps<DiceDeepSeaFishingState, DiceDeepSeaFishingSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="didesefi-wrap">
        <div className="didesefi-done">
          <h2>Cast</h2>
          <div className="didesefi-final">{Math.max(0, state.score)} pts</div>
          
          <div className="didesefi-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="didesefi-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="didesefi-wrap">
      <div className="didesefi-head">
        <span className="didesefi-round">Cast {state.round} / {TOTAL_ROUNDS}</span>
        <span className="didesefi-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="didesefi-dice-row">
          {state.dice.map((d, i) => <div key={i} className="didesefi-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="didesefi-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="didesefi-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="didesefi-log">{line}</div>)}
      </div>
      <div className="didesefi-actions">
        {state.phase === "rolling" && (
          <button className="didesefi-btn primary" data-testid="hint-target-dice-deep-sea-fishing-roll" onClick={() => dispatch({ type: "roll" } as DiceDeepSeaFishingAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="didesefi-btn alt" data-testid="hint-target-dice-deep-sea-fishing-next" onClick={() => dispatch({ type: "next" } as DiceDeepSeaFishingAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
