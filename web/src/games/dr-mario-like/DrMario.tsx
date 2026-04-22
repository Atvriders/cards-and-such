import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DrMarioState, DrMarioAction, DrMarioSettings } from "./state.js";
import { isTerminal, capsuleCells, COLS, ROWS } from "./state.js";
import "./DrMario.css";

const CELL_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12"];

export function DrMario({
  state,
  dispatch,
}: GameProps<DrMarioState, DrMarioSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = useCallback(() => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!stateRef.current.over) dispatch({ type: "tick" } as DrMarioAction);
    }, 600);
  }, [dispatch]);

  useEffect(() => {
    if (!state.over) startInterval();
    else {
      if (intervalRef.current !== null) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => {
      if (intervalRef.current !== null) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [state.over, startInterval]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowLeft": case "a": case "A": e.preventDefault(); dispatch({ type: "left" } as DrMarioAction); break;
        case "ArrowRight": case "d": case "D": e.preventDefault(); dispatch({ type: "right" } as DrMarioAction); break;
        case "ArrowUp": case "w": case "W": e.preventDefault(); dispatch({ type: "rotate" } as DrMarioAction); break;
        case "ArrowDown": case "s": case "S": e.preventDefault(); dispatch({ type: "down" } as DrMarioAction); break;
        case " ": e.preventDefault(); dispatch({ type: "drop" } as DrMarioAction); break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  const terminal = isTerminal(state);

  const currentSet = new Map<string, { color: number; kind: "capsule" }>();
  if (state.current) {
    const cells = capsuleCells(state.current);
    cells.forEach(([r, c], i) => {
      currentSet.set(`${r},${c}`, { color: state.current!.colors[i as 0 | 1], kind: "capsule" });
    });
  }

  return (
    <div className="drmario-game">
      <div className="drmario-header">
        <span>Score: {state.score}</span>
        <span>Viruses: {state.virusCount}</span>
      </div>

      <div className="drmario-body">
        <div className="drmario-board-wrapper">
          <div
            className="drmario-board"
            style={{ gridTemplateColumns: `repeat(${COLS}, 32px)`, gridTemplateRows: `repeat(${ROWS}, 32px)` }}
          >
            {Array.from({ length: ROWS }, (_, r) =>
              Array.from({ length: COLS }, (_, c) => {
                const key = `${r},${c}`;
                const gridCell = state.grid[r]![c];
                const curCell = currentSet.get(key);
                const cell = curCell ?? gridCell;
                let cls = "drmario-cell";
                if (!cell) {
                  cls += " drmario-cell--empty";
                } else {
                  cls += ` drmario-cell--${cell.kind}`;
                  if (curCell) cls += " drmario-cell--current";
                }
                return (
                  <div
                    key={key}
                    className={cls}
                    style={{ background: cell ? CELL_COLORS[cell.color % CELL_COLORS.length] : undefined }}
                  />
                );
              })
            )}
          </div>

          {terminal && (
            <div className="drmario-overlay">
              <h2>{state.won ? "You Win!" : "Game Over"}</h2>
              <p>Score: {terminal.score}</p>
              {state.won && <p>All viruses cleared!</p>}
            </div>
          )}
        </div>

        <div className="drmario-sidebar">
          <div>
            <div className="drmario-sidebar-label">Next</div>
            <div className="drmario-next">
              {state.next.map((color, i) => (
                <div key={i} className="drmario-next-cell" style={{ background: CELL_COLORS[color % CELL_COLORS.length] }} />
              ))}
            </div>
          </div>
          <div>
            <div className="drmario-sidebar-label">Score</div>
            <div className="drmario-sidebar-value">{state.score}</div>
          </div>
          <div>
            <div className="drmario-sidebar-label">Viruses</div>
            <div className="drmario-sidebar-value">{state.virusCount}</div>
          </div>
        </div>
      </div>

      <div className="drmario-hint">
        ← → Move · ↑/W Rotate · ↓/S Soft-drop · Space Hard-drop
      </div>
    </div>
  );
}
