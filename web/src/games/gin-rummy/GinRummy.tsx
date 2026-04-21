import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GinRummyState, GinRummySettings } from "./state.js";
import { detectMelds, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./GinRummy.css";

type GinRummyAction =
  | { type: "draw"; from: "stock" | "discard" }
  | { type: "discard"; cardId: string }
  | { type: "knock" };

export function GinRummy({
  state,
  dispatch,
  onGameOver,
}: GameProps<GinRummyState, GinRummySettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { playerHand, botHand, stock, discardPile, phase, message, finalScore } = state;
  const done = phase === "done";

  const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
  const { deadwoodValue, melds } = detectMelds(playerHand);
  const canKnock = deadwoodValue <= 10 && phase === "player-discard";

  const stockEmpty = stock.length === 0;

  return (
    <div className="gin-rummy">
      {/* Header */}
      <div className="gin-header">
        <span>Phase: {phase}</span>
        <span>Your deadwood: {deadwoodValue}</span>
        <span>Stock: {stock.length}</span>
      </div>

      {/* Bot hand */}
      <div className="gin-bot-area">
        <div className="gin-hand-label">Bot Hand ({botHand.length} cards)</div>
        <div className="gin-card-backs">
          {botHand.map((_, i) => (
            <div key={i} className="gin-card-back" />
          ))}
        </div>
      </div>

      {/* Draw area */}
      <div className="gin-area">
        <div className="gin-pile">
          Stock ({stock.length})
          {phase === "player-draw" && !stockEmpty ? (
            <Card
              faceDown
              onClick={() => dispatch({ type: "draw", from: "stock" } as GinRummyAction)}
            />
          ) : (
            <div className="gin-card-back" style={{ opacity: stockEmpty ? 0.2 : 0.6 }} />
          )}
        </div>
        <div className="gin-pile">
          Discard
          {topDiscard ? (
            phase === "player-draw"
              ? <Card card={topDiscard} onClick={() => dispatch({ type: "draw", from: "discard" } as GinRummyAction)} />
              : <Card card={topDiscard} />
          ) : (
            <div className="gin-card-back" style={{ opacity: 0.2 }} />
          )}
        </div>
      </div>

      {/* Status */}
      <div className="gin-status">{message}</div>

      {/* Actions */}
      {!done && (
        <div className="gin-actions">
          <button
            className="gin-btn"
            disabled={!canKnock}
            onClick={() => dispatch({ type: "knock" } as GinRummyAction)}
          >
            Knock (deadwood: {deadwoodValue})
          </button>
        </div>
      )}

      {/* Player hand */}
      <div className="gin-hand-label">
        Your Hand ({playerHand.length} cards) — melds: {melds.length}
      </div>
      <div className="gin-hand">
        {[...playerHand]
          .sort((a, b) => {
            const suitOrder: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
            const sd = (suitOrder[a.suit] ?? 0) - (suitOrder[b.suit] ?? 0);
            return sd !== 0 ? sd : a.rank - b.rank;
          })
          .map(card =>
            phase === "player-discard"
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "discard", cardId: card.id } as GinRummyAction)} />
              : <Card key={card.id} card={card} className="dim" />
          )}
      </div>

      {/* Result */}
      {done && finalScore !== null && (
        <div className="gin-result">
          <h2>Hand Over</h2>
          <div>{message}</div>
          <div>Final score: <strong>{finalScore > 0 ? `+${finalScore} (you win)` : finalScore < 0 ? `${finalScore} (bot wins)` : "Tie"}</strong></div>
          {state.playerMelds.length > 0 && (
            <>
              <div className="gin-hand-label">Your Melds</div>
              <div className="gin-melds">
                {state.playerMelds.map((m, i) => (
                  <div key={i} className="gin-meld-group">
                    {m.map(c => <Card key={c.id} card={c} />)}
                  </div>
                ))}
              </div>
            </>
          )}
          {state.botMelds.length > 0 && (
            <>
              <div className="gin-hand-label">Bot Melds</div>
              <div className="gin-melds">
                {state.botMelds.map((m, i) => (
                  <div key={i} className="gin-meld-group">
                    {m.map(c => <Card key={c.id} card={c} />)}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
