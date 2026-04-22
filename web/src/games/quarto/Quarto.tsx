import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuartoState, QuartoSettings, Piece } from "./state.js";
import { reducer, isTerminal, pieceAttrs, pieceLabel } from "./state.js";
import "./Quarto.css";

function PieceDisplay({ piece }: { piece: Piece }) {
  const a = pieceAttrs(piece);
  const shape = a.square ? (a.solid ? "■" : "□") : (a.solid ? "●" : "○");
  const sizeLabel = a.tall ? "Tall" : "Short";
  const colorLabel = a.light ? "Lt" : "Dk";
  return (
    <div className="quarto-piece-icon">
      <div className="quarto-piece-shape" style={{ fontSize: a.tall ? "2rem" : "1.3rem", color: a.light ? "#888" : "#222" }}>
        {shape}
      </div>
      <div className="quarto-piece-attrs">{sizeLabel}/{colorLabel}</div>
    </div>
  );
}

export function Quarto({ state, dispatch, onGameOver }: GameProps<QuartoState, QuartoSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  let statusText = "";
  let statusClass = "";

  if (state.gameOver) {
    if (state.winner === "player") { statusText = "You win! Four pieces share an attribute!"; statusClass = "win"; }
    else if (state.winner === "bot") { statusText = "Bot wins!"; statusClass = "loss"; }
    else { statusText = "Draw — all pieces placed, no winner."; statusClass = "draw"; }
  } else if (state.phase === "place") {
    statusText = `Place the piece [${pieceLabel(state.toPlace!)}] on the board.`;
  } else {
    statusText = "Choose a piece for the bot to place.";
  }

  return (
    <div className="quarto">
      <div className={`quarto-status ${statusClass}`}>{statusText}</div>

      {state.toPlace !== null && state.phase === "place" && !state.gameOver && (
        <div className="quarto-to-place">
          <div className="quarto-to-place-label">You must place:</div>
          <PieceDisplay piece={state.toPlace} />
          <div className="quarto-to-place-piece">[{pieceLabel(state.toPlace)}]</div>
        </div>
      )}

      <div className="quarto-board">
        {state.board.map((cell, i) => (
          <div
            key={i}
            className={`quarto-cell ${cell !== null ? "occupied" : ""} ${state.winningLine?.includes(i) ? "winning" : ""} ${state.phase !== "place" || state.gameOver ? "disabled" : ""}`}
            onClick={() => {
              if (state.phase === "place" && !state.gameOver && cell === null) {
                dispatch({ type: "place", cell: i });
              }
            }}
          >
            {cell !== null ? <PieceDisplay piece={cell} /> : ""}
          </div>
        ))}
      </div>

      {state.phase === "choose" && !state.gameOver && (
        <div className="quarto-remaining">
          <div className="quarto-remaining-label">Choose a piece for the bot ({state.remaining.length} remaining):</div>
          <div className="quarto-pieces-grid">
            {state.remaining.map((p) => (
              <button
                key={p}
                className="quarto-piece-btn"
                onClick={() => dispatch({ type: "choose", piece: p })}
              >
                <PieceDisplay piece={p} />
                <span style={{ fontSize: "0.6rem" }}>[{pieceLabel(p)}]</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="quarto-legend">
        T=Tall S=Short | L=Light D=Dark | Q=Square R=Round | S=Solid H=Hollow
      </div>

      {state.gameOver && (
        <button className="quarto-restart" onClick={() => dispatch({ type: "restart" })}>
          Play Again
        </button>
      )}
    </div>
  );
}
