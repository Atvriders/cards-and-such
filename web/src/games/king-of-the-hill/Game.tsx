import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KothState, KothSettings, ChessCoord, ChessMove } from "./state.js";
import type { KothAction } from "./state.js";
import { isTerminal, getLegalMovesForPiece, isPlayerInCheck, findKing, CENTER_SQUARES } from "./state.js";
import type { PieceType, PieceColor } from "../_chess-core/types.js";
import { idx } from "../_chess-core/types.js";
import "./Game.css";

const PIECE_UNICODE: Record<PieceColor, Record<string, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

export function KothGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<KothState, KothSettings>): JSX.Element {
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
  const inCheck = isPlayerTurn && isPlayerInCheck(state);
  const kingPos = inCheck ? findKing(state.board, "white") : null;
  const CELL_SIZE = 60;

  function handleClick(r: number, c: number) {
    if (terminal || !isPlayerTurn || state.promotionPending) return;
    const coord: ChessCoord = { row: r, col: c };
    const key = `${r},${c}`;
    if (selected && legalTargets.has(key)) {
      dispatch({ type: "move", from: selected, to: coord } as KothAction);
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
    const base = light ? "kh-sq-light" : "kh-sq-dark";
    const key = `${r},${c}`;
    const isCenter = CENTER_SQUARES.has(key);
    if (isCenter) {
      if (kingPos && kingPos.row === r && kingPos.col === c) return `kh-sq-center in-check`;
      if (selected && selected.row === r && selected.col === c) return `kh-sq-center selected-source`;
      if (legalTargets.has(key)) return `kh-sq-center legal-target`;
      return "kh-sq-center";
    }
    if (kingPos && kingPos.row === r && kingPos.col === c) return `${base} in-check`;
    if (selected && selected.row === r && selected.col === c) return `${base} selected-source`;
    if (legalTargets.has(key)) return `${base} legal-target`;
    return base;
  }

  let statusText = "";
  let statusClass = "";
  const wKing = findKing(state.board, "white");
  const bKing = findKing(state.board, "black");
  const wOnHill = wKing && CENTER_SQUARES.has(`${wKing.row},${wKing.col}`);
  const bOnHill = bKing && CENTER_SQUARES.has(`${bKing.row},${bKing.col}`);

  if (state.result === "white") { statusText = "You win!"; statusClass = "win"; }
  else if (state.result === "black") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.result === "draw") { statusText = "Draw!"; statusClass = "draw"; }
  else if (inCheck) { statusText = "Check!"; statusClass = "check"; }
  else if (wOnHill) { statusText = "Your king is on the hill! One more move..."; statusClass = "win"; }
  else if (bOnHill) { statusText = "Bot king is on the hill! Danger!"; statusClass = "loss"; }
  else if (isPlayerTurn) { statusText = "Your turn — race your king to the center!"; }
  else { statusText = "Bot thinking..."; }

  return (
    <div className="kh-wrap">
      <div className="kh-info">
        <span>King of the Hill</span>
        <span>You: White | Bot: Black ({state.settings.opponent})</span>
      </div>
      <div className={`kh-status ${statusClass}`}>{statusText}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(8, ${CELL_SIZE}px)`, border: "2px solid #555" }}>
        {Array.from({ length: 8 }, (_, r) =>
          Array.from({ length: 8 }, (_, c) => {
            const piece = state.board[idx(r, c)];
            return (
              <div
                key={`${r}-${c}`}
                className={`kh-cell ${squareClass(r, c)}`}
                style={{ width: CELL_SIZE, height: CELL_SIZE, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}
                onClick={() => handleClick(r, c)}
              >
                {piece && <span className="kh-piece">{PIECE_UNICODE[piece.color][piece.type]}</span>}
                {c === 0 && <span style={{ position: "absolute", top: 2, left: 3, fontSize: "0.6rem", color: (r+c)%2===0?"#b58863":"#f0d9b5", fontWeight: "bold" }}>{8-r}</span>}
                {r === 7 && <span style={{ position: "absolute", bottom: 2, right: 3, fontSize: "0.6rem", color: (r+c)%2===0?"#b58863":"#f0d9b5", fontWeight: "bold" }}>{String.fromCharCode(97+c)}</span>}
              </div>
            );
          })
        )}
      </div>
      {state.promotionPending && (
        <div className="kh-promo-overlay">
          <div className="kh-promo-box">
            <h3>Promote pawn</h3>
            <div className="kh-promo-choices">
              {(["queen","rook","bishop","knight"] as PieceType[]).map(pt => (
                <button key={pt} className="kh-promo-btn"
                  onClick={() => dispatch({ type: "promote", piece: pt as "queen"|"rook"|"bishop"|"knight" } as KothAction)}>
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
