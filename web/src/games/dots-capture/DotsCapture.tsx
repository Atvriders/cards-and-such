import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DotsCaptureState, DotsCaptureSettings } from "./state.js";
import { isTerminal } from "./state.js";
import type { Coord } from "../../engines/grid/index.js";
import { neighbors4 } from "../../engines/grid/index.js";
import "./DotsCapture.css";

function isCaptured(state: DotsCaptureState, c: Coord): boolean {
  const v = state.grid.get(c);
  if (!v) return false;
  const opp = v === "W" ? "B" : "W";
  return neighbors4(c).every(n => !state.grid.inBounds(n) || state.grid.get(n) === opp);
}

export function DotsCapture({ state, dispatch, onGameOver }: GameProps<DotsCaptureState, DotsCaptureSettings>): JSX.Element {
  const term = isTerminal(state);
  useEffect(() => { if (term) onGameOver(term.score); }, [term, onGameOver]);

  const isPlayerTurn = state.settings.opponent === "hot-seat" || state.turn === "W";

  function handleClick(c: Coord) {
    if (term || !isPlayerTurn || state.turnsLeft <= 0) return;
    dispatch({ type: "place", at: c });
  }

  const turnLabel = state.settings.opponent === "hot-seat"
    ? (state.turn === "W" ? "White's turn" : "Black's turn")
    : (state.turn === "W" ? "Your turn (White ⬜)" : "Bot thinking…");

  let statusText = term
    ? (state.winner === "W" ? "You win!" : state.winner === "B" ? "Bot wins!" : "Draw!")
    : `${turnLabel} — ${state.turnsLeft} turns left`;

  if (term && state.finalScore) {
    statusText += ` (W: ${state.finalScore.W} | B: ${state.finalScore.B})`;
  }

  return (
    <div className="dots-board">
      <div className="dots-status">{statusText}</div>
      <div className="dots-grid">
        {[...state.grid.coords()].map(c => {
          const k = `${c.row},${c.col}`;
          const cell = state.grid.get(c);
          const cap = cell && isCaptured(state, c);
          return (
            <div
              key={k}
              className={`dots-cell${cap ? (cell === "W" ? " captured-w" : " captured-b") : ""}`}
              onClick={() => handleClick(c)}
              data-testid={`cell-${c.row}-${c.col}`}
            >
              {cell === "W" ? "⬜" : cell === "B" ? "⬛" : null}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: "0.8rem", color: "#aaa" }}>
        Faded dots are surrounded (captured). Score = dots − captured + opponent captured.
      </div>
    </div>
  );
}
