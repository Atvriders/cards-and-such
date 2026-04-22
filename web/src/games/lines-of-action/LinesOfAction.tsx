import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LinesOfActionState, LinesOfActionSettings } from "./state.js";
import { isTerminal, getMoves } from "./state.js";
import type { Coord } from "../../engines/grid/index.js";
import "./LinesOfAction.css";

export function LinesOfAction({ state, dispatch, onGameOver }: GameProps<LinesOfActionState, LinesOfActionSettings>): JSX.Element {
  const term = isTerminal(state);
  useEffect(() => { if (term) onGameOver(term.score); }, [term, onGameOver]);

  const isPlayerTurn = state.settings.opponent === "hot-seat" || state.turn === "W";
  const legalMoves = isPlayerTurn && !term ? getMoves(state.grid, state.turn) : [];
  const selectedMoves = state.selected
    ? legalMoves.filter(m => m.from.row === state.selected!.row && m.from.col === state.selected!.col)
    : [];
  const targets = new Set(selectedMoves.map(m => `${m.to.row},${m.to.col}`));
  const sources = new Set(legalMoves.map(m => `${m.from.row},${m.from.col}`));

  function handleClick(c: Coord) {
    if (term || !isPlayerTurn) return;
    const key = `${c.row},${c.col}`;
    if (state.selected && targets.has(key)) {
      dispatch({ type: "move", from: state.selected, to: c });
      return;
    }
    if (sources.has(key)) dispatch({ type: "select", at: c });
  }

  const turnLabel = state.settings.opponent === "hot-seat"
    ? (state.turn === "W" ? "White's turn" : "Black's turn")
    : (state.turn === "W" ? "Your turn (White ⬜)" : "Bot thinking…");

  const statusText = term
    ? (state.winner === "W" ? "You win!" : state.winner === "B" ? "Bot wins!" : "Game over!")
    : turnLabel;

  return (
    <div className="loa-board">
      <div className="loa-status">{statusText}</div>
      <div className="loa-grid">
        {[...state.grid.coords()].map(c => {
          const key = `${c.row},${c.col}`;
          const cell = state.grid.get(c);
          const isSelected = state.selected?.row === c.row && state.selected?.col === c.col;
          const isTarget = targets.has(key);
          const shade = (c.row + c.col) % 2 === 0 ? "light" : "dark";
          return (
            <div
              key={key}
              className={`loa-cell ${shade}${isSelected ? " selected" : ""}${isTarget ? " target" : ""}`}
              onClick={() => handleClick(c)}
              data-testid={`cell-${c.row}-${c.col}`}
            >
              {cell === "W" ? "⬜" : cell === "B" ? "⬛" : null}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: "0.85rem", color: "#666" }}>
        White: left+right columns. Connect all pieces into one group to win.
      </div>
    </div>
  );
}
