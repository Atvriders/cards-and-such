import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OldMaidState, OldMaidSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./OldMaid.css";

type OldMaidAction = { type: "draw"; cardIndex: number };

function leftNeighborSeat(seat: number, seats: number, hands: readonly (readonly { id: string }[])[]): number {
  let left = (seat - 1 + seats) % seats;
  let tries = 0;
  while (hands[left]!.length === 0 && tries < seats) {
    left = (left - 1 + seats) % seats;
    tries++;
  }
  return left;
}

export function OldMaid({
  state,
  dispatch,
  onGameOver,
}: GameProps<OldMaidState, OldMaidSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, turn, phase, loser, seats, lastAction } = state;
  const leftSeat = leftNeighborSeat(0, seats, hands);
  const isMyTurn = turn === 0 && phase === "playing";
  const leftHand = hands[leftSeat]!;

  function seatName(s: number): string {
    return s === 0 ? "You" : `Bot ${s}`;
  }

  return (
    <div className="old-maid">
      <div className="old-maid-header">
        <h2>Old Maid</h2>
        <div className="old-maid-counts">
          {Array.from({ length: seats }, (_, i) => (
            <span key={i} className={turn === i && phase === "playing" ? "active-seat" : ""}>
              {seatName(i)}: {hands[i]!.length} cards
            </span>
          ))}
        </div>
      </div>

      {lastAction && (
        <div className="old-maid-log">{lastAction}</div>
      )}

      {phase === "playing" && (
        <>
          <div className="old-maid-status">
            {isMyTurn
              ? `Pick a card from ${seatName(leftSeat)}'s hand`
              : `Waiting for ${seatName(turn)}...`}
          </div>

          {isMyTurn && leftHand.length > 0 && (
            <div className="old-maid-pick-area">
              <div className="old-maid-pick-label">
                {seatName(leftSeat)}'s hand ({leftHand.length} cards — face down):
              </div>
              <div className="old-maid-facedown-row">
                {leftHand.map((_, idx) => (
                  <button data-testid="hint-target-old-maid-action"
                    key={idx}
                    className="old-maid-facedown-btn"
                    onClick={() => dispatch({ type: "draw", cardIndex: idx } as OldMaidAction)}
                    aria-label={`Pick card ${idx + 1}`}
                  >
                    <Card faceDown />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="old-maid-hand-area">
            <div className="old-maid-hand-label">Your hand ({hands[0]!.length} cards):</div>
            <div className="old-maid-hand-row">
              {hands[0]!.slice().sort((a, b) => a.rank - b.rank).map(c => (
                <Card key={c.id} card={c} />
              ))}
            </div>
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="old-maid-result">
          <h2>{loser === 0 ? "You got the Old Maid!" : `${seatName(loser!)} got the Old Maid!`}</h2>
          <p>{loser === 0 ? "You lose." : "You win!"}</p>
          <div className="old-maid-final-hands">
            {Array.from({ length: seats }, (_, i) => (
              <div key={i} className="old-maid-final-seat">
                <strong>{seatName(i)}</strong>: {hands[i]!.length} cards left
                {hands[i]!.length > 0 && (
                  <span className="old-maid-lone-card">
                    {" "}({hands[i]!.map(c => `${rankLabel(c.rank)}${c.suit}`).join(", ")})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
