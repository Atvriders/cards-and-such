import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MonochromeRunState, MonochromeRunAction, MonochromeRunSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";

export function MonochromeRunGame({ state, dispatch, onGameOver }: GameProps<MonochromeRunState, MonochromeRunSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div>Best Streak: {state.bestStreak}</div><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.drawn} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts</div>
      <div className="cm-info">Streak: {state.currentStreak} ({state.currentColor ?? "—"})</div>
      {state.lastCard !== null && (
        <div className={`cm-card ${isRed(state.lastCard) ? "red" : "black"}`}>{cardName(state.lastCard)}</div>
      )}
      <button data-testid="hint-target-monochrome-run-primary" className="cm-btn" onClick={() => dispatch({ type:"draw" } as MonochromeRunAction)}>Draw</button>
    </div>
  );
}
