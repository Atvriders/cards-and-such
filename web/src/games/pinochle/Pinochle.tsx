import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PinochleState, PinochleSettings } from "./state.js";
import { legalPlays, isTerminal, computeMelds } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Pinochle.css";

type PinochleAction = { type: "play"; cardId: string };

export function Pinochle({ state, dispatch, onGameOver }: GameProps<PinochleState, PinochleSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, currentTrick, turn, trumpSuit, tricksTaken, tricksPlayed, phase, finalScores, meldsByTeam } = state;
  const done = phase === "done";

  const legalIds = new Set(
    (!done && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;
  const myMelds = computeMelds(hands[0]!, trumpSuit);

  let statusLine = "";
  if (done) statusLine = "Hand complete!";
  else if (turn === 0) statusLine = currentTrick.length === 0 ? `Your lead (trump: ${trumpSuit})` : "Your turn";
  else statusLine = `Waiting on ${seatName(turn)}…`;

  const team0Tricks = tricksTaken[0]! + tricksTaken[2]!;
  const team1Tricks = tricksTaken[1]! + tricksTaken[3]!;

  return (
    <div className="pinochle">
      <div className="pinochle-header">
        <span>Trump: {trumpSuit}</span>
        <span>Tricks: {tricksPlayed}/12 (Team: {team0Tricks} vs {team1Tricks})</span>
        <span>Meld pts: Your team={meldsByTeam[0]} | Opp={meldsByTeam[1]}</span>
      </div>

      {myMelds.length > 0 && (
        <div className="pinochle-melds">
          <h4>Your Melds (in hand)</h4>
          <div className="pinochle-meld-list">
            {myMelds.map((m, i) => (
              <span key={i} className="pinochle-meld-item">{m.name}: +{m.value}</span>
            ))}
          </div>
        </div>
      )}

      <div className="pinochle-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`pinochle-seat${turn === s && !done ? " active" : ""}`}>
            <div className="pinochle-seat-label">{seatName(s)}</div>
            <div className="pinochle-card-backs">
              {Array.from({ length: hands[s]!.length }).map((_, i) => (
                <div key={i} className="pinochle-card-back" />
              ))}
            </div>
            <div className="pinochle-tricks-badge">{tricksTaken[s]} tricks</div>
          </div>
        ))}
      </div>

      <div className="pinochle-trick-area">
        <div className="pinochle-trick-label">
          Current Trick {currentTrick.length > 0 ? `(led: ${rankLabel(currentTrick[0]!.card.rank)}${currentTrick[0]!.card.suit})` : ""}
        </div>
        <div className="pinochle-trick-cards">
          {currentTrick.length === 0 ? (
            <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>
          ) : (
            currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="pinochle-trick-slot">
                <div className="pinochle-trick-slot-label">{seatName(seat)}</div>
                <Card card={card} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pinochle-status">{statusLine}</div>

      <div className="pinochle-player-area">
        <div className="pinochle-player-label">
          Your Hand ({hands[0]!.length} cards) — partner: Bot 2 — {tricksTaken[0]} tricks
        </div>
        <div className="pinochle-player-hand">
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
                  onClick={() => dispatch({ type: "play", cardId: card.id } as PinochleAction)}
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
        <div className="pinochle-result">
          <h2>Hand Over</h2>
          <div className="pinochle-score-row">
            <div className="pinochle-score-box">Your team (You+Bot2): {finalScores[0]} pts</div>
            <div className="pinochle-score-box">Opp team (Bot1+Bot3): {finalScores[1]} pts</div>
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
            (counters: A=11, 10=10, K=4, Q=3, J=2, 9=0) + meld points
          </div>
          <div>
            {finalScores[0]! > finalScores[1]! ? "Your team wins!" :
             finalScores[0]! < finalScores[1]! ? "Opponent team wins." : "Tie!"}
          </div>
        </div>
      )}
    </div>
  );
}
