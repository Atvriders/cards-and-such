import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CribbageCrashState, CribbageCrashAction, CribbageCrashSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CribbageCrashGame({ state, dispatch, onGameOver }: GameProps<CribbageCrashState, CribbageCrashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="cricra-wrap">
        <div className="cricra-done">
          <h2>Hand</h2>
          <div className="cricra-final">{Math.max(0, state.score)} pts</div>
          
          <div className="cricra-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="cricra-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="cricra-wrap">
      <div className="cricra-head">
        <span className="cricra-round">Hand {state.round} / {TOTAL_ROUNDS}</span>
        <span className="cricra-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="cricra-dice-row">
          {state.dice.map((d, i) => <div key={i} className="cricra-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="cricra-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="cricra-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="cricra-log">{line}</div>)}
      </div>
      <div className="cricra-actions">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-cribbage-crash-action" className="cricra-btn primary" onClick={() => dispatch({ type: "roll" } as CribbageCrashAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="cricra-btn alt" onClick={() => dispatch({ type: "next" } as CribbageCrashAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
