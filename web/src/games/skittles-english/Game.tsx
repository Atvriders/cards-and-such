import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SkittlesEnglishState, SkittlesEnglishAction, SkittlesEnglishSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function SkittlesEnglishGame({ state, dispatch, onGameOver }: GameProps<SkittlesEnglishState, SkittlesEnglishSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="skieng-wrap">
        <div className="skieng-done">
          <h2>Frame</h2>
          <div className="skieng-final">{Math.max(0, state.score)} pts</div>
          
          <div className="skieng-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="skieng-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="skieng-wrap">
      <div className="skieng-head">
        <span className="skieng-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="skieng-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="skieng-dice-row">
          {state.dice.map((d, i) => <div key={i} className="skieng-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="skieng-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="skieng-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="skieng-log">{line}</div>)}
      </div>
      <div className="skieng-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-skittles-english-action" className="skieng-btn primary" onClick={() => dispatch({ type: "roll" } as SkittlesEnglishAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="skieng-btn alt" onClick={() => dispatch({ type: "next" } as SkittlesEnglishAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
