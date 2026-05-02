import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SnakeState, SnakeAction, Dir, SnakeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Snake.css";

const SPEED_MS: Record<string, number> = {
  slow: 200,
  medium: 120,
  fast: 70,
};

const CELL_SIZE = 24; // px per cell

export function Snake({
  state,
  dispatch,
}: GameProps<SnakeState, SnakeSettings>): JSX.Element {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const tick = useCallback(() => {
    dispatch({ type: "tick" } as SnakeAction);
  }, [dispatch]);

  // Start/stop interval when alive/paused changes
  useEffect(() => {
    const ms = SPEED_MS[state.settings.speed] ?? 120;

    function startInterval() {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, ms);
    }

    if (state.alive && !state.paused) {
      startInterval();
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.alive, state.paused, state.settings.speed, tick]);

  // Keyboard handler
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const s = stateRef.current;
      const dirMap: Record<string, Dir> = {
        ArrowUp: "up",
        w: "up",
        W: "up",
        ArrowDown: "down",
        s: "down",
        S: "down",
        ArrowLeft: "left",
        a: "left",
        A: "left",
        ArrowRight: "right",
        d: "right",
        D: "right",
      };

      const dir = dirMap[e.key];
      if (dir) {
        e.preventDefault();
        dispatch({ type: "turn", direction: dir } as SnakeAction);
        return;
      }

      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (!s.alive) return;
        dispatch({ type: s.paused ? "resume" : "pause" } as SnakeAction);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  const terminal = isTerminal(state);
  const { gridSize, snake, food } = state;

  // Build a set of snake positions for O(1) lookup
  const headKey = `${snake[0]!.row},${snake[0]!.col}`;
  const snakeSet = new Set(snake.map((c) => `${c.row},${c.col}`));

  const gridPx = gridSize * CELL_SIZE + (gridSize - 1); // gap: 1px between cells

  return (
    <div className="snake-game">
      <div className="snake-header">
        <span>Score: {snake.length}</span>
        {state.paused && !terminal && <span>PAUSED</span>}
      </div>

      <div
        className="snake-grid-wrapper"
        style={{ width: gridPx, height: gridPx }}
      >
        <div
          className="snake-grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${gridSize}, ${CELL_SIZE}px)`,
            width: gridPx,
            height: gridPx,
          }}
        >
          {Array.from({ length: gridSize }, (_, row) =>
            Array.from({ length: gridSize }, (_, col) => {
              const key = `${row},${col}`;
              const isHead = key === headKey;
              const isSnake = snakeSet.has(key);
              const isFood = row === food.row && col === food.col;

              let cellClass = "snake-cell";
              if (isHead) cellClass += " snake-cell--head";
              else if (isSnake) cellClass += " snake-cell--snake";
              else if (isFood) cellClass += " snake-cell--food";

              return (
                <div
                  key={key}
                  className={cellClass}
                  data-testid={`hint-target-snake-${row}-${col}`}
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                />
              );
            })
          )}
        </div>

        {terminal && (
          <div className="snake-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}

        {state.paused && !terminal && (
          <div className="snake-overlay">
            <h2>Paused</h2>
            <p>Press Space to resume</p>
          </div>
        )}
      </div>

      <div className="snake-controls">
        {state.alive && (
          <button
            onClick={() =>
              dispatch({
                type: state.paused ? "resume" : "pause",
              } as SnakeAction)
            }
          >
            {state.paused ? "Resume" : "Pause"}
          </button>
        )}
      </div>

      <div className="snake-hint">
        Arrow keys / WASD to steer · Space to pause
      </div>
    </div>
  );
}
