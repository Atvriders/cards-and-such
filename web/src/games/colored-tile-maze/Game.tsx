import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ColoredTileMazeState, ColoredTileMazeSettings, Dir, TileColor } from "./state.js";
import "./Game.css";

const TILE_FILL: Record<TileColor, string> = {
  normal: "#1a1a2e",
  red: "#3a0a0a",
  blue: "#0a1a3a",
  yellow: "#2a2a0a",
  wall: "#0a0a0a",
  exit: "#0a3020",
};

const TILE_LABEL: Partial<Record<TileColor, string>> = {
  red: "B",
  blue: "S",
  yellow: "T",
  exit: "E",
};

const TILE_COLOR: Partial<Record<TileColor, string>> = {
  red: "#ff4444",
  blue: "#4488ff",
  yellow: "#ffdd00",
  exit: "#00ff88",
};

export function ColoredTileMazeGame({
  state,
  dispatch,
}: GameProps<ColoredTileMazeState, ColoredTileMazeSettings>): JSX.Element {
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

  const { rows, cols, tiles, playerRow, playerCol, moves, won, lastEffect } = state;
  const CELL = Math.min(36, Math.floor(480 / Math.max(rows, cols)));
  const W = cols * CELL;
  const H = rows * CELL;
  const idx = (r: number, c: number) => r * cols + c;

  return (
    <div className="color-maze-wrap">
      <div className="color-maze-header">
        <span>Moves: {moves}</span>
        {lastEffect && <span className="color-maze-effect">{lastEffect}</span>}
      </div>
      <svg width={W} height={H} className="color-maze-svg">
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const tile = tiles[idx(r, c)]!;
            const label = TILE_LABEL[tile];
            const labelColor = TILE_COLOR[tile];
            return (
              <g key={`cell-${r}-${c}`}>
                <rect x={c * CELL} y={r * CELL} width={CELL} height={CELL}
                  fill={TILE_FILL[tile]} stroke="#080810" strokeWidth={1}
                />
                {label && (
                  <text x={c * CELL + CELL / 2} y={r * CELL + CELL / 2 + 5}
                    textAnchor="middle" fontSize={CELL * 0.45} fill={labelColor} fontWeight="bold">
                    {label}
                  </text>
                )}
              </g>
            );
          }),
        )}

        {/* Player */}
        <circle
          cx={playerCol * CELL + CELL / 2}
          cy={playerRow * CELL + CELL / 2}
          r={CELL / 2 - 3}
          fill="#ffdd00"
        />
      </svg>

      <div className="color-maze-legend">
        <span className="legend-red">B=Bounce</span>
        <span className="legend-blue">S=Slow(×2)</span>
        <span className="legend-yellow">T=Teleport</span>
        <span className="legend-exit">E=Exit</span>
      </div>

      {won && (
        <div className="color-maze-overlay">
          <h2>Exit Reached!</h2>
          <p>Solved in {moves} moves</p>
        </div>
      )}
      <div className="color-maze-hint">Arrow keys or WASD · Beware colored tiles!</div>
    </div>
  );
}
