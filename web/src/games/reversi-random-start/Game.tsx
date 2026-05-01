import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ReversiRandomStartState, ReversiRandomStartSettings, ReversiRandomStartAction } from "./state.js";
import { isTerminal, legalMoves, idx, SIZE } from "./state.js";
import "./Game.css";

export function ReversiRandomStartGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<ReversiRandomStartState, ReversiRandomStartSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.winner === null;
  const legal = isHumanTurn ? legalMoves(state.board, 0) : [];
  const legalSet = new Set(legal.map((m) => `${m.row},${m.col}`));

  let status = "";
  let cls = "revrand-status";
  if (state.winner === 0) { status = "You win!"; cls += " revrand-win"; }
  else if (state.winner === 1) { status = "Bot wins"; cls += " revrand-loss"; }
  else if (state.winner === "draw") { status = "Draw"; cls += " revrand-draw"; }
  else if (state.turn === 0) {
    status = legal.length === 0 ? "No legal moves — Pass" : "Your turn (Black)";
  } else {
    status = "Bot thinking...";
  }

  return (
    <div className="revrand-root">
      <div className="revrand-banner">RANDOM 4-DISC OPENING</div>
      <div className="revrand-header">
        <div className="revrand-counts">
          <span className="revrand-count revrand-black">● {state.blackCount}</span>
          <span className="revrand-count revrand-white">○ {state.whiteCount}</span>
        </div>
        <div className={cls}>{status}</div>
      </div>
      <div className="revrand-board">
        {Array.from({ length: SIZE }).map((_, r) => (
          <div className="revrand-row" key={r}>
            {Array.from({ length: SIZE }).map((__, c) => {
              const v = state.board[idx(r, c)];
              const isLegal = legalSet.has(`${r},${c}`);
              return (
                <button
                  key={c}
                  type="button"
                  className={`revrand-cell${isLegal ? " revrand-legal" : ""}`}
                  onClick={() => {
                    if (isLegal) dispatch({ type: "place", row: r, col: c } as ReversiRandomStartAction);
                  }}
                  disabled={!isLegal}
                  aria-label={`r${r}c${c}`}
                >
                  {v === 0 && <span className="revrand-disc revrand-disc-black" />}
                  {v === 1 && <span className="revrand-disc revrand-disc-white" />}
                  {v === null && isLegal && <span className="revrand-hint" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {isHumanTurn && legal.length === 0 && (
        <button
          type="button"
          className="revrand-pass"
          onClick={() => dispatch({ type: "pass" } as ReversiRandomStartAction)}
        >
          Pass
        </button>
      )}
      <div className="revrand-foot">Bot: {state.settings.botStrength} · Moves: {state.movesMade}</div>
    </div>
  );
}
