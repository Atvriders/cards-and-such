import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NonogramState, NonogramSettings, NonogramAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Nonogram.css";

export function Nonogram({
  state,
  dispatch,
  onGameOver,
}: GameProps<NonogramState, NonogramSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleFill = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();
      if (terminal) return;
      if (e.shiftKey || e.button === 2) {
        dispatch({ type: "mark", index } as NonogramAction);
      } else {
        dispatch({ type: "fill", index } as NonogramAction);
      }
    },
    [dispatch, terminal],
  );

  const handleContextMenu = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();
      if (terminal) return;
      dispatch({ type: "mark", index } as NonogramAction);
    },
    [dispatch, terminal],
  );

  const { size, rowClues, colClues, cells } = state;

  // Build grid layout: top-left corner + col-clues row + data rows
  const maxColClues = Math.max(...colClues.map((c) => c.length));

  return (
    <div className="nonogram">
      <div className="nonogram-info">
        <span>Size: {size}×{size}</span>
        <span>Moves: {state.movesMade}</span>
      </div>
      <div className={`nonogram-status${state.won ? " win" : ""}`}>
        {state.won ? "Puzzle solved! Great job!" : "Fill cells to match the clues"}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `auto repeat(${size}, 24px)`,
          gridTemplateRows: `repeat(${maxColClues}, 14px) repeat(${size}, 24px)`,
        }}
      >
        {/* Top-left corner placeholder */}
        {Array.from({ length: maxColClues }, (_, ci) => (
          <div key={`corner-${ci}`} style={{ gridColumn: 1, gridRow: ci + 1 }} />
        ))}

        {/* Column clues */}
        {colClues.map((clue, c) =>
          Array.from({ length: maxColClues }, (_, ci) => {
            const val = clue[clue.length - (maxColClues - ci)];
            return (
              <div
                key={`col-${c}-${ci}`}
                className="nonogram-clue-cell"
                style={{ gridColumn: c + 2, gridRow: ci + 1 }}
              >
                {val !== undefined ? val : ""}
              </div>
            );
          }),
        )}

        {/* Row clues + cells */}
        {Array.from({ length: size }, (_, r) => (
          <>
            <div
              key={`row-clue-${r}`}
              className="nonogram-row-clue"
              style={{ gridColumn: 1, gridRow: maxColClues + r + 1 }}
            >
              {rowClues[r]!.join(" ")}
            </div>
            {Array.from({ length: size }, (_, c) => {
              const idx = r * size + c;
              const cell = cells[idx]!;
              let cls = "nonogram-cell";
              if (state.won && state.solution[idx]) cls += " won-filled";
              else if (cell === 1) cls += " filled";
              else if (cell === 2) cls += " marked";
              return (
                <div
                  key={`cell-${r}-${c}`}
                  className={cls}
                  style={{ gridColumn: c + 2, gridRow: maxColClues + r + 1 }}
                  onClick={(e) => handleFill(idx, e)}
                  onContextMenu={(e) => handleContextMenu(idx, e)}
                  aria-label={`Row ${r + 1} Col ${c + 1}`}
                >
                  {cell === 2 && !state.won ? "×" : ""}
                </div>
              );
            })}
          </>
        ))}
      </div>

      <p className="nonogram-hint">Left-click to fill · Shift-click or right-click to mark empty (×)</p>
    </div>
  );
}
