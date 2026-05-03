import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TuteState } from "./state.js";
import { isTerminal, tuteValue, legalPlays } from "./state.js";
import "./Tute.css";

type TuteAction = { type: "play"; cardId: string };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function Tute({
  state,
  dispatch,
  onGameOver,
}: GameProps<TuteState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { playerHand, botHand, trumpSuit, currentTrick, playerPoints, botPoints, playerTricks, botTricks, phase, message } = state;
  const done = phase === "done";

  const legalIds = new Set(
    !done ? legalPlays(playerHand, currentTrick, trumpSuit).map(c => c.id) : []
  );

  return (
    <div className="tute">
      <div className="tute-header">
        <span>You: {playerPoints} pts ({playerTricks} tricks)</span>
        <span>Bot: {botPoints} pts ({botTricks} tricks)</span>
      </div>

      <div className="tute-trump">Trump: {trumpSuit}</div>

      <div className="tute-bots">
        <div className="tute-seat">
          <div className="tute-label">Bot ({botHand.length} cards)</div>
          <div style={{ display: "flex", gap: 4 }}>
            {botHand.map((_, i) => <div key={i} className="tute-card-back" />)}
          </div>
        </div>
      </div>

      <div className="tute-trick">
        {currentTrick.length === 0
          ? <span className="tute-label">— trick area —</span>
          : currentTrick.map(({ seat, card }) => (
            <div key={card.id} style={{ textAlign: "center" }}>
              <div className="tute-label">{seat === 0 ? "You" : "Bot"}</div>
              <div
                className="tute-card"
                style={{ cursor: "default", color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
              >
                {card.suit}{rankLabel(card.rank)}
                <div style={{ fontSize: "0.65rem", color: "#888" }}>{tuteValue(card.rank)} pts</div>
              </div>
            </div>
          ))}
      </div>

      <div className="tute-message">{message}</div>

      {!done && (
        <>
          <div className="tute-label">Your hand — click to play:</div>
          <div data-testid="hint-target-tute-hand" className="tute-hand">
            {playerHand.map(card => {
              const legal = legalIds.has(card.id);
              return (
                <div
                  key={card.id}
                  className={`tute-card${card.suit === trumpSuit ? " trump" : ""}${!legal ? " illegal" : ""}`}
                  style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
                  onClick={() => legal && dispatch({ type: "play", cardId: card.id } as TuteAction)}
                >
                  {card.suit}{rankLabel(card.rank)}
                  <div style={{ fontSize: "0.65rem", color: "#888" }}>{tuteValue(card.rank)} pts</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
