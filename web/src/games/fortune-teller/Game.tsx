import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FortuneTellerState, FortuneTellerSettings } from "./state.js";
import type { FortuneTellerAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FortuneTeller({
  state,
  dispatch,
  onGameOver,
}: GameProps<FortuneTellerState, FortuneTellerSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const card = state.currentCard;
  const isRed = card?.suit === "♥" || card?.suit === "♦";

  return (
    <div className="ft-game">
      <div className="ft-title">Fortune Teller</div>
      <div className="ft-stats">
        <span>Drawn: {state.drawnCards.length}/{state.deck.length}</span>
        <span>Remaining: {state.cardsRemaining}</span>
      </div>

      <div className="ft-card-area">
        {card ? (
          <div className={`ft-card ${isRed ? "red" : "black"}`}>
            <div className="ft-card-corner ft-top-left">
              <div className="ft-card-rank">{card.rank}</div>
              <div className="ft-card-suit">{card.suit}</div>
            </div>
            <div className="ft-card-center">{card.suit}</div>
            <div className="ft-card-corner ft-bot-right">
              <div className="ft-card-rank">{card.rank}</div>
              <div className="ft-card-suit">{card.suit}</div>
            </div>
          </div>
        ) : (
          <div className="ft-card-back">
            <div className="ft-card-back-inner">?</div>
          </div>
        )}
      </div>

      {card && (
        <div className="ft-fortune">
          <div className="ft-fortune-label">Your Fortune</div>
          <div className="ft-fortune-text">{card.fortune}</div>
        </div>
      )}

      {!state.gameOver && (
        <button className="ft-draw-btn" onClick={() => dispatch({ type: "draw" } as FortuneTellerAction)}>
          {card ? "Draw Next Card" : "Draw Your Fortune"}
        </button>
      )}

      {state.gameOver && (
        <div className="ft-game-over">
          <div>All fortunes revealed!</div>
          <div className="ft-score">Score: {terminal?.score}</div>
          <button className="ft-draw-btn" onClick={() => dispatch({ type: "reset" } as FortuneTellerAction)}>
            New Reading
          </button>
        </div>
      )}

      {state.drawnCards.length > 1 && (
        <div className="ft-history">
          <div className="ft-history-label">Past Cards</div>
          <div className="ft-history-list">
            {state.drawnCards.slice(0, -1).reverse().slice(0, 5).map(c => (
              <span key={c.id} className={`ft-history-card ${c.suit === "♥" || c.suit === "♦" ? "red" : "black"}`}>
                {c.rank}{c.suit}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
