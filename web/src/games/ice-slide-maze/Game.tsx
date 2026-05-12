import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IceSlideMazeState, IceSlideMazeSettings, Dir } from "./state.js";
import { slide, isTerminal } from "./state.js";
import "./Game.css";

export function IceSlideMazeGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<IceSlideMazeState, IceSlideMazeSettings>): JSX.Element {
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

  const { rows, cols, walls, playerRow, playerCol, exitRow, exitCol, moves, won } = state;
  const CELL = Math.min(36, Math.floor(480 / Math.max(rows, cols)));
  const W = cols * CELL;
  const H = rows * CELL;
  const idx = (r: number, c: number) => r * cols + c;

  // Preview where player will slide
  const previewDirs: Dir[] = ["up", "down", "left", "right"];
  const previews = previewDirs.map((d) => slide(state, d));

  return (
    <div className="ice-maze-wrap">
      <div className="ice-maze-header">
        <span>Slides: {moves}</span>
        <span>Goal: blue diamond</span>
      </div>
      <svg width={W} height={H} className="ice-maze-svg">
        {/* Background */}
        <rect x={0} y={0} width={W} height={H} fill="#0d1a2a" />

        {/* Cells */}
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const isWall = walls[idx(r, c)];
            const isExit = r === exitRow && c === exitCol;
            const isPreview = !isWall && previews.some((p) => p.row === r && p.col === c && !(r === playerRow && c === playerCol));
            return (
              <rect key={`cell-${r}-${c}`}
                x={c * CELL} y={r * CELL}
                width={CELL} height={CELL}
                fill={isWall ? "#1a3060" : isExit ? "#0a2a1a" : isPreview ? "#0d2030" : "#a8d8f0"}
                stroke={isWall ? "#0d1a2a" : "none"}
              />
            );
          }),
        )}

        {/* Exit */}
        <polygon
          points={`${exitCol * CELL + CELL / 2},${exitRow * CELL + 4} ${exitCol * CELL + CELL - 4},${exitRow * CELL + CELL / 2} ${exitCol * CELL + CELL / 2},${exitRow * CELL + CELL - 4} ${exitCol * CELL + 4},${exitRow * CELL + CELL / 2}`}
          fill="#00ccff"
        />

        {/* Slide preview dots */}
        {previews.map((p, i) => {
          if (p.row === playerRow && p.col === playerCol) return null;
          if (walls[idx(p.row, p.col)]) return null;
          return (
            <circle key={`prev-${i}`}
              cx={p.col * CELL + CELL / 2} cy={p.row * CELL + CELL / 2}
              r={4} fill="rgba(255,255,255,0.4)"
            />
          );
        })}

        {/* Player */}
        <circle
          cx={playerCol * CELL + CELL / 2}
          cy={playerRow * CELL + CELL / 2}
          r={CELL / 2 - 4}
          fill="#ffdd00"
        />
      </svg>

      {won && (
        <div className="ice-maze-overlay">
          <h2>Slid to Victory!</h2>
          <p>Completed in {moves} slides</p>
        </div>
      )}

      <div className="ice-maze-hint">Arrow keys or WASD · Slide until hitting a wall · Reach the blue diamond</div>
    </div>
  );
}
