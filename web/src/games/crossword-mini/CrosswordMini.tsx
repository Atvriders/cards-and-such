import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrosswordMiniState, CrosswordMiniAction, CrosswordMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./CrosswordMini.css";

export function CrosswordMini({
  state,
  dispatch,
  onGameOver,
}: GameProps<CrosswordMiniState, CrosswordMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (state.gameOver) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "type", char: e.key } as CrosswordMiniAction);
    else if (e.key === "Backspace" || e.key === "Delete") dispatch({ type: "delete" } as CrosswordMiniAction);
    else if (e.key === "Tab") { e.preventDefault(); dispatch({ type: "toggleDirection" } as CrosswordMiniAction); }
  }, [state.gameOver, dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const { puzzle, playerGrid, selectedCell, direction, checked, score } = state;

  function getCellClass(i: number): string {
    const ch = puzzle.grid[i];
    if (ch === "#") return "cmn-cell cmn-black";
    let cls = "cmn-cell";
    if (selectedCell === i) cls += " cmn-selected";
    if (checked) {
      if (playerGrid[i] === ch) cls += " cmn-correct";
      else if (playerGrid[i]) cls += " cmn-wrong";
    }
    return cls;
  }

  // Compute cell numbers
  const cellNumbers: Record<number, number> = {};
  let clueNum = 1;
  for (let i = 0; i < 25; i++) {
    if (puzzle.grid[i] === "#") continue;
    const row = Math.floor(i / 5);
    const col = i % 5;
    const startAcross = col === 0 || puzzle.grid[i - 1] === "#";
    const startDown = row === 0 || puzzle.grid[i - 5] === "#";
    const acrossLen = startAcross && col + 1 < 5 && puzzle.grid[i + 1] !== "#";
    const downLen = startDown && row + 1 < 5 && puzzle.grid[i + 5] !== "#";
    if (acrossLen || downLen) {
      cellNumbers[i] = clueNum++;
    }
  }

  return (
    <div className="cmn-wrap">
      <div className="cmn-grid">
        {Array.from({ length: 25 }, (_, i) => (
          <div
            key={i}
            className={getCellClass(i)}
            onClick={() => puzzle.grid[i] !== "#" && dispatch({ type: "selectCell", index: i } as CrosswordMiniAction)}
          >
            {cellNumbers[i] && <span className="cmn-cell-num">{cellNumbers[i]}</span>}
            <span className="cmn-cell-letter">{playerGrid[i] !== "#" ? playerGrid[i] : ""}</span>
          </div>
        ))}
      </div>

      <div className="cmn-clues">
        <div className="cmn-clues-section">
          <strong>Across</strong>
          {puzzle.across.map(c => (
            <div key={c.number} className="cmn-clue">{c.number}. {c.clue}</div>
          ))}
        </div>
        <div className="cmn-clues-section">
          <strong>Down</strong>
          {puzzle.down.map(c => (
            <div key={c.number} className="cmn-clue">{c.number}. {c.clue}</div>
          ))}
        </div>
      </div>

      {!state.gameOver && (
        <button data-testid="hint-target-crossword-mini-action" className="cmn-check-btn" onClick={() => dispatch({ type: "check" } as CrosswordMiniAction)}>
          Check Answers
        </button>
      )}

      {checked && (
        <div className="cmn-result">Score: {score} / 100</div>
      )}

      {state.gameOver && (
        <div className="cmn-overlay">
          <div className="cmn-overlay-box">
            <h2>Checked!</h2>
            <div>Score: {score} / 100</div>
          </div>
        </div>
      )}
    </div>
  );
}
