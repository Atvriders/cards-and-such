import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoubleDummyWhistState } from "./state.js";
import { isTerminal } from "./state.js";
import { legalPlays } from "../_shared/trick-engine.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as CardType } from "../../engines/deck/index.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./DoubleDummyWhist.css";

type DDWAction = { type: "play"; cardId: string };

const SEAT_NAMES = ["You (S0)", "Bot (S1)", "Your Dummy (S2)", "Bot Dummy (S3)"];
const SEAT_TEAMS = ["player-team", "bot-team", "player-team", "bot-team"];

export function DoubleDummyWhist({ state, dispatch, onGameOver }: GameProps<DoubleDummyWhistState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, trick, turn, phase, tricksWon, trump, message } = state;
  const currentTrick = trick ?? [];
  const tricksTaken = tricksWon ?? [0, 0];
  const tricksPlayed = (tricksWon?.[0] ?? 0) + (tricksWon?.[1] ?? 0);
  const trumpSuit = trump ?? "♠";
  const finalScores = tricksWon ?? [0, 0];
  const done = phase === "done";

  // Player controls seats 0 and 2
  const playerSeats = [0, 2];
  const isPlayerTurn = playerSeats.includes(turn) && !done;

  const legalIds = new Set(
    isPlayerTurn && turn === 0
      ? legalPlays(hands[0] ?? [], currentTrick).map((c: CardType) => c.id)
      : []
  );

  return (
    <div className="ddw">
      <div className="ddw-header">
        <span>Double Dummy Whist</span>
        <span>Trump: {trumpSuit}</span>
        <span>Tricks: {tricksPlayed}/13</span>
        <span>Your team: {tricksTaken[0]}</span>
        <span>Bot team: {tricksTaken[1]}</span>
      </div>

      <div className="ddw-seat-grid">
        {([0, 1, 2, 3] as const).map(seat => {
          const isActive = turn === seat && !done;
          const isPlayerControlled = playerSeats.includes(seat);
          return (
            <div
              key={seat}
              className={`ddw-seat ${SEAT_TEAMS[seat]!}${isActive ? " active-seat" : ""}`}
            >
              <div className="ddw-seat-label">
                {SEAT_NAMES[seat]}{isActive ? " ←" : ""}{isPlayerControlled ? " 🎮" : ""}
              </div>
              <div className="ddw-seat-hand">
                {hands[seat]!
                  .slice()
                  .sort((a, b) => {
                    const so: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
                    const sd = (so[a.suit] ?? 0) - (so[b.suit] ?? 0);
                    return sd !== 0 ? sd : a.rank - b.rank;
                  })
                  .map(card => {
                    const legal = legalIds.has(card.id) && turn === seat;
                    return (
                      <Card
                        key={card.id}
                        card={card}
                        className={
                          legal ? "clickable" :
                          isActive && !legal ? "dim" : ""
                        }
                        {...(legal ? { onClick: () => dispatch({ type: "play", cardId: card.id } as DDWAction) } : {})}
                      />
                    );
                  })}
              </div>
              <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>{hands[seat]!.length} cards</div>
            </div>
          );
        })}
      </div>

      <div className="ddw-trick-area">
        <div className="ddw-trick-label">
          Current Trick {tricksPlayed + 1}
          {currentTrick.length > 0 ? ` (led: ${rankLabel(currentTrick[0]!.card.rank)}${currentTrick[0]!.card.suit})` : ""}
        </div>
        <div className="ddw-trick-cards">
          {currentTrick.length === 0 ? (
            <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>
          ) : (
            currentTrick.map(({ seat, card }: { seat: number; card: CardType }) => (
              <div key={card.id} className="ddw-trick-slot">
                <div className="ddw-trick-slot-label">{SEAT_NAMES[seat]}</div>
                <Card card={card} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="ddw-status">{message}</div>

      {done && finalScores && (
        <div className="ddw-result">
          <h2>
            {finalScores[0]! > finalScores[1]! ? "Your Team Wins!" :
             finalScores[0]! < finalScores[1]! ? "Bot Team Wins." : "Tie!"}
          </h2>
          <div>Your team (S0+S2): {finalScores[0]} tricks</div>
          <div>Bot team (S1+S3): {finalScores[1]} tricks</div>
        </div>
      )}
    </div>
  );
}
