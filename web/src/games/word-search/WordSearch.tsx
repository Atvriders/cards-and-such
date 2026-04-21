import { useEffect, useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WordSearchState, WordSearchSettings, WordSearchAction } from "./state.js";
import { isTerminal, getLineCells } from "./state.js";
import "./WordSearch.css";

export function WordSearch({
  state,
  dispatch,
  onGameOver,
}: GameProps<WordSearchState, WordSearchSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);

  // Compute set of "found" cells for highlighting
  const foundCells = new Set<number>();
  for (const pw of state.placedWords) {
    if (!pw.found) continue;
    for (let i = 0; i < pw.word.length; i++) {
      foundCells.add((pw.row + pw.dr * i) * state.size + (pw.col + pw.dc * i));
    }
  }

  // Compute selecting cells
  const selectingCells = new Set<number>();
  if (state.selecting && hover) {
    const line = getLineCells(state.selecting.startRow, state.selecting.startCol, hover.row, hover.col);
    if (line) {
      for (let i = 0; i < line.length; i++) {
        const r = line.row + line.dr * i;
        const c = line.col + line.dc * i;
        if (r >= 0 && r < state.size && c >= 0 && c < state.size) {
          selectingCells.add(r * state.size + c);
        }
      }
    }
  }

  const handleMouseDown = useCallback(
    (row: number, col: number) => {
      if (terminal) return;
      dispatch({ type: "startSelect", row, col } as WordSearchAction);
    },
    [dispatch, terminal],
  );

  const handleMouseUp = useCallback(
    (row: number, col: number) => {
      if (terminal) return;
      if (state.selecting) {
        dispatch({ type: "endSelect", row, col } as WordSearchAction);
      }
    },
    [dispatch, terminal, state.selecting],
  );

  return (
    <div className="word-search">
      <div className="word-search-info">
        <span>Grid: {state.size}×{state.size}</span>
        <span>Words found: {state.placedWords.filter((w) => w.found).length}/{state.placedWords.length}</span>
        <span>Attempts: {state.movesMade}</span>
      </div>
      <div className={`word-search-status${state.won ? " win" : ""}`}>
        {state.won ? "All words found! You win!" : "Find all hidden words"}
      </div>

      <div className="word-search-layout">
        <div
          className="word-search-grid"
          style={{ gridTemplateColumns: `repeat(${state.size}, 28px)` }}
          onMouseLeave={() => { setHover(null); if (state.selecting) dispatch({ type: "cancelSelect" } as WordSearchAction); }}
        >
          {Array.from({ length: state.size }, (_, r) =>
            Array.from({ length: state.size }, (_, c) => {
              const idx = r * state.size + c;
              const letter = state.grid[idx]!;
              let cls = "word-search-cell";
              if (foundCells.has(idx)) cls += " found";
              else if (selectingCells.has(idx)) cls += " selecting";
              return (
                <div
                  key={`${r}-${c}`}
                  className={cls}
                  onMouseDown={() => handleMouseDown(r, c)}
                  onMouseUp={() => handleMouseUp(r, c)}
                  onMouseEnter={() => setHover({ row: r, col: c })}
                  aria-label={`${letter} row ${r + 1} col ${c + 1}`}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>

        <div className="word-search-words">
          {state.placedWords.map((pw) => (
            <div key={pw.word} className={`word-search-word${pw.found ? " found" : ""}`}>
              {pw.word}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
