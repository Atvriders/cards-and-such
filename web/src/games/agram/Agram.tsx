import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AgramState } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Agram.css";

type AgramAction = { type: "play"; cardId: string };

export function Agram({ state, dispatch, onGameOver }: GameProps<AgramState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, currentTrick, turn, phase, tricksPlayed, message } = state;
  const done = phase === "done";

  const legalIds = new Set(
    (!done && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="agram">
      <div className="agram-header">
        <span>Agram</span>
        <span>No Trump</span>
        <span>Tricks: {tricksPlayed}/5</span>
        <span style={{ color: "#ffeb3b" }}>Win the LAST trick!</span>
      </div>

      <div className="agram-bot-row">
        <div className="agram-bot-label">
          Bot ({hands[1]!.length} cards){turn === 1 && !done ? " — thinking…" : ""}
        </div>
        <div className="agram-card-backs">
          {Array.from({ length: hands[1]!.length }).map((_, i) => (
            <div key={i} className="agram-card-back" />
          ))}
        </div>
      </div>

      <div className="agram-trick-area">
        <div className="agram-trick-label">
          Current Trick{currentTrick.length > 0 ? ` (led: ${rankLabel(currentTrick[0]!.card.rank)}${currentTrick[0]!.card.suit})` : ""}
        </div>
        <div className="agram-trick-cards">
          {currentTrick.length === 0 ? (
            <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>
          ) : (
            currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="agram-trick-slot">
                <div className="agram-trick-slot-label">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="agram-status">{message}</div>

      <div data-testid="hint-target-agram-primary" className="agram-player-area">
        <div className="agram-player-label">Your Hand ({hands[0]!.length} cards)</div>
        <div className="agram-player-hand">
          {hands[0]!
            .slice()
            .sort((a, b) => {
              const so: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
              const sd = (so[a.suit] ?? 0) - (so[b.suit] ?? 0);
              return sd !== 0 ? sd : a.rank - b.rank;
            })
            .map(card => {
              const legal = legalIds.has(card.id);
              return legal ? (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => dispatch({ type: "play", cardId: card.id } as AgramAction)}
                />
              ) : (
                <Card key={card.id} card={card} className="dim" />
              );
            })}
        </div>
      </div>

      {done && (
        <div className="agram-result">
          <h2>{terminal?.score === 100 ? "You Win!" : "Bot Wins."}</h2>
          <div>{message}</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Winner of the last trick wins Agram.</div>
        </div>
      )}
    </div>
  );
}
