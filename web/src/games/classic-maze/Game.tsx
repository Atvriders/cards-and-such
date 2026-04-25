import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ClassicMazeState, ClassicMazeSettings, Dir } from "./state.js";
import "./Game.css";

export function ClassicMazeGame({
  state,
  dispatch,
}: GameProps<ClassicMazeState, ClassicMazeSettings>): JSX.Element {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, Dir> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", s: "down", a: "left", d: "right",
        W: "up", S: "down", A: "left", D: "right",
      };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); dispatch({ type: "move", dir }); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const { rows, cols, hWalls, vWalls, playerRow, playerCol, moves, won } = state;
  const CELL = Math.min(36, Math.floor(480 / Math.max(rows, cols)));
  const W = cols * CELL;
  const H = rows * CELL;
  const idx = (r: number, c: number) => r * cols + c;

  return (
    <div className="classic-maze-wrap">
      <div className="classic-maze-header">
        <span>Moves: {moves}</span>
        <span>Goal: bottom-right</span>
      </div>
      <svg width={W + 2} height={H + 2} className="classic-maze-svg">
        {/* Floor */}
        <rect x={0} y={0} width={W + 2} height={H + 2} fill="#111" />

        {/* Horizontal walls (below each cell) */}
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            if (!hWalls[idx(r, c)]) return null;
            const x = c * CELL + 1;
            const y = (r + 1) * CELL + 1;
            return <line key={`h-${r}-${c}`} x1={x} y1={y} x2={x + CELL} y2={y} stroke="#4488cc" strokeWidth={2} />;
          }),
        )}

        {/* Vertical walls (right of each cell) */}
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            if (!vWalls[idx(r, c)]) return null;
            const x = (c + 1) * CELL + 1;
            const y = r * CELL + 1;
            return <line key={`v-${r}-${c}`} x1={x} y1={y} x2={x} y2={y + CELL} stroke="#4488cc" strokeWidth={2} />;
          }),
        )}

        {/* Outer border */}
        <rect x={1} y={1} width={W} height={H} fill="none" stroke="#4488cc" strokeWidth={2} />

        {/* Goal */}
        <rect
          x={(cols - 1) * CELL + 1 + 3}
          y={(rows - 1) * CELL + 1 + 3}
          width={CELL - 6}
          height={CELL - 6}
          fill="#22cc44"
          rx={3}
        />
        <text
          x={(cols - 1) * CELL + 1 + CELL / 2}
          y={(rows - 1) * CELL + 1 + CELL / 2 + 4}
          textAnchor="middle"
          fontSize={CELL * 0.45}
          fill="#000"
        >G</text>

        {/* Player */}
        <circle
          cx={playerCol * CELL + 1 + CELL / 2}
          cy={playerRow * CELL + 1 + CELL / 2}
          r={CELL / 2 - 4}
          fill="#ffdd00"
        />
      </svg>

      {won && (
        <div className="classic-maze-overlay">
          <h2>You Made It!</h2>
          <p>Solved in {moves} moves</p>
        </div>
      )}

      <div className="classic-maze-hint">Arrow keys or WASD · Reach the green G</div>
    </div>
  );
}
