import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PentagoState, PentagoSettings, RotateDir } from "./state.js";
import { type PentagoAction, isTerminal, posToRC, rcToPos } from "./state.js";
import "./Game.css";

const QUAD_OFFSETS = [
  { row: 0, col: 0 },
  { row: 0, col: 3 },
  { row: 3, col: 0 },
  { row: 3, col: 3 },
] as const;

const QUAD_LABELS = ["Top-Left", "Top-Right", "Bottom-Left", "Bottom-Right"];

export function Pentago({
  state,
  dispatch,
  onGameOver,
}: GameProps<PentagoState, PentagoSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;

  function handleCellClick(pos: number) {
    if (!isMyTurn || state.phase !== "place") return;
    if (state.board[pos] !== null) return;
    dispatch({ type: "place", pos } satisfies PentagoAction);
  }

  function handleRotate(quadrant: 0 | 1 | 2 | 3, dir: RotateDir) {
    if (!isMyTurn || state.phase !== "rotate") return;
    dispatch({ type: "rotate", quadrant, dir } satisfies PentagoAction);
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win! (Black)"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins! (White)"; statusClass = "loss"; }
  else if (state.winner === "draw") { statusText = "Draw!"; statusClass = ""; }
  else if (!isMyTurn) statusText = "Bot thinking...";
  else if (state.phase === "place") statusText = "Place your marble on any empty cell.";
  else statusText = "Now rotate a quadrant (↺ or ↻).";

  const { row: lpRow, col: lpCol } = state.lastPlaced !== null
    ? posToRC(state.lastPlaced)
    : { row: -1, col: -1 };

  return (
    <div className="pentago">
      <div className={`pentago-status ${statusClass}`}>{statusText}</div>
      <div className="pentago-container">
        {/* Board split into 4 quadrants visually */}
        <div className="pentago-board">
          {Array.from({ length: 6 }, (_, row) =>
            Array.from({ length: 6 }, (_, col) => {
              const pos = rcToPos(row, col);
              const val = state.board[pos];
              const isLast = row === lpRow && col === lpCol;
              const isEmpty = val === null;
              return (
                <div
                  key={pos}
                  className={`pent-cell ${isLast ? "last-placed" : ""} ${row < 3 ? "top" : "bottom"} ${col < 3 ? "left" : "right"}`}
                  onClick={() => handleCellClick(pos)}
                  data-testid={`pent-${row}-${col}`}
                  role="button"
                >
                  {val !== null ? (
                    <div className={`pent-marble ${val === 0 ? "black" : "white"}`} />
                  ) : isEmpty && isMyTurn && state.phase === "place" ? (
                    <div className="pent-hint" />
                  ) : null}
                </div>
              );
            })
          )}
        </div>
        {/* Rotation controls */}
        {isMyTurn && state.phase === "rotate" && (
          <div className="pentago-rotations">
            <div className="pent-rot-label">Rotate a quadrant:</div>
            {([0, 1, 2, 3] as const).map((q) => (
              <div key={q} className="pent-rot-row">
                <span className="pent-rot-name">{QUAD_LABELS[q]}</span>
                <button className="pent-rot-btn" onClick={() => handleRotate(q, "ccw")}>↺ CCW</button>
                <button className="pent-rot-btn" onClick={() => handleRotate(q, "cw")}>↻ CW</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="pentago-legend">
        <span className="pent-leg black-leg">■ You (Black)</span>
        <span className="pent-leg white-leg">■ Bot (White)</span>
        <span className="pent-leg">Goal: 5 in a row</span>
      </div>
    </div>
  );
}
