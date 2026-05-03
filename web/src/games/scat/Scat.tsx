import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ScatState } from "./state.js";
import { handScore, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Scat.css";

type ScatAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "knock" }
  | { type: "discard"; cardId: string };

export function Scat({ state, dispatch, onGameOver }: GameProps<ScatState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, stock, discardPile, phase, drawnCard, drawnFrom, scores, message, lives } = state;
  const done = phase === "done";
  const needsDiscard = phase === "player-discard";
  const canAct = phase === "player-turn";

  const playerHand = hands[0]!;
  const discardTop = discardPile[discardPile.length - 1] ?? null;

  const livesEmoji = (n: number) => "♥".repeat(Math.max(0, n)) + "♡".repeat(Math.max(0, 3 - n));
  const rl = (card: { rank: number; suit: string }) => `${rankLabel(card.rank as 1)}${card.suit}`;

  // Hand score display
  const playerScore = handScore(playerHand);

  const handWithDrawn = needsDiscard && drawnCard
    ? [...playerHand, drawnCard]
    : playerHand;

  return (
    <div className="scat">
      <div className="scat-header">
        <span>Scat (31)</span>
        <span>Stock: {stock.length}</span>
        <span>Your score: {playerScore.toFixed(1)}</span>
      </div>

      <div className="scat-bots-row">
        {[1, 2].map(seat => (
          <div key={seat} className="scat-bot-seat">
            <div className="scat-bot-label">Bot {seat}</div>
            <div className="scat-lives">{livesEmoji(lives[seat] ?? 3)}</div>
            <div className="scat-card-backs">
              {Array.from({ length: hands[seat]!.length }).map((_, i) => (
                <div key={i} className="scat-card-back" />
              ))}
            </div>
            {done && (
              <div style={{ fontSize: "0.75rem", marginTop: 4 }}>
                Score: {scores[seat]?.toFixed(1)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="scat-middle">
        <div className="scat-pile-area">
          <div className="scat-pile-label">Stock</div>
          {stock.length > 0 ? (
            <div
              className="scat-card-back"
              style={{ width: 50, height: 70, cursor: canAct ? "pointer" : "default" }}
              onClick={canAct ? () => dispatch({ type: "draw-stock" } as ScatAction) : undefined}
            />
          ) : (
            <div className="scat-pile-empty">Empty</div>
          )}
          <div className="scat-pile-count">{stock.length} cards</div>
        </div>

        <div className="scat-pile-area">
          <div className="scat-pile-label">Discard</div>
          {discardTop ? (
            <Card
              card={discardTop}
              {...(canAct ? { onClick: () => dispatch({ type: "draw-discard" } as ScatAction) } : {})}
            />
          ) : (
            <div className="scat-pile-empty">—</div>
          )}
          <div className="scat-pile-count">top: {discardTop ? rl(discardTop) : "—"}</div>
        </div>
      </div>

      <div className="scat-status">{message}</div>

      {canAct && (
        <div className="scat-actions">
          <button data-testid="hint-target-scat-primary"
            className="scat-btn"
            onClick={() => dispatch({ type: "draw-stock" } as ScatAction)}
            disabled={stock.length === 0}
          >
            Draw Stock
          </button>
          <button
            className="scat-btn"
            onClick={() => dispatch({ type: "draw-discard" } as ScatAction)}
            disabled={!discardTop}
          >
            Take Discard {discardTop ? `(${rl(discardTop)})` : ""}
          </button>
          <button
            className="scat-btn knock"
            onClick={() => dispatch({ type: "knock" } as ScatAction)}
          >
            Knock!
          </button>
        </div>
      )}

      <div className="scat-player-area">
        <div className="scat-player-label">
          Your Hand — {livesEmoji(lives[0] ?? 3)} — Score: {playerScore.toFixed(1)}
        </div>

        {needsDiscard && drawnCard && (
          <div className="scat-drawn-area">
            <div className="scat-drawn-label">
              Drew from {drawnFrom} — click to keep or discard:
            </div>
            <Card card={drawnCard} />
          </div>
        )}

        <div className="scat-player-hand">
          {handWithDrawn.map(card => (
            <Card
              key={card.id}
              card={card}
              {...(needsDiscard ? { onClick: () => dispatch({ type: "discard", cardId: card.id } as ScatAction) } : {})}
            />
          ))}
        </div>

        {needsDiscard && (
          <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
            Click a card to discard it
          </div>
        )}
      </div>

      {done && (
        <div className="scat-result">
          <h2>
            {lives[0]! <= 0 ? "You Lost!" :
             lives.slice(1).every(l => l <= 0) ? "You Win!" : "Round Over"}
          </h2>
          <div>{message}</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            Lives remaining: You {lives[0]}, Bot1 {lives[1]}, Bot2 {lives[2]}
          </div>
        </div>
      )}
    </div>
  );
}
