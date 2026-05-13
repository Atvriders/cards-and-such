import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ProgressiveState, ProgressiveSettings, ChessCoord, ChessMove } from "./state.js";
import type { ProgressiveAction } from "./state.js";
import { isTerminal, getLegalMovesForPiece, isPlayerInCheck, findKing } from "./state.js";
import type { PieceType, PieceColor } from "../_chess-core/types.js";
import { idx } from "../_chess-core/types.js";
import "./Game.css";

const PIECE_UNICODE: Record<PieceColor, Record<string, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

export function ProgressiveChessGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<ProgressiveState, ProgressiveSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<ChessCoord | null>(null);
  const [legalTargets, setLegalTargets] = useState<Set<string>>(new Set());

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  useEffect(() => { setSelected(null); setLegalTargets(new Set()); }, [state.movesInSeries, state.turn]);
  useEffect(() => {
    if (selected) {
      const moves = getLegalMovesForPiece(state, selected);
      setLegalTargets(new Set(moves.map((m: ChessMove) => `${m.to.row},${m.to.col}`)));
    } else {
      setLegalTargets(new Set());
    }
  }, [selected, state]);

  const isPlayerTurn = state.turn === "white";
  const inCheck = isPlayerTurn && isPlayerInCheck(state);
  const kingPos = inCheck ? findKing(state.board, "white") : null;
  const CELL_SIZE = 60;

  const movesRemaining = state.seriesNumber - state.movesInSeries;

  function handleClick(r: number, c: number) {
    if (terminal || !isPlayerTurn || state.promotionPending) return;
    const coord: ChessCoord = { row: r, col: c };
    const key = `${r},${c}`;
    if (selected && legalTargets.has(key)) {
      dispatch({ type: "move", from: selected, to: coord } as ProgressiveAction);
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
    const base = light ? "pg-sq-light" : "pg-sq-dark";
    const key = `${r},${c}`;
    if (kingPos && kingPos.row === r && kingPos.col === c) return `${base} in-check`;
    if (selected && selected.row === r && selected.col === c) return `${base} selected-source`;
    if (legalTargets.has(key)) return `${base} legal-target`;
    return base;
  }

  let statusText = "";
  let statusClass = "";
  if (state.result === "white") { statusText = "You win!"; statusClass = "win"; }
  else if (state.result === "black") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.result === "draw") { statusText = "Draw!"; statusClass = "draw"; }
  else if (inCheck) { statusText = "Check! Escape on your first move!"; statusClass = "check"; }
  else if (isPlayerTurn) { statusText = `Your turn — ${movesRemaining} move${movesRemaining !== 1 ? "s" : ""} remaining in series ${state.seriesNumber}`; }
  else { statusText = `Bot's ${state.seriesNumber}-move series...`; }

  // Progress dots
  const seriesDots = Array.from({ length: state.seriesNumber }, (_, i) => (
    <span key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: i < state.movesInSeries ? "#27ae60" : "#ddd", display: "inline-block", margin: "0 2px" }} />
  ));

  return (
    <div className="pg-wrap fade-in">
      <div className="pg-info">
        <span>Progressive Chess</span>
        <span>You: White | Bot: Black ({state.settings.opponent})</span>
      </div>
      <div className="pg-series-info">
        <span>Series {state.seriesNumber}: </span>
        {seriesDots}
        <span> ({state.movesInSeries}/{state.seriesNumber} moves made)</span>
      </div>
      <div className={`pg-status ${statusClass}`}>{statusText}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(8, ${CELL_SIZE}px)`, border: "2px solid #555" }}>
        {Array.from({ length: 8 }, (_, r) =>
          Array.from({ length: 8 }, (_, c) => {
            const piece = state.board[idx(r, c)];
            return (
              <div
                key={`${r}-${c}`}
                className={`pg-cell ${squareClass(r, c)}`}
                style={{ width: CELL_SIZE, height: CELL_SIZE, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}
                onClick={() => handleClick(r, c)}
              >
                {piece && <span className="pg-piece">{PIECE_UNICODE[piece.color][piece.type]}</span>}
                {c === 0 && <span style={{ position: "absolute", top: 2, left: 3, fontSize: "0.6rem", color: (r+c)%2===0?"#b58863":"#f0d9b5", fontWeight: "bold" }}>{8-r}</span>}
              </div>
            );
          })
        )}
      </div>
      {state.promotionPending && (
        <div className="pg-promo-overlay">
          <div className="pg-promo-box">
            <h3>Promote pawn</h3>
            <div className="pg-promo-choices">
              {(["queen","rook","bishop","knight"] as PieceType[]).map(pt => (
                <button key={pt} className="pg-promo-btn"
                  onClick={() => dispatch({ type: "promote", piece: pt as "queen"|"rook"|"bishop"|"knight" } as ProgressiveAction)}>
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
