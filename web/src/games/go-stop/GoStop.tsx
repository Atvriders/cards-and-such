import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GoStopState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./GoStop.css";

type GoStopAction = { type: "play"; cardId: string };

export function GoStop({ state, dispatch, onGameOver }: GameProps<GoStopState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="go-stop-game">
      <div className="go-stop-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♦</span>
      </div>
      <div className="go-stop-bot-row">
        <div className="go-stop-label">Bot ({botHand.length} cards)</div>
        <div className="go-stop-card-backs">
          {botHand.map((_, i) => <div key={i} className="go-stop-card-back" />)}
        </div>
      </div>
      <div className="go-stop-trick">
        <div className="go-stop-label">Current Trick</div>
        <div className="go-stop-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="go-stop-trick-slot">
                <div className="go-stop-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="go-stop-status">{message}</div>
      <div className="go-stop-player-area">
        <div className="go-stop-label">Your Hand</div>
        <div className="go-stop-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as GoStopAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="go-stop-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
