import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WizardState, WizardSettings } from "./state.js";
import { legalPlays, isTerminal, isWizard, isJester, cardLabel } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Wizard.css";

type WizardAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

function SpecialCard({ card, onClick }: { card: import("../../engines/deck/index.js").Card; onClick?: () => void }): JSX.Element {
  if (isWizard(card)) {
    return <div className="wizard-special-card wizard-card" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>W</div>;
  }
  return <div className="wizard-special-card jester-card" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>J</div>;
}

export function Wizard({ state, dispatch, onGameOver }: GameProps<WizardState, WizardSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, currentTrick, turn, phase, trumpCard, trumpSuit, bids, tricksTaken, tricksPlayed, finalScores } = state;
  const done = phase === "done";

  const legalIds = new Set(
    (phase === "playing" && !done && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;

  let statusLine = "";
  if (phase === "bidding") statusLine = `How many tricks will you win? (Trump: ${trumpSuit ?? "none"})`;
  else if (done) statusLine = "Hand complete!";
  else if (turn === 0) statusLine = currentTrick.length === 0 ? "Your lead" : "Your turn";
  else statusLine = `Waiting on ${seatName(turn)}…`;

  return (
    <div className="wizard">
      <div className="wizard-header">
        <span>Trump: {trumpSuit ?? (trumpCard ? "none (Jester)" : "?")}</span>
        {trumpCard && <span>Trump card: {cardLabel(trumpCard)}</span>}
        {phase !== "bidding" && <span>Tricks: {tricksPlayed}/10</span>}
        {bids.map((b, i) => b !== null && (
          <span key={i}>{seatName(i)}: bid {b}, got {tricksTaken[i]}</span>
        ))}
      </div>

      <div className="wizard-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`wizard-seat${turn === s && !done ? " active" : ""}`}>
            <div className="wizard-seat-label">{seatName(s)}</div>
            <div className="wizard-card-backs">
              {Array.from({ length: hands[s]!.length }).map((_, i) => (
                <div key={i} className="wizard-card-back" />
              ))}
            </div>
            <div className="wizard-bid-badge">
              {bids[s] !== null ? `Bid: ${bids[s]} | Got: ${tricksTaken[s]}` : "Bidding…"}
            </div>
          </div>
        ))}
      </div>

      {phase === "bidding" && turn === 0 && (
        <div className="wizard-bid-panel">
          <h3>Your bid (0–10 tricks)</h3>
          <div className="wizard-bid-buttons">
            {Array.from({ length: 11 }, (_, i) => (
              <button data-testid="hint-target-wizard-primary"
                key={i}
                className="wizard-bid-btn"
                onClick={() => dispatch({ type: "bid", amount: i } as WizardAction)}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "playing" && (
        <>
          <div className="wizard-trick-area">
            <div className="wizard-trick-label">
              Current Trick
            </div>
            <div className="wizard-trick-cards">
              {currentTrick.length === 0 ? (
                <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>
              ) : (
                currentTrick.map(({ seat, card }) => (
                  <div key={card.id} className="wizard-trick-slot">
                    <div className="wizard-trick-slot-label">{seatName(seat)}</div>
                    {isWizard(card) || isJester(card)
                      ? <SpecialCard card={card} />
                      : <Card card={card} />
                    }
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="wizard-status">{statusLine}</div>

          <div className="wizard-player-area">
            <div className="wizard-player-label">
              Your Hand ({hands[0]!.length} cards) — Bid: {bids[0] ?? "?"} | Got: {tricksTaken[0]}
            </div>
            <div className="wizard-player-hand">
              {hands[0]!
                .slice()
                .sort((a, b) => {
                  if (isWizard(a)) return -1;
                  if (isWizard(b)) return 1;
                  if (isJester(a)) return 1;
                  if (isJester(b)) return -1;
                  const suitOrder = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
                  const sd = (suitOrder[a.suit] ?? 0) - (suitOrder[b.suit] ?? 0);
                  return sd !== 0 ? sd : a.rank - b.rank;
                })
                .map(card => {
                  const legal = legalIds.has(card.id);
                  if (isWizard(card) || isJester(card)) {
                    return legal ? (
                      <SpecialCard
                        key={card.id}
                        card={card}
                        onClick={() => dispatch({ type: "play", cardId: card.id } as WizardAction)}
                      />
                    ) : (
                      <SpecialCard key={card.id} card={card} />
                    );
                  }
                  return legal ? (
                    <Card
                      key={card.id}
                      card={card}
                      className=""
                      onClick={() => dispatch({ type: "play", cardId: card.id } as WizardAction)}
                    />
                  ) : (
                    <Card
                      key={card.id}
                      card={card}
                      className="dim"
                    />
                  );
                })}
            </div>
          </div>
        </>
      )}

      {done && finalScores && (
        <div className="wizard-result">
          <h2>Hand Over</h2>
          <div className="wizard-scores-row">
            {[0, 1, 2, 3].map(s => (
              <div key={s} className={`wizard-score-box${s === 0 ? " me" : ""}`}>
                {seatName(s)}: bid {bids[s]}, got {tricksTaken[s]}, score {finalScores[s] ?? 0}
              </div>
            ))}
          </div>
          <div>Your score: <strong>{finalScores[0]}</strong> {(finalScores[0] ?? 0) >= 0 ? "✓" : "✗"}</div>
          <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Made bid: 20 + 10×bid pts | Missed: -10 × |diff|</div>
        </div>
      )}

      {phase === "bidding" && (
        <div className="wizard-status">{statusLine}</div>
      )}
    </div>
  );
}
