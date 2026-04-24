import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Nonogram5x5State, Nonogram5x5Settings, Nonogram5x5Action } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function Nonogram5x5Game({
  state,
  dispatch,
  onGameOver,
}: GameProps<Nonogram5x5State, Nonogram5x5Settings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleFill = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();
      if (terminal) return;
      if (e.shiftKey || e.button === 2) {
        dispatch({ type: "mark", index } as Nonogram5x5Action);
      } else {
        dispatch({ type: "fill", index } as Nonogram5x5Action);
      }
    },
    [dispatch, terminal],
  );

  const handleContextMenu = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();
      if (terminal) return;
      dispatch({ type: "mark", index } as Nonogram5x5Action);
    },
    [dispatch, terminal],
  );

  const { rowClues, colClues, cells } = state;
  const maxColClues = Math.max(...colClues.map((c) => c.length));

  return (
    <div className="nonogram5">
      <div className="nonogram5-info">
        <span>Difficulty: {state.settings.difficulty}</span>
        <span>Moves: {state.movesMade}</span>
      </div>
      <div className={`nonogram5-status${state.won ? " win" : ""}`}>
        {state.won ? "Puzzle solved!" : "Fill cells to match the clues"}
      </div>

      <div
        className="nonogram5-grid"
        style={{
          gridTemplateColumns: `36px repeat(5, 28px)`,
          gridTemplateRows: `repeat(${maxColClues}, 20px) repeat(5, 28px)`,
          display: "grid",
          gap: "1px",
          background: "#999",
        }}
      >
        {Array.from({ length: maxColClues }, (_, ci) => (
          <div key={`corner-${ci}`} style={{ gridColumn: 1, gridRow: ci + 1, background: "#f0f0f0" }} />
        ))}

        {colClues.map((clue, c) =>
          Array.from({ length: maxColClues }, (_, ci) => {
            const val = clue[clue.length - (maxColClues - ci)];
            return (
              <div
                key={`col-${c}-${ci}`}
                className="nonogram5-clue-cell"
                style={{ gridColumn: c + 2, gridRow: ci + 1 }}
              >
                {val !== undefined ? val : ""}
              </div>
            );
          }),
        )}

        {Array.from({ length: 5 }, (_, r) => (
          <>
            <div
              key={`row-clue-${r}`}
              className="nonogram5-row-clue"
              style={{ gridColumn: 1, gridRow: maxColClues + r + 1 }}
            >
              {rowClues[r]!.join(" ")}
            </div>
            {Array.from({ length: 5 }, (_, c) => {
              const idx = r * 5 + c;
              const cell = cells[idx]!;
              let cls = "nonogram5-cell";
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
                >
                  {cell === 2 && !state.won ? "×" : ""}
                </div>
              );
            })}
          </>
        ))}
      </div>

      <p className="nonogram5-hint">Left-click fill · Shift/right-click mark empty</p>
    </div>
  );
}
