import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GravityMazeState, GravityMazeSettings } from "./state.js";
import "./Game.css";

const GRAVITY_ARROWS: Record<string, string> = {
  down: "↓", up: "↑", left: "←", right: "→",
};

export function GravityMazeGame({
  state,
  dispatch,
}: GameProps<GravityMazeState, GravityMazeSettings>): JSX.Element {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault(); dispatch({ type: "rotate-ccw" });
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault(); dispatch({ type: "rotate-cw" });
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S"
        || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault(); dispatch({ type: "fall" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const { rows, cols, walls, playerRow, playerCol, exitRow, exitCol, gravity, moves, won } = state;
  const CELL = Math.min(52, Math.floor(400 / Math.max(rows, cols)));
  const W = cols * CELL;
  const H = rows * CELL;
  const idx = (r: number, c: number) => r * cols + c;

  return (
    <div className="gravity-maze-wrap">
      <div className="gravity-maze-header">
        <span>Gravity: <strong>{GRAVITY_ARROWS[gravity]} {gravity}</strong></span>
        <span>Rotations: {moves}</span>
      </div>
      <svg width={W} height={H} className="gravity-maze-svg">
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const isWall = walls[idx(r, c)];
            const isExit = r === exitRow && c === exitCol;
            return (
              <rect key={`cell-${r}-${c}`}
                x={c * CELL} y={r * CELL}
                width={CELL} height={CELL}
                fill={isWall ? "#1a2a40" : isExit ? "#0d3020" : "#151525"}
                stroke={isWall ? "#0a1520" : "#1e1e2e"}
                strokeWidth={1}
              />
            );
          }),
        )}

        {/* Exit marker */}
        <text x={exitCol * CELL + CELL / 2} y={exitRow * CELL + CELL / 2 + 6}
          textAnchor="middle" fontSize={CELL * 0.55} fill="#00ff88">E</text>

        {/* Player */}
        <circle
          cx={playerCol * CELL + CELL / 2}
          cy={playerRow * CELL + CELL / 2}
          r={CELL / 2 - 4}
          fill="#ffdd00"
        />

        {/* Gravity arrow overlay */}
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={18} fill="rgba(255,255,255,0.2)">
          {GRAVITY_ARROWS[gravity]}
        </text>
      </svg>

      <div className="gravity-maze-controls">
        <button onClick={() => dispatch({ type: "rotate-ccw" })}>↺ Rotate CCW (A/←)</button>
        <button onClick={() => dispatch({ type: "fall" })}>Fall (W/S/↑↓)</button>
        <button onClick={() => dispatch({ type: "rotate-cw" })}>↻ Rotate CW (D/→)</button>
      </div>

      {won && (
        <div className="gravity-maze-overlay">
          <h2>Gravity Mastered!</h2>
          <p>Solved in {moves} rotations</p>
        </div>
      )}
      <div className="gravity-maze-hint">Rotate gravity left/right · Ball falls automatically · Reach E</div>
    </div>
  );
}
