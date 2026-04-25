import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HordeState, HordeSettings, ChessCoord, ChessMove } from "./state.js";
import type { HordeAction } from "./state.js";
import { isTerminal, getLegalMovesForPiece, findKing } from "./state.js";
import type { PieceType, PieceColor } from "../_chess-core/types.js";
import { idx } from "../_chess-core/types.js";
import "./Game.css";

const PIECE_UNICODE: Record<PieceColor, Record<string, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

export function HordeGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<HordeState, HordeSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<ChessCoord | null>(null);
  const [legalTargets, setLegalTargets] = useState<Set<string>>(new Set());

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  useEffect(() => { setSelected(null); setLegalTargets(new Set()); }, [state.turn]);
  useEffect(() => {
    if (selected) {
      const moves = getLegalMovesForPiece(state, selected);
      setLegalTargets(new Set(moves.map((m: ChessMove) => `${m.to.row},${m.to.col}`)));
    } else {
      setLegalTargets(new Set());
    }
  }, [selected, state]);

  const isPlayerTurn = state.turn === "white";
  const CELL_SIZE = 58;

  const whitePawns = state.board.filter(p => p?.color === "white").length;
  const bKing = findKing(state.board, "black");

  function handleClick(r: number, c: number) {
    if (terminal || !isPlayerTurn || state.promotionPending) return;
    const coord: ChessCoord = { row: r, col: c };
    const key = `${r},${c}`;
    if (selected && legalTargets.has(key)) {
      dispatch({ type: "move", from: selected, to: coord } as HordeAction);
      setSelected(null);
      setLegalTargets(new Set());
      return;
    }
    const piece = state.board[idx(r, c)];
    if (piece && piece.color === "white") setSelected(coord);
    else { setSelected(null); setLegalTargets(new Set()); }
  }

  function squareClass(r: number, c: number): string {
    const light = (r + c) % 2 === 0;
    const base = light ? "hd-sq-light" : "hd-sq-dark";
    const key = `${r},${c}`;
    if (bKing && bKing.row === r && bKing.col === c) return `${base} hd-bking`;
    if (selected && selected.row === r && selected.col === c) return `${base} selected-source`;
    if (legalTargets.has(key)) return `${base} legal-target`;
    return base;
  }

  let statusText = "";
  let statusClass = "";
  if (state.result === "white") { statusText = "Horde wins! Black king checkmated!"; statusClass = "win"; }
  else if (state.result === "black") { statusText = "Black survives! All horde pawns captured!"; statusClass = "loss"; }
  else if (state.result === "draw") { statusText = "Draw!"; statusClass = "draw"; }
  else if (isPlayerTurn) { statusText = `Your turn (White Horde) — ${whitePawns} pieces remain`; }
  else { statusText = "Bot thinking..."; }

  return (
    <div className="hd-wrap">
      <div className="hd-info">
        <span>Horde Chess — overwhelm with pawns!</span>
        <span>Horde pieces: {whitePawns}</span>
      </div>
      <div className={`hd-status ${statusClass}`}>{statusText}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(8, ${CELL_SIZE}px)`, border: "2px solid #555" }}>
        {Array.from({ length: 8 }, (_, r) =>
          Array.from({ length: 8 }, (_, c) => {
            const piece = state.board[idx(r, c)];
            return (
              <div
                key={`${r}-${c}`}
                className={`hd-cell ${squareClass(r, c)}`}
                style={{ width: CELL_SIZE, height: CELL_SIZE, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}
                onClick={() => handleClick(r, c)}
              >
                {piece && <span className="hd-piece">{PIECE_UNICODE[piece.color][piece.type]}</span>}
              </div>
            );
          })
        )}
      </div>
      {state.promotionPending && (
        <div className="hd-promo-overlay">
          <div className="hd-promo-box">
            <h3>Promote pawn!</h3>
            <div className="hd-promo-choices">
              {(["queen","rook","bishop","knight"] as PieceType[]).map(pt => (
                <button key={pt} className="hd-promo-btn"
                  onClick={() => dispatch({ type: "promote", piece: pt as "queen"|"rook"|"bishop"|"knight" } as HordeAction)}>
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
