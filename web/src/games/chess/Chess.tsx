import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChessState, ChessSettings, ChessCoord, ChessMove } from "./state.js";
import type { ChessAction } from "./state.js";
import { isTerminal, getLegalMovesForPiece, isPlayerInCheck, findKing } from "./state.js";
import type { PieceType, PieceColor } from "../_chess-core/types.js";
import { idx } from "../_chess-core/types.js";
import "./Chess.css";

const PIECE_UNICODE: Record<PieceColor, Record<string, string>> = {
  white: {
    king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙",
  },
  black: {
    king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟",
  },
};

export function Chess({
  state,
  dispatch,
  onGameOver,
}: GameProps<ChessState, ChessSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<ChessCoord | null>(null);
  const [legalTargets, setLegalTargets] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    setSelected(null);
    setLegalTargets(new Set());
  }, [state.turn]);

  useEffect(() => {
    if (selected) {
      const moves = getLegalMovesForPiece(state, selected);
      setLegalTargets(new Set(moves.map((m) => `${m.to.row},${m.to.col}`)));
    } else {
      setLegalTargets(new Set());
    }
  }, [selected, state]);

  const isPlayerTurn = state.turn === "white";
  const inCheck = isPlayerTurn && isPlayerInCheck(state);
  const kingPos = inCheck ? findKing(state.board, "white") : null;

  const CELL_SIZE = 60;

  function handleCellClick(r: number, c: number) {
    if (terminal || !isPlayerTurn || state.promotionPending) return;
    const coord: ChessCoord = { row: r, col: c };
    const key = `${r},${c}`;

    if (selected && legalTargets.has(key)) {
      dispatch({ type: "move", from: selected, to: coord } as ChessAction);
      setSelected(null);
      setLegalTargets(new Set());
      return;
    }

    const piece = state.board[idx(r, c)];
    if (piece && piece.color === "white") {
      setSelected(coord);
    } else {
      setSelected(null);
      setLegalTargets(new Set());
    }
  }

  function getSquareClass(r: number, c: number): string {
    const isLight = (r + c) % 2 === 0;
    const base = isLight ? "chess-square-light" : "chess-square-dark";
    const key = `${r},${c}`;
    const isSelected = selected && selected.row === r && selected.col === c;
    const isTarget = legalTargets.has(key);
    const isKingInCheck = kingPos && kingPos.row === r && kingPos.col === c;

    if (isKingInCheck) return `${base} in-check`;
    if (isSelected) return `${base} selected-source`;
    if (isTarget) return `${base} legal-target`;
    return base;
  }

  let statusText = "";
  let statusClass = "";
  if (state.result === "white") { statusText = "You win! (Checkmate)"; statusClass = "win"; }
  else if (state.result === "black") { statusText = "Bot wins! (Checkmate)"; statusClass = "loss"; }
  else if (state.result === "draw") { statusText = "Draw!"; statusClass = "draw"; }
  else if (inCheck) { statusText = "Check! Your king is in danger."; statusClass = "check"; }
  else if (isPlayerTurn) { statusText = "Your turn (White)"; }
  else { statusText = "Bot thinking..."; }

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  return (
    <div className="chess">
      <div className="chess-info">
        <span>Chess</span>
        <span>You: White | Bot: Black ({state.settings.opponent})</span>
      </div>

      <div className={`chess-status ${statusClass}`}>{statusText}</div>

      <div className="chess-board-wrap">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(8, ${CELL_SIZE}px)`,
            border: "2px solid #555",
          }}
        >
          {Array.from({ length: 8 }, (_, r) =>
            Array.from({ length: 8 }, (_, c) => {
              const piece = state.board[idx(r, c)];
              return (
                <div
                  key={`${r}-${c}`}
                  className={`cell ${getSquareClass(r, c)}`}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={() => handleCellClick(r, c)}
                >
                  {piece && (
                    <span className="chess-piece">
                      {PIECE_UNICODE[piece.color][piece.type]}
                    </span>
                  )}
                  {c === 0 && (
                    <span style={{ position: "absolute", top: 2, left: 3, fontSize: "0.6rem", color: (r + c) % 2 === 0 ? "#b58863" : "#f0d9b5", fontWeight: "bold" }}>
                      {8 - r}
                    </span>
                  )}
                  {r === 7 && (
                    <span style={{ position: "absolute", bottom: 2, right: 3, fontSize: "0.6rem", color: (r + c) % 2 === 0 ? "#b58863" : "#f0d9b5", fontWeight: "bold" }}>
                      {files[c]}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {state.promotionPending && (
        <div className="chess-promotion-overlay">
          <div className="chess-promotion-box">
            <h3>Choose promotion piece</h3>
            <div className="chess-promotion-choices">
              {(["queen", "rook", "bishop", "knight"] as PieceType[]).map((pt) => (
                <button
                  key={pt}
                  className="chess-promotion-btn"
                  onClick={() => dispatch({ type: "promote", piece: pt as "queen" | "rook" | "bishop" | "knight" } as ChessAction)}
                >
                  {PIECE_UNICODE["white"][pt]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
