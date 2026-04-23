import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WordChainState, WordChainAction, WordChainSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./WordChain.css";

export function WordChain({
  state,
  dispatch,
  onGameOver,
}: GameProps<WordChainState, WordChainSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.gameOver) return;
    const id = setInterval(() => dispatch({ type: "tick" } as WordChainAction), 1000);
    return () => clearInterval(id);
  }, [state.gameOver, dispatch]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (state.gameOver) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter") dispatch({ type: "submit" } as WordChainAction);
    else if (e.key === "Backspace") dispatch({ type: "delete" } as WordChainAction);
    else if (e.key === "Escape") dispatch({ type: "clear" } as WordChainAction);
    else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "type", char: e.key } as WordChainAction);
  }, [state.gameOver, dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const { chain, currentInput, score, timeLeft, message, startLetter } = state;
  const nextReq = chain.length === 0 ? startLetter : (chain[chain.length - 1]?.slice(-1).toUpperCase() ?? startLetter);

  return (
    <div className="wc-wrap">
      <div className="wc-header">
        <span className="wc-score">Score: {score}</span>
        <span className="wc-timer">{timeLeft}s</span>
      </div>

      <div className="wc-requirement">
        Next word must start with: <span className="wc-req-letter">{nextReq}</span>
      </div>

      <div className="wc-input">
        {currentInput || <span className="wc-placeholder">Type a word…</span>}
      </div>
      {message && <div className="wc-message">{message}</div>}

      <div className="wc-controls">
        <button onClick={() => dispatch({ type: "delete" } as WordChainAction)}>Del</button>
        <button onClick={() => dispatch({ type: "clear" } as WordChainAction)}>Clear</button>
        <button className="wc-submit" onClick={() => dispatch({ type: "submit" } as WordChainAction)}>Enter</button>
      </div>

      <div className="wc-chain">
        <div className="wc-chain-header">Chain ({chain.length} words):</div>
        <div className="wc-chain-list">
          {chain.map((w, i) => (
            <span key={i} className="wc-chain-word">
              {w}
              {i < chain.length - 1 && <span className="wc-arrow"> →</span>}
            </span>
          ))}
        </div>
      </div>

      {state.gameOver && (
        <div className="wc-overlay">
          <div className="wc-overlay-box">
            <h2>Time&apos;s Up!</h2>
            <div>Chain length: {chain.length}</div>
            <div>Score: {score}</div>
          </div>
        </div>
      )}
    </div>
  );
}
