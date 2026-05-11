import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KnockOutWhistState, KnockOutWhistSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { legalPlays } from "../_shared/trick-engine.js";
import type { Card as CardType } from "../../engines/deck/index.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./KnockOutWhist.css";

type KOWAction = { type: "play"; cardId: string } | { type: "next-round" };

export function KnockOutWhist({ state, dispatch, onGameOver }: GameProps<KnockOutWhistState, KnockOutWhistSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, trick, tricksWon, phase, leadSeat, turn, trump, message } = state;
  const playerHand = hands[0] ?? [];
  const currentTrick = trick ?? [];
  const tricksTaken = tricksWon ?? [0, 0];
  const active: readonly boolean[] = [true, true];
  const trumpSuit = trump ?? "♥";
  const roundNumber = 1;
  const cardsPerRound = 7;
  const tricksInRound = currentTrick.length;
  const finalWinner = (tricksTaken[0] ?? 0) >= (tricksTaken[1] ?? 0) ? 0 : 1;
  const seats = hands.length;
  const done = phase === "done";
  const betweenRounds = false;

  // leadSeat preserved from destructure for parity with state shape.
  void leadSeat;

  const legal: readonly CardType[] =
    !done && !betweenRounds && turn === 0 ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map((c: CardType) => c.id));

  const seatName = (i: number) => i === 0 ? "You" : `Bot ${i}`;

  return (
    <div className="kow">
      <div className="kow-header">
        <span>Trump: {trumpSuit}</span>
        <span>Round {roundNumber}</span>
        <span>{cardsPerRound} cards/round</span>
        <span>Tricks: {tricksInRound}/{cardsPerRound}</span>
      </div>

      <div className="kow-bots-row">
        {Array.from({ length: seats - 1 }, (_, i) => i + 1).map(s => (
          <div key={s} className={`kow-seat${!active[s] ? " eliminated" : ""}${turn === s && !done && !betweenRounds ? " active" : ""}`}>
            <div className="kow-seat-label">{seatName(s)}</div>
            <div className="kow-card-backs">
              {Array.from({ length: (hands[s] ?? []).length }).map((_, i) => (
                <div key={i} className="kow-card-back" />
              ))}
            </div>
            <div className="kow-tricks-badge">{tricksTaken[s] ?? 0} tricks</div>
          </div>
        ))}
      </div>

      <div className="kow-trick-area">
        <div className="kow-trick-label">
          Current Trick{currentTrick.length > 0 ? ` (led: ${rankLabel(currentTrick[0]!.card.rank)}${currentTrick[0]!.card.suit})` : ""}
        </div>
        <div className="kow-trick-cards">
          {currentTrick.length === 0 ? (
            <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>
          ) : (
            currentTrick.map(({ seat, card }: { seat: number; card: CardType }) => (
              <div key={card.id} className="kow-trick-slot">
                <div className="kow-trick-slot-label">{seatName(seat)}</div>
                <Card card={card} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="kow-status">{message}</div>

      {betweenRounds && (
        <button
          className="kow-next-btn"
          onClick={() => dispatch({ type: "next-round" } as KOWAction)}
        >
          Next Round
        </button>
      )}

      <div className="kow-player-area">
        <div className="kow-player-label">
          Your Hand ({playerHand.length} cards) — {tricksTaken[0] ?? 0} tricks — {active[0] ? "Active" : "Eliminated"}
        </div>
        <div className="kow-player-hand">
          {playerHand
            .slice()
            .sort((a: CardType, b: CardType) => {
              const so: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
              const sd = (so[a.suit] ?? 0) - (so[b.suit] ?? 0);
              return sd !== 0 ? sd : a.rank - b.rank;
            })
            .map((card: CardType) => {
              const isLegal = legalIds.has(card.id);
              return isLegal ? (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => dispatch({ type: "play", cardId: card.id } as KOWAction)}
                />
              ) : (
                <Card key={card.id} card={card} className="dim" />
              );
            })}
        </div>
      </div>

      {done && (
        <div className="kow-result">
          <h2>
            {finalWinner === 0 ? "You Win!" : `Bot ${finalWinner} Wins.`}
          </h2>
          <div>{message}</div>
        </div>
      )}
    </div>
  );
}
