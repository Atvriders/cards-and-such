import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AntichessState, AntichessSettings, ChessCoord, ChessMove } from "./state.js";
import type { AntichessAction } from "./state.js";
import { isTerminal, getLegalMovesForPiece, hasForcedCaptures } from "./state.js";
import type { PieceType, PieceColor } from "../_chess-core/types.js";
import { idx } from "../_chess-core/types.js";
import "./Game.css";

const PIECE_UNICODE: Record<PieceColor, Record<string, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

export function AntichessGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<AntichessState, AntichessSettings>): JSX.Element {
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
  const CELL_SIZE = 60;
  const forcedCapture = isPlayerTurn && hasForcedCaptures(state);
  const wCount = state.board.filter(p => p?.color === "white").length;
  const bCount = state.board.filter(p => p?.color === "black").length;

  function handleClick(r: number, c: number) {
    if (terminal || !isPlayerTurn || state.promotionPending) return;
    const coord: ChessCoord = { row: r, col: c };
    const key = `${r},${c}`;
    if (selected && legalTargets.has(key)) {
      dispatch({ type: "move", from: selected, to: coord } as AntichessAction);
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
    const base = light ? "ac-sq-light" : "ac-sq-dark";
    const key = `${r},${c}`;
    if (selected && selected.row === r && selected.col === c) return `${base} selected-source`;
    if (legalTargets.has(key)) return `${base} legal-target`;
    return base;
  }

  let statusText = "";
  let statusClass = "";
  if (state.result === "white") { statusText = "You win! All your pieces gone!"; statusClass = "win"; }
  else if (state.result === "black") { statusText = "Bot wins! All bot pieces gone!"; statusClass = "loss"; }
  else if (state.result === "draw") { statusText = "Draw!"; statusClass = "draw"; }
  else if (forcedCapture) { statusText = "MUST capture! (forced move)"; statusClass = "check"; }
  else if (isPlayerTurn) { statusText = `Your turn — give away pieces! (${wCount} remaining)`; }
  else { statusText = `Bot thinking... (Bot: ${bCount} pieces)`; }

  return (
    <div className="ac-wrap">
      <div className="ac-info">
        <span>Antichess — give away all pieces to win!</span>
        <span>Your pieces: {wCount} | Bot pieces: {bCount}</span>
      </div>
      <div className={`ac-status ${statusClass}`}>{statusText}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(8, ${CELL_SIZE}px)`, border: "2px solid #555" }}>
        {Array.from({ length: 8 }, (_, r) =>
          Array.from({ length: 8 }, (_, c) => {
            const piece = state.board[idx(r, c)];
            return (
              <div
                key={`${r}-${c}`}
                className={`ac-cell ${squareClass(r, c)}`}
                style={{ width: CELL_SIZE, height: CELL_SIZE, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}
                onClick={() => handleClick(r, c)}
              >
                {piece && <span className="ac-piece">{PIECE_UNICODE[piece.color][piece.type]}</span>}
                {c === 0 && <span style={{ position: "absolute", top: 2, left: 3, fontSize: "0.6rem", color: (r+c)%2===0?"#b58863":"#f0d9b5", fontWeight: "bold" }}>{8-r}</span>}
              </div>
            );
          })
        )}
      </div>
      {state.promotionPending && (
        <div className="ac-promo-overlay">
          <div className="ac-promo-box">
            <h3>Promote pawn (even to King!)</h3>
            <div className="ac-promo-choices">
              {(["queen","rook","bishop","knight","king"] as PieceType[]).map(pt => (
                <button key={pt} className="ac-promo-btn"
                  onClick={() => dispatch({ type: "promote", piece: pt } as AntichessAction)}>
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
