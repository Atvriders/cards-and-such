import { useEffect, useMemo } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConnectFourMiniState, ConnectFourMiniAction, ConnectFourMiniSettings } from "./state.js";
import { isTerminal, ROWS, COLS } from "./state.js";
import "./Game.css";

export function ConnectFourMiniGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<ConnectFourMiniState, ConnectFourMiniSettings>): JSX.Element {
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
    dispatch({ type: "drop", col } as ConnectFourMiniAction);
  };

  const reset = () => dispatch({ type: "reset" } as ConnectFourMiniAction);

  const playerLabel =
    state.phase === "done"
      ? state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw"
      : state.turn === "P" ? "Your turn (red)" : "CPU thinking...";

  const last = state.lastDrop;

  return (
    <div className="connect4-mini connect4-wrap">
      <div className="connect4-status">
        <span className="connect4-pill" data-mode="mini">Mini · {COLS}×{ROWS}</span>
        <span className="connect4-turn" data-state={state.phase === "done" ? state.result ?? "" : state.turn}>
          {playerLabel}
        </span>
        <span className="connect4-score">{state.score} pts</span>
      </div>

      <div className="connect4-board-shell">
        <div className="connect4-arrow-row" style={{ gridTemplateColumns: `repeat(${COLS},1fr)` }}>
          {Array.from({ length: COLS }).map((_, c) => (
            <button
              key={`arrow-${c}`}
              className="connect4-arrow"
              onClick={() => drop(c)}
              disabled={state.phase !== "playing" || state.turn !== "P" || fullCols[c]}
              aria-label={`Drop in column ${c + 1}`}
            >
              <span className="connect4-arrow-glyph">{state.turn === "P" && !fullCols[c] ? "▼" : ""}</span>
            </button>
          ))}
        </div>
        <div
          className="connect4-board"
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
                <div key={idx} className="connect4-slot" onClick={() => drop(c)}>
                  <div className="connect4-slot-inner">
                    {v && (
                      <div
                        className={`connect4-disc connect4-disc-${v === "P" ? "red" : "yellow"}${isWin ? " connect4-disc-win" : ""}${isLastDrop ? " connect4-disc-drop" : ""}`}
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

      <div className="connect4-controls">
        <button className="connect4-btn" onClick={reset}>
          {state.phase === "done" ? "New Game" : "Restart"}
        </button>
        <div className="connect4-legend">
          <span className="connect4-legend-item"><span className="connect4-dot connect4-dot-red" />You</span>
          <span className="connect4-legend-item"><span className="connect4-dot connect4-dot-yellow" />CPU</span>
        </div>
      </div>
    </div>
  );
}
