import { useCallback, useEffect, useMemo, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import {
  COLS,
  ROWS,
  chooseCpuMove,
  dropRow,
  isTerminal,
  type CFFAction,
  type CFFSettings,
  type CFFState,
} from "./state.js";
import "./Game.css";

export function ConnectFourFullGame(
  props: GameProps<CFFState, CFFSettings>,
): JSX.Element {
  const { state, dispatch, onGameOver } = props;
  const endedRef = useRef(false);
  const cpuTimerRef = useRef<number | null>(null);

  // Fire onGameOver exactly once.
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // CPU "thinking" trigger.
  useEffect(() => {
    if (state.phase === "thinking" && state.turn === 1 && state.winner === null) {
      // Small delay so the human sees their disc land before the CPU plays.
      const delay = state.difficulty === "hard" ? 350 : 200;
      cpuTimerRef.current = window.setTimeout(() => {
        const col = chooseCpuMove(state, state.difficulty);
        if (col !== null) {
          dispatch({ type: "cpuMove", col } satisfies CFFAction);
        }
      }, delay);
      return () => {
        if (cpuTimerRef.current !== null) {
          window.clearTimeout(cpuTimerRef.current);
          cpuTimerRef.current = null;
        }
      };
    }
    return undefined;
  }, [state, dispatch]);

  const handleColumn = useCallback(
    (col: number) => {
      if (state.phase !== "playing" || state.turn !== 0) return;
      dispatch({ type: "drop", col } satisfies CFFAction);
    },
    [dispatch, state.phase, state.turn],
  );

  const handleReset = useCallback(() => {
    endedRef.current = false;
    dispatch({ type: "reset" } satisfies CFFAction);
  }, [dispatch]);

  const winSet = useMemo(() => {
    return new Set((state.winningLine ?? []).map(([r, c]) => `${r},${c}`));
  }, [state.winningLine]);

  const previewRow = useMemo(() => {
    if (state.phase !== "playing" || state.turn !== 0) return -1;
    return -1; // hover preview is handled per-column below
  }, [state.phase, state.turn]);

  const statusText =
    state.winner === 0
      ? "You win!"
      : state.winner === 1
        ? "CPU wins"
        : state.winner === "draw"
          ? "Draw"
          : state.turn === 0
            ? "Your turn (Red)"
            : "CPU thinking…";

  const terminal = isTerminal(state);

  return (
    <div className="cff-root fade-in">
      <div className="cff-info game-info">
        <div className="cff-info-cell">
          <div className="label">Difficulty</div>
          <div className="value value--accent">
            {state.difficulty[0]!.toUpperCase() + state.difficulty.slice(1)}
          </div>
        </div>
        <div className="cff-info-cell">
          <div className="label">Moves</div>
          <div className="value value--moves">{state.movesPlayed}</div>
        </div>
        <div className="cff-info-cell">
          <div className="label">Status</div>
          <div
            className={`value cff-status${state.winner === 0 ? " pulse" : ""}`}
            data-testid="cff-status"
          >
            {statusText}
          </div>
        </div>
      </div>

      <div
        className="cff-board-frame"
        data-testid="cff-board"
        role="grid"
        aria-label="Connect Four board, 7 columns by 6 rows"
      >
        {/* Column drop buttons sit above the board for keyboard/mouse drops. */}
        <div className="cff-col-buttons" role="row">
          {Array.from({ length: COLS }, (_, c) => {
            const full = state.board[c] !== null;
            const disabled = full || state.phase !== "playing" || state.winner !== null;
            return (
              <button
                key={c}
                type="button"
                className="cff-col-btn game-button"
                data-testid={`cff-drop-${c}`}
                onClick={() => handleColumn(c)}
                disabled={disabled}
                title={`Drop disc in column ${c + 1}`}
                aria-label={`Drop disc in column ${c + 1}`}
              >
                ↓
              </button>
            );
          })}
        </div>

        <div className="cff-board" role="presentation">
          {Array.from({ length: ROWS }, (_, r) => (
            <div className="cff-row" key={r} role="row">
              {Array.from({ length: COLS }, (_, c) => {
                const v = state.board[r * COLS + c];
                const winning = winSet.has(`${r},${c}`);
                const isLast =
                  state.lastMove !== null &&
                  state.lastMove.row === r &&
                  state.lastMove.col === c;
                const previewHere =
                  previewRow === r &&
                  state.phase === "playing" &&
                  state.turn === 0 &&
                  dropRow(state.board, c) === r;
                return (
                  <button
                    key={c}
                    type="button"
                    className={[
                      "cff-cell",
                      v === 0 ? "red" : v === 1 ? "yellow" : "",
                      winning ? "win" : "",
                      isLast ? "last" : "",
                      previewHere ? "preview" : "",
                    ].filter(Boolean).join(" ")}
                    data-testid={`cff-cell-${c}-${r}`}
                    onClick={() => handleColumn(c)}
                    disabled={state.phase !== "playing" || state.turn !== 0 || state.winner !== null}
                    title={`Column ${c + 1}, row ${r + 1}`}
                    aria-label={
                      v === 0
                        ? `Red disc at column ${c + 1}, row ${r + 1}`
                        : v === 1
                          ? `Yellow disc at column ${c + 1}, row ${r + 1}`
                          : `Empty cell, column ${c + 1}, row ${r + 1}`
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {terminal && (
        <div className="cff-result bounce-in" data-testid="cff-result">
          <div className="cff-result-title">
            {state.winner === 0 ? "Victory" : state.winner === 1 ? "Defeat" : "Draw"}
          </div>
          <div className="cff-result-score">
            Score: <strong>{terminal.score}</strong>
            {state.winner === 0 && (
              <span className="cff-result-note">
                {" "}
                · {state.movesPlayed} moves
                {state.difficulty === "hard" ? " · hard ×1.5" : state.difficulty === "medium" ? " · medium ×1.2" : ""}
              </span>
            )}
          </div>
          <button
            type="button"
            className="game-button game-button--primary"
            onClick={handleReset}
            title="Start a new game with the same difficulty"
            data-testid="cff-reset"
          >
            Play again
          </button>
        </div>
      )}
    </div>
  );
}

export default ConnectFourFullGame;
