import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PuyoState, PuyoAction, PuyoSettings } from "./state.js";
import { isTerminal, pairCells, tickDelay, COLS, ROWS } from "./state.js";
import "./PuyoPop.css";

const PUYO_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6"];

export function PuyoPop({
  state,
  dispatch,
  onGameOver,
}: GameProps<PuyoState, PuyoSettings>): JSX.Element {
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
      if (!stateRef.current.over) dispatch({ type: "tick" } as PuyoAction);
    }, delay);
  }, [dispatch]);

  useEffect(() => {
    if (!state.over) startInterval();
    else {
      if (intervalRef.current !== null) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => {
      if (intervalRef.current !== null) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [state.over, state.level, startInterval]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowLeft": case "a": case "A": e.preventDefault(); dispatch({ type: "left" } as PuyoAction); break;
        case "ArrowRight": case "d": case "D": e.preventDefault(); dispatch({ type: "right" } as PuyoAction); break;
        case "ArrowUp": case "w": case "W": e.preventDefault(); dispatch({ type: "rotate-cw" } as PuyoAction); break;
        case "z": case "Z": e.preventDefault(); dispatch({ type: "rotate-ccw" } as PuyoAction); break;
        case "ArrowDown": case "s": case "S": e.preventDefault(); dispatch({ type: "tick" } as PuyoAction); break;
        case " ": e.preventDefault(); dispatch({ type: "drop" } as PuyoAction); break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  const terminal = isTerminal(state);
  const [[pr, pc], [sr, sc]] = pairCells(state.current);
  const currentMap = new Map<string, number>([
    [`${pr},${pc}`, state.current.pivotColor],
    [`${sr},${sc}`, state.current.satelliteColor],
  ]);

  return (
    <div className="puyo-game">
      <div className="puyo-header">
        <span>Score: {state.score}</span>
        <span>Level: {state.level}</span>
      </div>

      <div className="puyo-body">
        <div className="puyo-board-wrapper">
          <div
            className="puyo-board"
            style={{ gridTemplateColumns: `repeat(${COLS}, 38px)`, gridTemplateRows: `repeat(${ROWS}, 38px)` }}
          >
            {Array.from({ length: ROWS }, (_, r) =>
              Array.from({ length: COLS }, (_, c) => {
                const key = `${r},${c}`;
                const curColor = currentMap.get(key);
                const gridColor = state.grid[r]![c];
                const color = curColor ?? gridColor;
                let cls = "puyo-cell";
                if (color === null || color === undefined) cls += " puyo-cell--empty";
                if (curColor !== undefined) cls += " puyo-cell--current";
                return (
                  <div
                    key={key}
                    className={cls}
                    style={{ background: color !== null && color !== undefined ? PUYO_COLORS[color % PUYO_COLORS.length] : undefined }}
                  />
                );
              })
            )}
          </div>

          {terminal && (
            <div className="puyo-overlay">
              <h2>Game Over</h2>
              <p>Score: {terminal.score}</p>
            </div>
          )}
        </div>

        <div className="puyo-sidebar">
          <div>
            <div className="puyo-sidebar-label">Next</div>
            <div className="puyo-next">
              <div className="puyo-next-cell" style={{ background: PUYO_COLORS[state.next.pivotColor % PUYO_COLORS.length] }} />
              <div className="puyo-next-cell" style={{ background: PUYO_COLORS[state.next.satelliteColor % PUYO_COLORS.length] }} />
            </div>
          </div>
          <div>
            <div className="puyo-sidebar-label">Score</div>
            <div className="puyo-sidebar-value">{state.score}</div>
          </div>
          <div>
            <div className="puyo-sidebar-label">Level</div>
            <div className="puyo-sidebar-value">{state.level}</div>
          </div>
        </div>
      </div>

      <div className="puyo-hint">
        ← → Move · ↑/W Rotate CW · Z Rotate CCW · ↓/S Soft-drop · Space Hard-drop
      </div>
    </div>
  );
}
