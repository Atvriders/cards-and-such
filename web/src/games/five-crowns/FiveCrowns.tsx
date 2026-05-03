import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FiveCrownsState, FiveCrownsSettings } from "./state.js";
import { detectMelds, isWild, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./FiveCrowns.css";

type FiveCrownsAction =
  | { type: "draw"; from: "stock" | "discard" }
  | { type: "discard"; cardId: string }
  | { type: "go-out" };

export function FiveCrowns({
  state,
  dispatch,
  onGameOver,
}: GameProps<FiveCrownsState, FiveCrownsSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, stock, discardPile, phase, message, numPlayers, deadwoodScores, playerMelds } = state;
  const done = phase === "done";
  const playerHand = hands[0] ?? [];
  const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;

  const { deadwoodValue, melds } = detectMelds(playerHand);
  const canGoOut = deadwoodValue === 0 && phase === "player-discard";

  const playerNames = ["You", ...Array.from({ length: numPlayers - 1 }, (_, i) => `Bot ${i + 1}`)];

  return (
    <div className="five-crowns">
      {/* Header */}
      <div className="fc-header">
        <span>Cards: {playerHand.length}</span>
        <span>Deadwood: {deadwoodValue}</span>
        <span>Melds: {melds.length}</span>
        <span>Stock: {stock.length}</span>
      </div>
      <div className="fc-wild-note">★ Wild cards: all 3s are wild!</div>

      {/* Bot hands */}
      <div className="fc-bots-row">
        {Array.from({ length: numPlayers - 1 }, (_, i) => i + 1).map(seat => (
          <div key={seat} className="fc-bot-seat">
            <span style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Bot {seat}</span>
            <div className="fc-card-backs">
              {(hands[seat] ?? []).slice(0, 6).map((_, i) => <div key={i} className="fc-card-back" />)}
              {(hands[seat] ?? []).length > 6 && (
                <span style={{ fontSize: "0.7rem" }}>+{(hands[seat]?.length ?? 0) - 6}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Draw area */}
      {!done && (
        <div className="fc-draw-area">
          <div className="fc-pile">
            Stock ({stock.length})
            {phase === "player-draw" ? (
              <div
                className="fc-stock-back"
                onClick={() => dispatch({ type: "draw", from: "stock" } as FiveCrownsAction)}
              />
            ) : (
              <div className="fc-stock-back" style={{ opacity: 0.3 }} />
            )}
          </div>
          <div className="fc-pile">
            Discard
            {topDiscard ? (
              phase === "player-draw"
                ? <Card card={topDiscard} onClick={() => dispatch({ type: "draw", from: "discard" } as FiveCrownsAction)} />
                : <Card card={topDiscard} />
            ) : (
              <div className="fc-stock-back" style={{ opacity: 0.2 }} />
            )}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="fc-status">{message}</div>

      {/* Actions */}
      {!done && phase === "player-discard" && (
        <div className="fc-actions">
          <button data-testid="hint-target-five-crowns-action"
            className="fc-btn"
            disabled={!canGoOut}
            onClick={() => dispatch({ type: "go-out" } as FiveCrownsAction)}
          >
            Go Out! (deadwood: {deadwoodValue})
          </button>
        </div>
      )}

      {/* Player hand */}
      <div className="fc-hand-label">
        Your Hand ({playerHand.length} cards) — deadwood: {deadwoodValue}
      </div>
      <div className="fc-hand">
        {[...playerHand]
          .sort((a, b) => {
            if (isWild(a) && !isWild(b)) return -1;
            if (!isWild(a) && isWild(b)) return 1;
            const suitOrder: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
            const sd = (suitOrder[a.suit] ?? 0) - (suitOrder[b.suit] ?? 0);
            return sd !== 0 ? sd : a.rank - b.rank;
          })
          .map(card =>
            (!done && phase === "player-discard")
              ? <Card key={card.id} card={card} className={isWild(card) ? "wild-card" : ""} onClick={() => dispatch({ type: "discard", cardId: card.id } as FiveCrownsAction)} />
              : <Card key={card.id} card={card} className="dim" />
          )}
      </div>

      {/* Melds display */}
      {melds.length > 0 && (
        <>
          <div className="fc-hand-label">Your Best Melds</div>
          <div className="fc-melds">
            {melds.map((m, i) => (
              <div key={i} className="fc-meld-group">
                {m.map(c => <Card key={c.id} card={c} />)}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Result */}
      {done && deadwoodScores.length > 0 && (
        <div className="fc-result">
          <h2>Hand Over</h2>
          <div>{message}</div>
          {deadwoodScores.map((dw, i) => (
            <div key={i}>
              {playerNames[i]}: <strong>{dw} deadwood</strong>
              {i === 0 && dw === 0 ? " 🎉" : ""}
            </div>
          ))}
          {playerMelds.length > 0 && (
            <>
              <div className="fc-hand-label" style={{ marginTop: "0.5rem" }}>Your Melds</div>
              <div className="fc-melds" style={{ justifyContent: "center" }}>
                {playerMelds.map((m, i) => (
                  <div key={i} className="fc-meld-group">
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
