import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EcarteState, EcarteSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Ecarte.css";

type EcarteAction =
  | { type: "propose" }
  | { type: "refuse" }
  | { type: "exchange"; ids: string[] }
  | { type: "play"; cardId: string };

export function Ecarte({ state, dispatch, onGameOver }: GameProps<EcarteState, EcarteSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [selected, setSelected] = useState<string[]>([]);
  const { playerHand, botHand, trumpSuit, trumpCard, currentTrick, turn, phase, playerTricks, botTricks, playerScore, botScore, message } = state;

  const legalIds = new Set(
    phase === "playing" && turn === 0 ? legalPlays(playerHand, currentTrick, trumpSuit).map(c => c.id) : []
  );

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="ecarte">
      <div className="ec-header">
        <span>You: {playerScore} pts</span>
        <span>Bot: {botScore} pts</span>
        <span>Trump: {trumpSuit}</span>
        <span>Tricks: You {playerTricks} | Bot {botTricks}</span>
      </div>

      <div className="ec-trick-area">
        <div className="ec-label">Trump Card</div>
        <Card card={trumpCard} />
      </div>

      <div className="ec-trick-area">
        <div className="ec-label">Bot Hand ({botHand.length} cards)</div>
        <div className="ec-bot-hand">
          {botHand.map((_, i) => <div key={i} className="ec-card-back" />)}
        </div>
      </div>

      {phase === "playing" && (
        <div className="ec-trick-area">
          <div className="ec-label">Current Trick</div>
          <div className="ec-trick-cards">
            {currentTrick.length === 0
              ? <span style={{ opacity: 0.4 }}>—</span>
              : currentTrick.map(({ seat, card }) => (
                <div key={card.id} className="ec-trick-slot">
                  <div className="ec-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                  <Card card={card} />
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="ec-status">{message}</div>

      {phase === "propose" && (
        <div className="ec-action-row">
          <button className="ec-btn" onClick={() => dispatch({ type: "propose" } as EcarteAction)}>Propose Exchange</button>
          <button className="ec-btn" onClick={() => dispatch({ type: "refuse" } as EcarteAction)}>Refuse & Play</button>
        </div>
      )}

      {phase === "exchange" && (
        <div className="ec-action-row">
          <button className="ec-btn" onClick={() => { dispatch({ type: "exchange", ids: selected } as EcarteAction); setSelected([]); }}>
            Confirm Exchange ({selected.length})
          </button>
        </div>
      )}

      <div className="ec-player-area">
        <div className="ec-player-label">Your Hand</div>
        <div className="ec-player-hand">
          {playerHand.map(card => {
            const sel = selected.includes(card.id);
            const legal = legalIds.has(card.id);
            if (phase === "exchange") {
              return <Card key={card.id} card={card} className={sel ? "selected" : ""} onClick={() => toggleSelect(card.id)} />;
            }
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as EcarteAction)} />
              : <Card key={card.id} card={card} className="dim" />;
          })}
        </div>
      </div>

      {state.phase === "done" && (
        <div className="ec-result">
          <h2>Round Over</h2>
          <div>{message}</div>
          <div>You: <strong>{playerScore}</strong> | Bot: <strong>{botScore}</strong></div>
        </div>
      )}
    </div>
  );
}
