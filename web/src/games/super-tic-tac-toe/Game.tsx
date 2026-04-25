import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SuperTTTState, SuperAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SuperTicTacToe({
  state,
  dispatch,
  onGameOver,
}: GameProps<SuperTTTState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: SuperAction) => dispatch(a);

  function getLocalClass(bi: number): string {
    const cl = state.claimed[bi];
    const isActive = state.phase === "playing" && (state.nextBoard === -1 || state.nextBoard === bi) && cl === null;
    if (cl === "X") return "stt-local-wrap claimed-x";
    if (cl === "O") return "stt-local-wrap claimed-o";
    if (cl === "D") return "stt-local-wrap claimed-d";
    if (isActive) return "stt-local-wrap active";
    return "stt-local-wrap";
  }

  return (
    <div className="stt-wrap">
      <div className="stt-header">
        <span className="stt-title">Super TTT</span>
        {state.phase === "playing" && (
          <span className="stt-turn">
            Turn: <span className={state.current.toLowerCase()}>{state.current}</span>
          </span>
        )}
        {state.phase === "done" && (
          <span className="stt-turn">{state.winner === "D" ? "Draw!" : `${state.winner} wins!`}</span>
        )}
      </div>

      <div className="stt-global">
        {state.boards.map((board, bi) => {
          const cl = state.claimed[bi];
          return (
            <div key={bi} className={getLocalClass(bi)}>
              {cl !== null ? (
                <div className={`stt-claimed-overlay ${cl ? cl.toLowerCase() : ""}`}>
                  {cl === "D" ? "~" : cl}
                </div>
              ) : (
                <div className="stt-local">
                  {board.map((cell, ci) => (
                    <div
                      key={ci}
                      className={`stt-cell${cell ? ` ${cell.toLowerCase()}` : ""}`}
                      onClick={() => state.phase === "playing" && d({ type: "move", boardIndex: bi, cellIndex: ci })}
                    >
                      {cell ?? ""}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {state.phase === "playing" && (
        <div className="stt-hint">
          {state.nextBoard === -1 ? "Play in any open board" : `Must play in board #${state.nextBoard + 1}`}
        </div>
      )}

      {state.phase === "done" && (
        <div className="stt-done">
          {state.winner === "D" ? "It's a draw!" : `Player ${state.winner} wins the game!`}
        </div>
      )}

      <button className="stt-btn" onClick={() => d({ type: "reset", seed: Date.now() })}>
        New Game
      </button>
    </div>
  );
}
