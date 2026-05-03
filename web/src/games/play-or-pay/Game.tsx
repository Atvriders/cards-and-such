import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PlayOrPayState, PlayOrPaySettings } from "./state.js";
import { seatName, isTerminal, canPlayCard, SUITS, rankLabel } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as CardType } from "../../engines/deck/index.js";
import "./Game.css";

const SUIT_COLORS: Record<string, string> = { "♠": "#bbb", "♣": "#bbb", "♥": "#f77", "♦": "#f99" };

export function PlayOrPayGame({ state, dispatch, onGameOver }: GameProps<PlayOrPayState, PlayOrPaySettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isPlayerTurn = state.turn === 0 && !state.winner;
  const playerHand = state.hands[0] ?? [];
  const playableIds = new Set(playerHand.filter(c => canPlayCard(c, state.sequences)).map(c => c.id));

  return (
    <div className="play-or-pay">
      <div className="pop-title">Play or Pay</div>

      <div className="pop-opponents">
        {Array.from({ length: state.seats - 1 }, (_, i) => i + 1).map(seat => (
          <div key={seat} className="pop-opponent">
            <div className="pop-opp-name">{seatName(seat)}</div>
            <div style={{ fontSize: "0.82rem" }}>{state.hands[seat]?.length ?? 0} cards</div>
            <div style={{ fontSize: "0.82rem" }}>💰 {state.chips[seat] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="pop-sequences">
        {SUITS.map(suit => {
          const next = state.sequences[suit] as CardType["rank"];
          const done = next > 13;
          return (
            <div key={suit} className="pop-suit-info">
              <span className="pop-suit-sym" style={{ color: SUIT_COLORS[suit] }}>{suit}</span>
              <span className="pop-suit-next">
                {done ? "Complete!" : `Needs: ${rankLabel(next)}`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pop-chips">
        <span>Your chips: 💰 {state.chips[0] ?? 0}</span>
        <span className="pop-pot">Pot: 🪙 {state.pot}</span>
      </div>

      <div className="pop-log">{state.log}</div>

      <div className="pop-hand">
        <div className="pop-hand-label">Your hand ({playerHand.length} cards) — green = playable</div>
        <div className="pop-cards">
          {[...playerHand].sort((a, b) => a.suit.localeCompare(b.suit) || a.rank - b.rank).map(c => (
            <button
              key={c.id}
              className={`pop-card-btn${playableIds.has(c.id) ? " playable" : ""}`}
              disabled={!isPlayerTurn || !playableIds.has(c.id)}
              onClick={() => dispatch({ type: "playCard", cardId: c.id })}
              aria-label={`${c.suit}${rankLabel(c.rank)}`}
            >
              <Card card={c} />
            </button>
          ))}
        </div>
      </div>

      {isPlayerTurn && (
        <div className="pop-actions">
          <button
            data-testid="hint-target-play-or-pay-action" className="pop-btn pay-btn"
            disabled={(state.chips[0] ?? 0) <= 0}
            onClick={() => dispatch({ type: "pay" })}
          >
            Pay a Chip 💰
          </button>
          {playableIds.size > 0 && (
            <div style={{ fontSize: "0.8rem", opacity: 0.75, alignSelf: "center" }}>Or play a green card!</div>
          )}
        </div>
      )}

      {!isPlayerTurn && !state.winner && (
        <div style={{ opacity: 0.7, fontStyle: "italic" }}>Waiting for {seatName(state.turn)}…</div>
      )}

      {state.winner !== null && (
        <div className="pop-game-over">
          {state.winner === 0 ? `You win! 💰 ${state.chips[0]}` : `${seatName(state.winner)} wins!`}
        </div>
      )}
    </div>
  );
}
