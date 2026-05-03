import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShuffleQuarterPubState, ShuffleQuarterPubAction, ShuffleQuarterPubSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function ShuffleQuarterPubGame({ state, dispatch, onGameOver }: GameProps<ShuffleQuarterPubState, ShuffleQuarterPubSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="shqupu-wrap">
        <div className="shqupu-done">
          <h2>Round</h2>
          <div className="shqupu-final">{Math.max(0, state.score)} pts</div>
          
          <div className="shqupu-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="shqupu-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="shqupu-wrap">
      <div className="shqupu-head">
        <span className="shqupu-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="shqupu-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="shqupu-dice-row">
          {state.dice.map((d, i) => <div key={i} className="shqupu-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="shqupu-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="shqupu-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="shqupu-log">{line}</div>)}
      </div>
      <div className="shqupu-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-shuffle-quarter-pub-action" className="shqupu-btn primary" onClick={() => dispatch({ type: "roll" } as ShuffleQuarterPubAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="shqupu-btn alt" onClick={() => dispatch({ type: "next" } as ShuffleQuarterPubAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
