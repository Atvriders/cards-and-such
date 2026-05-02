import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TicTacToeCardsState, TicTacToeCardsAction, TicTacToeCardsSettings } from "./state.js";
import { isTerminal, RANK_NAMES, SUIT_GLYPH, isRedSuit } from "./state.js";
import "./Game.css";

export function TicTacToeCards({
  state, dispatch, onGameOver,
}: GameProps<TicTacToeCardsState, TicTacToeCardsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const status =
    state.phase === "done"
      ? state.result === "P" ? "Three reds win — you took the round!"
        : state.result === "C" ? "Three blacks lined up — CPU wins"
        : "Draw"
      : "Place a Hearts/Diamonds card. CPU plays Spades/Clubs.";

  return (
    <div className="thmTTTC">
    <div className="tttcards-wrap">
      <div className="tttcards-header">
        <h2 className="tttcards-title">Tic-Tac-Toe Cards</h2>
        <div className="tttcards-info">3-in-a-row of your color (red) wins. Cards are randomly drawn.</div>
        <div className="tttcards-status">{status}</div>
        <div className="tttcards-score">Score: {state.score}</div>
      </div>
      <div className="tttcards-board">
        {Array.from({ length: 9 }).map((_, idx) => {
          const c = state.board[idx];
          const isWin = state.winLine?.includes(idx);
          const empty = c === null;
          const colorClass = c ? (isRedSuit(c.suit) ? "tttcards-cell-red" : "tttcards-cell-black") : "";
          return (
            <button
              key={idx}
              data-testid={`hint-target-tic-tac-toe-cards-${idx}`}
              className={`tttcards-cell ${colorClass} ${isWin ? "tttcards-cell-win" : ""}`}
              disabled={!empty || state.phase === "done"}
              onClick={() => dispatch({ type: "place", idx } as TicTacToeCardsAction)}
              aria-label={`cell ${idx}`}
            >
              {c ? (
                <span className="tttcards-card">
                  <span className="tttcards-rank">{RANK_NAMES[c.rank]}</span>
                  <span className="tttcards-suit">{SUIT_GLYPH[c.suit]}</span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {state.phase === "done" && (
        <div className="tttcards-final">
          {state.result === "P" ? "Victory!" : state.result === "C" ? "Defeat" : "Tie"} — {state.score} pts
        </div>
      )}
    </div>
    </div>
  );
}
