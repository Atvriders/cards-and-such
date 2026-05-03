import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KachuufiState } from "./state.js";
import { isTerminal } from "./state.js";
import type { Suit } from "../../engines/deck/index.js";
import "./Game.css";

type KachuufiAction =
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

export function Game({ state, dispatch, onGameOver }: GameProps<KachuufiState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [bidTricks, setBidTricks] = useState(6);
  const [bidTrump, setBidTrump] = useState<Suit>("♠");

  const { playerHand, playerPlayed, botPlayed, bid, trump, tricksWon, phase, message, finalScores } = state;
  const done = phase === "done";
  const isBidPhase = phase === "bid";
  const isPlayPhase = phase === "play";

  const sortedHand = [...playerHand].sort((a, b) => {
    if (trump && a.suit === trump && b.suit !== trump) return -1;
    if (trump && b.suit === trump && a.suit !== trump) return 1;
    if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
    return (b.rank === 1 ? 14 : b.rank) - (a.rank === 1 ? 14 : a.rank);
  });

  return (
    <div className="kachuufi">
      <div className="kachuufi-header">
        <span>Tricks — You: {tricksWon.player} Bot: {tricksWon.bot}</span>
        {trump && <span>Trump: <strong style={{ color: trump === "♥" || trump === "♦" ? "#c62828" : "#333" }}>{trump}</strong></span>}
        {bid > 0 && <span>Your bid: {bid}</span>}
      </div>

      <div className="kachuufi-message">{message}</div>

      {finalScores && (
        <div className="kachuufi-done">
          You: {finalScores.player > 0 ? "+" : ""}{finalScores.player} | Bot: {finalScores.bot > 0 ? "+" : ""}{finalScores.bot}
        </div>
      )}

      {isBidPhase && (
        <div className="kachuufi-bid">
          <label>Bid tricks (1–13):
            <select value={bidTricks} onChange={e => setBidTricks(Number(e.target.value))}>
              {Array.from({ length: 13 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label>Trump suit:
            <select value={bidTrump} onChange={e => setBidTrump(e.target.value as Suit)}>
              {SUITS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button data-testid="hint-target-kachuufi-action" className="kachuufi-btn" onClick={() => dispatch({ type: "bid", tricks: bidTricks, trump: bidTrump } as KachuufiAction)}>
            Bid!
          </button>
        </div>
      )}

      {isPlayPhase && (
        <div className="kachuufi-table">
          <div className="kachuufi-slot">
            <div className="kachuufi-label">Your card</div>
            <div className={`kachuufi-card${playerPlayed ? " played" : " empty"}`}
              style={{ color: playerPlayed && (playerPlayed.suit === "♥" || playerPlayed.suit === "♦") ? "#c62828" : "#333" }}>
              {playerPlayed ? `${playerPlayed.suit}${rankLabel(playerPlayed.rank)}` : "—"}
            </div>
          </div>
          <div className="kachuufi-slot">
            <div className="kachuufi-label">Bot card</div>
            <div className={`kachuufi-card${botPlayed ? " played bot" : " empty"}`}
              style={{ color: botPlayed && (botPlayed.suit === "♥" || botPlayed.suit === "♦") ? "#c62828" : "#333" }}>
              {botPlayed ? `${botPlayed.suit}${rankLabel(botPlayed.rank)}` : "—"}
            </div>
          </div>
        </div>
      )}

      {!done && isPlayPhase && (
        <>
          <div className="kachuufi-label">Your hand ({playerHand.length}) — click to play:</div>
          <div className="kachuufi-hand">
            {sortedHand.map(card => (
              <div
                key={card.id}
                className={`kachuufi-card hand${card.suit === trump ? " trump-card" : ""}`}
                style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
                onClick={() => dispatch({ type: "play", cardId: card.id } as KachuufiAction)}
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
