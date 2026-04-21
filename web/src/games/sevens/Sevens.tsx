import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevensState, SevensAction, SevensSettings, Card } from "./state.js";
import { isTerminal, playableCards } from "./state.js";
import "./Sevens.css";

const SUITS = ["♠", "♥", "♦", "♣"] as const;

function isRed(suit: string): boolean {
  return suit === "♥" || suit === "♦";
}

function rankStr(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function Sevens({
  state,
  dispatch,
  onGameOver,
}: GameProps<SevensState, SevensSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const gameOver = terminal !== null;
  const isMyTurn = state.turn === 0 && !gameOver;
  const myHand = state.hands[0] ?? [];
  const playable = isMyTurn ? playableCards(myHand, state.board) : [];
  const playableIds = new Set(playable.map((c) => c.id));
  const canPass = isMyTurn && playable.length === 0;

  function playCard(card: Card) {
    if (playableIds.has(card.id)) dispatch({ type: "play", card });
  }

  return (
    <div className="sevens-game">
      <div className="sevens-title">Sevens</div>

      <div className="sevens-status">
        {gameOver ? "" : isMyTurn ? "Your turn" : `Bot ${state.turn} is thinking...`}
      </div>

      {/* Board */}
      <div className="sevens-board">
        <div className="sevens-board-title">Board</div>
        {SUITS.map((suit) => {
          const row = state.board[suit];
          const cards: number[] = [];
          if (row.played) {
            for (let r = row.low; r <= row.high; r++) cards.push(r);
          }
          return (
            <div key={suit} className="sevens-suit-row">
              <div className={`sevens-suit-label${isRed(suit) ? " red" : ""}`}>{suit}</div>
              {!row.played && <div style={{ opacity: 0.4, fontSize: "0.75rem" }}>—</div>}
              {row.played && cards.map((r) => (
                <div key={r} className={`sevens-board-card${isRed(suit) ? " red" : ""}${r === 7 ? " pivot" : ""}`}>
                  {rankStr(r)}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Hand counts for bots */}
      <div className="sevens-opponents">
        {Array.from({ length: state.numPlayers - 1 }, (_, i) => i + 1).map((p) => (
          <div key={p} className={`sevens-opp${state.turn === p ? " active" : ""}`}>
            Bot {p}: {state.hands[p]?.length ?? 0} cards
          </div>
        ))}
      </div>

      {/* Player hand */}
      <div className="sevens-hand-section">
        <div className="sevens-hand-label">Your Hand ({myHand.length} cards)</div>
        <div className="sevens-hand">
          {myHand.map((card) => {
            const canPlayThis = playableIds.has(card.id);
            return (
              <div
                key={card.id}
                className={`sevens-card${isRed(card.suit) ? " red" : ""} ${canPlayThis ? "playable" : "not-playable"}`}
                onClick={() => playCard(card)}
              >
                {rankStr(card.rank)}{card.suit}
              </div>
            );
          })}
        </div>
      </div>

      {state.lastAction && (
        <div className="sevens-log">{state.lastAction}</div>
      )}

      {isMyTurn && (
        <div className="sevens-actions">
          {canPass && (
            <button onClick={() => dispatch({ type: "pass" })}>Pass</button>
          )}
          {!canPass && playable.length > 0 && (
            <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>Click a highlighted card to play</span>
          )}
        </div>
      )}

      {gameOver && (
        <div className="sevens-game-over">
          {state.winner === 0 ? "You win!" : `Bot ${state.winner} wins!`}
        </div>
      )}
    </div>
  );
}
