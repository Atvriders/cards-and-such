import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GoFishState, GoFishAction, GoFishSettings, Rank } from "./state.js";
import { seatName, rankName, isTerminal } from "./state.js";
import { rankLabel } from "../../engines/deck/index.js";
import { Card } from "../../engines/deck/Card.js";
import "./GoFish.css";

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];

export function GoFish({
  state,
  dispatch,
  onGameOver,
}: GameProps<GoFishState, GoFishSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Reset rank selection when turn changes
  useEffect(() => {
    setSelectedRank(null);
  }, [state.turn]);

  const playerHand = state.hands[0] ?? [];
  const isPlayerTurn = state.turn === 0 && !state.winner;

  // Group player hand by rank
  const rankGroups = new Map<Rank, number>();
  for (const card of playerHand) {
    rankGroups.set(card.rank, (rankGroups.get(card.rank) ?? 0) + 1);
  }
  const sortedRanks = [...rankGroups.keys()].sort((a, b) => a - b);

  function handleAsk(target: number): void {
    if (selectedRank === null) return;
    dispatch({ type: "ask", rank: selectedRank, target } satisfies GoFishAction);
    setSelectedRank(null);
  }

  return (
    <div className="go-fish">
      {/* Opponents */}
      <div className="gf-opponents">
        {Array.from({ length: state.seats - 1 }, (_, i) => i + 1).map(seat => {
          const hand = state.hands[seat] ?? [];
          const books = state.books[seat] ?? 0;
          return (
            <div key={seat} className="gf-opponent">
              <div className="gf-opponent-name">{SEAT_NAMES[seat]}</div>
              <div className="gf-opponent-cards">
                {hand.slice(0, 8).map((_, idx) => (
                  <Card key={idx} faceDown />
                ))}
              </div>
              <div className="gf-opp-stat">
                {hand.length} card{hand.length !== 1 ? "s" : ""} &bull; {books} book{books !== 1 ? "s" : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ocean */}
      <div className="gf-ocean">
        Ocean: {state.ocean.length} card{state.ocean.length !== 1 ? "s" : ""}
      </div>

      {/* Action log */}
      <div className="gf-log">
        {state.lastAction ?? "Game started — it's your turn!"}
      </div>

      {/* Books summary */}
      <div className="gf-books-summary">
        Books — You: {state.books[0] ?? 0}
        {Array.from({ length: state.seats - 1 }, (_, i) => i + 1).map(s => (
          <span key={s}> | {seatName(s)}: {state.books[s] ?? 0}</span>
        ))}
      </div>

      {/* Player hand */}
      <div className="gf-your-hand">
        <div className="gf-section-label">Your hand ({playerHand.length} cards)</div>
        {playerHand.length === 0 ? (
          <div className="gf-waiting">No cards in hand</div>
        ) : (
          <div className="gf-rank-groups">
            {sortedRanks.map(rank => {
              const count = rankGroups.get(rank) ?? 0;
              const isSelected = selectedRank === rank;
              return (
                <div
                  key={rank}
                  className={`gf-rank-group${isSelected ? " selected" : ""}`}
                  onClick={() => isPlayerTurn && setSelectedRank(isSelected ? null : rank)}
                  role="button"
                  tabIndex={isPlayerTurn ? 0 : -1}
                  aria-label={`${rankName(rank)}, ${count} card${count !== 1 ? "s" : ""}`}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      isPlayerTurn && setSelectedRank(isSelected ? null : rank);
                    }
                  }}
                >
                  <div className="gf-rank-cards">
                    {Array.from({ length: count }).map((_, idx) => (
                      <Card key={idx} card={{ suit: "♠", rank, id: `hand-${rank}-${idx}` }} />
                    ))}
                  </div>
                  <div className="gf-rank-label">{rankLabel(rank)}s &times; {count}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Target picker */}
      {selectedRank !== null && isPlayerTurn && (
        <div className="gf-target-picker">
          <h3>Ask for {rankName(selectedRank)} from:</h3>
          <div className="gf-target-buttons">
            {Array.from({ length: state.seats - 1 }, (_, i) => i + 1).map(seat => {
              const hand = state.hands[seat] ?? [];
              return (
                <button
                  key={seat}
                  onClick={() => handleAsk(seat)}
                  disabled={hand.length === 0}
                >
                  {seatName(seat)}
                </button>
              );
            })}
            <button data-testid="hint-target-go-fish-action" className="gf-cancel-btn" onClick={() => setSelectedRank(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Not player's turn */}
      {!isPlayerTurn && !state.winner && (
        <div className="gf-waiting">Waiting for {seatName(state.turn)}…</div>
      )}

      {/* Game over */}
      {state.winner !== null && (
        <div className="gf-game-over">
          {state.winner === 0 ? "You win!" : `${seatName(state.winner)} wins!`}
          {" "}(You had {state.books[0] ?? 0} book{(state.books[0] ?? 0) !== 1 ? "s" : ""})
        </div>
      )}
    </div>
  );
}
