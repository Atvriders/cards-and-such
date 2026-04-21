import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TTT3DState, TTT3DAction, TTT3DSettings, Coord3D } from "./state.js";
import { isTerminal } from "./state.js";
import "./TicTacToe3D.css";

export function TicTacToe3D({
  state,
  dispatch,
  onGameOver,
}: GameProps<TTT3DState, TTT3DSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const gameOver = terminal !== null;

  const winSet = new Set(
    (state.winningLine ?? []).map(([l, r, c]) => `${l},${r},${c}`)
  );

  function handleClick(at: Coord3D) {
    if (gameOver || state.turn !== "X") return;
    dispatch({ type: "place", at });
  }

  return (
    <div className="ttt3d-game">
      <div className="ttt3d-title">3D Tic-Tac-Toe</div>
      <div className="ttt3d-status">
        {gameOver ? "" : state.turn === "X" ? "Your turn (X)" : "Bot thinking..."}
      </div>

      <div className="ttt3d-legend">
        <span className="x">X = You</span>
        <span className="o">O = Bot</span>
      </div>

      <div className="ttt3d-layers">
        {[0, 1, 2, 3].map((layer) => (
          <div key={layer} className="ttt3d-layer">
            <div className="ttt3d-layer-label">Layer {layer + 1}</div>
            <div className="ttt3d-grid">
              {[0, 1, 2, 3].map((row) =>
                [0, 1, 2, 3].map((col) => {
                  const val = state.board[layer]?.[row]?.[col] ?? null;
                  const key = `${layer},${row},${col}`;
                  const isWin = winSet.has(key);
                  return (
                    <div
                      key={key}
                      className={`ttt3d-cell${val ? ` occupied ${val}` : ""}${isWin ? " winning" : ""}`}
                      onClick={() => handleClick([layer, row, col])}
                    >
                      {val ?? ""}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="ttt3d-game-over">
          {state.winner === "X" && "You win!"}
          {state.winner === "O" && "Bot wins!"}
          {state.winner === "draw" && "Draw!"}
        </div>
      )}
    </div>
  );
}
