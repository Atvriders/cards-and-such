import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpoofBiddingState, SpoofBiddingAction, SpoofBiddingSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function SpoofBiddingGame({ state, dispatch, onGameOver }: GameProps<SpoofBiddingState, SpoofBiddingSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="spobid-wrap">
        <div className="spobid-done bounce-in">
          <h2>Round</h2>
          <div className="spobid-final">{Math.max(0, state.score)} pts</div>
          
          <div className="spobid-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="spobid-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="spobid-wrap fade-in">
      <div className="spobid-head">
        <span className="spobid-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="spobid-score pulse">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="spobid-dice-row">
          {state.dice.map((d, i) => <div key={i} className="spobid-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="spobid-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="spobid-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="spobid-log">{line}</div>)}
      </div>
      <div className="spobid-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-spoof-bidding-action" className="spobid-btn primary" onClick={() => dispatch({ type: "roll" } as SpoofBiddingAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="spobid-btn alt" onClick={() => dispatch({ type: "next" } as SpoofBiddingAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
