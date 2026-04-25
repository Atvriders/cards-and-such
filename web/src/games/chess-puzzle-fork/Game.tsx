import { useState, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ForkPuzzleState, ForkPuzzleAction } from "./state.js";
import { isTerminal, getLegalTargets } from "./state.js";
import { idx } from "../_chess-core/types.js";
import type { PieceColor } from "../_chess-core/types.js";
import "./Game.css";

type Settings = Record<string, never>;

const PIECE_UNICODE: Record<PieceColor, Record<string, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

export function Game({ state, dispatch, onGameOver }: GameProps<ForkPuzzleState, Settings>): JSX.Element {
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [targets, setTargets] = useState<Set<string>>(new Set());
  const terminal = isTerminal(state);

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    if (selected) {
      const ts = getLegalTargets(state, selected);
      setTargets(new Set(ts.map((t) => `${t.row},${t.col}`)));
    } else {
      setTargets(new Set());
    }
  }, [selected, state]);

  function handleClick(r: number, c: number) {
    if (state.status === "complete" || state.status === "solved") return;
    if (selected) {
      const key = `${r},${c}`;
      if (targets.has(key)) {
        dispatch({ type: "move", from: selected, to: { row: r, col: c } } as ForkPuzzleAction);
        setSelected(null);
        setTargets(new Set());
        return;
      }
    }
    const piece = state.board[idx(r, c)];
    if (piece && piece.color === "white") {
      setSelected({ row: r, col: c });
    } else {
      setSelected(null);
      setTargets(new Set());
    }
  }

  const CELL = 58;
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  return (
    <div className="cp-puzzle">
      <div className="cp-header">
        <span className="cp-title">Chess Fork Puzzles</span>
        <span className="cp-progress" style={{ color: "#8e44ad", fontWeight: "bold" }}>
          FORK — Puzzle {state.puzzleIndex + 1} / 6
        </span>
      </div>
      <div className={`cp-message cp-msg-${state.status}`}>{state.message}</div>
      <div className="cp-score-line">Score: <b>{state.score}</b></div>
      <div className="cp-board-wrap">
        <div className="cp-board" style={{ gridTemplateColumns: `repeat(8, ${CELL}px)` }}>
          {Array.from({ length: 8 }, (_, r) =>
            Array.from({ length: 8 }, (_, c) => {
              const piece = state.board[idx(r, c)];
              const isLight = (r + c) % 2 === 0;
              const key = `${r},${c}`;
              const isSel = selected?.row === r && selected?.col === c;
              const isTgt = targets.has(key);
              let cls = isLight ? "cp-sq-light" : "cp-sq-dark";
              if (isSel) cls += " cp-sq-sel";
              else if (isTgt) cls += " cp-sq-tgt";
              return (
                <div
                  key={key}
                  className={`cp-sq ${cls}`}
                  style={{ width: CELL, height: CELL }}
                  onClick={() => handleClick(r, c)}
                >
                  {piece && <span className="cp-piece">{PIECE_UNICODE[piece.color][piece.type]}</span>}
                  {c === 0 && <span className="cp-coord cp-rank">{8 - r}</span>}
                  {r === 7 && <span className="cp-coord cp-file">{files[c]}</span>}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="cp-actions">
        {state.status === "wrong" && (
          <button className="cp-btn" onClick={() => dispatch({ type: "retry" } as ForkPuzzleAction)}>
            Try Again
          </button>
        )}
        {state.status === "solved" && (
          <button className="cp-btn cp-btn-next" onClick={() => dispatch({ type: "next" } as ForkPuzzleAction)}>
            Next Puzzle
          </button>
        )}
      </div>
    </div>
  );
}
