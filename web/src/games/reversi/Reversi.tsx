import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ReversiState, ReversiSettings, Cell } from "./state.js";
import type { ReversiAction } from "./state.js";
import { isTerminal, legalMoves, flipsFor } from "./state.js";
import { Board } from "../../engines/grid/Board.js";
import type { Coord } from "../../engines/grid/index.js";
import "./Reversi.css";

export function Reversi({
  state,
  dispatch,
  onGameOver,
}: GameProps<ReversiState, ReversiSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const humanSeat = 0;
  const isHumanTurn = state.turn === humanSeat && state.winner === null;
  const legal = isHumanTurn ? legalMoves(state.grid, humanSeat) : [];
  const legalSet = new Set(legal.map((c) => `${c.row},${c.col}`));

  function handleCellClick(c: Coord) {
    if (!isHumanTurn) return;
    if (legalSet.has(`${c.row},${c.col}`)) {
      dispatch({ type: "place", at: c } as ReversiAction);
    }
  }

  function renderCell(c: Coord, value: Cell): React.ReactNode {
    if (value === 0) return <div className="reversi-disc black" />;
    if (value === 1) return <div className="reversi-disc white" />;
    if (legalSet.has(`${c.row},${c.col}`)) {
      return <div className="reversi-legal-dot" />;
    }
    return null;
  }

  const humanHasNoMoves = isHumanTurn && legal.length === 0;

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) {
    statusText = "You win! (Black)";
    statusClass = "win";
  } else if (state.winner === 1) {
    statusText = "Bot wins! (White)";
    statusClass = "loss";
  } else if (state.winner === "draw") {
    statusText = "Draw!";
    statusClass = "draw";
  } else if (state.turn === 0) {
    statusText = humanHasNoMoves ? "No legal moves — pass" : "Your turn (Black)";
  } else {
    statusText = "Bot thinking... (White)";
  }

  return (
    <div className="reversi">
      <div className="reversi-info">
        <span>Bot: {state.settings.botDifficulty}</span>
        <span>Moves: {state.movesMade}</span>
      </div>

      <div className="reversi-counts">
        <span className="reversi-count-black">⬤ Black: {state.blackCount}</span>
        <span className="reversi-count-white">⬤ White: {state.whiteCount}</span>
      </div>

      <div className={`reversi-status ${statusClass}`}>{statusText}</div>

      <div className="reversi-board-wrap">
        <Board
          grid={state.grid}
          cellSize={56}
          renderCell={renderCell}
          onCellClick={handleCellClick}
          highlight={legal}
        />
      </div>

      {humanHasNoMoves && state.winner === null && (
        <button
          onClick={() => dispatch({ type: "pass" } as ReversiAction)}
          style={{
            padding: "8px 24px",
            fontSize: "1rem",
            cursor: "pointer",
            borderRadius: "4px",
            background: "#555",
            color: "#fff",
            border: "none",
          }}
        >
          Pass
        </button>
      )}
    </div>
  );
}
