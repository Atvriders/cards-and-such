import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DvonnLiteState, DvonnLiteSettings } from "./state.js";
import { isTerminal, getLegalMoves, getLegalPlaces } from "./state.js";
import type { Coord } from "../../engines/grid/index.js";
import "./DvonnLite.css";

export function DvonnLite({ state, dispatch, onGameOver }: GameProps<DvonnLiteState, DvonnLiteSettings>): JSX.Element {
  const term = isTerminal(state);
  useEffect(() => { if (term) onGameOver(term.score); }, [term, onGameOver]);

  const isPlayerTurn = state.settings.opponent === "hot-seat" || state.turn === "W";

  const legalMoves = state.phase === "movement" && isPlayerTurn && !term ? getLegalMoves(state) : [];
  const selectedMoves = state.selected
    ? legalMoves.filter(m => m.from.row === state.selected!.row && m.from.col === state.selected!.col)
    : [];
  const targets = new Set(selectedMoves.map(m => `${m.to.row},${m.to.col}`));
  const sources = new Set(legalMoves.map(m => `${m.from.row},${m.from.col}`));

  const legalPlaces = state.phase === "placement" && isPlayerTurn && !term ? getLegalPlaces(state) : [];
  const placeSet = new Set(legalPlaces.map(c => `${c.row},${c.col}`));

  function handleClick(c: Coord) {
    if (term || !isPlayerTurn) return;
    const key = `${c.row},${c.col}`;

    if (state.phase === "placement") {
      if (placeSet.has(key)) dispatch({ type: "place", at: c });
      return;
    }

    // Movement
    if (state.selected && targets.has(key)) {
      dispatch({ type: "move", from: state.selected, to: c });
      return;
    }
    if (sources.has(key)) dispatch({ type: "select", at: c });
  }

  const phaseLabel = state.phase === "placement"
    ? `Placement — W: ${state.piecesPlaced.W}/12, B: ${state.piecesPlaced.B}/12`
    : "Movement phase";

  const turnLabel = state.settings.opponent === "hot-seat"
    ? (state.turn === "W" ? "White's turn" : "Black's turn")
    : (state.turn === "W" ? "Your turn (White)" : "Bot thinking…");

  const statusText = term
    ? (state.winner === "W" ? "You win!" : state.winner === "B" ? "Bot wins!" : "Draw!")
    : `${turnLabel} — ${phaseLabel}`;

  return (
    <div className="dvonn-board">
      <div className="dvonn-status">{statusText}</div>
      <div className="dvonn-grid">
        {[...state.grid.coords()].map(c => {
          const key = `${c.row},${c.col}`;
          const stack = state.grid.get(c);
          const isSelected = state.selected?.row === c.row && state.selected?.col === c.col;
          const isTarget = targets.has(key);
          return (
            <div
              key={key}
              className={`dvonn-cell${isSelected ? " selected" : ""}${isTarget ? " target" : ""}${stack?.hasDvonn ? " has-dvonn" : ""}`}
              onClick={() => handleClick(c)}
              data-testid={`cell-${c.row}-${c.col}`}
            >
              {stack ? (
                <>
                  <span className="stack-icon">
                    {stack.top === "W" ? "⬜" : stack.top === "B" ? "⬛" : "🔴"}
                  </span>
                  <span className="stack-height">×{stack.height}{stack.hasDvonn ? "★" : ""}</span>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: "0.8rem", color: "#888" }}>
        Red-bordered = has DVONN piece. Stacks must stay connected to DVONN.
      </div>
    </div>
  );
}
