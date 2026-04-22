import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AtariGoState, AtariGoSettings } from "./state.js";
import { isTerminal } from "./state.js";
import type { Coord } from "../../engines/grid/index.js";
import "./AtariGo.css";

export function AtariGo({ state, dispatch, onGameOver }: GameProps<AtariGoState, AtariGoSettings>): JSX.Element {
  const term = isTerminal(state);
  useEffect(() => { if (term) onGameOver(term.score); }, [term, onGameOver]);

  const isPlayerTurn = state.settings.opponent === "hot-seat" || state.turn === "B";

  function handleClick(c: Coord) {
    if (term || !isPlayerTurn) return;
    dispatch({ type: "place", at: c });
  }

  const turnLabel = state.settings.opponent === "hot-seat"
    ? (state.turn === "B" ? "Black's turn" : "White's turn")
    : (state.turn === "B" ? "Your turn (Black ⚫)" : "Bot thinking…");

  const statusText = term
    ? (state.winner === "B" ? "You win! First capture!" : "Bot wins! First capture!")
    : turnLabel;

  return (
    <div className="atarigo-board">
      <div className="atarigo-status">{statusText}</div>
      <div className="atarigo-info">
        Captured — B: {state.capturedB} | W: {state.capturedW}
      </div>
      <div className="atarigo-grid">
        {[...state.grid.coords()].map(c => {
          const key = `${c.row},${c.col}`;
          const cell = state.grid.get(c);
          return (
            <div
              key={key}
              className="atarigo-cell"
              onClick={() => handleClick(c)}
              data-testid={`cell-${c.row}-${c.col}`}
            >
              {cell === "B" ? "⚫" : cell === "W" ? "⚪" : null}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: "0.8rem", color: "#888" }}>
        First player to capture any opponent stone wins!
      </div>
    </div>
  );
}
