import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrosswordProState, CrosswordProSettings } from "./state.js";
import type { CrosswordProAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CrosswordPro({
  state,
  dispatch,
  onGameOver,
}: GameProps<CrosswordProState, CrosswordProSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Build cell number map
  const cellNumbers: Record<number, number> = {};
  for (const clue of state.clues) {
    const idx = clue.row * state.size + clue.col;
    if (!cellNumbers[idx]) cellNumbers[idx] = clue.number;
  }

  // Highlight cells for active clue
  const highlightedCells = new Set<number>();
  if (state.selectedClue !== null) {
    const clue = state.clues[state.selectedClue];
    if (clue) {
      for (let i = 0; i < clue.length; i++) {
        const r = clue.direction === "across" ? clue.row : clue.row + i;
        const c = clue.direction === "across" ? clue.col + i : clue.col;
        highlightedCells.add(r * state.size + c);
      }
    }
  }

  const acrossClues = state.clues.filter(c => c.direction === "across");
  const downClues = state.clues.filter(c => c.direction === "down");

  return (
    <div className="crossword-pro">
      <div className={`crossword-pro-status${state.won ? " win" : ""}`}>
        {state.won ? "Puzzle solved — You win!" : `Reveals used: ${state.reveals}`}
      </div>
      <div className="crossword-pro-top">
        <div
          className="crossword-pro-grid"
          style={{ gridTemplateColumns: `repeat(${state.size}, 44px)` }}
        >
          {Array.from({ length: state.size }, (_, row) =>
            Array.from({ length: state.size }, (_, col) => {
              const idx = row * state.size + col;
              const isBlack = state.grid[idx] === "#";
              const num = cellNumbers[idx];
              const isHighlighted = highlightedCells.has(idx);
              const isFocused = focusedIdx === idx;
              return (
                <div
                  key={idx}
                  className={`crossword-pro-cell${isBlack ? " black" : ""}${isHighlighted && !isBlack ? " selected" : ""}`}
                >
                  {num && !isBlack && <span className="crossword-pro-num">{num}</span>}
                  {!isBlack && (
                    <input
                      ref={el => { inputRefs.current[idx] = el; }}
                      maxLength={1}
                      value={state.grid[idx] ?? ""}
                      onFocus={() => setFocusedIdx(idx)}
                      onBlur={() => setFocusedIdx(null)}
                      onChange={e => {
                        const letter = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
                        dispatch({ type: "type", row, col, letter } as CrosswordProAction);
                      }}
                      disabled={state.won}
                      style={{ color: isFocused ? "#000" : "#000" }}
                      aria-label={`Cell ${row + 1},${col + 1}`}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
        <div className="crossword-pro-clues">
          <h4>Across</h4>
          {acrossClues.map((clue, i) => {
            const ci = state.clues.indexOf(clue);
            return (
              <div
                key={i}
                className={`crossword-pro-clue${state.selectedClue === ci ? " active" : ""}`}
                onClick={() => dispatch({ type: "select", clueIndex: ci } as CrosswordProAction)}
              >
                {clue.number}. {clue.clue}
              </div>
            );
          })}
          <h4 style={{ marginTop: 12 }}>Down</h4>
          {downClues.map((clue, i) => {
            const ci = state.clues.indexOf(clue);
            return (
              <div
                key={i}
                className={`crossword-pro-clue${state.selectedClue === ci ? " active" : ""}`}
                onClick={() => dispatch({ type: "select", clueIndex: ci } as CrosswordProAction)}
              >
                {clue.number}. {clue.clue}
              </div>
            );
          })}
        </div>
      </div>
      <div className="crossword-pro-controls">
        <button data-testid="hint-target-crossword-pro-action" onClick={() => dispatch({ type: "reveal" } as CrosswordProAction)} disabled={state.won}>
          Reveal a Letter
        </button>
      </div>
    </div>
  );
}
