import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SuicideState, SuicideSettings, ChessCoord } from "./state.js";
import type { SuicideAction } from "./state.js";
import { isTerminal, getSuicideLegalMoves } from "./state.js";
import type { PieceType, PieceColor } from "../_chess-core/types.js";
import { idx } from "../_chess-core/types.js";
import "./SuicideChess.css";

const PIECE_UNICODE: Record<PieceColor, Record<string, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

export function SuicideChess({
  state,
  dispatch,
  onGameOver,
}: GameProps<SuicideState, SuicideSettings>): JSX.Element {
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
      const moves = getSuicideLegalMoves(state.board, state.turn, state.enPassantTarget)
        .filter((m) => m.from.row === selected.row && m.from.col === selected.col);
      setLegalTargets(new Set(moves.map((m) => `${m.to.row},${m.to.col}`)));
    } else {
      setLegalTargets(new Set());
    }
  }, [selected, state]);

  const isPlayerTurn = state.turn === "white";
  const allMoves = isPlayerTurn ? getSuicideLegalMoves(state.board, state.turn, state.enPassantTarget) : [];
  const hasCaptures = allMoves.some((m) => m.capturedPiece || m.isEnPassant);

  const CELL_SIZE = 60;

  function handleCellClick(r: number, c: number) {
    if (terminal || !isPlayerTurn || state.promotionPending) return;
    const coord: ChessCoord = { row: r, col: c };
    const key = `${r},${c}`;

    if (selected && legalTargets.has(key)) {
      dispatch({ type: "move", from: selected, to: coord } as SuicideAction);
      setSelected(null);
      return;
    }

    const piece = state.board[idx(r, c)];
    if (piece && piece.color === "white") {
      setSelected(coord);
    } else {
      setSelected(null);
    }
  }

  function getSquareClass(r: number, c: number): string {
    const isLight = (r + c) % 2 === 0;
    const base = isLight ? "suicide-square-light" : "suicide-square-dark";
    const key = `${r},${c}`;
    const isSelected = selected && selected.row === r && selected.col === c;
    const isTarget = legalTargets.has(key);
    // Highlight squares that must be captured from (if mandatory capture)
    const piece = state.board[idx(r, c)];
    const isMustCapture = hasCaptures && piece && piece.color === "white" &&
      allMoves.some((m) => m.from.row === r && m.from.col === c && (m.capturedPiece || m.isEnPassant));

    if (isSelected) return `${base} selected-source`;
    if (isTarget) return `${base} legal-target`;
    if (isMustCapture) return `${base} must-capture`;
    return base;
  }

  let statusText = "";
  let statusClass = "";
  if (state.result === "white") { statusText = "You win! Lost all your pieces first!"; statusClass = "win"; }
  else if (state.result === "black") { statusText = "Bot wins! It lost all pieces first."; statusClass = "loss"; }
  else if (state.result === "draw") { statusText = "Draw!"; statusClass = "draw"; }
  else if (isPlayerTurn) {
    statusText = hasCaptures ? "Your turn — capture is MANDATORY!" : "Your turn (White)";
  } else {
    statusText = "Bot thinking...";
  }

  return (
    <div className="suicide-chess">
      <div className="suicide-chess-info">Suicide Chess — Lose all your pieces to win!</div>
      <div className={`suicide-chess-status ${statusClass}`}>{statusText}</div>

      <div style={{ position: "relative" }}>
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
                  }}
                  onClick={() => handleCellClick(r, c)}
                >
                  {piece && (
                    <span className="suicide-piece">
                      {PIECE_UNICODE[piece.color][piece.type]}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {state.promotionPending && (
        <div className="suicide-promotion-overlay">
          <div className="suicide-promotion-box">
            <h3>Choose promotion piece</h3>
            <div className="suicide-promotion-choices">
              {(["queen", "rook", "bishop", "knight"] as PieceType[]).map((pt) => (
                <button
                  key={pt}
                  className="suicide-promotion-btn"
                  onClick={() => dispatch({ type: "promote", piece: pt as "queen" | "rook" | "bishop" | "knight" } as SuicideAction)}
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
