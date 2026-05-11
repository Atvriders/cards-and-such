import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WhistState, WhistSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { legalPlays } from "../_shared/trick-engine.js";
import type { Card as CardType } from "../../engines/deck/index.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Whist.css";

type WhistAction = { type: "play"; cardId: string };

export function Whist({ state, dispatch, onGameOver }: GameProps<WhistState, WhistSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, trick, turn, trump, tricksWon, phase, score } = state;
  const currentTrick = trick ?? [];
  const trumpSuit = trump ?? "♠";
  const tricksTaken = tricksWon ?? [0, 0, 0, 0];
  const tricksPlayed = (tricksTaken[0] ?? 0) + (tricksTaken[1] ?? 0) + (tricksTaken[2] ?? 0) + (tricksTaken[3] ?? 0);
  const finalScores = score ?? [0, 0];
  const done = phase === "done";
  const playerHand = hands[0] ?? [];

  const legal: readonly CardType[] =
    !done && turn === 0 ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map((c: CardType) => c.id));

  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;
  const seatTeam = (s: number) => s % 2 === 0 ? "Your team" : "Opp team";

  let statusLine = "";
  if (done) {
    statusLine = "Hand complete!";
  } else if (turn === 0) {
    statusLine = currentTrick.length === 0 ? `Your lead (trump: ${trumpSuit})` : "Your turn";
  } else {
    statusLine = `Waiting on ${seatName(turn)}…`;
  }

  const team0Tricks = tricksTaken[0]! + tricksTaken[2]!;
  const team1Tricks = tricksTaken[1]! + tricksTaken[3]!;

  return (
    <div className="whist">
      <div className="whist-header">
        <span>Trump: {trumpSuit}</span>
        <span>Tricks: {tricksPlayed}/13</span>
        <span>Your team: {team0Tricks} tricks</span>
        <span>Opp team: {team1Tricks} tricks</span>
        {[0, 1, 2, 3].map(s => (
          <span key={s}>{seatName(s)}: {tricksTaken[s]}</span>
        ))}
      </div>

      <div className="whist-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`whist-seat${turn === s && !done ? " active" : ""}`}>
            <div className="whist-seat-label">{seatName(s)} ({seatTeam(s)})</div>
            <div className="whist-card-backs">
              {Array.from({ length: hands[s]!.length }).map((_, i) => (
                <div key={i} className="whist-card-back" />
              ))}
            </div>
            <div className="whist-tricks-badge">{tricksTaken[s]} tricks</div>
          </div>
        ))}
      </div>

      <div className="whist-trick-area">
        <div className="whist-trick-label">
          Current Trick {currentTrick.length > 0 ? `(led: ${rankLabel(currentTrick[0]!.card.rank)}${currentTrick[0]!.card.suit})` : ""}
        </div>
        <div className="whist-trick-cards">
          {currentTrick.length === 0 ? (
            <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>
          ) : (
            currentTrick.map(({ seat, card }: { seat: number; card: CardType }) => (
              <div key={card.id} className="whist-trick-slot">
                <div className="whist-trick-slot-label">{seatName(seat)}</div>
                <Card card={card} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="whist-status">{statusLine}</div>

      <div className="whist-player-area">
        <div className="whist-player-label">
          Your Hand ({hands[0]!.length} cards) — partner: Bot 2 — {tricksTaken[0]} tricks taken
        </div>
        <div className="whist-player-hand">
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
                  onClick={() => dispatch({ type: "play", cardId: card.id } as WhistAction)}
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

      {done && finalScores && (
        <div className="whist-result">
          <h2>Hand Over</h2>
          <div className="whist-result-scores">
            <div className="whist-result-score">Your team (You+Bot 2): {finalScores[0]} points</div>
            <div className="whist-result-score">Opp team (Bot 1+Bot 3): {finalScores[1]} points</div>
          </div>
          <div>
            {finalScores[0]! > finalScores[1]! ? "Your team wins!" :
             finalScores[0]! < finalScores[1]! ? "Opponent team wins." : "Tie!"}
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Points = tricks won above 6</div>
        </div>
      )}
    </div>
  );
}
