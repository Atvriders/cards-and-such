import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Drop7State, Drop7Action, Drop7Settings } from "./state.js";
import { isTerminal, COLS, ROWS } from "./state.js";
import "./Drop7.css";

const DISC_COLORS = [
  "#e74c3c", "#e67e22", "#f1c40f", "#2ecc71",
  "#3498db", "#9b59b6", "#1abc9c",
];

function discColor(value: number): string {
  return DISC_COLORS[(value - 1) % DISC_COLORS.length] ?? "#888";
}

export function Drop7({
  state,
  dispatch,
}: GameProps<Drop7State, Drop7Settings>): JSX.Element {
  const terminal = isTerminal(state);

  function handleColClick(col: number) {
    if (state.over) return;
    dispatch({ type: "drop", col } as Drop7Action);
  }

  return (
    <div className="drop7-game">
      <div className="drop7-header">
        <span>Score: {state.score}</span>
        <span>Level: {state.level}</span>
      </div>

      <div className="drop7-next-area">
        <span>Next:</span>
        <div className="drop7-next-disc" style={{ background: discColor(state.next) }}>
          {state.next}
        </div>
      </div>

      <div className="drop7-board-wrapper">
        <div
          className="drop7-board"
          style={{ gridTemplateColumns: `repeat(${COLS}, 52px)` }}
        >
          {Array.from({ length: COLS }, (_, c) => (
            <div key={c} className="drop7-col" onClick={() => handleColClick(c)}>
              {Array.from({ length: ROWS }, (_, r) => {
                const cell = state.grid[r]![c];
                let cls = "drop7-cell";
                let bg: string | undefined;
                let label: string | number = "";
                if (cell === null) {
                  cls += " drop7-cell--empty";
                } else if (cell === "blank") {
                  cls += " drop7-cell--blank";
                } else if (typeof cell === "object" && cell !== null) {
                  bg = discColor(cell.value);
                  label = cell.value;
                }
                return (
                  <div key={r} className={cls} style={{ background: bg }}>
                    {label}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {terminal && (
          <div className="drop7-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
            <p>Level reached: {state.level}</p>
          </div>
        )}
      </div>

      <div className="drop7-hint">
        Click a column to drop the disc. A disc clears when its value equals discs in its row or column.
      </div>
    </div>
  );
}
