import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  OthelloFTAction,
  OthelloFTSettings,
  OthelloFTState,
} from "./state.js";
import { idx, isTerminal, legalMoves, SIZE } from "./state.js";
import "./Game.css";

function colLabel(c: number): string {
  return String.fromCharCode(65 + c); // A..H
}

export function OthelloFullTournament({
  state,
  dispatch,
  onGameOver,
}: GameProps<OthelloFTState, OthelloFTSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Reset the "game-over" guard whenever a fresh game starts so the next
  // finish still fires onGameOver. We detect "fresh" by zero moves + no winner.
  useEffect(() => {
    if (state.winner === null && state.movesMade === 0) {
      endedRef.current = false;
    }
  }, [state.winner, state.movesMade]);

  const isHumanTurn = state.turn === 0 && state.winner === null;
  const legal = isHumanTurn ? legalMoves(state.board, 0) : [];
  const legalSet = new Set(legal.map((m) => `${m.row},${m.col}`));
  const mustPass = isHumanTurn && legal.length === 0;

  let status = "";
  let statusKind: "neutral" | "win" | "loss" | "draw" = "neutral";
  if (state.winner === 0) {
    status = `You win — ${state.blackCount} to ${state.whiteCount}.`;
    statusKind = "win";
  } else if (state.winner === 1) {
    status = `CPU wins — ${state.whiteCount} to ${state.blackCount}.`;
    statusKind = "loss";
  } else if (state.winner === "draw") {
    status = `Draw — ${state.blackCount} to ${state.whiteCount}.`;
    statusKind = "draw";
  } else if (state.turn === 1) {
    status = "CPU thinking...";
  } else if (mustPass) {
    status = "No legal moves — you must pass.";
  } else {
    status = "Your move, Black.";
  }

  return (
    <div className="oftt fade-in">
      <header className="oftt-header">
        <div className="oftt-title">
          <span className="oftt-badge">TOURNAMENT</span>
          <span className="oftt-titletext">Othello</span>
        </div>
        <div className="oftt-meta">
          <span title="Selected AI strength">Level: <strong>{state.settings.difficulty}</strong></span>
          <span title="Completed games this session">
            Session: <strong data-testid="oftt-session">{state.completedThisSession}</strong>
          </span>
        </div>
      </header>

      <div className="oftt-scoreline">
        <div className="oftt-score oftt-score-black">
          <span className="oftt-chip oftt-chip-black" aria-hidden="true" />
          <span className="oftt-score-label">Black (You)</span>
          <span className="oftt-score-value pulse" data-testid="oftt-black-count">{state.blackCount}</span>
        </div>
        <div className={`oftt-status oftt-status-${statusKind}`}>{status}</div>
        <div className="oftt-score oftt-score-white">
          <span className="oftt-chip oftt-chip-white" aria-hidden="true" />
          <span className="oftt-score-label">White (CPU)</span>
          <span className="oftt-score-value pulse" data-testid="oftt-white-count">{state.whiteCount}</span>
        </div>
      </div>

      <div className="oftt-opening" data-testid="oftt-opening">
        Opening: <strong>{state.openingName ?? "—"}</strong>
        <span className="oftt-moves"> · Move {state.movesMade}</span>
      </div>

      <div className="oftt-board-wrap">
        <div className="oftt-axis oftt-axis-top">
          {Array.from({ length: SIZE }).map((_, c) => (
            <span key={c} className="oftt-axis-cell">{colLabel(c)}</span>
          ))}
        </div>
        <div className="oftt-board-row">
          <div className="oftt-axis oftt-axis-left">
            {Array.from({ length: SIZE }).map((_, r) => (
              <span key={r} className="oftt-axis-cell">{r + 1}</span>
            ))}
          </div>
          <div className="oftt-board" role="grid" aria-label="Othello board">
            {Array.from({ length: SIZE }).map((_, r) => (
              <div className="oftt-row" key={r} role="row">
                {Array.from({ length: SIZE }).map((__, c) => {
                  const v = state.board[idx(r, c)];
                  const isLegal = legalSet.has(`${r},${c}`);
                  const label = `${colLabel(c)}${r + 1}`;
                  return (
                    <button
                      key={c}
                      type="button"
                      className={`oftt-cell${isLegal ? " oftt-cell-legal" : ""}`}
                      onClick={() => {
                        if (isLegal) {
                          dispatch({ type: "place", row: r, col: c } satisfies OthelloFTAction);
                        }
                      }}
                      disabled={!isLegal && state.winner === null}
                      title={`${label}${isLegal ? " — legal move" : ""}`}
                      aria-label={label}
                      data-testid={`oftt-cell-${r}-${c}`}
                    >
                      {v === 0 && <span className="oftt-disc oftt-disc-black" />}
                      {v === 1 && <span className="oftt-disc oftt-disc-white" />}
                      {v === null && isLegal && <span className="oftt-hint" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="oftt-controls">
        {mustPass && (
          <button
            type="button"
            className="oftt-btn oftt-btn-primary"
            onClick={() => dispatch({ type: "pass" } satisfies OthelloFTAction)}
            title="You have no legal placements — yield the turn to the CPU"
            data-testid="oftt-pass"
          >
            Pass turn
          </button>
        )}
        {state.winner !== null && (
          <button
            type="button"
            className="oftt-btn oftt-btn-primary bounce-in"
            onClick={() => dispatch({ type: "newGame" } satisfies OthelloFTAction)}
            title="Begin a new tournament game; bumps the session counter"
            data-testid="oftt-new-game"
          >
            New Game
          </button>
        )}
      </div>

      {state.winner !== null && (
        <div className="oftt-result bounce-in">
          <div className="oftt-result-line">Final: Black {state.blackCount} — White {state.whiteCount}</div>
          {state.openingName && (
            <div className="oftt-result-sub">Played the {state.openingName}.</div>
          )}
        </div>
      )}
    </div>
  );
}
