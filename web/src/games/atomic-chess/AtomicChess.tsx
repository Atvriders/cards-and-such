import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AtomicState, AtomicSettings, ChessCoord } from "./state.js";
import type { AtomicAction } from "./state.js";
import { isTerminal, getAtomicLegalMoves } from "./state.js";
import type { PieceType, PieceColor } from "../_chess-core/types.js";
import { idx } from "../_chess-core/types.js";
import "./AtomicChess.css";

const PIECE_UNICODE: Record<PieceColor, Record<string, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

export function AtomicChess({
  state,
  dispatch,
  onGameOver,
}: GameProps<AtomicState, AtomicSettings>): JSX.Element {
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
      const moves = getAtomicLegalMoves(state.board, state.turn, state.enPassantTarget, state.castling)
        .filter((m) => m.from.row === selected.row && m.from.col === selected.col);
      setLegalTargets(new Set(moves.map((m) => `${m.to.row},${m.to.col}`)));
    } else {
      setLegalTargets(new Set());
    }
  }, [selected, state]);

  const isPlayerTurn = state.turn === "white";
  const CELL_SIZE = 60;

  const explosionSet = new Set((state.lastExplosion ?? []).map((c) => `${c.row},${c.col}`));

  function handleCellClick(r: number, c: number) {
    if (terminal || !isPlayerTurn || state.promotionPending) return;
    const coord: ChessCoord = { row: r, col: c };
    const key = `${r},${c}`;

    if (selected && legalTargets.has(key)) {
      dispatch({ type: "move", from: selected, to: coord } as AtomicAction);
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
    const base = isLight ? "atomic-square-light" : "atomic-square-dark";
    const key = `${r},${c}`;
    if (explosionSet.has(key)) return `${base} explosion`;
    if (selected && selected.row === r && selected.col === c) return `${base} selected-source`;
    if (legalTargets.has(key)) return `${base} legal-target`;
    return base;
  }

  let statusText = "";
  let statusClass = "";
  if (state.result === "white") { statusText = "You win! Opponent's king exploded!"; statusClass = "win"; }
  else if (state.result === "black") { statusText = "Bot wins! Your king exploded!"; statusClass = "loss"; }
  else if (state.result === "draw") { statusText = "Draw!"; statusClass = "draw"; }
  else if (isPlayerTurn) { statusText = "Your turn (White)"; }
  else { statusText = "Bot thinking..."; }

  return (
    <div className="atomic-chess">
      <div className="atomic-chess-info">Atomic Chess — Captures cause explosions!</div>
      <div className={`atomic-chess-status ${statusClass}`}>{statusText}</div>

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
                  <span className="atomic-piece">
                    {PIECE_UNICODE[piece.color][piece.type]}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {state.promotionPending && (
        <div className="atomic-promotion-overlay">
          <div className="atomic-promotion-box">
            <h3>Choose promotion piece</h3>
            <div className="atomic-promotion-choices">
              {(["queen", "rook", "bishop", "knight"] as PieceType[]).map((pt) => (
                <button
                  key={pt}
                  className="atomic-promotion-btn"
                  onClick={() => dispatch({ type: "promote", piece: pt as "queen" | "rook" | "bishop" | "knight" } as AtomicAction)}
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
