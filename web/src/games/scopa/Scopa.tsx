import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ScopaState } from "./state.js";
import { isTerminal, canCapture, findCaptureSets, faceValue, COINS_SUIT } from "./state.js";
import "./Scopa.css";

type ScopaAction =
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

export function Scopa({
  state,
  dispatch,
  onGameOver,
}: GameProps<ScopaState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { playerHand, table, playerCaptures, botCaptures, playerScopeCount, botScopeCount, phase, message, selectedCardId, finalScores } = state;
  const done = phase === "done";
  const isPlayerTurn = phase === "player-turn";

  const selectedCard = playerHand.find(c => c.id === selectedCardId) ?? null;
  const selectedFv = selectedCard ? faceValue(selectedCard.rank) : 0;

  // Auto-find single best capture set for selected card
  const captureSet = selectedCard ? (findCaptureSets(table, selectedFv)[0] ?? null) : null;
  const captureSetIds = captureSet ? captureSet.map(c => c.id) : [];

  return (
    <div className="scopa">
      <div className="scopa-header">
        <span>You: {playerCaptures.length} cards, {playerScopeCount} scope</span>
        <span>Bot: {botCaptures.length} cards, {botScopeCount} scope</span>
      </div>

      {finalScores && (
        <div className="scopa-done">
          Player: {finalScores.player} pts | Bot: {finalScores.bot} pts
        </div>
      )}

      <div className="scopa-label">Table ({table.length} cards):</div>
      <div className="scopa-table">
        {table.length === 0
          ? <span className="scopa-label">— empty —</span>
          : table.map(card => (
            <div
              key={card.id}
              className={`scopa-card${captureSetIds.includes(card.id) ? " capturable" : ""}${card.suit === COINS_SUIT ? " coins" : ""}`}
              style={{ cursor: "default", color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
            >
              {card.suit}{rankLabel(card.rank)}
            </div>
          ))}
      </div>

      <div className="scopa-message">{message}</div>

      {!done && (
        <>
          <div className="scopa-label">Your hand — click to select:</div>
          <div className="scopa-hand">
            {playerHand.map(card => (
              <div
                key={card.id}
                data-testid={`hint-target-scopa-${card.id}`}
                className={`scopa-card${card.id === selectedCardId ? " selected" : ""}${card.suit === COINS_SUIT ? " coins" : ""}`}
                style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
                onClick={() => isPlayerTurn && dispatch({ type: "select", cardId: card.id } as ScopaAction)}
              >
                {card.suit}{rankLabel(card.rank)}
              </div>
            ))}
          </div>

          {selectedCard && isPlayerTurn && (
            <div className="scopa-actions">
              {captureSet && (
                <button
                  className="scopa-btn"
                  onClick={() => dispatch({ type: "capture", tableCardIds: captureSetIds } as ScopaAction)}
                >
                  Capture ({captureSet.map(c => rankLabel(c.rank)).join("+")})
                </button>
              )}
              <button
                className="scopa-btn danger"
                onClick={() => dispatch({ type: "place" } as ScopaAction)}
              >
                Place on table
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
