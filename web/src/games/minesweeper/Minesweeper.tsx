import { useEffect, useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MinesweeperState, MinesweeperAction, MinesweeperSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Minesweeper.css";

const NUM_COLORS = ["", "n1", "n2", "n3", "n4", "n5", "n6", "n7", "n8"] as const;

export function Minesweeper({
  state,
  dispatch,
  onGameOver,
}: GameProps<MinesweeperState, MinesweeperSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [flagMode, setFlagMode] = useState(false);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (terminal) return;
      if (flagMode) {
        dispatch({ type: "flag", row, col } as MinesweeperAction);
      } else {
        dispatch({ type: "reveal", row, col } as MinesweeperAction);
      }
    },
    [dispatch, terminal, flagMode],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      if (terminal) return;
      dispatch({ type: "flag", row, col } as MinesweeperAction);
    },
    [dispatch, terminal],
  );

  const handleChord = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      // Middle-click or double-click as chord
      if (e.button === 1) {
        e.preventDefault();
        if (terminal) return;
        dispatch({ type: "chord", row, col } as MinesweeperAction);
      }
    },
    [dispatch, terminal],
  );

  const minesRemaining = state.mineCount - state.flagsUsed;

  return (
    <div className="minesweeper">
      <div className="minesweeper-topbar">
        <span className="mine-counter">💣 {minesRemaining}</span>
        <span>{state.settings.difficulty}</span>
        <button
          className={`flag-mode-btn${flagMode ? " active" : ""}`}
          onClick={() => setFlagMode((f) => !f)}
          disabled={!!terminal}
          title="Toggle flag mode (for mobile)"
        >
          🚩 Flag mode: {flagMode ? "ON" : "OFF"}
        </button>
      </div>

      {terminal && (
        <div className={`minesweeper-overlay ${state.won ? "win" : "lose"}`}>
          {state.won
            ? `You win! Score: ${terminal.score}`
            : "💥 Boom! You hit a mine."}
        </div>
      )}

      <div
        className="minesweeper-grid"
        style={{
          gridTemplateColumns: `repeat(${state.cols}, 30px)`,
          gridTemplateRows: `repeat(${state.rows}, 30px)`,
        }}
      >
        {Array.from({ length: state.rows * state.cols }, (_, idx) => {
          const row = Math.floor(idx / state.cols);
          const col = idx % state.cols;
          const cellState = state.state[idx]!;
          const adjVal = state.adj ? state.adj[idx] : null;
          const isMine = state.mines ? state.mines[idx] : false;

          let className = "ms-cell";
          let content: React.ReactNode = null;

          if (cellState === "revealed") {
            if (isMine) {
              className += " revealed mine-hit";
              content = "💣";
            } else {
              className += " revealed";
              if (adjVal !== null && adjVal !== undefined && adjVal > 0) {
                className += ` ${NUM_COLORS[adjVal as 1|2|3|4|5|6|7|8] ?? ""}`;
                content = adjVal;
              }
            }
          } else if (cellState === "flagged") {
            className += " flagged";
            content = "🚩";
          }
          // else hidden — no extra class, no content

          return (
            <button
              key={idx}
              data-testid={`hint-target-minesweeper-${idx}`}
              className={className}
              onClick={() => handleCellClick(row, col)}
              onContextMenu={(e) => handleContextMenu(e, row, col)}
              onMouseDown={(e) => handleChord(e, row, col)}
              disabled={!!terminal && cellState !== "revealed"}
              aria-label={`Cell row ${row + 1} col ${col + 1}`}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
