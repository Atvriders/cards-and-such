import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ConnectGame({
  state, dispatch, onGameOver,
}: GameProps<ConnectState, ConnectSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const status =
    state.phase === "done"
      ? state.result === "P" ? "You won the meta-game!" : state.result === "C" ? "CPU won the meta-game" : "Draw"
      : state.activeMini >= 0
      ? `Play in mini-board #${state.activeMini + 1}`
      : "Play in any open mini-board";

  function isClickable(mini: number): boolean {
    if (state.phase === "done") return false;
    if (state.miniWinners[mini] !== null) return false;
    if (state.activeMini >= 0 && state.activeMini !== mini) return false;
    return state.turn === "P";
  }

  return (
    <div className="ultttt-wrap">
      <div className="ultttt-header">
        <h2 className="ultttt-title">Ultimate TTT Mini</h2>
        <div className="ultttt-info">9 mini-boards · win 3-in-a-row of mini wins</div>
        <div className="ultttt-status">{status}</div>
        <div className="ultttt-score">Score: {state.score}</div>
      </div>

      <div className="ultttt-super">
        {Array.from({ length: 9 }).map((_, m) => {
          const winner = state.miniWinners[m];
          const active = isClickable(m);
          return (
            <div
              key={m}
              className={`ultttt-mini ${active ? "ultttt-mini-active" : ""} ${winner === "P" ? "ultttt-mini-p" : winner === "C" ? "ultttt-mini-c" : winner === "draw" ? "ultttt-mini-draw" : ""}`}
            >
              {winner === "P" || winner === "C" ? (
                <div className={`ultttt-mini-claim ${winner === "P" ? "ultttt-claim-p" : "ultttt-claim-c"}`}>
                  {winner === "P" ? "X" : "O"}
                </div>
              ) : (
                <div className="ultttt-mini-grid">
                  {Array.from({ length: 9 }).map((_, c) => {
                    const v = state.cells[m * 9 + c];
                    return (
                      <button
                        key={c}
                        className={`ultttt-cell ${v === "P" ? "ultttt-cell-x" : v === "C" ? "ultttt-cell-o" : ""}`}
                        disabled={!active || v !== null}
                        onClick={() => dispatch({ type: "place", mini: m, cell: c } as ConnectAction)}
                        aria-label={`mini ${m} cell ${c}`}
                      >
                        {v === "P" ? "X" : v === "C" ? "O" : ""}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {state.phase === "done" && (
        <div className="ultttt-final">
          {state.result === "P" ? "Victory!" : state.result === "C" ? "Defeat" : "Tie"} — {state.score} pts
        </div>
      )}
    </div>
  );
}
