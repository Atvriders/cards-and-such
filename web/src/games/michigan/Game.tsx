import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MichiganState, MichiganSettings } from "./state.js";
import type { Suit } from "../../engines/deck/index.js";
import { isTerminal, nextRank, canPlay } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type MichiganAction =
  | { type: "play"; cardId: string }
  | { type: "changeSuit"; suit: Suit };

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANK_DISPLAY: Record<number, string> = { 1: "A", 11: "J", 12: "Q", 13: "K" };

function rankName(r: number): string {
  return RANK_DISPLAY[r] ?? String(r);
}

export function MichiganGame({ state, dispatch, onGameOver }: GameProps<MichiganState, MichiganSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, currentSuit, currentRank, blockedSuits, finishOrder, phase } = state;
  const myHand = hands[0]!;
  const nr = nextRank(currentRank);
  const isMyTurn = phase === "playing";

  // Check if player needs to play next in sequence
  const nextCardInSeq = nr !== null ? myHand.find(c => canPlay(c, currentSuit, nr)) : null;
  const sequenceBlocked = nr === null || (!nextCardInSeq && !myHand.some(c => c.suit === currentSuit));

  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;
  const positions = ["1st", "2nd", "3rd", "4th"] as const;

  const sortedHand = [...myHand].sort((a, b) => {
    if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
    return a.rank - b.rank;
  });

  const suitsWithCards = SUITS.filter(s => !blockedSuits.includes(s) && myHand.some(c => c.suit === s));

  return (
    <div className="michigan">
      <div className="michigan-header">
        <h2>Michigan</h2>
        <div className="michigan-info">
          {[0, 1, 2, 3].map(s => (
            <span key={s}>{seatName(s)}: {hands[s]!.length}{finishOrder.includes(s) ? ` (${positions[finishOrder.indexOf(s)]})` : ""}</span>
          ))}
        </div>
      </div>

      <div className="michigan-sequence">
        <div className="michigan-sequence-label">Current sequence:</div>
        <div className="michigan-current">{rankName(currentRank)}{currentSuit}</div>
        {nr !== null
          ? <div className="michigan-next">Next needed: {rankName(nr)}{currentSuit}</div>
          : <div className="michigan-next">Sequence blocked — choose new suit</div>}
      </div>

      <div className="michigan-status">
        {phase === "playing"
          ? nextCardInSeq
            ? `Play ${rankName(nr!)}${currentSuit} to continue the sequence`
            : sequenceBlocked
            ? "Sequence blocked — choose a suit to lead"
            : "Waiting for bots…"
          : "Game over!"}
      </div>

      {phase === "playing" && sequenceBlocked && suitsWithCards.length > 0 && (
        <>
          <div style={{ fontSize: ".85rem", opacity: .8 }}>Choose a new suit to lead:</div>
          <div className="michigan-suit-picker">
            {SUITS.map(s => (
              <button data-testid="hint-target-michigan-primary" key={s} className="michigan-suit-btn"
                disabled={!suitsWithCards.includes(s)}
                onClick={() => dispatch({ type: "changeSuit", suit: s } as MichiganAction)}>
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "playing" && (
        <>
          <div className="michigan-hand-label">Your hand ({myHand.length}):</div>
          <div className="michigan-hand">
            {sortedHand.map(c => {
              const isNext = nr !== null && canPlay(c, currentSuit, nr);
              const isLeadable = sequenceBlocked && !blockedSuits.includes(c.suit);
              return (
                <div key={c.id}
                  className={`michigan-slot${isNext ? " playable" : isLeadable ? " leadable" : ""}`}
                  onClick={() => {
                    if (isNext) dispatch({ type: "play", cardId: c.id } as MichiganAction);
                    else if (isLeadable) dispatch({ type: "changeSuit", suit: c.suit } as MichiganAction);
                  }}>
                  <Card card={c} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="michigan-result">
          <h3>Game Over!</h3>
          {[0, 1, 2, 3].map(s => (
            <div key={s} className={s === 0 ? "michigan-you" : ""}>
              {seatName(s)}: {finishOrder.includes(s) ? positions[finishOrder.indexOf(s)] : `${hands[s]!.length} cards left`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
