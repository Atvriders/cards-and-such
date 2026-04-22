import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Go9x9State, Go9x9Settings } from "./state.js";
import { isTerminal } from "./state.js";
import type { Coord } from "../../engines/grid/index.js";
import "./Go9x9.css";

export function Go9x9({ state, dispatch, onGameOver }: GameProps<Go9x9State, Go9x9Settings>): JSX.Element {
  const term = isTerminal(state);
  useEffect(() => { if (term) onGameOver(term.score); }, [term, onGameOver]);

  const isPlayerTurn = state.settings.opponent === "hot-seat" || state.turn === "B";

  function handleClick(c: Coord) {
    if (term || !isPlayerTurn) return;
    dispatch({ type: "place", at: c });
  }

  function handlePass() {
    if (term || !isPlayerTurn) return;
    dispatch({ type: "pass" });
  }

  const turnLabel = state.settings.opponent === "hot-seat"
    ? (state.turn === "B" ? "Black's turn" : "White's turn")
    : (state.turn === "B" ? "Your turn (Black ⚫)" : "Bot thinking…");

  let statusText = term
    ? (state.winner === "B" ? "You win! (Black)" : state.winner === "W" ? "Bot wins! (White)" : "Draw!")
    : turnLabel;

  if (term && state.scores) {
    statusText += ` B:${state.scores.B.toFixed(1)} W:${state.scores.W.toFixed(1)}`;
  }

  return (
    <div className="go9-board">
      <div className="go9-status">{statusText}</div>
      <div className="go9-info">
        Captured — B: {state.capturedB} | W: {state.capturedW} | Passes: {state.consecutivePasses}
      </div>
      <div className="go9-grid">
        {[...state.grid.coords()].map(c => {
          const key = `${c.row},${c.col}`;
          const cell = state.grid.get(c);
          return (
            <div
              key={key}
              className="go9-cell"
              onClick={() => handleClick(c)}
              data-testid={`cell-${c.row}-${c.col}`}
            >
              {cell === "B" ? "⚫" : cell === "W" ? "⚪" : null}
            </div>
          );
        })}
      </div>
      <div className="go9-actions">
        {!term && isPlayerTurn && (
          <button onClick={handlePass}>Pass</button>
        )}
      </div>
      <div style={{ fontSize: "0.8rem", color: "#888" }}>
        Two consecutive passes end the game. White gets 6.5 komi.
      </div>
    </div>
  );
}
