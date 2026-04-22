import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuixoState, QuixoSettings, Dir } from "./state.js";
import { reducer, isTerminal, edgeCells, canSelect, validDirs, SIZE } from "./state.js";
import "./Quixo.css";

const DIR_LABELS: Record<Dir, string> = {
  right: "→ Right",
  left: "← Left",
  up: "↑ Up",
  down: "↓ Down",
};

export function Quixo({ state, dispatch, onGameOver }: GameProps<QuixoState, QuixoSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const edges = edgeCells();
  const availableDirs = state.selected !== null ? validDirs(state.selected) : [];

  let statusText = "Click an edge cell (X or empty) to select, then choose push direction.";
  let statusClass = "";
  if (state.selected !== null) statusText = `Cell selected — choose a direction to push.`;
  if (state.gameOver) {
    if (state.winner === "X") { statusText = "You win! Five X's in a row!"; statusClass = "win"; }
    else { statusText = "Bot wins! Five O's in a row!"; statusClass = "loss"; }
  }

  return (
    <div className="quixo">
      <div className={`quixo-status ${statusClass}`}>{statusText}</div>

      <div className="quixo-grid">
        {state.grid.map((cell, i) => {
          const isEdge = edges.includes(i);
          const isSelectable = isEdge && canSelect(state.grid, i, "X") && !state.gameOver;
          const isSelected = state.selected === i;
          const isWinning = state.winningLine?.includes(i) ?? false;
          const isInner = !isEdge;

          return (
            <div
              key={i}
              className={`quixo-cell ${cell === "X" ? "x" : cell === "O" ? "o" : ""} ${isEdge && !isInner ? "edge" : ""} ${isSelected ? "selected" : ""} ${isWinning ? "winning" : ""} ${isInner ? "inner" : ""}`}
              onClick={() => isSelectable && dispatch({ type: "select", idx: i })}
            >
              {cell ?? (isEdge ? "·" : "")}
            </div>
          );
        })}
      </div>

      {state.selected !== null && !state.gameOver && (
        <div className="quixo-dirs">
          {(["up", "down", "left", "right"] as Dir[]).map((dir) => (
            <button
              key={dir}
              className="quixo-dir-btn"
              disabled={!availableDirs.includes(dir)}
              onClick={() => dispatch({ type: "push", dir })}
            >
              {DIR_LABELS[dir]}
            </button>
          ))}
        </div>
      )}

      {!state.gameOver && state.selected === null && (
        <div className="quixo-hint">You are X. Only edge cells can be selected.</div>
      )}

      {state.gameOver && (
        <button className="quixo-restart" onClick={() => dispatch({ type: "restart" })}>
          Play Again
        </button>
      )}
    </div>
  );
}
