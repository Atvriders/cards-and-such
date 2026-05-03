import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BSState, BSSettings } from "./state.js";
import { isTerminal, rankName } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Rank } from "../../engines/deck/index.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./BS.css";

type BSAction =
  | { type: "play"; cardIds: string[]; claimRank: Rank }
  | { type: "call-bs" }
  | { type: "pass" };

export function BS({
  state,
  dispatch,
  onGameOver,
}: GameProps<BSState, BSSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const {
    hands, pile, currentFaceDown, currentClaimRank, currentPlaySeat,
    turn, phase, winner, seats, lastEvent, claimRankSequence
  } = state;

  const myHand = hands[0]!;
  const isMyTurn = turn === 0 && phase === "playing";
  const canCallBS = phase === "calling" && currentPlaySeat !== 0;

  function toggleCard(id: string): void {
    if (!isMyTurn) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function play(): void {
    if (!isMyTurn || selected.size === 0) return;
    dispatch({ type: "play", cardIds: Array.from(selected), claimRank: claimRankSequence } as BSAction);
    setSelected(new Set());
  }

  function callBS(): void {
    dispatch({ type: "call-bs" } as BSAction);
  }

  function pass(): void {
    dispatch({ type: "pass" } as BSAction);
  }

  function seatName(s: number): string {
    return s === 0 ? "You" : `Bot ${s}`;
  }

  return (
    <div className="bs-game">
      <div className="bs-header">
        <h2>BS (Cheat)</h2>
        <div className="bs-seats">
          {Array.from({ length: seats }, (_, s) => (
            <span key={s} className={turn === s && phase === "playing" ? "active" : ""}>
              {seatName(s)}: {hands[s]!.length} cards
            </span>
          ))}
        </div>
      </div>

      <div className="bs-info">
        <div className="bs-pile-info">Pile: {pile.length + currentFaceDown.length} cards</div>
        <div className="bs-claim-rank">
          Current rank: <strong>{rankName(currentClaimRank ?? claimRankSequence)}</strong>
        </div>
      </div>

      {lastEvent && (
        <div className="bs-event">{lastEvent}</div>
      )}

      {phase === "calling" && currentPlaySeat !== null && (
        <div className="bs-calling-area">
          <div className="bs-calling-label">
            {seatName(currentPlaySeat)} played {currentFaceDown.length} card(s) claiming{" "}
            <strong>{rankName(currentClaimRank!)}</strong>s.
          </div>
          <div className="bs-calling-actions">
            <button data-testid="hint-target-bs-call" className="bs-btn bs-btn" onClick={callBS}>
              Call BS!
            </button>
            <button data-testid="hint-target-bs-believe" className="bs-btn pass-btn" onClick={pass}>
              Believe It
            </button>
          </div>
        </div>
      )}

      {phase === "playing" && (
        <>
          <div className="bs-status">
            {isMyTurn
              ? `Your turn — play cards claiming to be ${rankName(claimRankSequence)}s`
              : `Waiting for ${seatName(turn)}…`}
          </div>

          <div className="bs-hand-label">Your hand ({myHand.length}):</div>
          <div className="bs-hand">
            {myHand.slice().sort((a, b) => a.rank - b.rank).map(c => (
              <div
                key={c.id}
                className={`bs-card-slot${selected.has(c.id) ? " selected" : ""}${isMyTurn ? " clickable" : ""}`}
                onClick={() => toggleCard(c.id)}
              >
                <Card card={c} />
              </div>
            ))}
          </div>

          {isMyTurn && (
            <div className="bs-actions">
              <button data-testid="hint-target-bs-play"
                className="bs-btn play-btn"
                onClick={play}
                disabled={selected.size === 0}
              >
                Play {selected.size > 0 ? `${selected.size} card(s) as ${rankLabel(claimRankSequence)}` : ""}
              </button>
            </div>
          )}
        </>
      )}

      {phase === "done" && (
        <div className="bs-result">
          <h2>{winner === 0 ? "You win!" : `${seatName(winner!)} wins!`}</h2>
          <p>{winner === 0 ? "You emptied your hand first." : "Better luck next time."}</p>
        </div>
      )}
    </div>
  );
}
