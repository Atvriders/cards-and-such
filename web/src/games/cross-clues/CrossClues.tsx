import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrossCluesState, CrossCluesAction, CrossCluesSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./CrossClues.css";

export function CrossClues({ state, dispatch, onGameOver }: GameProps<CrossCluesState, CrossCluesSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.activeCell && !state.submitted) {
      inputRef.current?.focus();
    }
  }, [state.activeCell, state.submitted]);

  const { rowCategories, colCategories, playerGuesses, activeCell, hintRevealed, checked, submitted, won, score, hintsUsed } = state;

  function getCellClass(r: number, c: number): string {
    const key = `${r},${c}`;
    let cls = "cc-cell";
    if (submitted) {
      cls += checked[key] === "correct" ? " correct" : " wrong";
    } else if (hintRevealed.includes(key)) {
      cls += " hint-revealed";
    } else if (activeCell && activeCell[0] === r && activeCell[1] === c) {
      cls += " active";
    }
    return cls;
  }

  const currentText = activeCell ? (playerGuesses[activeCell[0]]![activeCell[1]] ?? "") : "";

  return (
    <div className="cc-wrap">
      <div className="cc-title">Cross Clues Mini</div>
      <div className="cc-subtitle">
        Fill each cell with a word that fits BOTH the row and column categories
      </div>

      <div className="cc-grid-container">
        <div className="cc-grid">
          <div className="cc-corner" />
          {colCategories.map((cat, c) => (
            <div key={c} className="cc-col-header">{cat}</div>
          ))}
          {rowCategories.map((rowCat, r) => (
            <>
              <div key={`row-${r}`} className="cc-row-header">{rowCat}</div>
              {[0, 1, 2].map(c => {
                const key = `${r},${c}`;
                const text = playerGuesses[r]![c];
                return (
                  <div
                    key={c}
                    className={getCellClass(r, c)}
                    onClick={() => !submitted && !hintRevealed.includes(key) && dispatch({ type: "selectCell", row: r, col: c } as CrossCluesAction)}
                  >
                    {text || (
                      <span className="cc-cell-placeholder">
                        {!submitted ? "click to fill" : "—"}
                      </span>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {activeCell && !submitted && (
        <div className="cc-keyboard">
          <input
            ref={inputRef}
            type="text"
            value={currentText}
            placeholder={`Word for row ${activeCell[0]+1}, col ${activeCell[1]+1}…`}
            onChange={e => dispatch({ type: "typeText", text: e.target.value } as CrossCluesAction)}
            onKeyDown={e => {
              if (e.key === "Enter") dispatch({ type: "submit" } as CrossCluesAction);
              if (e.key === "Backspace" && currentText === "") dispatch({ type: "clearCell" } as CrossCluesAction);
            }}
          />
        </div>
      )}

      <div className="cc-hints-info">Hints used: {hintsUsed} (−50 pts each)</div>

      <div className="cc-actions">
        {!submitted ? (
          <>
            <button
              className="cc-btn submit"
              onClick={() => dispatch({ type: "submit" } as CrossCluesAction)}
            >
              Submit All
            </button>
            <button
              className="cc-btn hint"
              onClick={() => dispatch({ type: "hint" } as CrossCluesAction)}
            >
              Hint
            </button>
          </>
        ) : null}
      </div>

      {submitted && (
        <div className={`cc-result${won ? " won" : ""}`}>
          <h3>{won ? "Perfect! All cells correct!" : `Score: ${score} / 900`}</h3>
          <p>Hints used: {hintsUsed}</p>
          <p>Final score: <strong>{score}</strong></p>
        </div>
      )}
    </div>
  );
}
