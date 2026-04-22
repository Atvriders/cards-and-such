import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShisenShoState, ShisenAction } from "./state.js";
import { isTerminal, SHISEN_COLS, SHISEN_ROWS } from "./state.js";
import "./ShisenSho.css";

type Settings = Record<string, never>;

export function ShisenSho({
  state,
  dispatch,
  onGameOver,
}: GameProps<ShisenShoState, Settings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleClick = (cellIdx: number) => {
    if (terminal) return;
    if (state.grid[cellIdx] === null) return;
    dispatch({ type: "select" as const, idx: cellIdx } as ShisenAction);
  };

  const gridStyle = {
    gridTemplateColumns: `repeat(${SHISEN_COLS}, 44px)`,
    gridTemplateRows: `repeat(${SHISEN_ROWS}, 52px)`,
  };

  return (
    <div className="shisen-sho">
      <div className="shisen-info">
        <span>Removed: {state.removed}/{state.total}</span>
        <span>Moves: {state.moves}</span>
      </div>

      {terminal && (
        <div className={`shisen-status ${state.won ? "won" : "lost"}`}>
          {state.won ? `You win! Score: ${terminal.score}` : `No moves left. Score: ${terminal.score}`}
        </div>
      )}

      <div className="shisen-grid" style={gridStyle}>
        {state.grid.map((face, cellIdx) => {
          const isEmpty = face === null;
          const isSelected = state.selectedIdx === cellIdx;
          let cls = "shisen-cell";
          if (isEmpty) cls += " empty";
          else {
            cls += " tile";
            if (isSelected) cls += " selected";
          }

          return (
            <button
              key={cellIdx}
              className={cls}
              onClick={() => handleClick(cellIdx)}
              disabled={isEmpty || !!terminal}
              aria-label={face ?? "empty"}
            >
              {face}
            </button>
          );
        })}
      </div>
    </div>
  );
}
