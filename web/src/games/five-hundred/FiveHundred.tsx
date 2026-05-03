import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FiveHundredState, FiveHundredSettings } from "./state.js";
import { legalPlays, isTerminal, VALID_BIDS } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./FiveHundred.css";

type FiveHundredAction =
  | { type: "bid"; bidIndex: number }
  | { type: "play"; cardId: string };

export function FiveHundred({ state, dispatch, onGameOver }: GameProps<FiveHundredState, FiveHundredSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, currentTrick, turn, phase, trumpSuit, contractBid, contractSeat, tricksTaken, tricksPlayed, teamScore, message } = state;
  const done = phase === "done";

  const legalIds = new Set(
    (phase === "playing" && !done && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;

  let statusLine = message;
  if (phase === "playing" && !done) {
    statusLine = turn === 0
      ? (currentTrick.length === 0 ? `Your lead (trump: ${trumpSuit ?? "none"})` : "Your turn")
      : `Waiting on ${seatName(turn)}…`;
  }

  const team0Tricks = tricksTaken[0]! + tricksTaken[2]!;
  const team1Tricks = tricksTaken[1]! + tricksTaken[3]!;

  return (
    <div className="fivehundred">
      <div className="fivehundred-header">
        <span>Score: You+Bot2={teamScore[0]} | Bot1+Bot3={teamScore[1]}</span>
        {phase !== "bidding" && <span>Trump: {trumpSuit ?? "none"}</span>}
        {contractBid && <span>Contract: {contractSeat === 0 ? "You" : `Bot ${contractSeat}`} bid {contractBid.level}{contractBid.trump}</span>}
        {phase === "playing" && <span>Tricks: {tricksPlayed}/10 (Team: {team0Tricks} vs {team1Tricks})</span>}
      </div>

      <div className="fivehundred-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`fivehundred-seat${turn === s && !done ? " active" : ""}`}>
            <div className="fivehundred-seat-label">{seatName(s)}</div>
            <div className="fivehundred-card-backs">
              {Array.from({ length: hands[s]!.length }).map((_, i) => (
                <div key={i} className="fivehundred-card-back" />
              ))}
            </div>
            {phase !== "bidding" && (
              <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{tricksTaken[s]} tricks</div>
            )}
            {phase === "bidding" && state.bids[s] !== null && (
              <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                {state.bids[s] === "pass" ? "Pass" : `${(state.bids[s] as { level: number; trump: string }).level}${(state.bids[s] as { level: number; trump: string }).trump}`}
              </div>
            )}
          </div>
        ))}
      </div>

      {phase === "bidding" && turn === 0 && (
        <div className="fivehundred-bid-panel">
          <h3>Your Bid</h3>
          <div className="fivehundred-bid-buttons">
            {VALID_BIDS.map((bid, i) => (
              <button data-testid="hint-target-five-hundred-primary"
                key={i}
                className="fivehundred-bid-btn"
                onClick={() => dispatch({ type: "bid", bidIndex: i } as FiveHundredAction)}
              >
                {bid.level}{bid.trump}
              </button>
            ))}
            <button
              className="fivehundred-bid-btn pass"
              onClick={() => dispatch({ type: "bid", bidIndex: -1 } as FiveHundredAction)}
            >
              Pass
            </button>
          </div>
        </div>
      )}

      {phase === "playing" && (
        <>
          <div className="fivehundred-trick-area">
            <div className="fivehundred-trick-label">
              Current Trick {currentTrick.length > 0 ? `(led: ${rankLabel(currentTrick[0]!.card.rank)}${currentTrick[0]!.card.suit})` : ""}
            </div>
            <div className="fivehundred-trick-cards">
              {currentTrick.length === 0 ? (
                <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>
              ) : (
                currentTrick.map(({ seat, card }) => (
                  <div key={card.id} className="fivehundred-trick-slot">
                    <div className="fivehundred-trick-slot-label">{seatName(seat)}</div>
                    <Card card={card} />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="fivehundred-status">{statusLine}</div>

          <div className="fivehundred-player-area">
            <div className="fivehundred-player-label">
              Your Hand ({hands[0]!.length} cards) — {tricksTaken[0]} tricks taken
            </div>
            <div className="fivehundred-player-hand">
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
                      onClick={() => dispatch({ type: "play", cardId: card.id } as FiveHundredAction)}
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

      {phase === "bidding" && turn !== 0 && (
        <div className="fivehundred-status">Waiting for bots to bid…</div>
      )}

      {done && (
        <div className="fivehundred-result">
          <h2>Hand Over</h2>
          <div>{message}</div>
          <div>Final Score — Your team: {teamScore[0]} | Opp team: {teamScore[1]}</div>
          <div>{teamScore[0]! > teamScore[1]! ? "Your team wins!" : teamScore[0]! < teamScore[1]! ? "Opponent team wins." : "Tie!"}</div>
        </div>
      )}
    </div>
  );
}
