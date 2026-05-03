import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NapWellingtonState, NapWellingtonAction, NapWellingtonSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function NapWellingtonGame({ state, dispatch, onGameOver }: GameProps<NapWellingtonState, NapWellingtonSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="napwel-wrap">
        <div className="napwel-done">
          <h2>Deal</h2>
          <div className="napwel-final">{Math.max(0, state.score)} pts</div>
          
          <div className="napwel-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="napwel-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="napwel-wrap">
      <div className="napwel-head">
        <span className="napwel-round">Deal {state.round} / {TOTAL_ROUNDS}</span>
        <span className="napwel-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="napwel-dice-row">
          {state.dice.map((d, i) => <div key={i} className="napwel-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="napwel-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="napwel-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="napwel-log">{line}</div>)}
      </div>
      <div className="napwel-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-nap-wellington-action" className="napwel-btn primary" onClick={() => dispatch({ type: "roll" } as NapWellingtonAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="napwel-btn alt" onClick={() => dispatch({ type: "next" } as NapWellingtonAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
