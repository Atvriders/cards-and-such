import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PiquetState, PiquetSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Piquet.css";

type PiquetAction =
  | { type: "discard"; cardIds: string[] }
  | { type: "play"; cardId: string };

export function Piquet({
  state,
  dispatch,
  onGameOver,
}: GameProps<PiquetState, PiquetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { hands, talon, currentTrick, turn, phase, playerScore, botScore, message } = state;
  const done = phase === "done";

  const legalIds = new Set(
    (!done && phase === "tricks" && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  function toggleSelect(id: string) {
    if (phase !== "discard") return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 5) next.add(id);
      return next;
    });
  }

  function handleDiscard() {
    dispatch({ type: "discard", cardIds: [...selected] } as PiquetAction);
    setSelected(new Set());
  }

  return (
    <div className="piquet">
      <div className="pq-header">
        <span>You: {playerScore} pts</span>
        <span>Bot: {botScore} pts</span>
        <span>Talon: {talon.length}</span>
        <span>Phase: {phase}</span>
      </div>

      <div className="pq-bot-area">
        <div className={`pq-bot-seat${turn === 1 && !done ? " active" : ""}`}>
          <div className="pq-label">Bot</div>
          <div className="pq-card-backs">
            {hands[1]!.map((_, i) => <div key={i} className="pq-card-back" />)}
          </div>
        </div>
      </div>

      {phase === "tricks" && (
        <div className="pq-trick-area">
          <div className="pq-label">Current Trick</div>
          <div className="pq-trick-cards">
            {currentTrick.length === 0
              ? <span className="pq-empty">—</span>
              : currentTrick.map(({ seat, card }) => (
                <div key={card.id} className="pq-trick-slot">
                  <div className="pq-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                  <Card card={card} />
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="pq-status">{message}</div>

      <div className="pq-player-area">
        <div className="pq-label">
          {phase === "discard"
            ? `Your Hand — Select up to 5 to discard (${selected.size} selected)`
            : "Your Hand"}
        </div>
        <div className="pq-player-hand">
          {hands[0]!.map(card => {
            const sel = selected.has(card.id);
            const legal = legalIds.has(card.id);
            if (phase === "discard") {
              return (
                <div key={card.id} className={`pq-card-wrap${sel ? " selected" : ""}`} onClick={() => toggleSelect(card.id)}>
                  <Card card={card} />
                </div>
              );
            }
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as PiquetAction)} />
              : <Card key={card.id} card={card} className="dim" />;
          })}
        </div>
        {phase === "discard" && (
          <button className="pq-btn" onClick={handleDiscard}>
            Discard ({selected.size}) &amp; Draw
          </button>
        )}
      </div>

      {done && (
        <div className="pq-result">
          <h2>Game Over</h2>
          <div>You: <strong>{playerScore}</strong> pts</div>
          <div>Bot: <strong>{botScore}</strong> pts</div>
          <div>{playerScore > botScore ? "You win!" : playerScore < botScore ? "Bot wins!" : "Tie!"}</div>
        </div>
      )}
    </div>
  );
}
