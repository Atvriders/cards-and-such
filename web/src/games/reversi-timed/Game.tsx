import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ReversiTimedState, ReversiTimedSettings, ReversiTimedAction } from "./state.js";
import { isTerminal, legalMoves, idx, SIZE } from "./state.js";
import "./Game.css";

export function ReversiTimedGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<ReversiTimedState, ReversiTimedSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.winner !== null) return;
    if (state.turn !== 0) return;
    const id = setInterval(() => dispatch({ type: "tick" } as ReversiTimedAction), 1000);
    return () => clearInterval(id);
  }, [state.winner, state.turn, dispatch]);

  const isHumanTurn = state.turn === 0 && state.winner === null;
  const legal = isHumanTurn ? legalMoves(state.board, 0) : [];
  const legalSet = new Set(legal.map((m) => `${m.row},${m.col}`));

  let status = "";
  let cls = "rev-timed-status";
  if (state.winner === 0) { status = "You win!"; cls += " rev-timed-win"; }
  else if (state.winner === 1) { status = "Bot wins"; cls += " rev-timed-loss"; }
  else if (state.winner === "draw") { status = "Draw"; cls += " rev-timed-draw"; }
  else if (state.turn === 0) {
    status = legal.length === 0 ? "No legal moves — Pass" : "Your turn";
  } else {
    status = "Bot thinking...";
  }

  const clockMax = parseInt(state.settings.clockSeconds, 10);
  const clockPct = Math.max(0, Math.min(100, (state.timeLeft / clockMax) * 100));
  const clockClass = state.timeLeft <= 3 ? "rev-timed-clock rev-timed-clock-low" : "rev-timed-clock";

  return (
    <div className="rev-timed-root">
      <div className="rev-timed-header">
        <div className="rev-timed-counts">
          <span className="rev-timed-count rev-timed-black">● {state.blackCount}</span>
          <span className="rev-timed-count rev-timed-white">○ {state.whiteCount}</span>
        </div>
        <div className={cls}>{status}</div>
        <div className="rev-timed-bot-label">Bot: {state.settings.botStrength}</div>
      </div>
      <div className={clockClass}>
        <div className="rev-timed-clock-label">
          <span>Move clock</span>
          <span className="rev-timed-clock-time">{state.timeLeft}s</span>
        </div>
        <div className="rev-timed-clock-bar">
          <div className="rev-timed-clock-fill" style={{ width: `${clockPct}%` }} />
        </div>
      </div>
      <div className="rev-timed-board">
        {Array.from({ length: SIZE }).map((_, r) => (
          <div className="rev-timed-row" key={r}>
            {Array.from({ length: SIZE }).map((__, c) => {
              const v = state.board[idx(r, c)];
              const isLegal = legalSet.has(`${r},${c}`);
              return (
                <button
                  key={c}
                  type="button"
                  className={`rev-timed-cell${isLegal ? " rev-timed-legal" : ""}`}
                  onClick={() => {
                    if (isLegal) dispatch({ type: "place", row: r, col: c } as ReversiTimedAction);
                  }}
                  disabled={!isLegal}
                  aria-label={`r${r}c${c}`}
                >
                  {v === 0 && <span className="rev-timed-disc rev-timed-disc-black" />}
                  {v === 1 && <span className="rev-timed-disc rev-timed-disc-white" />}
                  {v === null && isLegal && <span className="rev-timed-hint" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {isHumanTurn && legal.length === 0 && (
        <button
          className="rev-timed-pass"
          type="button"
          onClick={() => dispatch({ type: "pass" } as ReversiTimedAction)}
        >
          Pass
        </button>
      )}
      <div className="rev-timed-foot">Moves: {state.movesMade} · Time used: {state.totalTimeUsed}s</div>
    </div>
  );
}
