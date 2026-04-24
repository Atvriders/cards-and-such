import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EscobaState } from "./state.js";
import { isTerminal, findCaptureSets, faceValue, TARGET } from "./state.js";
import "./Game.css";

type EscobaAction =
  | { type: "select"; cardId: string }
  | { type: "capture"; tableCardIds: string[] }
  | { type: "place" };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function Game({ state, dispatch, onGameOver }: GameProps<EscobaState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { playerHand, table, playerCaptures, botCaptures, playerEscobas, botEscobas, phase, message, selectedCardId, finalScores } = state;
  const done = phase === "done";
  const isPlayerTurn = phase === "player-turn";

  const selectedCard = playerHand.find(c => c.id === selectedCardId) ?? null;
  const needed = selectedCard ? TARGET - faceValue(selectedCard.rank) : 0;
  const captureSet = selectedCard ? (findCaptureSets(table, needed)[0] ?? null) : null;
  const captureSetIds = captureSet ? captureSet.map(c => c.id) : [];

  return (
    <div className="escoba">
      <div className="escoba-header">
        <span>You: {playerCaptures.length} cards, {playerEscobas} escobas</span>
        <span>Bot: {botCaptures.length} cards, {botEscobas} escobas</span>
      </div>

      {finalScores && <div className="escoba-done">Player: {finalScores.player} pts | Bot: {finalScores.bot} pts</div>}

      <div className="escoba-label">Table ({table.length} cards) — need cards summing to {selectedCard ? needed : "15 - your card"}:</div>
      <div className="escoba-table">
        {table.length === 0
          ? <span className="escoba-label">— empty —</span>
          : table.map(card => (
            <div
              key={card.id}
              className={`escoba-card${captureSetIds.includes(card.id) ? " capturable" : ""}${card.suit === "♦" ? " coins" : ""}`}
              style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
            >
              {card.suit}{rankLabel(card.rank)} ({faceValue(card.rank)})
            </div>
          ))}
      </div>

      <div className="escoba-message">{message}</div>

      {!done && (
        <>
          <div className="escoba-label">Your hand — click to select:</div>
          <div className="escoba-hand">
            {playerHand.map(card => (
              <div
                key={card.id}
                className={`escoba-card${card.id === selectedCardId ? " selected" : ""}${card.suit === "♦" ? " coins" : ""}`}
                style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
                onClick={() => isPlayerTurn && dispatch({ type: "select", cardId: card.id } as EscobaAction)}
              >
                {card.suit}{rankLabel(card.rank)} ({faceValue(card.rank)})
              </div>
            ))}
          </div>

          {selectedCard && isPlayerTurn && (
            <div className="escoba-actions">
              {captureSet && (
                <button className="escoba-btn" onClick={() => dispatch({ type: "capture", tableCardIds: captureSetIds } as EscobaAction)}>
                  Capture ({captureSet.map(c => faceValue(c.rank)).join("+")} = {needed})
                </button>
              )}
              <button className="escoba-btn danger" onClick={() => dispatch({ type: "place" } as EscobaAction)}>
                Place on table
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
