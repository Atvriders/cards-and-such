import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HeartsState, HeartsSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Hearts.css";

type HeartsAction = { type: "play"; cardId: string };

export function Hearts({
  state,
  dispatch,
  onGameOver,
}: GameProps<HeartsState, HeartsSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const { hands, currentTrick, turn, heartsBroken, tricksPlayed, takenCards, handDone, finalScores, leadSeat } = state;

  // Legal card ids for seat 0
  const legalIds = new Set(
    (!handDone && turn === 0)
      ? legalPlays(state, 0, hands[0]!).map(c => c.id)
      : []
  );

  // Penalty tallies
  function penaltyOf(seatCards: readonly (readonly { suit: string; rank: number }[])[], seat: number): number {
    return (seatCards[seat] ?? []).reduce((sum, c) => {
      if (c.suit === "♥") return sum + 1;
      if (c.suit === "♠" && c.rank === 12) return sum + 13;
      return sum;
    }, 0);
  }

  const penalties = [0, 1, 2, 3].map(s => penaltyOf(takenCards as readonly (readonly { suit: string; rank: number }[])[],s));

  // Status line
  let statusLine = "";
  if (handDone) {
    statusLine = "Hand complete!";
  } else if (turn === 0) {
    statusLine = currentTrick.length === 0 ? "Your lead" : "Your turn";
  } else {
    statusLine = `Waiting on Bot ${turn}…`;
  }

  // Shoot the moon detection for result panel
  let moonNote = "";
  if (handDone && finalScores) {
    const shooter = finalScores.findIndex(p => p === 0 && [0, 1, 2, 3].some(
      s => finalScores[s] === 26 && s !== finalScores.indexOf(0)
    ));
    // Simpler: find who has all penalties summed to 26 before shoot adjustment
    // Check raw sum = 26*4 (4×26) means shoot happened
    const rawSum = finalScores.reduce((a, b) => a + b, 0);
    if (rawSum === 26 * 3) {
      // someone has 0, others have 26
      const shooterSeat = finalScores.findIndex(p => p === 0);
      moonNote = shooterSeat === 0 ? "You shot the moon! +26 to bots." : `Bot ${shooterSeat} shot the moon! +26 to everyone else.`;
    }
  }

  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;

  return (
    <div className="hearts">
      {/* Header */}
      <div className="hearts-header">
        <span>Tricks: {tricksPlayed}/13</span>
        <span>Hearts broken: {heartsBroken ? "Yes" : "No"}</span>
        {[0, 1, 2, 3].map(s => (
          <span key={s}>{seatName(s)}: {penalties[s]}pts</span>
        ))}
      </div>

      {/* Bot seats row */}
      <div className="hearts-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`hearts-seat${turn === s && !handDone ? " active" : ""}`}>
            <div className="hearts-seat-label">{seatName(s)}</div>
            <div className="hearts-face-down-count">
              {Array.from({ length: hands[s]!.length }).map((_, i) => (
                <div key={i} className="hearts-card-back" />
              ))}
            </div>
            <div className="hearts-penalty-badge">{penalties[s]} pts</div>
          </div>
        ))}
      </div>

      {/* Current trick */}
      <div className="hearts-trick-area">
        <div className="hearts-trick-label">
          Current Trick {currentTrick.length > 0 ? `(led: ${currentTrick[0]!.card.suit})` : ""}
        </div>
        <div className="hearts-trick-cards">
          {currentTrick.length === 0 ? (
            <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>
          ) : (
            currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="hearts-trick-slot">
                <div className="hearts-trick-slot-label">{seatName(seat)}</div>
                <Card card={card} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Status */}
      <div className="hearts-status">{statusLine}</div>

      {/* Player hand */}
      <div className="hearts-player-area">
        <div className="hearts-player-label">
          Your Hand ({hands[0]!.length} cards) — {penalties[0]} pts taken
        </div>
        <div className="hearts-player-hand">
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
                  onClick={() => dispatch({ type: "play", cardId: card.id } as HeartsAction)}
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

      {/* Final result */}
      {handDone && finalScores && (
        <div className="hearts-result">
          <h2>Hand Over</h2>
          <div className="hearts-result-scores">
            {[0, 1, 2, 3].map(s => (
              <div key={s} className="hearts-result-score">
                {seatName(s)}: {finalScores[s]} penalty pts
              </div>
            ))}
          </div>
          {moonNote && <div className="hearts-moon-note">{moonNote}</div>}
          <div>Your score: <strong>{Math.max(0, 26 - finalScores[0]!)}</strong> / 26</div>
        </div>
      )}
    </div>
  );
}
