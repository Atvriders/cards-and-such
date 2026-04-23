import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GermanWhistState, GermanWhistSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./GermanWhist.css";

type GermanWhistAction = { type: "play"; cardId: string };

export function GermanWhist({ state, dispatch, onGameOver }: GameProps<GermanWhistState, GermanWhistSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, stockTop, stock, trumpSuit, currentTrick, turn, phase, tricksTaken, phase1Tricks, phase2Tricks, finalScores, message } = state;
  const done = phase === "done";

  const legalIds = new Set(
    (!done && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  const phaseLabel = phase === "phase1" ? "Phase 1: Build hand" : phase === "phase2" ? "Phase 2: Play out" : "Done";

  return (
    <div className="german-whist">
      <div className="gw-header">
        <span>Trump: {trumpSuit}</span>
        <span>{phaseLabel}</span>
        <span>Your tricks: {tricksTaken[0]}</span>
        <span>Bot tricks: {tricksTaken[1]}</span>
        {phase === "phase1" && <span>Phase1: {phase1Tricks}/13</span>}
        {phase === "phase2" && <span>Phase2: {phase2Tricks}/13</span>}
      </div>

      <div className="gw-bot-row">
        <div className="gw-bot-label">
          Bot ({hands[1]!.length} cards) — {turn === 1 && !done ? "thinking…" : ""}
        </div>
        <div className="gw-card-backs">
          {Array.from({ length: hands[1]!.length }).map((_, i) => (
            <div key={i} className="gw-card-back" />
          ))}
        </div>
      </div>

      {phase === "phase1" && (
        <div className="gw-stock-area">
          <div className="gw-stock-label">Stock top (face up):</div>
          {stockTop ? <Card card={stockTop} /> : <span style={{ opacity: 0.5 }}>—</span>}
          <div className="gw-stock-label">({stock.length} hidden remaining)</div>
        </div>
      )}

      <div className="gw-trick-area">
        <div className="gw-trick-label">
          Current Trick{currentTrick.length > 0 ? ` (led: ${rankLabel(currentTrick[0]!.card.rank)}${currentTrick[0]!.card.suit})` : ""}
        </div>
        <div className="gw-trick-cards">
          {currentTrick.length === 0 ? (
            <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>
          ) : (
            currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="gw-trick-slot">
                <div className="gw-trick-slot-label">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="gw-status">{message}</div>

      <div className="gw-player-area">
        <div className="gw-player-label">Your Hand ({hands[0]!.length} cards)</div>
        <div className="gw-player-hand">
          {hands[0]!
            .slice()
            .sort((a, b) => {
              const so: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
              const sd = (so[a.suit] ?? 0) - (so[b.suit] ?? 0);
              return sd !== 0 ? sd : a.rank - b.rank;
            })
            .map(card => {
              const legal = legalIds.has(card.id);
              return legal ? (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => dispatch({ type: "play", cardId: card.id } as GermanWhistAction)}
                />
              ) : (
                <Card key={card.id} card={card} className="dim" />
              );
            })}
        </div>
      </div>

      {done && finalScores && (
        <div className="gw-result">
          <h2>
            {finalScores[0]! > finalScores[1]! ? "You Win!" :
             finalScores[0]! < finalScores[1]! ? "Bot Wins." : "Tie!"}
          </h2>
          <div>Your tricks: {finalScores[0]} | Bot tricks: {finalScores[1]}</div>
        </div>
      )}
    </div>
  );
}
