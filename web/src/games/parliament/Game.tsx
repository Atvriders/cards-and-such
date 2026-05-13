import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ParliamentState, ParliamentSettings, Rank } from "./state.js";
import { seatName, isTerminal, canPlayCard, SUITS, rankLabel } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

const SUIT_COLORS: Record<string, string> = { "♠": "#aaa", "♣": "#aaa", "♥": "#f77", "♦": "#f99" };

export function ParliamentGame({ state, dispatch, onGameOver }: GameProps<ParliamentState, ParliamentSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isPlayerTurn = state.turn === 0 && !state.winner;
  const playerHand = state.hands[0] ?? [];
  const playableIds = new Set(playerHand.filter(c => canPlayCard(c, state.board)).map(c => c.id));

  return (
    <div className="parliament fade-in">
      <div className="parl-title">Parliament</div>

      <div className="parl-opponents">
        {Array.from({ length: state.seats - 1 }, (_, i) => i + 1).map(seat => (
          <div key={seat} className="parl-opponent">
            <div className="parl-opp-name">{seatName(seat)}</div>
            <div style={{ fontSize: "0.8rem" }}>{state.hands[seat]?.length ?? 0} cards</div>
          </div>
        ))}
      </div>

      <div className="parl-board">
        {SUITS.map(suit => {
          const range = state.board[suit];
          return (
            <div key={suit} className="parl-suit-row">
              <span className="parl-suit-icon" style={{ color: SUIT_COLORS[suit] }}>{suit}</span>
              <span className="parl-suit-range">
                {range ? `${rankLabel(range.min as Rank)} – ${rankLabel(range.max as Rank)}` : "—"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="parl-log">{state.log}</div>

      <div className="parl-hand">
        <div className="parl-hand-label">Your hand ({playerHand.length} cards)</div>
        <div className="parl-cards">
          {[...playerHand].sort((a, b) => a.suit.localeCompare(b.suit) || a.rank - b.rank).map(c => (
            <button data-testid="hint-target-parliament-primary"
              key={c.id}
              className={`parl-card-btn${playableIds.has(c.id) ? " playable" : ""}`}
              disabled={!isPlayerTurn || !playableIds.has(c.id)}
              onClick={() => dispatch({ type: "play", cardId: c.id })}
              aria-label={`${c.suit}${rankLabel(c.rank)}`}
            >
              <Card card={c} />
            </button>
          ))}
        </div>
      </div>

      {isPlayerTurn && (
        <div className="parl-actions">
          <button
            className="parl-btn"
            disabled={playableIds.size > 0}
            onClick={() => dispatch({ type: "pass" })}
          >
            Pass {playableIds.size > 0 ? "(must play)" : ""}
          </button>
        </div>
      )}

      {!isPlayerTurn && !state.winner && (
        <div style={{ opacity: 0.7, fontStyle: "italic" }}>Waiting for {seatName(state.turn)}…</div>
      )}

      {state.winner !== null && (
        <div className="parl-game-over">
          {state.winner === 0 ? "You win!" : `${seatName(state.winner)} wins!`}
        </div>
      )}
    </div>
  );
}
