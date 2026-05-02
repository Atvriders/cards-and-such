import { useEffect, useMemo } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { isTerminal, ROWS, COLS } from "./state.js";
import "./Game.css";

export function ConnectGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<ConnectState, ConnectSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const winSet = useMemo(() => new Set(state.winLine ?? []), [state.winLine]);
  const fullCols = useMemo(() => {
    const cols: boolean[] = [];
    for (let c = 0; c < COLS; c++) {
      let full = true;
      for (let r = 0; r < ROWS; r++) {
        if (state.board[r * COLS + c] === null) { full = false; break; }
      }
      cols.push(full);
    }
    return cols;
  }, [state.board]);

  const drop = (col: number) => {
    if (state.phase !== "playing" || state.turn !== "P") return;
    if (fullCols[col]) return;
    dispatch({ type: "drop", col } as ConnectAction);
  };

  const reset = () => dispatch({ type: "reset" } as ConnectAction);

  const playerLabel =
    state.phase === "done"
      ? state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw"
      : state.turn === "P" ? "Your turn (red)" : "CPU thinking...";

  const last = state.lastDrop;

  return (
    <div className="c4cl-classic c4cl-wrap">
      <div className="c4cl-status">
        <span className="c4cl-pill" data-mode="classic">Classic · {COLS}×{ROWS}</span>
        <span className="c4cl-turn" data-state={state.phase === "done" ? state.result ?? "" : state.turn}>
          {playerLabel}
        </span>
        <span className="c4cl-score">{state.score} pts</span>
      </div>

      <div className="c4cl-board-shell">
        <div className="c4cl-arrow-row" style={{ gridTemplateColumns: `repeat(${COLS},1fr)` }}>
          {Array.from({ length: COLS }).map((_, c) => (
            <button
              key={`arrow-${c}`}
              className="c4cl-arrow"
              data-testid={`c4cl-col-${c}`}
              onClick={() => drop(c)}
              disabled={state.phase !== "playing" || state.turn !== "P" || fullCols[c]}
              aria-label={`Drop in column ${c + 1}`}
            >
              <span className="c4cl-arrow-glyph">{state.turn === "P" && !fullCols[c] ? "▼" : ""}</span>
            </button>
          ))}
        </div>
        <div
          className="c4cl-board"
          style={{ gridTemplateColumns: `repeat(${COLS},1fr)`, gridTemplateRows: `repeat(${ROWS},1fr)` }}
        >
          {Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: COLS }).map((__, c) => {
              const idx = r * COLS + c;
              const v = state.board[idx];
              const isWin = winSet.has(idx);
              const isLastDrop = last && last.row === r && last.col === c;
              const dropDist = isLastDrop ? r + 1 : 0;
              return (
                <div key={idx} className="c4cl-slot" onClick={() => drop(c)}>
                  <div className="c4cl-slot-inner">
                    {v && (
                      <div
                        className={`c4cl-disc c4cl-disc-${v === "P" ? "red" : "yellow"}${isWin ? " c4cl-disc-win" : ""}${isLastDrop ? " c4cl-disc-drop" : ""}`}
                        style={isLastDrop ? ({ "--drop-from": `-${dropDist * 100}%` } as React.CSSProperties) : undefined}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="c4cl-controls">
        <button className="c4cl-btn" onClick={reset}>
          {state.phase === "done" ? "New Game" : "Restart"}
        </button>
        <div className="c4cl-legend">
          <span className="c4cl-legend-item"><span className="c4cl-dot c4cl-dot-red" />You</span>
          <span className="c4cl-legend-item"><span className="c4cl-dot c4cl-dot-yellow" />CPU</span>
        </div>
      </div>
    </div>
  );
}
