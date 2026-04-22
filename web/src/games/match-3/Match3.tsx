import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Match3State, Match3Action, Match3Settings } from "./state.js";
import { isTerminal, COLS, ROWS } from "./state.js";
import "./Match3.css";

const GEM_COLORS = [
  "#e74c3c", // red
  "#3498db", // blue
  "#2ecc71", // green
  "#f39c12", // orange
  "#9b59b6", // purple
  "#1abc9c", // teal
  "#e91e63", // pink
];

export function Match3({
  state,
  dispatch,
}: GameProps<Match3State, Match3Settings>): JSX.Element {
  const terminal = isTerminal(state);

  function handleCell(row: number, col: number) {
    if (state.over) return;
    dispatch({ type: "select", row, col } as Match3Action);
  }

  const selectedKey = state.selected ? `${state.selected[0]},${state.selected[1]}` : null;

  return (
    <div className="match3-game">
      <div className="match3-header">
        <span>Score: {state.score}</span>
        <span>Moves: {state.movesLeft}</span>
      </div>

      <div className="match3-board-wrapper">
        <div
          className="match3-board"
          style={{ gridTemplateColumns: `repeat(${COLS}, 44px)`, gridTemplateRows: `repeat(${ROWS}, 44px)` }}
        >
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const color = state.grid[r]![c] ?? null;
              const key = `${r},${c}`;
              const isSelected = selectedKey === key;
              let cls = "match3-cell";
              if (isSelected) cls += " match3-cell--selected";
              if (color === null) cls += " match3-cell--empty";
              return (
                <div
                  key={key}
                  className={cls}
                  style={{ background: color !== null ? (GEM_COLORS[color % GEM_COLORS.length] ?? "#888") : undefined }}
                  onClick={() => handleCell(r, c)}
                />
              );
            })
          )}
        </div>

        {terminal && (
          <div className="match3-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
            <p>Moves used: {parseInt(state.settings.moves, 10)}</p>
          </div>
        )}
      </div>

      <div className="match3-hint">
        Click a gem, then click an adjacent gem to swap. Make matches of 3+!
      </div>
    </div>
  );
}
