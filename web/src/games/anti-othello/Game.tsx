import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AntiOthelloState, AntiOthelloSettings, AntiOthelloAction } from "./state.js";
import { isTerminal, legalMoves, idx, SIZE } from "./state.js";
import "./Game.css";

export function AntiOthelloGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<AntiOthelloState, AntiOthelloSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.winner === null;
  const legal = isHumanTurn ? legalMoves(state.board, 0) : [];
  const legalSet = new Set(legal.map((m) => `${m.row},${m.col}`));

  let status = "";
  let cls = "antiothello-status";
  if (state.winner === 0) { status = "You win — fewer discs!"; cls += " antiothello-win"; }
  else if (state.winner === 1) { status = "Bot wins"; cls += " antiothello-loss"; }
  else if (state.winner === "draw") { status = "Draw"; cls += " antiothello-draw"; }
  else if (state.turn === 0) {
    status = legal.length === 0 ? "No legal moves — Pass" : "Your turn (Black)";
  } else {
    status = "Bot thinking...";
  }

  return (
    <div className="antiothello-root">
      <div className="antiothello-banner">
        <span className="antiothello-misere">MISÈRE</span>
        <span>FEWEST discs at the end wins</span>
      </div>
      <div className="antiothello-header">
        <div className="antiothello-counts">
          <span className="antiothello-count antiothello-black">● {state.blackCount}</span>
          <span className="antiothello-count antiothello-white">○ {state.whiteCount}</span>
        </div>
        <div className={cls}>{status}</div>
      </div>
      <div className="antiothello-board">
        {Array.from({ length: SIZE }).map((_, r) => (
          <div className="antiothello-row" key={r}>
            {Array.from({ length: SIZE }).map((__, c) => {
              const v = state.board[idx(r, c)];
              const isLegal = legalSet.has(`${r},${c}`);
              return (
                <button
                  key={c}
                  type="button"
                  className={`antiothello-cell${isLegal ? " antiothello-legal" : ""}`}
                  onClick={() => {
                    if (isLegal) dispatch({ type: "place", row: r, col: c } as AntiOthelloAction);
                  }}
                  disabled={!isLegal}
                  aria-label={`r${r}c${c}`}
                >
                  {v === 0 && <span className="antiothello-disc antiothello-disc-black" />}
                  {v === 1 && <span className="antiothello-disc antiothello-disc-white" />}
                  {v === null && isLegal && <span className="antiothello-hint" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {isHumanTurn && legal.length === 0 && (
        <button
          type="button"
          className="antiothello-pass"
          onClick={() => dispatch({ type: "pass" } as AntiOthelloAction)}
        >
          Pass
        </button>
      )}
      <div className="antiothello-foot">Bot: {state.settings.botStrength} · Moves: {state.movesMade}</div>
    </div>
  );
}
