import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrazyhouseState, CrazyhouseSettings, ChessCoord, CrazyMoveOrDrop } from "./state.js";
import type { CrazyhouseAction } from "./state.js";
import { isTerminal, getLegalMovesForPiece, getDropTargets, isPlayerInCheck, findKing } from "./state.js";
import type { PieceType, PieceColor } from "../_chess-core/types.js";
import { idx } from "../_chess-core/types.js";
import "./Game.css";

const PIECE_UNICODE: Record<PieceColor, Record<string, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

const PIECE_TYPES: PieceType[] = ["queen", "rook", "bishop", "knight", "pawn"];

export function CrazyhouseGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<CrazyhouseState, CrazyhouseSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<ChessCoord | null>(null);
  const [legalTargets, setLegalTargets] = useState<Set<string>>(new Set());

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  useEffect(() => { setSelected(null); setLegalTargets(new Set()); }, [state.turn]);
  useEffect(() => {
    if (state.selectedDrop) {
      const targets = getDropTargets(state, state.selectedDrop);
      setLegalTargets(new Set(targets.map(t => `${t.row},${t.col}`)));
      setSelected(null);
    } else if (selected) {
      const moves = getLegalMovesForPiece(state, selected);
      setLegalTargets(new Set(moves
        .filter((m): m is Extract<CrazyMoveOrDrop, { type: "move" }> => m.type === "move")
        .map(m => `${m.to.row},${m.to.col}`)));
    } else {
      setLegalTargets(new Set());
    }
  }, [selected, state, state.selectedDrop]);

  const isPlayerTurn = state.turn === "white";
  const inCheck = isPlayerTurn && isPlayerInCheck(state);
  const kingPos = inCheck ? findKing(state.board, "white") : null;
  const CELL_SIZE = 58;

  function handleClick(r: number, c: number) {
    if (terminal || !isPlayerTurn || state.promotionPending) return;
    const coord: ChessCoord = { row: r, col: c };
    const key = `${r},${c}`;

    if (state.selectedDrop && legalTargets.has(key)) {
      dispatch({ type: "drop", piece: state.selectedDrop, to: coord } as CrazyhouseAction);
      return;
    }

    if (selected && legalTargets.has(key)) {
      dispatch({ type: "move", from: selected, to: coord } as CrazyhouseAction);
      setSelected(null);
      setLegalTargets(new Set());
      return;
    }

    const piece = state.board[idx(r, c)];
    if (piece && piece.color === "white") {
      dispatch({ type: "selectDrop", piece: null } as CrazyhouseAction);
      setSelected(coord);
    } else {
      dispatch({ type: "selectDrop", piece: null } as CrazyhouseAction);
      setSelected(null);
      setLegalTargets(new Set());
    }
  }

  function squareClass(r: number, c: number): string {
    const light = (r + c) % 2 === 0;
    const base = light ? "ch-sq-light" : "ch-sq-dark";
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
  else if (inCheck) { statusText = "Check!"; statusClass = "check"; }
  else if (state.selectedDrop) { statusText = `Drop ${state.selectedDrop} — click a square`; statusClass = "drop"; }
  else if (isPlayerTurn) { statusText = "Your turn (White)"; }
  else { statusText = "Bot thinking..."; }

  const whitePocket = state.pockets.white;
  const blackPocket = state.pockets.black;

  return (
    <div className="ch-wrap">
      <div className="ch-info">
        <span>Crazyhouse</span>
        <span>You: White | Bot: Black ({state.settings.opponent})</span>
      </div>

      {/* Black's pocket (bot captured pieces shown for info) */}
      <div className="ch-pocket ch-pocket-black">
        <span className="ch-pocket-label">Bot pocket:</span>
        {PIECE_TYPES.map(pt => (
          (blackPocket[pt] ?? 0) > 0 ? (
            <span key={pt} className="ch-pocket-piece">{PIECE_UNICODE["black"][pt]}×{blackPocket[pt]}</span>
          ) : null
        ))}
      </div>

      <div className={`ch-status ${statusClass}`}>{statusText}</div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(8, ${CELL_SIZE}px)`, border: "2px solid #555" }}>
        {Array.from({ length: 8 }, (_, r) =>
          Array.from({ length: 8 }, (_, c) => {
            const piece = state.board[idx(r, c)];
            return (
              <div
                key={`${r}-${c}`}
                className={`ch-cell ${squareClass(r, c)}`}
                style={{ width: CELL_SIZE, height: CELL_SIZE, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}
                onClick={() => handleClick(r, c)}
              >
                {piece && <span className="ch-piece">{PIECE_UNICODE[piece.color][piece.type]}</span>}
                {c === 0 && <span style={{ position: "absolute", top: 2, left: 3, fontSize: "0.6rem", color: (r+c)%2===0?"#b58863":"#f0d9b5", fontWeight: "bold" }}>{8-r}</span>}
              </div>
            );
          })
        )}
      </div>

      {/* White's pocket (player can drop) */}
      <div className="ch-pocket ch-pocket-white">
        <span className="ch-pocket-label">Your pocket (click to drop):</span>
        {isPlayerTurn && PIECE_TYPES.map(pt => (
          (whitePocket[pt] ?? 0) > 0 ? (
            <button
              key={pt}
              className={`ch-pocket-btn ${state.selectedDrop === pt ? "selected" : ""}`}
              onClick={() => dispatch({ type: "selectDrop", piece: state.selectedDrop === pt ? null : pt } as CrazyhouseAction)}
            >
              {PIECE_UNICODE["white"][pt]}×{whitePocket[pt]}
            </button>
          ) : null
        ))}
        {!isPlayerTurn && PIECE_TYPES.map(pt => (
          (whitePocket[pt] ?? 0) > 0 ? (
            <span key={pt} className="ch-pocket-piece">{PIECE_UNICODE["white"][pt]}×{whitePocket[pt]}</span>
          ) : null
        ))}
      </div>

      {state.promotionPending && (
        <div className="ch-promo-overlay">
          <div className="ch-promo-box">
            <h3>Promote pawn</h3>
            <div className="ch-promo-choices">
              {(["queen","rook","bishop","knight"] as PieceType[]).map(pt => (
                <button key={pt} className="ch-promo-btn"
                  onClick={() => dispatch({ type: "promote", piece: pt as "queen"|"rook"|"bishop"|"knight" } as CrazyhouseAction)}>
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
