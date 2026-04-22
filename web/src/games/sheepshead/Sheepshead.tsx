import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SheepsheadState, SheepsheadSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Sheepshead.css";

type SheepsheadAction = { type: "play"; cardId: string };

export function Sheepshead({ state, dispatch, onGameOver }: GameProps<SheepsheadState, SheepsheadSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, currentTrick, turn, tricksTaken, tricksPlayed, phase, pickerScore, opponentScore } = state;
  const done = phase === "done";

  const legalIds = new Set(
    (!done && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  const seatName = (s: number) => s === 0 ? "You (Picker)" : `Bot ${s}`;

  let statusLine = "";
  if (done) statusLine = "Hand complete!";
  else if (turn === 0) statusLine = currentTrick.length === 0 ? "Your lead (clubs & Q/J are trump)" : "Your turn";
  else statusLine = `Waiting on ${seatName(turn)}…`;

  return (
    <div className="sheepshead">
      <div className="sheepshead-header">
        <span>Trump: Clubs + all Queens &amp; Jacks</span>
        <span>Tricks: {tricksPlayed}/6</span>
        <span>You: {tricksTaken[0]} tricks | Bots: {[1,2,3,4].reduce((s, i) => s + tricksTaken[i]!, 0)}</span>
      </div>

      <div className="sheepshead-bots-row">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`sheepshead-seat${turn === s && !done ? " active" : ""}`}>
            <div className="sheepshead-seat-label">{seatName(s)}</div>
            <div className="sheepshead-card-backs">
              {Array.from({ length: hands[s]!.length }).map((_, i) => (
                <div key={i} className="sheepshead-card-back" />
              ))}
            </div>
            <div className="sheepshead-tricks-badge">{tricksTaken[s]} tricks</div>
          </div>
        ))}
      </div>

      <div className="sheepshead-trick-area">
        <div className="sheepshead-trick-label">
          Current Trick {currentTrick.length > 0 ? `(led: ${rankLabel(currentTrick[0]!.card.rank)}${currentTrick[0]!.card.suit})` : ""}
        </div>
        <div className="sheepshead-trick-cards">
          {currentTrick.length === 0 ? (
            <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>
          ) : (
            currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="sheepshead-trick-slot">
                <div className="sheepshead-trick-slot-label">{seatName(seat)}</div>
                <Card card={card} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="sheepshead-status">{statusLine}</div>

      <div className="sheepshead-player-area">
        <div className="sheepshead-player-label">
          Your Hand ({hands[0]!.length} cards) — You are the Picker (solo vs 4 bots)
        </div>
        <div className="sheepshead-player-hand">
          {hands[0]!
            .slice()
            .sort((a, b) => {
              const suitOrder = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
              const sd = (suitOrder[a.suit] ?? 0) - (suitOrder[b.suit] ?? 0);
              return sd !== 0 ? sd : a.rank - b.rank;
            })
            .map(card => {
              const legal = legalIds.has(card.id);
              return legal ? (
                <Card
                  key={card.id}
                  card={card}
                  className=""
                  onClick={() => dispatch({ type: "play", cardId: card.id } as SheepsheadAction)}
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

      {done && pickerScore !== null && opponentScore !== null && (
        <div className="sheepshead-result">
          <h2>Hand Over</h2>
          <div>Your counters: {pickerScore} / 120</div>
          <div>Opponents' counters: {opponentScore}</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Need ≥ 61 to win. (A=11, 10=10, K=4, Q=3, J=2)</div>
          <div>
            <strong>{pickerScore >= 61 ? "You win! (Picker succeeds)" : "Opponents win! (Picker fails)"}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
