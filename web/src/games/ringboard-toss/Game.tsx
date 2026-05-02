import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RingboardTossState, RingboardTossAction, RingboardTossSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function RingboardTossGame({ state, dispatch, onGameOver }: GameProps<RingboardTossState, RingboardTossSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="rintos-wrap">
        <div className="rintos-done">
          <h2>Round</h2>
          <div className="rintos-final">{Math.max(0, state.score)} pts</div>
          
          <div className="rintos-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="rintos-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rintos-wrap">
      <div className="rintos-head">
        <span className="rintos-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="rintos-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="rintos-dice-row">
          {state.dice.map((d, i) => <div key={i} className="rintos-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="rintos-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="rintos-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="rintos-log">{line}</div>)}
      </div>
      <div className="rintos-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-ringboard-toss-action" className="rintos-btn primary" onClick={() => dispatch({ type: "roll" } as RingboardTossAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="rintos-btn alt" onClick={() => dispatch({ type: "next" } as RingboardTossAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
