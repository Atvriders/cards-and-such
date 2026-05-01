import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RacingKingsState, RacingKingsSettings, ChessCoord, ChessMove } from "./state.js";
import type { RacingKingsAction } from "./state.js";
import { isTerminal, getLegalMovesForPiece, findKing } from "./state.js";
import type { PieceColor } from "../_chess-core/types.js";
import { idx } from "../_chess-core/types.js";
import "./Game.css";

const PIECE_UNICODE: Record<PieceColor, Record<string, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

export function RacingKingsGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<RacingKingsState, RacingKingsSettings>): JSX.Element {
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

  const wKing = findKing(state.board, "white");
  const bKing = findKing(state.board, "black");

  function handleClick(r: number, c: number) {
    if (terminal || !isPlayerTurn) return;
    const coord: ChessCoord = { row: r, col: c };
    const key = `${r},${c}`;
    if (selected && legalTargets.has(key)) {
      dispatch({ type: "move", from: selected, to: coord } as RacingKingsAction);
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
    const base = light ? "rkpb-sq-light" : "rkpb-sq-dark";
    const key = `${r},${c}`;
    if (r === 0) return `${base} rkpb-goal`;
    if (selected && selected.row === r && selected.col === c) return `${base} selected-source`;
    if (legalTargets.has(key)) return `${base} legal-target`;
    return base;
  }

  let statusText = "";
  let statusClass = "";
  if (state.result === "white") { statusText = "You win! Your king reached rank 8 first!"; statusClass = "win"; }
  else if (state.result === "black") { statusText = "Bot wins! Black king reached rank 8 first!"; statusClass = "loss"; }
  else if (state.result === "draw") { statusText = "Draw! Both kings reached rank 8."; statusClass = "draw"; }
  else if (state.whiteReachedRank8) { statusText = "Your king made it! Bot gets one chance..."; statusClass = "check"; }
  else if (isPlayerTurn) { statusText = "Your turn — race your king to rank 8!"; }
  else { statusText = "Bot thinking..."; }

  const wRow = wKing ? 8 - wKing.row : 0;
  const bRow = bKing ? 8 - bKing.row : 0;

  return (
    <div className="rkpb-wrap">
      <div className="rkpb-info">
        <span>Racing Kings — race to rank 8!</span>
        <span>White king rank: {wRow} | Black king rank: {bRow}</span>
      </div>
      <div className={`rkpb-status ${statusClass}`}>{statusText}</div>
      <div className="rkpb-goal-label">← Finish line (rank 8)</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(8, ${CELL_SIZE}px)`, border: "2px solid #555" }}>
        {Array.from({ length: 8 }, (_, r) =>
          Array.from({ length: 8 }, (_, c) => {
            const piece = state.board[idx(r, c)];
            return (
              <div
                key={`${r}-${c}`}
                className={`rkpb-cell ${squareClass(r, c)}`}
                style={{ width: CELL_SIZE, height: CELL_SIZE, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}
                onClick={() => handleClick(r, c)}
              >
                {piece && <span className="rkpb-piece">{PIECE_UNICODE[piece.color][piece.type]}</span>}
                {c === 0 && <span style={{ position: "absolute", top: 2, left: 3, fontSize: "0.6rem", color: "#888", fontWeight: "bold" }}>{8-r}</span>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
