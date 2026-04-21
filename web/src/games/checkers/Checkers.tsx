import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CheckersState, CheckersSettings, Piece } from "./state.js";
import type { CheckersAction } from "./state.js";
import { isTerminal, getLegalMoves } from "./state.js";
import { Board } from "../../engines/grid/Board.js";
import type { Coord } from "../../engines/grid/index.js";
import "./Checkers.css";

export function Checkers({
  state,
  dispatch,
  onGameOver,
}: GameProps<CheckersState, CheckersSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<Coord | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Reset selection when turn changes
  useEffect(() => {
    setSelected(null);
  }, [state.turn, state.mustContinueFrom]);

  const isPlayerTurn =
    state.settings.opponent === "hot-seat" || state.turn === "red";

  const legalMoves = isPlayerTurn && !terminal
    ? getLegalMoves(
        state.grid,
        state.turn,
        state.settings.mandatoryCapture,
        state.mustContinueFrom,
      )
    : [];

  const selectedMoves = selected
    ? legalMoves.filter(
        (m) => m.from.row === selected.row && m.from.col === selected.col,
      )
    : [];

  const legalTargets = new Set(
    selectedMoves.map((m) => `${m.to.row},${m.to.col}`),
  );

  const legalSources = new Set(
    legalMoves.map((m) => `${m.from.row},${m.from.col}`),
  );

  function handleCellClick(c: Coord) {
    if (terminal || !isPlayerTurn) return;

    const key = `${c.row},${c.col}`;

    // If clicking a legal target and we have a source selected, dispatch move
    if (selected && legalTargets.has(key)) {
      dispatch({ type: "move", from: selected, to: c } as CheckersAction);
      setSelected(null);
      return;
    }

    // If mustContinueFrom is set, only that piece can be selected
    if (state.mustContinueFrom) {
      const mcf = state.mustContinueFrom;
      if (c.row === mcf.row && c.col === mcf.col) {
        setSelected(c);
      }
      return;
    }

    // Select a piece that has legal moves
    if (legalSources.has(key)) {
      const piece = state.grid.get(c);
      if (piece && piece.color === state.turn) {
        setSelected(c);
        return;
      }
    }

    // Deselect
    setSelected(null);
  }

  function renderCell(c: Coord, value: Piece | null): React.ReactNode {
    if (!value) return null;
    const isKing = value.king;
    return (
      <div className={`checkers-piece ${value.color}`}>
        {isKing ? "♛" : ""}
      </div>
    );
  }

  function getCellClass(c: Coord): string {
    const isDark = (c.row + c.col) % 2 === 1;
    const key = `${c.row},${c.col}`;
    const isSelected =
      selected && selected.row === c.row && selected.col === c.col;
    const isMustContinue =
      state.mustContinueFrom &&
      state.mustContinueFrom.row === c.row &&
      state.mustContinueFrom.col === c.col;

    const classes = [isDark ? "dark-square" : "light-square"];
    if (isSelected) classes.push("selected-source");
    else if (legalTargets.has(key)) classes.push("legal-target");
    if (isMustContinue) classes.push("must-continue");
    return classes.join(" ");
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === "red") {
    statusText =
      state.settings.opponent === "bot" ? "You win!" : "Red wins!";
    statusClass = "win";
  } else if (state.winner === "black") {
    statusText =
      state.settings.opponent === "bot" ? "Bot wins!" : "Black wins!";
    statusClass = "loss";
  } else if (state.mustContinueFrom) {
    statusText = "Continue jumping!";
  } else {
    statusText =
      state.settings.opponent === "bot"
        ? state.turn === "red"
          ? "Your turn (Red)"
          : "Bot thinking..."
        : `${state.turn === "red" ? "Red" : "Black"}'s turn`;
  }

  // Custom board render that adds per-cell CSS classes
  const highlightCoords = selected ? selectedMoves.map((m) => m.to) : undefined;

  return (
    <div className="checkers">
      <div className="checkers-info">
        <span>American Checkers</span>
        <span>
          {state.settings.mandatoryCapture ? "Mandatory capture" : "Optional capture"}
        </span>
        <span>
          {state.settings.opponent === "bot"
            ? `Bot depth: ${state.settings.botDepth}`
            : "Hot Seat"}
        </span>
      </div>

      <div className={`checkers-status ${statusClass}`}>{statusText}</div>

      <div className="checkers-board-wrap">
        <Board
          grid={state.grid}
          cellSize={56}
          renderCell={(c, v) => {
            // Inject cell class via a wrapper trick
            return (
              <div
                className={getCellClass(c)}
                style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {renderCell(c, v)}
              </div>
            );
          }}
          onCellClick={handleCellClick}
          {...(highlightCoords ? { highlight: highlightCoords } : {})}
        />
      </div>
    </div>
  );
}
