import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BingoCallState, BingoCallAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./BingoCall.css";

const COL_HEADERS = ["B", "I", "N", "G", "O"];

export function BingoCall({
  state,
  dispatch,
  onGameOver,
}: GameProps<BingoCallState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="bingo-call">
      <h2>BINGO CALL</h2>

      {state.lastCall !== null && (
        <div className="bc-last-call">
          <span className="bc-letter">{COL_HEADERS[Math.floor((state.lastCall - 1) / 15)]}</span>
          <span className="bc-number">{state.lastCall}</span>
        </div>
      )}

      <div className="bc-card">
        <div className="bc-header">
          {COL_HEADERS.map((h) => (
            <div key={h} className="bc-cell bc-head">{h}</div>
          ))}
        </div>
        {state.card.map((row, r) => (
          <div key={r} className="bc-row">
            {row.map((num, c) => (
              <div
                key={c}
                className={`bc-cell${state.marked[r]![c] ? " daubed" : ""}${num === 0 ? " free" : ""}`}
              >
                {num === 0 ? "FREE" : num}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bc-called">
        Called: {state.calledNumbers.length}
      </div>

      {state.bingo && <div className="bc-bingo">BINGO!</div>}

      {terminal && !state.bingo && (
        <div className="bc-gameover">All numbers called — no bingo.</div>
      )}

      <button
        className="bc-btn"
        onClick={() => dispatch({ type: "call" } as BingoCallAction)}
        disabled={state.gameOver}
      >
        {state.lastCall === null ? "Start Calling!" : "Next Number"}
      </button>
    </div>
  );
}
