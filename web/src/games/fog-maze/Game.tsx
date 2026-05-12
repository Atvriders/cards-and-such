import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FogMazeState, FogMazeSettings, Dir } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FogMazeGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<FogMazeState, FogMazeSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) { endedRef.current = true; onGameOver(t.score); }
  }, [state, onGameOver]);
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

  const { rows, cols, hWalls, vWalls, visited, playerRow, playerCol, moves, won } = state;
  const CELL = Math.min(36, Math.floor(500 / Math.max(rows, cols)));
  const W = cols * CELL;
  const H = rows * CELL;
  const idx = (r: number, c: number) => r * cols + c;

  return (
    <div className="fog-maze-wrap">
      <div className="fog-maze-header">
        <span>Moves: {moves}</span>
        <span>Goal: bottom-right</span>
      </div>
      <svg width={W + 2} height={H + 2} className="fog-maze-svg">
        <rect x={0} y={0} width={W + 2} height={H + 2} fill="#050508" />

        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const isVisible = visited[idx(r, c)];
            if (!isVisible) return null;
            const x = c * CELL + 1;
            const y = r * CELL + 1;
            const isGoal = r === rows - 1 && c === cols - 1;
            return (
              <rect key={`cell-${r}-${c}`} x={x} y={y} width={CELL} height={CELL}
                fill={isGoal ? "#1a4a1a" : "#1a1a2a"} />
            );
          }),
        )}

        {/* Horizontal walls (below each cell) */}
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            if (!hWalls[idx(r, c)]) return null;
            const visible = visited[idx(r, c)] || (r + 1 < rows && visited[idx(r + 1, c)]);
            if (!visible) return null;
            return (
              <line key={`h-${r}-${c}`}
                x1={c * CELL + 1} y1={(r + 1) * CELL + 1}
                x2={(c + 1) * CELL + 1} y2={(r + 1) * CELL + 1}
                stroke="#3366aa" strokeWidth={2} />
            );
          }),
        )}

        {/* Vertical walls */}
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            if (!vWalls[idx(r, c)]) return null;
            const visible = visited[idx(r, c)] || (c + 1 < cols && visited[idx(r, c + 1)]);
            if (!visible) return null;
            return (
              <line key={`v-${r}-${c}`}
                x1={(c + 1) * CELL + 1} y1={r * CELL + 1}
                x2={(c + 1) * CELL + 1} y2={(r + 1) * CELL + 1}
                stroke="#3366aa" strokeWidth={2} />
            );
          }),
        )}

        {/* Outer border */}
        <rect x={1} y={1} width={W} height={H} fill="none" stroke="#3366aa" strokeWidth={2} />

        {/* Goal indicator if visible */}
        {visited[idx(rows - 1, cols - 1)] && (
          <text
            x={(cols - 1) * CELL + 1 + CELL / 2}
            y={(rows - 1) * CELL + 1 + CELL / 2 + 5}
            textAnchor="middle"
            fontSize={CELL * 0.5}
            fill="#22cc44"
          >G</text>
        )}

        {/* Player */}
        <circle
          cx={playerCol * CELL + 1 + CELL / 2}
          cy={playerRow * CELL + 1 + CELL / 2}
          r={CELL / 2 - 4}
          fill="#ffdd00"
        />
      </svg>

      {won && (
        <div className="fog-maze-overlay">
          <h2>You Found the Exit!</h2>
          <p>Solved in {moves} moves</p>
        </div>
      )}

      <div className="fog-maze-hint">Arrow keys or WASD · Find the green exit through the fog</div>
    </div>
  );
}
