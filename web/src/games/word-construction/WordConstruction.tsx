import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WordConstructionState, WordConstructionAction, WordConstructionSettings } from "./state.js";
import { isTerminal, getPrefixWordCount } from "./state.js";
import "./WordConstruction.css";

export function WordConstruction({
  state,
  dispatch,
  onGameOver,
}: GameProps<WordConstructionState, WordConstructionSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.gameOver) return;
    const id = setInterval(() => dispatch({ type: "tick" } as WordConstructionAction), 1000);
    return () => clearInterval(id);
  }, [state.gameOver, dispatch]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (state.gameOver) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter") dispatch({ type: "submit" } as WordConstructionAction);
    else if (e.key === "Backspace") dispatch({ type: "delete" } as WordConstructionAction);
    else if (e.key === "Escape") dispatch({ type: "clear" } as WordConstructionAction);
    else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "type", char: e.key } as WordConstructionAction);
  }, [state.gameOver, dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const { prefixes, currentPrefix, foundWords, currentInput, score, timeLeft, message } = state;
  const totalFound = Object.values(foundWords).reduce((a, b) => a + b.length, 0);

  return (
    <div className="wcon-wrap">
      <div className="wcon-header">
        <span className="wcon-score">Score: {score}</span>
        <span className="wcon-timer">{timeLeft}s</span>
      </div>

      <div className="wcon-prefixes">
        {prefixes.map(p => (
          <button
            key={p}
            className={`wcon-prefix-btn${p === currentPrefix ? " wcon-active" : ""}`}
            onClick={() => dispatch({ type: "selectPrefix", prefix: p } as WordConstructionAction)}
          >
            <span className="wcon-prefix-label">{p}-</span>
            <span className="wcon-prefix-count">{foundWords[p]?.length ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="wcon-input-area">
        <span className="wcon-prefix-display">{currentPrefix}</span>
        <span className="wcon-input">{currentInput.slice(currentPrefix.length) || <span className="wcon-cursor">|</span>}</span>
      </div>

      {message && <div className="wcon-message">{message}</div>}

      <div className="wcon-controls">
        <button onClick={() => dispatch({ type: "delete" } as WordConstructionAction)}>Del</button>
        <button onClick={() => dispatch({ type: "clear" } as WordConstructionAction)}>Clear</button>
        <button className="wcon-submit" onClick={() => dispatch({ type: "submit" } as WordConstructionAction)}>Enter</button>
      </div>

      <div className="wcon-found-all">
        {prefixes.map(p => (
          <div key={p} className="wcon-prefix-found">
            <div className="wcon-prefix-found-header">
              {p}- ({foundWords[p]?.length ?? 0} / {getPrefixWordCount(p)}):
            </div>
            <div className="wcon-prefix-found-words">
              {(foundWords[p] ?? []).map(w => (
                <span key={w} className="wcon-found-word">{w}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="wcon-stats">Total found: {totalFound} words</div>

      {state.gameOver && (
        <div className="wcon-overlay">
          <div className="wcon-overlay-box">
            <h2>Time&apos;s Up!</h2>
            <div>Words found: {totalFound}</div>
            <div>Score: {score}</div>
          </div>
        </div>
      )}
    </div>
  );
}
