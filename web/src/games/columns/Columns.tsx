import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ColumnsState, ColumnsAction, ColumnsSettings } from "./state.js";
import { isTerminal, tickDelay, COLS, ROWS } from "./state.js";
import "./Columns.css";

const GEM_COLORS = [
  "#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c",
];

export function Columns({
  state,
  dispatch,
  onGameOver,
}: GameProps<ColumnsState, ColumnsSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = useCallback(() => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    const delay = tickDelay(stateRef.current.level);
    intervalRef.current = setInterval(() => {
      if (!stateRef.current.over) dispatch({ type: "tick" } as ColumnsAction);
    }, delay);
  }, [dispatch]);

  useEffect(() => {
    if (!state.over) {
      startInterval();
    } else {
      if (intervalRef.current !== null) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => {
      if (intervalRef.current !== null) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [state.over, state.level, startInterval]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowLeft": case "a": case "A": e.preventDefault(); dispatch({ type: "left" } as ColumnsAction); break;
        case "ArrowRight": case "d": case "D": e.preventDefault(); dispatch({ type: "right" } as ColumnsAction); break;
        case "ArrowUp": case "w": case "W": e.preventDefault(); dispatch({ type: "rotate" } as ColumnsAction); break;
        case "ArrowDown": case "s": case "S": e.preventDefault(); dispatch({ type: "tick" } as ColumnsAction); break;
        case " ": e.preventDefault(); dispatch({ type: "drop" } as ColumnsAction); break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  const terminal = isTerminal(state);
  const { current } = state;
  const currentKeys = new Set([
    `${current.row},${current.col}`,
    `${current.row + 1},${current.col}`,
    `${current.row + 2},${current.col}`,
  ]);
  const currentGemMap: Record<string, number> = {
    [`${current.row},${current.col}`]: current.gems[0],
    [`${current.row + 1},${current.col}`]: current.gems[1],
    [`${current.row + 2},${current.col}`]: current.gems[2],
  };

  return (
    <div className="columns-game">
      <div className="columns-header">
        <span>Score: {state.score}</span>
        <span>Level: {state.level}</span>
      </div>

      <div className="columns-body">
        <div className="columns-board-wrapper">
          <div
            className="columns-board"
            style={{ gridTemplateColumns: `repeat(${COLS}, 36px)`, gridTemplateRows: `repeat(${ROWS}, 28px)` }}
          >
            {Array.from({ length: ROWS }, (_, r) =>
              Array.from({ length: COLS }, (_, c) => {
                const key = `${r},${c}`;
                const isCurrent = currentKeys.has(key);
                const gridColor = state.grid[r]![c];
                const gemColor = isCurrent ? currentGemMap[key] : gridColor;
                let cls = "columns-cell";
                if (isCurrent) cls += " columns-cell--current";
                if (gemColor === null || gemColor === undefined) cls += " columns-cell--empty";
                return (
                  <div
                    key={key}
                    className={cls}
                    style={{ background: gemColor !== null && gemColor !== undefined ? GEM_COLORS[gemColor % GEM_COLORS.length] : undefined }}
                  />
                );
              })
            )}
          </div>

          {terminal && (
            <div className="columns-overlay">
              <h2>Game Over</h2>
              <p>Score: {terminal.score}</p>
            </div>
          )}
        </div>

        <div className="columns-sidebar">
          <div>
            <div className="columns-sidebar-label">Next</div>
            <div className="columns-next">
              {state.next.map((gem, i) => (
                <div key={i} className="columns-next-cell" style={{ background: GEM_COLORS[gem % GEM_COLORS.length] }} />
              ))}
            </div>
          </div>
          <div>
            <div className="columns-sidebar-label">Score</div>
            <div className="columns-sidebar-value">{state.score}</div>
          </div>
          <div>
            <div className="columns-sidebar-label">Level</div>
            <div className="columns-sidebar-value">{state.level}</div>
          </div>
        </div>
      </div>

      <div className="columns-hint">
        ← → Move · ↑/W Rotate gems · ↓/S Soft-drop · Space Hard-drop
      </div>
    </div>
  );
}
