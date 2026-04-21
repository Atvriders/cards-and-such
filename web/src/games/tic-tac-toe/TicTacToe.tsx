import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TTTState, TTTSettings } from "./state.js";
import type { TTTAction } from "./state.js";
import { reducer, isTerminal } from "./state.js";
import { Board } from "../../engines/grid/Board.js";
import type { Coord } from "../../engines/grid/index.js";
import "./TicTacToe.css";

export function TicTacToe({
  state,
  dispatch,
  onGameOver,
}: GameProps<TTTState, TTTSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  function handleCellClick(c: Coord) {
    if (terminal) return;
    dispatch({ type: "place", at: c } as TTTAction);
  }

  function renderCell(c: Coord, value: "X" | "O" | null): React.ReactNode {
    if (!value) return null;
    return (
      <span className={value === "X" ? "tictactoe-cell-x" : "tictactoe-cell-o"}>
        {value}
      </span>
    );
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === "X") {
    statusText = state.settings.opponent === "bot" ? "You win!" : "X wins!";
    statusClass = "win";
  } else if (state.winner === "O") {
    statusText = state.settings.opponent === "bot" ? "Bot wins!" : "O wins!";
    statusClass = "loss";
  } else if (state.winner === "draw") {
    statusText = "Draw!";
    statusClass = "draw";
  } else {
    statusText =
      state.settings.opponent === "bot"
        ? state.turn === "X"
          ? "Your turn (X)"
          : "Bot thinking..."
        : `${state.turn}'s turn`;
  }

  return (
    <div className="tictactoe">
      <div className="tictactoe-info">
        <span>
          {state.grid.rows}×{state.grid.cols} — {state.settings.winLength} in a row to win
        </span>
        <span>{state.settings.opponent === "bot" ? `Bot: ${state.settings.botStrength}` : "Hot Seat"}</span>
      </div>

      <div className={`tictactoe-status ${statusClass}`}>{statusText}</div>

      <div className="tictactoe-board-wrap">
        <Board
          grid={state.grid}
          cellSize={80}
          renderCell={renderCell}
          onCellClick={handleCellClick}
          {...(state.winningLine ? { highlight: state.winningLine } : {})}
        />
      </div>
    </div>
  );
}
