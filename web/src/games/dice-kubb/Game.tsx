import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceKubbState, DiceKubbAction, DiceKubbSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceKubbGame({ state, dispatch, onGameOver }: GameProps<DiceKubbState, DiceKubbSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dickub-wrap">
        <div className="dickub-done">
          <h2>Round</h2>
          <div className="dickub-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dickub-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dickub-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dickub-wrap">
      <div className="dickub-head">
        <span className="dickub-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dickub-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dickub-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dickub-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dickub-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dickub-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dickub-log">{line}</div>)}
      </div>
      <div className="dickub-actions">
        {state.phase === "rolling" && (
          <button className="dickub-btn primary" onClick={() => dispatch({ type: "roll" } as DiceKubbAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dickub-btn alt" onClick={() => dispatch({ type: "next" } as DiceKubbAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
