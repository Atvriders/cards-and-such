import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GomokuProState, GomokuProSettings, GomokuProAction } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";

export function GomokuPro({
  state,
  dispatch,
  onGameOver,
}: GameProps<GomokuProState, GomokuProSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const CELL = 36;
  const PAD = 20;
  const SVG_W = CELL * (SIZE - 1) + PAD * 2;
  const SVG_H = CELL * (SIZE - 1) + PAD * 2;

  function colToX(c: number): number { return PAD + c * CELL; }
  function rowToY(r: number): number { return PAD + r * CELL; }

  function handleClick(pos: number) {
    if (state.winner !== null || state.turn !== "black") return;
    dispatch({ type: "place", pos } satisfies GomokuProAction);
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === "black") { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === "white") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.turn === "white") { statusText = "Bot thinking..."; }
  else { statusText = "Your turn (Black) — click an intersection."; }

  const winSet = new Set(state.winningLine ?? []);

  return (
    <div className="gomokupro-game">
      <div className={`gomokupro-status ${statusClass}`}>{statusText}</div>
      <div className="gomokupro-info">Pro rules: Black may not place overline, double-four, or double-three</div>
      <svg
        width={SVG_W}
        height={SVG_H}
        className="gomokupro-svg"
        onClick={(e) => {
          // handled via overlay rects
          void e;
        }}
      >
        {/* Grid lines */}
        {Array.from({ length: SIZE }, (_, i) => (
          <g key={i}>
            <line
              x1={colToX(0)} y1={rowToY(i)}
              x2={colToX(SIZE - 1)} y2={rowToY(i)}
              stroke="#888" strokeWidth={0.8}
            />
            <line
              x1={colToX(i)} y1={rowToY(0)}
              x2={colToX(i)} y2={rowToY(SIZE - 1)}
              stroke="#888" strokeWidth={0.8}
            />
          </g>
        ))}
        {/* Star points */}
        {[3, 7, 11].flatMap((r) =>
          [3, 7, 11].map((c) => (
            <circle key={`${r},${c}`} cx={colToX(c)} cy={rowToY(r)} r={3} fill="#555" />
          ))
        )}
        {/* Pieces */}
        {Array.from({ length: SIZE * SIZE }, (_, pos) => {
          const r = Math.floor(pos / SIZE);
          const c = pos % SIZE;
          const cell = state.board[pos];
          const cx = colToX(c);
          const cy = rowToY(r);
          const isWin = winSet.has(pos);

          return (
            <g key={pos}>
              {/* Click target */}
              {state.turn === "black" && state.winner === null && cell === null && (
                <rect
                  x={cx - CELL / 2}
                  y={cy - CELL / 2}
                  width={CELL}
                  height={CELL}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleClick(pos)}
                />
              )}
              {cell && (
                <circle
                  cx={cx} cy={cy} r={CELL / 2 - 2}
                  fill={cell === "black" ? "#1a1a1a" : "#f5f5f5"}
                  stroke={isWin ? "#e74c3c" : (cell === "black" ? "#555" : "#aaa")}
                  strokeWidth={isWin ? 2.5 : 1}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
