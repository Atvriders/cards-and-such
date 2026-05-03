import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PaintState, PaintAction } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";

const COLOR_ICONS = ["", "R", "B", "G", "Y"];
const COLOR_LABELS = ["", "Red", "Blue", "Green", "Yellow"];
const DOT_COLORS = ["", "#ef5350", "#42a5f5", "#66bb6a", "#ffca28"];

export function PaintingPuzzle({
  state,
  dispatch,
  onGameOver,
}: GameProps<PaintState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: PaintAction) => dispatch(a);

  return (
    <div className="paint-wrap">
      <div className="paint-header">
        <span className="paint-title">Painting Puzzle</span>
        <span className="paint-info">Moves: {state.moves} | #{state.puzzleIndex + 1}</span>
      </div>

      <div className="paint-grid">
        {Array.from({ length: SIZE }, (_, r) =>
          Array.from({ length: SIZE }, (_, c) => {
            const color = state.grid[r]![c]!;
            const locked = state.locked[r]![c];
            return (
              <div
                key={`${r}-${c}`}
                className={`paint-cell c${color}${locked ? " locked" : ""}`}
                onClick={() => d({ type: "cycleColor", row: r, col: c })}
              >
                {color > 0 ? COLOR_ICONS[color] : ""}
              </div>
            );
          })
        )}
      </div>

      <div className="paint-legend">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="paint-legend-item">
            <div className="paint-legend-dot" style={{ background: DOT_COLORS[i] }} />
            <span>{COLOR_LABELS[i]}</span>
          </div>
        ))}
      </div>

      <div className="paint-hint">Each row and column must have exactly one of each color.</div>

      <div className="paint-controls">
        <button data-testid="hint-target-painting-puzzle-action" className="paint-btn" onClick={() => d({ type: "reset" })}>New Puzzle</button>
      </div>

      {state.phase === "won" && (
        <div className="paint-status">
          Solved! Score: {terminal?.score ?? 0}
        </div>
      )}
    </div>
  );
}
