import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KeyMazeState, KeyMazeSettings, Dir } from "./state.js";
import { collectedCount, isTerminal } from "./state.js";
import "./Game.css";

export function KeyMazeGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<KeyMazeState, KeyMazeSettings>): JSX.Element {
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

  const { rows, cols, hWalls, vWalls, playerRow, playerCol, keys, exit, moves, won } = state;
  const collected = collectedCount(state);
  const allKeys = collected >= state.keysNeeded;
  const CELL = Math.min(40, Math.floor(480 / Math.max(rows, cols)));
  const W = cols * CELL;
  const H = rows * CELL;
  const idx = (r: number, c: number) => r * cols + c;

  return (
    <div className="key-maze-wrap">
      <div className="key-maze-header">
        <span>Keys: {collected}/{state.keysNeeded}</span>
        <span>Moves: {moves}</span>
        {allKeys && <span className="key-maze-ready">Exit ready!</span>}
      </div>
      <svg width={W + 2} height={H + 2} className="key-maze-svg">
        <rect x={0} y={0} width={W + 2} height={H + 2} fill="#0a0a14" />

        {/* Cell backgrounds */}
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => (
            <rect key={`bg-${r}-${c}`}
              x={c * CELL + 1} y={r * CELL + 1}
              width={CELL} height={CELL}
              fill="#12121e"
            />
          )),
        )}

        {/* H-walls */}
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            if (!hWalls[idx(r, c)]) return null;
            return <line key={`h-${r}-${c}`}
              x1={c * CELL + 1} y1={(r + 1) * CELL + 1}
              x2={(c + 1) * CELL + 1} y2={(r + 1) * CELL + 1}
              stroke="#5566dd" strokeWidth={2} />;
          }),
        )}

        {/* V-walls */}
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            if (!vWalls[idx(r, c)]) return null;
            return <line key={`v-${r}-${c}`}
              x1={(c + 1) * CELL + 1} y1={r * CELL + 1}
              x2={(c + 1) * CELL + 1} y2={(r + 1) * CELL + 1}
              stroke="#5566dd" strokeWidth={2} />;
          }),
        )}

        <rect x={1} y={1} width={W} height={H} fill="none" stroke="#5566dd" strokeWidth={2} />

        {/* Keys */}
        {keys.filter((k) => !k.collected).map((k) => (
          <g key={`key-${k.id}`}>
            <circle cx={k.col * CELL + 1 + CELL / 2} cy={k.row * CELL + 1 + CELL / 2}
              r={CELL / 2 - 5} fill="#ffcc00" />
            <text x={k.col * CELL + 1 + CELL / 2} y={k.row * CELL + 1 + CELL / 2 + 5}
              textAnchor="middle" fontSize={CELL * 0.45} fill="#000">K</text>
          </g>
        ))}

        {/* Exit */}
        <rect
          x={exit.col * CELL + 1 + 3} y={exit.row * CELL + 1 + 3}
          width={CELL - 6} height={CELL - 6}
          fill={allKeys ? "#22cc44" : "#cc4444"} rx={3}
        />
        <text x={exit.col * CELL + 1 + CELL / 2} y={exit.row * CELL + 1 + CELL / 2 + 5}
          textAnchor="middle" fontSize={CELL * 0.45} fill="#fff">
          {allKeys ? "E" : "X"}
        </text>

        {/* Player */}
        <circle
          cx={playerCol * CELL + 1 + CELL / 2}
          cy={playerRow * CELL + 1 + CELL / 2}
          r={CELL / 2 - 4}
          fill="#ffdd00"
        />
      </svg>

      {won && (
        <div className="key-maze-overlay">
          <h2>Escaped!</h2>
          <p>All keys collected. Solved in {moves} moves.</p>
        </div>
      )}

      <div className="key-maze-hint">Arrow keys or WASD · Collect all K keys · Then reach the exit</div>
    </div>
  );
}
