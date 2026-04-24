import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TarneebState } from "./state.js";
import { isTerminal } from "./state.js";
import type { Suit } from "../../engines/deck/index.js";
import "./Game.css";

type TarneebAction =
  | { type: "bid"; tricks: number; trump: Suit }
  | { type: "play"; cardId: string };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function Game({ state, dispatch, onGameOver }: GameProps<TarneebState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [bidTricks, setBidTricks] = useState(7);
  const [bidTrump, setBidTrump] = useState<Suit>("♠");

  const { playerHand, playerPlayed, botPlayed, bid, trump, tricksWon, phase, message, finalScores } = state;
  const done = phase === "done";
  const isBidPhase = phase === "bid";
  const isPlayPhase = phase === "play";

  // Group hand by suit for readability
  const sortedHand = [...playerHand].sort((a, b) => {
    const suitOrder: Record<Suit, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
    if (a.suit !== b.suit) return suitOrder[a.suit] - suitOrder[b.suit];
    const ra = a.rank === 1 ? 14 : a.rank;
    const rb = b.rank === 1 ? 14 : b.rank;
    return rb - ra;
  });

  return (
    <div className="tarneeb">
      <div className="tarneeb-header">
        <span>Tricks — You: {tricksWon.player} Bot: {tricksWon.bot}</span>
        {trump && <span>Trump: <strong style={{ color: trump === "♥" || trump === "♦" ? "#c62828" : "#333" }}>{trump}</strong></span>}
        {bid > 0 && <span>Your bid: {bid}</span>}
      </div>

      <div className="tarneeb-message">{message}</div>

      {finalScores && (
        <div className="tarneeb-done">
          Final: You {finalScores.player > 0 ? "+" : ""}{finalScores.player} | Bot {finalScores.bot > 0 ? "+" : ""}{finalScores.bot}
        </div>
      )}

      {isBidPhase && (
        <div className="tarneeb-bid">
          <label>Bid tricks:
            <select value={bidTricks} onChange={e => setBidTricks(Number(e.target.value))}>
              {[7, 8, 9, 10, 11, 12, 13].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label>Trump suit:
            <select value={bidTrump} onChange={e => setBidTrump(e.target.value as Suit)}>
              {SUITS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button className="tarneeb-btn" onClick={() => dispatch({ type: "bid", tricks: bidTricks, trump: bidTrump } as TarneebAction)}>
            Confirm Bid
          </button>
        </div>
      )}

      {isPlayPhase && (
        <div className="tarneeb-table">
          <div className="tarneeb-played">
            <div className="tarneeb-label">Your card</div>
            <div className={`tarneeb-card${playerPlayed ? " played" : " empty"}`}
              style={{ color: playerPlayed && (playerPlayed.suit === "♥" || playerPlayed.suit === "♦") ? "#c62828" : "#333" }}>
              {playerPlayed ? `${playerPlayed.suit}${rankLabel(playerPlayed.rank)}` : "—"}
            </div>
          </div>
          <div className="tarneeb-played">
            <div className="tarneeb-label">Bot card</div>
            <div className={`tarneeb-card${botPlayed ? " played bot" : " empty"}`}
              style={{ color: botPlayed && (botPlayed.suit === "♥" || botPlayed.suit === "♦") ? "#c62828" : "#333" }}>
              {botPlayed ? `${botPlayed.suit}${rankLabel(botPlayed.rank)}` : "—"}
            </div>
          </div>
        </div>
      )}

      {!done && isPlayPhase && (
        <>
          <div className="tarneeb-label">Your hand ({playerHand.length}) — click to play:</div>
          <div className="tarneeb-hand">
            {sortedHand.map(card => (
              <div
                key={card.id}
                className={`tarneeb-card hand${card.suit === trump ? " trump-card" : ""}`}
                style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
                onClick={() => dispatch({ type: "play", cardId: card.id } as TarneebAction)}
              >
                {card.suit}{rankLabel(card.rank)}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
