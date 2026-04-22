import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SokobanState, SokobanAction, SokobanSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Sokoban.css";

export function Sokoban({
  state,
  dispatch,
  onGameOver,
}: GameProps<SokobanState, SokobanSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const move = useCallback(
    (dr: number, dc: number) => {
      if (terminal) return;
      dispatch({ type: "move", dr, dc } as SokobanAction);
    },
    [dispatch, terminal],
  );

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (terminal) return;
      const map: Record<string, [number, number]> = {
        ArrowUp: [-1, 0], w: [-1, 0], W: [-1, 0],
        ArrowDown: [1, 0], s: [1, 0], S: [1, 0],
        ArrowLeft: [0, -1], a: [0, -1], A: [0, -1],
        ArrowRight: [0, 1], d: [0, 1], D: [0, 1],
      };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); move(dir[0], dir[1]); }
    },
    [move, terminal],
  );

  const { level, playerPos, crates } = state;
  const crateSet = new Set(crates.map(([r, c]) => `${r},${c}`));
  const [pr, pc] = playerPos;

  return (
    <div className="sokoban" tabIndex={0} onKeyDown={handleKey}>
      <div className="sokoban-info">
        <span>Difficulty: {state.settings.difficulty}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Par: {state.parMoves}</span>
        <span>Crates on target: {crates.filter(([r, c]) => level.grid[r]?.[c] === "target").length}/{crates.length}</span>
      </div>

      {terminal && (
        <div className="sokoban-game-over">Level Complete! Score: {terminal.score}</div>
      )}

      <div
        className="sokoban-grid"
        style={{ gridTemplateColumns: `repeat(${level.width}, 40px)` }}
      >
        {Array.from({ length: level.height }, (_, r) =>
          Array.from({ length: level.width }, (_, c) => {
            const cell = level.grid[r]?.[c] ?? "void";
            const isPlayer = r === pr && c === pc;
            const isCrate = crateSet.has(`${r},${c}`);
            const isTarget = cell === "target";

            let className = "sokoban-cell ";
            let content = "";

            if (cell === "wall") {
              className += "wall";
              content = "";
            } else if (cell === "void") {
              className += "void";
            } else if (isPlayer) {
              className += isTarget ? "target" : "floor";
              content = "@";
            } else if (isCrate) {
              className += isTarget ? "crate-on-target" : "crate";
              content = isTarget ? "✓" : "■";
            } else if (isTarget) {
              className += "target";
              content = "·";
            } else {
              className += "floor";
            }

            return (
              <div key={`${r},${c}`} className={className}>
                {content}
              </div>
            );
          })
        )}
      </div>

      <div className="sokoban-controls">
        <div style={{ gridColumn: "2" }}>
          <button onClick={() => move(-1, 0)} disabled={!!terminal}>↑</button>
        </div>
        <button onClick={() => move(0, -1)} disabled={!!terminal}>←</button>
        <button onClick={() => move(1, 0)} disabled={!!terminal}>↓</button>
        <button onClick={() => move(0, 1)} disabled={!!terminal}>→</button>
      </div>

      <div className="sokoban-btn-row">
        <button onClick={() => dispatch({ type: "reset" } as SokobanAction)}>Reset Level</button>
      </div>

      <div style={{ fontSize: "0.8rem", color: "#888" }}>
        Arrow keys or WASD to move
      </div>
    </div>
  );
}
