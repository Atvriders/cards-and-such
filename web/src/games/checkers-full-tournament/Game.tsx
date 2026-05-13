import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CftAction, CftSettings, CftState, Coord, Piece } from "./state.js";
import { getLegalMoves, isTerminal } from "./state.js";
import "./Game.css";

export function CheckersFullTournamentGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<CftState, CftSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);
  const [selected, setSelected] = useState<Coord | null>(null);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Clear selection when turn flips or mid-chain anchor changes.
  useEffect(() => {
    setSelected(null);
  }, [state.turn, state.mustContinueFrom?.row, state.mustContinueFrom?.col]);

  const isRedTurn = state.turn === "red" && state.winner === null;

  const legal = useMemo(() => {
    if (!isRedTurn) return [];
    return getLegalMoves(state.board, "red", state.mustContinueFrom);
  }, [state.board, isRedTurn, state.mustContinueFrom]);

  const legalSources = useMemo(() => {
    const s = new Set<string>();
    for (const m of legal) s.add(`${m.from.row},${m.from.col}`);
    return s;
  }, [legal]);

  const legalTargetsForSelected = useMemo(() => {
    const s = new Set<string>();
    if (!selected) return s;
    for (const m of legal) {
      if (m.from.row === selected.row && m.from.col === selected.col) {
        s.add(`${m.to.row},${m.to.col}`);
      }
    }
    return s;
  }, [legal, selected]);

  function handleClick(r: number, c: number): void {
    if (terminal || !isRedTurn) return;
    const key = `${r},${c}`;
    if (selected && legalTargetsForSelected.has(key)) {
      dispatch({ type: "move", from: selected, to: { row: r, col: c } } as CftAction);
      setSelected(null);
      return;
    }
    if (state.mustContinueFrom) {
      // Only the chain anchor is selectable mid-chain.
      const mcf = state.mustContinueFrom;
      if (r === mcf.row && c === mcf.col) setSelected({ row: r, col: c });
      return;
    }
    if (legalSources.has(key)) {
      setSelected({ row: r, col: c });
      return;
    }
    setSelected(null);
  }

  // Status line.
  let status = "";
  let statusClass = "";
  if (state.winner === "red") { status = "You win!"; statusClass = "win"; }
  else if (state.winner === "black") { status = "CPU wins."; statusClass = "loss"; }
  else if (state.winner === "draw") { status = "Draw — 40-move rule."; statusClass = "draw"; }
  else if (state.mustContinueFrom) status = "Continue jumping — captures are mandatory.";
  else if (state.turn === "red") status = "Your turn (Red).";
  else status = "CPU thinking…";

  const ballotLabel = state.ballot
    ? `Ballot: ${state.ballot.name}${state.ballotPliesPlayed < state.ballot.plies.length ? ` (${state.ballotPliesPlayed}/3)` : ""}`
    : "Free play";

  const remaining = Math.max(0, 40 - state.pliesSinceCaptureOrPromo);

  return (
    <div className="cft-root fade-in" data-testid="cft-root">
      <div className="cft-info">
        <span className="cft-info-pill" title="3-move opening ballot name">{ballotLabel}</span>
        <span className="cft-info-pill" title="Plies remaining before the 40-move draw rule triggers">
          Draw counter: {remaining}
        </span>
        <span className="cft-info-pill" title="CPU minimax search depth">
          CPU depth {state.settings.botDepth}
        </span>
      </div>

      <div className={`cft-status ${statusClass} ${terminal ? "pulse" : ""}`} data-testid="cft-status">
        {status}
      </div>

      <div className="cft-board" role="grid" aria-label="Checkers board">
        {Array.from({ length: 8 }).map((_, r) => (
          <div key={r} className="cft-row" role="row">
            {Array.from({ length: 8 }).map((_, c) => {
              const isDark = (r + c) % 2 === 1;
              const key = `${r},${c}`;
              const isSel = selected && selected.row === r && selected.col === c;
              const isTarget = legalTargetsForSelected.has(key);
              const isSource = !selected && legalSources.has(key);
              const isLast = state.settings.showLastMove && state.lastMove && (
                (state.lastMove.from.row === r && state.lastMove.from.col === c) ||
                (state.lastMove.to.row === r && state.lastMove.to.col === c)
              );
              const isAnchor = state.mustContinueFrom &&
                state.mustContinueFrom.row === r && state.mustContinueFrom.col === c;
              const piece: Piece | null = state.board[r * 8 + c] ?? null;
              const classes = [
                "cft-cell",
                isDark ? "dark" : "light",
                isSel ? "selected" : "",
                isTarget ? "target" : "",
                isSource ? "source" : "",
                isAnchor ? "anchor" : "",
                isLast ? "last" : "",
              ].filter(Boolean).join(" ");
              return (
                <button
                  key={key}
                  type="button"
                  className={classes}
                  onClick={() => handleClick(r, c)}
                  data-testid={`cell-${r}-${c}`}
                  aria-label={`Square ${r},${c}${piece ? ` ${piece.color}${piece.king ? " king" : ""}` : " empty"}`}
                  title={piece ? `${piece.color}${piece.king ? " king" : ""}` : "empty dark square"}
                  disabled={!isDark}
                >
                  {piece && (
                    <span className={`cft-piece ${piece.color}${piece.king ? " king" : ""}`}>
                      {piece.king ? "★" : ""}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {terminal && (
        <div className="cft-end bounce-in" data-testid="cft-end">
          <div className="cft-end-title">
            {state.winner === "red" && "Victory"}
            {state.winner === "black" && "Defeat"}
            {state.winner === "draw" && "Drawn Game"}
          </div>
          <div className="cft-end-score">Score: {terminal.score}</div>
        </div>
      )}
    </div>
  );
}
