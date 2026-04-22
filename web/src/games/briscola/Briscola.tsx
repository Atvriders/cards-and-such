import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BriscolaState } from "./state.js";
import { isTerminal, briscolaValue } from "./state.js";
import "./Briscola.css";

type BriscolaAction = { type: "play"; cardId: string };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function Briscola({
  state,
  dispatch,
  onGameOver,
}: GameProps<BriscolaState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { playerHand, trump, trumpSuit, currentTrick, playerPoints, botPoints, stock, phase, message } = state;
  const done = phase === "done";

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
          {trumpSuit}{rankLabel(trump.rank)}
        </span>
        <span style={{ fontSize: "0.75rem", color: "#888" }}>({briscolaValue(trump.rank)} pts)</span>
      </div>

      <div className="briscola-trick">
        {currentTrick.length === 0
          ? <span className="briscola-label">— trick area —</span>
          : currentTrick.map(({ seat, card }) => (
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
            {playerHand.map(card => (
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
