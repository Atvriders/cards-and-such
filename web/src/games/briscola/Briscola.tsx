import { useEffect } from "react";
import type { Card } from "../../engines/deck/index.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BriscolaState } from "./state.js";
import { isTerminal } from "./state.js";
import { legalPlays } from "../_shared/trick-engine.js";
import "./Briscola.css";

type BriscolaAction = { type: "play"; cardId: string };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

function briscolaValue(rank: number): number {
  if (rank === 1) return 11;
  if (rank === 3) return 10;
  if (rank === 13) return 4;
  if (rank === 12) return 3;
  if (rank === 11) return 2;
  return 0;
}

export function Briscola({
  state,
  dispatch,
  onGameOver,
}: GameProps<BriscolaState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trick: currentTrick, score, stock, phase, trump, turn, message } = state;
  const playerHand = hands[0] ?? [];
  const playerPoints = score[0];
  const botPoints = score[1];
  const trumpSuit = trump ?? "♠";
  const trumpCard = stock.length > 0 ? stock[stock.length - 1] : null;
  const done = phase === "done";
  const legal: Card[] = (!done && turn === 0) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map((c: Card) => c.id));
  void legalIds;

  return (
    <div className="briscola">
      <div className="briscola-header">
        <span>You: {playerPoints} pts</span>
        <span>Bot: {botPoints} pts</span>
        <span className="briscola-stock">Stock: {stock.length}</span>
      </div>

      <div className="briscola-trump">
        <span>Trump:</span>
        <span style={{ color: trumpSuit === "♥" || trumpSuit === "♦" ? "#c62828" : "#333" }}>
          {trumpSuit}{trumpCard ? rankLabel(trumpCard.rank) : ""}
        </span>
        {trumpCard && (
          <span style={{ fontSize: "0.75rem", color: "#888" }}>({briscolaValue(trumpCard.rank)} pts)</span>
        )}
      </div>

      <div className="briscola-trick">
        {currentTrick.length === 0
          ? <span className="briscola-label">— trick area —</span>
          : currentTrick.map(({ seat, card }: { seat: number; card: Card }) => (
            <div key={card.id} style={{ textAlign: "center" }}>
              <div className="briscola-label">{seat === 0 ? "You" : "Bot"}</div>
              <div
                className="briscola-card"
                style={{ cursor: "default", color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
              >
                {card.suit}{rankLabel(card.rank)}
                <div style={{ fontSize: "0.65rem", color: "#888" }}>{briscolaValue(card.rank)} pts</div>
              </div>
            </div>
          ))}
      </div>

      <div className="briscola-message">{message}</div>

      {done ? (
        <div className="briscola-done">{message}</div>
      ) : (
        <>
          <div className="briscola-label">Your hand — click to play:</div>
          <div className="briscola-hand">
            {playerHand.map((card: Card) => (
              <div
                key={card.id}
                className={`briscola-card${card.suit === trumpSuit ? " trump" : ""}`}
                style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
                onClick={() => dispatch({ type: "play", cardId: card.id } as BriscolaAction)}
              >
                {card.suit}{rankLabel(card.rank)}
                <div style={{ fontSize: "0.65rem", color: "#888" }}>{briscolaValue(card.rank)} pts</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
