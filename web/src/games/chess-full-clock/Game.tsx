import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  ChessFullClockState,
  ChessFullClockSettings,
  ChessFullClockAction,
} from "./state.js";
import {
  isTerminal,
  getLegalMovesForPiece,
  isPlayerInCheck,
  findKing,
} from "./state.js";
import type {
  PieceType,
  PieceColor,
  ChessCoord,
} from "../_chess-core/types.js";
import { idx } from "../_chess-core/types.js";
import "./Game.css";

const PIECE_UNICODE: Record<PieceColor, Record<string, string>> = {
  white: {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙",
  },
  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟",
  },
};

function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ChessFullClock({
  state,
  dispatch,
  onGameOver,
}: GameProps<ChessFullClockState, ChessFullClockSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);
  const [selected, setSelected] = useState<ChessCoord | null>(null);
  const [legalTargets, setLegalTargets] = useState<Set<string>>(new Set());

  // Fire onGameOver exactly once.
  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Reset selection on every turn change.
  useEffect(() => {
    setSelected(null);
    setLegalTargets(new Set());
  }, [state.turn]);

  // Compute legal target squares for the selected piece.
  useEffect(() => {
    if (selected) {
      const moves = getLegalMovesForPiece(state, selected);
      setLegalTargets(new Set(moves.map((m) => `${m.to.row},${m.to.col}`)));
    } else {
      setLegalTargets(new Set());
    }
  }, [selected, state]);

  // Clock tick: dispatch deltaMs every animation frame while the game is live.
  useEffect(() => {
    if (terminal) return;
    let raf: number;
    let last = performance.now();
    const loop = (now: number) => {
      const delta = now - last;
      last = now;
      if (delta > 0) {
        dispatch({ type: "tick", deltaMs: delta } as ChessFullClockAction);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [terminal, dispatch]);

  const isPlayerTurn = state.turn === "white";
  const inCheck = isPlayerInCheck(state);
  const playerKingPos =
    inCheck && isPlayerTurn ? findKing(state.board, "white") : null;
  const botKingPos =
    inCheck && !isPlayerTurn ? findKing(state.board, "black") : null;

  function handleCellClick(r: number, c: number) {
    if (terminal || !isPlayerTurn || state.promotionPending) return;
    const coord: ChessCoord = { row: r, col: c };
    const key = `${r},${c}`;
    if (selected && legalTargets.has(key)) {
      dispatch({
        type: "move",
        from: selected,
        to: coord,
      } as ChessFullClockAction);
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

  function squareClass(r: number, c: number): string {
    const light = (r + c) % 2 === 0;
    const classes = ["cfc-square", light ? "cfc-light" : "cfc-dark"];
    const key = `${r},${c}`;
    if (selected && selected.row === r && selected.col === c) {
      classes.push("cfc-selected");
    }
    if (legalTargets.has(key)) classes.push("cfc-legal-target");
    if (
      state.lastMove &&
      ((state.lastMove.from.row === r && state.lastMove.from.col === c) ||
        (state.lastMove.to.row === r && state.lastMove.to.col === c))
    ) {
      classes.push("cfc-last-move");
    }
    if (playerKingPos && playerKingPos.row === r && playerKingPos.col === c)
      classes.push("cfc-in-check");
    if (botKingPos && botKingPos.row === r && botKingPos.col === c)
      classes.push("cfc-in-check");
    return classes.join(" ");
  }

  let statusText = "";
  let statusClass = "";
  switch (state.result) {
    case "white-checkmate":
      statusText = "Checkmate — you win!";
      statusClass = "win";
      break;
    case "black-checkmate":
      statusText = "Checkmate — the bot wins.";
      statusClass = "loss";
      break;
    case "white-timeout":
      statusText = "Time out — you lose.";
      statusClass = "loss";
      break;
    case "black-timeout":
      statusText = "Time out — you win!";
      statusClass = "win";
      break;
    case "draw-stalemate":
      statusText = "Draw by stalemate.";
      statusClass = "draw";
      break;
    case "draw-50move":
      statusText = "Draw by the 50-move rule.";
      statusClass = "draw";
      break;
    case "draw-repetition":
      statusText = "Draw by threefold repetition.";
      statusClass = "draw";
      break;
    case "draw-material":
      statusText = "Draw by insufficient material.";
      statusClass = "draw";
      break;
    case "draw-agreed":
      statusText = "Draw agreed.";
      statusClass = "draw";
      break;
    default:
      if (inCheck && isPlayerTurn) {
        statusText = "Check — your king is under attack.";
        statusClass = "check";
      } else if (isPlayerTurn) {
        statusText = "Your turn (White).";
      } else {
        statusText = "Bot thinking…";
      }
  }

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  // PGN render: pairs of plies => "1. e4 e5 2. Nf3 Nc6 ..."
  const pgnPairs: string[] = [];
  for (let i = 0; i < state.pgn.length; i += 2) {
    const moveNum = i / 2 + 1;
    const white = state.pgn[i] ?? "";
    const black = state.pgn[i + 1] ?? "";
    pgnPairs.push(`${moveNum}. ${white}${black ? ` ${black}` : ""}`);
  }

  return (
    <div className="cfc fade-in">
      <div className="cfc-header">
        <div className="cfc-title">Chess (Full FIDE w/ Clock)</div>
        <div className="cfc-sub">
          You: White &nbsp;|&nbsp; Bot: Black &nbsp;|&nbsp; {state.settings.timeControl}
        </div>
      </div>

      <div className="cfc-clocks">
        <div
          className={`cfc-clock ${state.turn === "black" && !terminal ? "active" : ""}`}
          data-testid="cfc-clock-black"
        >
          <span className="cfc-clock-label">Black</span>
          <span className="cfc-clock-time">
            {formatTime(state.blackTimeMs)}
          </span>
        </div>
        <div className={`cfc-status ${statusClass}`} data-testid="cfc-status">
          {statusText}
        </div>
        <div
          className={`cfc-clock ${state.turn === "white" && !terminal ? "active pulse" : ""}`}
          data-testid="cfc-clock-white"
        >
          <span className="cfc-clock-label">White</span>
          <span className="cfc-clock-time">
            {formatTime(state.whiteTimeMs)}
          </span>
        </div>
      </div>

      <div className="cfc-main">
        <div className="cfc-board" data-testid="cfc-board">
          {Array.from({ length: 8 }, (_, r) =>
            Array.from({ length: 8 }, (_, c) => {
              const piece = state.board[idx(r, c)];
              return (
                <div
                  key={`${r}-${c}`}
                  className={squareClass(r, c)}
                  data-testid={`cfc-cell-${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  role="button"
                  aria-label={`Square ${files[c]}${8 - r}${piece ? `, ${piece.color} ${piece.type}` : ""}`}
                >
                  {piece && (
                    <span className="cfc-piece">
                      {PIECE_UNICODE[piece.color][piece.type]}
                    </span>
                  )}
                  {c === 0 && <span className="cfc-rank">{8 - r}</span>}
                  {r === 7 && <span className="cfc-file">{files[c]}</span>}
                </div>
              );
            }),
          )}
        </div>

        <div className="cfc-side">
          <div className="cfc-pgn" data-testid="cfc-pgn">
            <div className="cfc-pgn-title">Move list (PGN)</div>
            <ol className="cfc-pgn-list">
              {pgnPairs.length === 0 && (
                <li className="cfc-pgn-empty">No moves yet.</li>
              )}
              {pgnPairs.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </div>

          <div className="cfc-controls">
            {state.drawOfferedBy === "white" ? (
              <button
                className="cfc-btn"
                disabled
                title="Waiting for the bot's response to your draw offer"
              >
                Draw offered…
              </button>
            ) : state.drawOfferedBy === "black" ? (
              <div className="cfc-draw-row">
                <button
                  className="cfc-btn"
                  onClick={() =>
                    dispatch({ type: "accept-draw" } as ChessFullClockAction)
                  }
                  title="Accept the bot's draw offer"
                >
                  Accept draw
                </button>
                <button
                  className="cfc-btn"
                  onClick={() =>
                    dispatch({ type: "decline-draw" } as ChessFullClockAction)
                  }
                  title="Decline the bot's draw offer"
                >
                  Decline
                </button>
              </div>
            ) : (
              <button
                className="cfc-btn"
                disabled={!!terminal || !isPlayerTurn}
                onClick={() =>
                  dispatch({ type: "offer-draw" } as ChessFullClockAction)
                }
                title="Offer a draw to the bot"
              >
                Offer draw
              </button>
            )}
            <button
              className="cfc-btn cfc-btn-danger"
              disabled={!!terminal}
              onClick={() =>
                dispatch({ type: "resign" } as ChessFullClockAction)
              }
              title="Resign the game"
            >
              Resign
            </button>
          </div>
        </div>
      </div>

      {state.promotionPending && (
        <div className="cfc-promotion-overlay">
          <div className="cfc-promotion-box bounce-in">
            <h3>Choose promotion piece</h3>
            <div className="cfc-promotion-choices">
              {(["queen", "rook", "bishop", "knight"] as PieceType[]).map(
                (pt) => (
                  <button
                    key={pt}
                    className="cfc-promotion-btn"
                    onClick={() =>
                      dispatch({
                        type: "promote",
                        piece: pt as
                          | "queen"
                          | "rook"
                          | "bishop"
                          | "knight",
                      } as ChessFullClockAction)
                    }
                    title={`Promote to ${pt}`}
                    aria-label={`Promote to ${pt}`}
                  >
                    {PIECE_UNICODE.white[pt]}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {terminal && (
        <div className="cfc-final bounce-in" data-testid="cfc-final">
          {statusText}
        </div>
      )}
    </div>
  );
}
