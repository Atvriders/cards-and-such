import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MusState } from "./state.js";
import { isTerminal, handValue, hasJuego, musCardValue } from "./state.js";
import "./Mus.css";

type MusAction = { type: "bid"; amount: number };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function Mus({
  state,
  dispatch,
  onGameOver,
}: GameProps<MusState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { playerHand, botHands, phase, message, scores, winner } = state;
  const done = phase === "done";
  const pv = handValue(playerHand);
  const pHasJ = hasJuego(playerHand);

  // Bid buttons: 0, half, actual value
  const bidOptions = [0, Math.floor(pv / 2), pv];

  return (
    <div className="mus">
      <div className="mus-header">Mus — Juego Phase</div>

      <div className="mus-hands">
        <div className="mus-player-area">
          <div className="mus-label">Your hand</div>
          <div className="mus-hand">
            {playerHand.map(card => (
              <div
                key={card.id}
                className={`mus-card${pHasJ ? " juego" : ""}`}
                style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
              >
                {card.suit}{rankLabel(card.rank)}
                <div style={{ fontSize: "0.65rem", color: "#888" }}>{musCardValue(card.rank)}</div>
              </div>
            ))}
          </div>
          <div className="mus-value">Value: {pv}{pHasJ ? " ✓ Juego" : ""}</div>
        </div>

        {botHands.map((hand, i) => {
          const bv = handValue(hand);
          const bj = hasJuego(hand);
          return (
            <div key={i} className="mus-bot-area">
              <div className="mus-label">Bot {i + 1}</div>
              <div className="mus-hand">
                {!done
                  ? hand.map((_, j) => <div key={j} className="mus-card-back" />)
                  : hand.map(card => (
                    <div
                      key={card.id}
                      className={`mus-card${bj ? " juego" : ""}`}
                      style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
                    >
                      {card.suit}{rankLabel(card.rank)}
                    </div>
                  ))}
              </div>
              {done && <div className="mus-value">Value: {bv}{bj ? " ✓ Juego" : ""}</div>}
            </div>
          );
        })}
      </div>

      <div className="mus-message">{message}</div>

      {done && (
        <div className="mus-done">
          <div className="mus-scores">
            <div>You: {scores[0]} pts {winner === 0 ? "🏆" : ""}</div>
            {[1, 2, 3].map(i => <div key={i}>Bot {i}: {scores[i]} pts {winner === i ? "🏆" : ""}</div>)}
          </div>
        </div>
      )}

      {!done && (
        <div className="mus-bid-area">
          <div className="mus-label">Place your Juego bid (how confident are you in your hand?):</div>
          <div className="mus-bid-row">
            <button className="mus-bid-btn pass" onClick={() => dispatch({ type: "bid", amount: 0 } as MusAction)}>
              Pass (0)
            </button>
            {bidOptions.slice(1).map(amt => (
              <button
                key={amt}
                className="mus-bid-btn"
                onClick={() => dispatch({ type: "bid", amount: amt } as MusAction)}
              >
                Bid {amt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
