import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CodewordsState, CodewordsAction, CodewordsSettings } from "./state.js";
import { isTerminal, getGridCodes } from "./state.js";
import "./Codewords.css";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function Codewords({ state, dispatch, onGameOver }: GameProps<CodewordsState, CodewordsSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.won || !state.selectedCode) return;
    function onKeyDown(e: KeyboardEvent) {
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key) && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: "guessLetter", letter: key } as CodewordsAction);
      }
      if (e.key === "Escape") {
        dispatch({ type: "clearCode" } as CodewordsAction);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.won, state.selectedCode, dispatch]);

  const { grid, width, playerMap, givenCodes, selectedCode, won, guesses, solution } = state;
  const gridCodes = getGridCodes(grid);
  const usedCodes = Array.from({ length: 26 }, (_, i) => i + 1).filter(c => gridCodes.has(c));

  const gridStyle = { gridTemplateColumns: `repeat(${width}, 56px)` };

  return (
    <div className="cw-wrap">
      <div className="cw-title">Codewords</div>
      <div className="cw-info">Guesses: {guesses} — Each number represents a letter. Decode the grid!</div>

      <div className="cw-grid" style={gridStyle}>
        {grid.flatMap((row, r) =>
          row.map((cell, c) => {
            if (cell === null) {
              return <div key={`${r}-${c}`} className="cw-cell black" />;
            }
            const isGiven = givenCodes.includes(cell);
            const isSelected = !isGiven && selectedCode !== null && cell === selectedCode;
            const letter = playerMap[cell];
            const isCorrect = won && letter === solution[cell];

            return (
              <div
                key={`${r}-${c}`}
                className={`cw-cell${isGiven ? " given" : ""}${isSelected ? " selected" : ""}${isCorrect ? " correct" : ""}`}
                onClick={() => !isGiven && !won && dispatch({ type: "selectCode", code: cell } as CodewordsAction)}
              >
                <span className="cw-cell-letter">{letter ?? ""}</span>
                <span className="cw-cell-code">{cell}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="cw-info">
        Click a code chip or grid cell to select, then type or click a letter.
        {selectedCode ? ` Selected: [${selectedCode}]` : ""}
      </div>

      <div className="cw-code-panel">
        {usedCodes.map(code => {
          const isGiven = givenCodes.includes(code);
          const isSel = selectedCode === code;
          const letter = playerMap[code];
          return (
            <div
              key={code}
              className={`cw-code-chip${isGiven ? " given" : isSel ? " selected" : letter ? " filled" : ""}`}
              onClick={() => !isGiven && !won && dispatch({ type: "selectCode", code } as CodewordsAction)}
            >
              <span>{letter ?? "?"}</span>
              <span className="cw-code-num">{code}</span>
            </div>
          );
        })}
      </div>

      {selectedCode && !won && (
        <div className="cw-alphabet">
          {ALPHABET.map(l => (
            <button
              key={l}
              className="cw-alpha-btn"
              onClick={() => dispatch({ type: "guessLetter", letter: l } as CodewordsAction)}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {won && (
        <div className="cw-win">
          <h2>Solved!</h2>
          <p>Guesses used: {guesses}</p>
          <p>Score: <strong>{Math.max(100, 1000 - guesses * 20)}</strong></p>
        </div>
      )}
    </div>
  );
}
