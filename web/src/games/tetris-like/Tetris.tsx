import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TetrisState, TetrisAction, TetrisSettings } from "./state.js";
import { getCells, getColor, isTerminal, tickDelay, COLS, ROWS } from "./state.js";
import "./Tetris.css";

const CELL = 28; // px per cell

export function Tetris({
  state,
  dispatch,
  onGameOver,
}: GameProps<TetrisState, TetrisSettings>): JSX.Element {
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

  // ── Tick loop using setInterval keyed on level ─────────────────────────────
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = useCallback(() => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    const delay = tickDelay(stateRef.current.level);
    intervalRef.current = setInterval(() => {
      if (!stateRef.current.over) {
        dispatch({ type: "tick" } as TetrisAction);
      }
    }, delay);
  }, [dispatch]);

  useEffect(() => {
    if (!state.over) {
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
  }, [state.over, state.level, startInterval]);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          dispatch({ type: "left" } as TetrisAction);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          dispatch({ type: "right" } as TetrisAction);
          break;
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          dispatch({ type: "rotate" } as TetrisAction);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          dispatch({ type: "soft-drop" } as TetrisAction);
          break;
        case " ":
        case "Spacebar":
          e.preventDefault();
          dispatch({ type: "hard-drop" } as TetrisAction);
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  const terminal = isTerminal(state);

  // ── Ghost piece (where piece would land) ──────────────────────────────────
  const ghostRow = (() => {
    let r = state.current.row;
    while (true) {
      const next = { ...state.current, row: r + 1 };
      // Check manually without importing isValidPosition
      const cells = getCells(next);
      let ok = true;
      for (const [cr, cc] of cells) {
        if (cr >= ROWS || cc < 0 || cc >= COLS) { ok = false; break; }
        if (cr >= 0 && state.grid[cr]![cc] !== null) { ok = false; break; }
      }
      if (!ok) break;
      r++;
    }
    return r;
  })();

  const currentCells = getCells(state.current);
  const ghostCells = getCells({ ...state.current, row: ghostRow });
  const currentSet = new Set(currentCells.map(([r, c]) => `${r},${c}`));
  const ghostSet = new Set(ghostCells.map(([r, c]) => `${r},${c}`));
  const pieceColor = getColor(state.current.type);

  // ── Next piece preview ────────────────────────────────────────────────────
  const nextCells = getCells({ type: state.next, row: 1, col: 2, rotation: 0 });
  const nextColor = getColor(state.next);
  const nextSet = new Set(nextCells.map(([r, c]) => `${r},${c}`));

  const boardWidthPx = COLS * CELL + (COLS - 1);
  const boardHeightPx = ROWS * CELL + (ROWS - 1);

  return (
    <div className="tetris-game">
      <div className="tetris-header">
        <span>Score: {state.score}</span>
        <span>Lines: {state.lines}</span>
        <span>Level: {state.level}</span>
      </div>

      <div className="tetris-body">
        <div className="tetris-board-wrapper">
          <div
            className="tetris-board"
            style={{
              gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
              gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
              width: boardWidthPx,
              height: boardHeightPx,
            }}
          >
            {Array.from({ length: ROWS }, (_, r) =>
              Array.from({ length: COLS }, (_, c) => {
                const key = `${r},${c}`;
                const gridColor = state.grid[r]![c];
                const isCurrent = currentSet.has(key);
                const isGhost = !isCurrent && ghostSet.has(key);
                let bg: string | undefined;
                let cls = "tetris-cell";
                if (isCurrent) {
                  bg = pieceColor;
                } else if (gridColor !== null) {
                  bg = gridColor;
                } else if (isGhost) {
                  cls += " tetris-cell--ghost";
                } else {
                  cls += " tetris-cell--empty";
                }
                return (
                  <div
                    key={key}
                    className={cls}
                    data-testid={r === 0 ? `hint-target-tetris-col-${c}` : undefined}
                    style={{ width: CELL, height: CELL, background: bg }}
                  />
                );
              })
            )}
          </div>

          {terminal && (
            <div className="tetris-overlay">
              <h2>Game Over</h2>
              <p>Score: {terminal.score}</p>
              <p>Lines: {state.lines}</p>
            </div>
          )}
        </div>

        <div className="tetris-sidebar">
          <div>
            <div className="tetris-sidebar-label">Next</div>
            <div
              className="tetris-next"
              style={{
                gridTemplateColumns: `repeat(4, 20px)`,
                gridTemplateRows: `repeat(3, 20px)`,
                width: 4 * 20 + 3,
                height: 3 * 20 + 2,
                marginTop: 4,
              }}
            >
              {Array.from({ length: 3 }, (_, r) =>
                Array.from({ length: 4 }, (_, c) => {
                  const key = `${r},${c}`;
                  const isNext = nextSet.has(key);
                  return (
                    <div
                      key={key}
                      className="tetris-next-cell"
                      style={{
                        width: 20,
                        height: 20,
                        background: isNext ? nextColor : "#1a1a1a",
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>
          <div>
            <div className="tetris-sidebar-label">Score</div>
            <div className="tetris-sidebar-value">{state.score}</div>
          </div>
          <div>
            <div className="tetris-sidebar-label">Lines</div>
            <div className="tetris-sidebar-value">{state.lines}</div>
          </div>
          <div>
            <div className="tetris-sidebar-label">Level</div>
            <div className="tetris-sidebar-value">{state.level}</div>
          </div>
        </div>
      </div>

      <div className="tetris-hint">
        ← → Move · ↑/W Rotate · ↓/S Soft-drop · Space Hard-drop
      </div>
    </div>
  );
}
