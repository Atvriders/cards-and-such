import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RushHourState, RushHourAction, RushHourSettings } from "./state.js";
import { isTerminal, canMove } from "./state.js";
import "./RushHour.css";

const CELL = 44; // px per grid cell

export function RushHour({
  state,
  dispatch,
  onGameOver,
}: GameProps<RushHourState, RushHourSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleBlockClick = useCallback(
    (id: string) => {
      if (terminal) return;
      dispatch({ type: "select", id: state.selected === id ? null : id } as RushHourAction);
    },
    [dispatch, state.selected, terminal],
  );

  const handleMove = useCallback(
    (delta: number) => {
      if (terminal || !state.selected) return;
      dispatch({ type: "move", id: state.selected, delta } as RushHourAction);
    },
    [dispatch, state.selected, terminal],
  );

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (!state.selected || terminal) return;
      const block = state.blocks.find((b) => b.id === state.selected);
      if (!block) return;
      if (block.orientation === "h") {
        if (e.key === "ArrowRight") { e.preventDefault(); handleMove(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); handleMove(-1); }
      } else {
        if (e.key === "ArrowDown") { e.preventDefault(); handleMove(1); }
        if (e.key === "ArrowUp") { e.preventDefault(); handleMove(-1); }
      }
    },
    [state.selected, state.blocks, terminal, handleMove],
  );

  const selectedBlock = state.selected ? state.blocks.find((b) => b.id === state.selected) : null;
  const canFwd = selectedBlock ? canMove(state.blocks, selectedBlock.id, 1) : false;
  const canBkw = selectedBlock ? canMove(state.blocks, selectedBlock.id, -1) : false;

  return (
    <div className="rush-hour" tabIndex={0} onKeyDown={handleKey}>
      <div className="rush-hour-info">
        <span>Difficulty: {state.settings.difficulty}</span>
        <span>Moves: {state.moves}</span>
      </div>

      {terminal && (
        <div className="rush-hour-game-over">Escaped! Score: {terminal.score}</div>
      )}

      <div style={{ position: "relative" }}>
        <div className="rush-hour-grid">
          {/* Background grid lines */}
          {Array.from({ length: 36 }, (_, i) => {
            const r = Math.floor(i / 6);
            const c = i % 6;
            return (
              <div
                key={i}
                className="rush-hour-cell"
                style={{ top: r * CELL, left: c * CELL }}
              />
            );
          })}

          {/* Blocks */}
          {state.blocks.map((b) => {
            const isH = b.orientation === "h";
            const w = isH ? b.length * CELL - 4 : CELL - 4;
            const h = isH ? CELL - 4 : b.length * CELL - 4;
            const top = b.row * CELL + 2;
            const left = b.col * CELL + 2;
            const isSelected = state.selected === b.id;

            return (
              <div
                key={b.id}
                className={`rush-hour-block ${b.isPlayer ? "player" : "other"}${isSelected ? " selected" : ""}`}
                style={{ top, left, width: w, height: h }}
                onClick={() => handleBlockClick(b.id)}
                title={b.isPlayer ? "Red car (get to exit →)" : `Block ${b.id}`}
              >
                {b.isPlayer ? "→" : ""}
              </div>
            );
          })}
        </div>
        <div className="rush-hour-exit">→</div>
      </div>

      {state.selected && !terminal && (
        <div className="rush-hour-controls">
          {selectedBlock?.orientation === "h" ? (
            <>
              <button onClick={() => handleMove(-1)} disabled={!canBkw}>← Left</button>
              <button onClick={() => handleMove(1)} disabled={!canFwd}>Right →</button>
            </>
          ) : (
            <>
              <button onClick={() => handleMove(-1)} disabled={!canBkw}>↑ Up</button>
              <button onClick={() => handleMove(1)} disabled={!canFwd}>Down ↓</button>
            </>
          )}
        </div>
      )}

      <div className="rush-hour-move-hint">
        {state.selected
          ? `Selected: ${state.selected === "player" ? "Red Car" : state.selected}. Use arrow keys or buttons.`
          : "Click a block to select it, then move with buttons or arrow keys."}
      </div>
    </div>
  );
}
