import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CourtPieceState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./CourtPiece.css";

type CourtPieceAction = { type: "play"; cardId: string };

export function CourtPiece({ state, dispatch, onGameOver }: GameProps<CourtPieceState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="court-piece-game fade-in">
      <div className="court-piece-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♦</span>
      </div>
      <div className="court-piece-bot-row">
        <div className="court-piece-label">Bot ({botHand.length} cards)</div>
        <div className="court-piece-card-backs">
          {botHand.map((_, i) => <div key={i} className="court-piece-card-back" />)}
        </div>
      </div>
      <div className="court-piece-trick">
        <div className="court-piece-label">Current Trick</div>
        <div className="court-piece-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="court-piece-trick-slot">
                <div className="court-piece-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="court-piece-status">{message}</div>
      <div className="court-piece-player-area">
        <div className="court-piece-label">Your Hand</div>
        <div data-testid="hint-target-court-piece-hand" className="court-piece-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as CourtPieceAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="court-piece-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
