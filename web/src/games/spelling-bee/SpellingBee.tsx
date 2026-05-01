import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpellingBeeState, SpellingBeeAction, SpellingBeeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { isPangram } from "./words.js";
import "./SpellingBee.css";

export function SpellingBee({
  state,
  dispatch,
  onGameOver,
}: GameProps<SpellingBeeState, SpellingBeeSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Countdown timer
  useEffect(() => {
    if (state.gameOver) return;
    const id = setInterval(() => dispatch({ type: "tick" } as SpellingBeeAction), 1000);
    return () => clearInterval(id);
  }, [state.gameOver, dispatch]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (state.gameOver) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter") dispatch({ type: "submit" } as SpellingBeeAction);
    else if (e.key === "Backspace") dispatch({ type: "delete" } as SpellingBeeAction);
    else if (e.key === "Escape") dispatch({ type: "clear" } as SpellingBeeAction);
    else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "type", char: e.key } as SpellingBeeAction);
  }, [state.gameOver, dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const { letters, centerLetter, foundWords, currentInput, score, timeLeft, message } = state;

  // Honeycomb layout: center + 6 outer
  const [center, ...outer] = letters;
  const outerAngles = [0, 60, 120, 180, 240, 300];

  return (
    <div className="sbe-wrap">
      <div className="sbe-header">
        <span className="sbe-score">Score: {score}</span>
        <span className="sbe-timer">{timeLeft}s</span>
      </div>

      <div className="sbe-input-display">{currentInput || " "}</div>
      {message && <div className="sbe-message">{message}</div>}

      <div className="sbe-honeycomb">
        <svg viewBox="-120 -120 240 240" width="240" height="240">
          {outerAngles.map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const cx = Math.round(Math.cos(rad) * 80);
            const cy = Math.round(Math.sin(rad) * 80);
            const letter = outer[i] ?? "";
            return (
              <g key={i} className="sbe-hex-outer" onClick={() => dispatch({ type: "type", char: letter } as SpellingBeeAction)}>
                <polygon
                  points={hexPoints(cx, cy, 36)}
                  className="sbe-hex"
                />
                <text x={cx} y={cy + 7} textAnchor="middle" className="sbe-hex-letter">{letter}</text>
              </g>
            );
          })}
          <g className="sbe-hex-center" onClick={() => dispatch({ type: "type", char: center ?? "" } as SpellingBeeAction)}>
            <polygon points={hexPoints(0, 0, 36)} className="sbe-hex sbe-hex-center-cell" />
            <text x={0} y={7} textAnchor="middle" className="sbe-hex-letter">{center}</text>
          </g>
        </svg>
      </div>

      <div className="sbe-controls">
        <button onClick={() => dispatch({ type: "delete" } as SpellingBeeAction)}>Delete</button>
        <button onClick={() => dispatch({ type: "clear" } as SpellingBeeAction)}>Clear</button>
        <button className="sbe-submit-btn" onClick={() => dispatch({ type: "submit" } as SpellingBeeAction)}>Enter</button>
      </div>

      <div className="sbe-found">
        <div className="sbe-found-header">Found ({foundWords.length}):</div>
        <div className="sbe-found-list">
          {foundWords.map(w => (
            <span key={w} className={`sbe-found-word${isPangram(w, letters) ? " pangram" : ""}`}>{w}</span>
          ))}
        </div>
      </div>

      {state.gameOver && (
        <div className="sbe-overlay">
          <div className="sbe-overlay-box">
            <h2>Time&apos;s Up!</h2>
            <div>Words found: {foundWords.length}</div>
            <div>Final score: {score}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = ((i * 60 - 30) * Math.PI) / 180;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" ");
}
