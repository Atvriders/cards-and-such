import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BeziqueState, BeziqueSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Bezique.css";

type BeziqueAction = { type: "play"; cardId: string };

export function Bezique({
  state,
  dispatch,
  onGameOver,
}: GameProps<BeziqueState, BeziqueSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, stock, currentTrick, turn, phase, trumpSuit, playerScore, botScore, message } = state;
  const done = phase === "done";
  const legalIds = new Set(
    (!done && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="bezique">
      <div className="bz-header">
        <span>You: {playerScore} pts</span>
        <span>Bot: {botScore} pts</span>
        {trumpSuit ? <span>Trump: {trumpSuit}</span> : <span>Trump: (none yet)</span>}
        <span>Stock: {stock.length}</span>
      </div>

      <div className="bz-bot-area">
        <div className={`bz-bot-seat${turn === 1 && !done ? " active" : ""}`}>
          <div className="bz-label">Bot</div>
          <div className="bz-card-backs">
            {hands[1]!.map((_, i) => <div key={i} className="bz-card-back" />)}
          </div>
        </div>
      </div>

      <div className="bz-trick-area">
        <div className="bz-label">Current Trick</div>
        <div className="bz-trick-cards">
          {currentTrick.length === 0
            ? <span className="bz-empty">—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="bz-trick-slot">
                <div className="bz-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>

      <div className="bz-status">{message}</div>

      <div className="bz-player-area">
        <div className="bz-label">Your Hand</div>
        <div className="bz-player-hand">
          {hands[0]!.map(card => {
            const legal = legalIds.has(card.id);
            return legal
              ? <Card data-testid="hint-target-bezique-primary" key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as BeziqueAction)} />
              : <Card key={card.id} card={card} className="dim" />;
          })}
        </div>
      </div>

      {done && (
        <div className="bz-result">
          <h2>Game Over</h2>
          <div>You: <strong>{playerScore}</strong> pts</div>
          <div>Bot: <strong>{botScore}</strong> pts</div>
          <div>{playerScore > botScore ? "You win!" : playerScore < botScore ? "Bot wins!" : "Tie!"}</div>
        </div>
      )}
    </div>
  );
}
