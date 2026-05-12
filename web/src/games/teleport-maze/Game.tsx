import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TeleportMazeState, TeleportMazeSettings, Dir } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PAD_COLORS = ["#ff44ff", "#ff8844", "#44ffff", "#ffff44", "#44ff88", "#ff4444", "#4488ff", "#ff88cc"];

export function TeleportMazeGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<TeleportMazeState, TeleportMazeSettings>): JSX.Element {
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

  const { rows, cols, hWalls, vWalls, pads, playerRow, playerCol, moves, won } = state;
  const CELL = Math.min(40, Math.floor(480 / Math.max(rows, cols)));
  const W = cols * CELL;
  const H = rows * CELL;
  const idx = (r: number, c: number) => r * cols + c;

  return (
    <div className="teleport-maze-wrap">
      <div className="teleport-maze-header">
        <span>Moves: {moves}</span>
        <span>Step on matching pads to teleport</span>
      </div>
      <svg width={W + 2} height={H + 2} className="teleport-maze-svg">
        <rect x={0} y={0} width={W + 2} height={H + 2} fill="#0a0a14" />
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => (
            <rect key={`bg-${r}-${c}`}
              x={c * CELL + 1} y={r * CELL + 1}
              width={CELL} height={CELL} fill="#12121e"
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
              stroke="#6644aa" strokeWidth={2} />;
          }),
        )}
        {/* V-walls */}
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            if (!vWalls[idx(r, c)]) return null;
            return <line key={`v-${r}-${c}`}
              x1={(c + 1) * CELL + 1} y1={r * CELL + 1}
              x2={(c + 1) * CELL + 1} y2={(r + 1) * CELL + 1}
              stroke="#6644aa" strokeWidth={2} />;
          }),
        )}
        <rect x={1} y={1} width={W} height={H} fill="none" stroke="#6644aa" strokeWidth={2} />

        {/* Teleport pads */}
        {pads.map((pad) => {
          const pairIdx = Math.floor(Math.min(pad.id, pad.partnerId) / 2);
          const color = PAD_COLORS[pairIdx % PAD_COLORS.length] ?? "#ff44ff";
          return (
            <g key={`pad-${pad.id}`}>
              <rect
                x={pad.col * CELL + 1 + 3} y={pad.row * CELL + 1 + 3}
                width={CELL - 6} height={CELL - 6}
                fill={color} rx={4} opacity={0.7}
              />
              <text x={pad.col * CELL + 1 + CELL / 2} y={pad.row * CELL + 1 + CELL / 2 + 5}
                textAnchor="middle" fontSize={CELL * 0.4} fill="#000" fontWeight="bold">
                {pairIdx + 1}
              </text>
            </g>
          );
        })}

        {/* Goal */}
        <rect
          x={(cols - 1) * CELL + 1 + 3} y={(rows - 1) * CELL + 1 + 3}
          width={CELL - 6} height={CELL - 6}
          fill="#22cc44" rx={3}
        />
        <text x={(cols - 1) * CELL + 1 + CELL / 2} y={(rows - 1) * CELL + 1 + CELL / 2 + 5}
          textAnchor="middle" fontSize={CELL * 0.45} fill="#000">G</text>

        {/* Player */}
        <circle
          cx={playerCol * CELL + 1 + CELL / 2}
          cy={playerRow * CELL + 1 + CELL / 2}
          r={CELL / 2 - 4}
          fill="#ffdd00"
        />
      </svg>

      {won && (
        <div className="teleport-maze-overlay">
          <h2>Teleported to Victory!</h2>
          <p>Solved in {moves} moves</p>
        </div>
      )}
      <div className="teleport-maze-hint">Arrow keys or WASD · Matching numbered pads teleport you · Reach G</div>
    </div>
  );
}
