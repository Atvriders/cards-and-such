import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BoggleState, BoggleAction, BoggleSettings } from "./state.js";
import { isTerminal, wordScore } from "./state.js";
import "./Boggle.css";

export function Boggle({ state, dispatch, onGameOver }: GameProps<BoggleState, BoggleSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.done) return;
    tickRef.current = setInterval(() => {
      dispatch({ type: "tick" } as BoggleAction);
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.done, dispatch]);

  const { grid, gridSize, currentPath, foundWords, score, timeLeft, done, error } = state;

  const currentWord = currentPath.map(i => grid[i]!).join("");

  const gridStyle = {
    gridTemplateColumns: `repeat(${gridSize}, 60px)`,
  };

  return (
    <div className="bgl-wrap">
      <div className="bgl-header">
        <span>Score: {score}</span>
        <span className="bgl-timer">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
        <span>{foundWords.length} words</span>
      </div>

      <div className="bgl-grid" style={gridStyle}>
        {grid.map((letter, i) => {
          const pathIdx = currentPath.indexOf(i);
          const isFirst = currentPath[0] === i;
          const isSelected = pathIdx !== -1;
          return (
            <div
              key={i}
              className={`bgl-cell${isFirst ? " first" : isSelected ? " selected" : ""}`}
              onClick={() => !done && dispatch({ type: "selectCell", index: i } as BoggleAction)}
            >
              {letter}
            </div>
          );
        })}
      </div>

      <div className="bgl-current-word">{currentWord || " "}</div>

      <div className="bgl-actions">
        <button
          className="bgl-btn submit"
          disabled={currentPath.length < 3 || done}
          onClick={() => dispatch({ type: "submitWord" } as BoggleAction)}
        >
          Submit ({currentPath.length >= 3 ? `+${wordScore(currentPath.length)}pt` : "—"})
        </button>
        <button
          className="bgl-btn clear"
          disabled={currentPath.length === 0 || done}
          onClick={() => dispatch({ type: "clearPath" } as BoggleAction)}
        >
          Clear
        </button>
      </div>

      <div className="bgl-error">{error ?? " "}</div>

      {foundWords.length > 0 && (
        <div className="bgl-found-words">
          {[...foundWords].reverse().map(w => (
            <span key={w} className="bgl-word-chip">{w}</span>
          ))}
        </div>
      )}

      {done && (
        <div className="bgl-done-overlay">
          <div className="bgl-done-box">
            <h2>Time&apos;s up!</h2>
            <p>Words found: {foundWords.length}</p>
            <p>Final score: <strong>{score}</strong></p>
          </div>
        </div>
      )}
    </div>
  );
}
