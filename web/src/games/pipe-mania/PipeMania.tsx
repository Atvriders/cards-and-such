import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PipeManiaState, PipeManiaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./PipeMania.css";

const PIPE_GLYPHS: Record<string, string> = {
  NS: "┃", EW: "━", NE: "┗", NW: "┛", SE: "┏", SW: "┓",
  NESW: "╋", source: "⬤",
};

export function PipeMania({ state, dispatch, onGameOver }: GameProps<PipeManiaState, PipeManiaSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);
  const terminal = isTerminal(state);
  const rows = state.grid.length;
  const cols = state.grid[0]!.length;

  // Tick flood every 800ms
  useEffect(() => {
    if (state.over) return;
    const id = setInterval(() => dispatch({ type: "tick" }), 800);
    return () => clearInterval(id);
  }, [state.over, dispatch]);

  return (
    <div className="pipemania-game">
      <div className="pipemania-header">
        <span>Score: {state.score}</span>
        <span>Pipe the water as far as possible!</span>
      </div>

      <div className="pipemania-layout">
        <div
          className="pipemania-board"
          style={{ gridTemplateColumns: `repeat(${cols}, 52px)` }}
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const cell = state.grid[r]![c]!;
              const isSource = cell.type === "source";
              const isFlooded = cell.flooded;
              return (
                <div data-testid="hint-target-pipe-mania-action"
                  key={`${r},${c}`}
                  className={`pipemania-cell${isFlooded ? " pipemania-cell--flooded" : ""}${isSource ? " pipemania-cell--source" : ""}`}
                  onClick={() => !isSource && dispatch({ type: "place", row: r, col: c })}
                  style={{ color: isFlooded ? "#4fc3f7" : isSource ? "#ffb300" : "#aaa" }}
                >
                  {cell.type ? PIPE_GLYPHS[cell.type] ?? "?" : ""}
                </div>
              );
            })
          )}
        </div>

        <div className="pipemania-queue">
          <div className="pipemania-queue-label">Queue</div>
          {state.queue.map((pipe, i) => (
            <div key={i} className="pipemania-queue-item" style={{ color: "#aaa" }}>
              {PIPE_GLYPHS[pipe] ?? "?"}
            </div>
          ))}
        </div>
      </div>

      {terminal && (
        <div className="pipemania-overlay">
          <h2>Water Stopped!</h2>
          <p>Pipe segments flooded: {terminal.score}</p>
        </div>
      )}
    </div>
  );
}
