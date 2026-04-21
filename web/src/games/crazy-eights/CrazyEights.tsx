import { useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrazyEightsState, CrazyEightsAction, CrazyEightsSettings } from "./state.js";
import type { Card, Suit } from "../../engines/deck/index.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./CrazyEights.css";

type Props = GameProps<CrazyEightsState, CrazyEightsSettings>;

const SUITS: readonly Suit[] = ["♠", "♥", "♦", "♣"];

function isRed(suit: Suit): boolean {
  return suit === "♥" || suit === "♦";
}

function isPlayable(card: Card, top: Card, activeSuit: Suit): boolean {
  if (card.rank === 8) return true;
  return card.suit === activeSuit || card.rank === top.rank;
}

function CardFace({ card }: { card: Card }): JSX.Element {
  const color = isRed(card.suit) ? "red" : "black";
  return (
    <div className={`ce-card ${color}`}>
      <span className="ce-card-rank">{rankLabel(card.rank)}</span>
      <span className="ce-card-suit">{card.suit}</span>
    </div>
  );
}

function CardBack(): JSX.Element {
  return <div className="ce-card ce-card-back" />;
}

export function CrazyEights({ state, dispatch }: Props): JSX.Element {
  const [pickingEight, setPickingEight] = useState<string | null>(null);

  const myHand = state.hands[0] ?? [];
  const isMyTurn = state.turn === 0 && state.winner === null;

  const canPass =
    state.turn === 0 &&
    state.winner === null &&
    state.pendingDraw &&
    !myHand.some((c) => isPlayable(c, state.discardTop, state.activeSuit));

  const handleCardClick = (card: Card): void => {
    if (!isMyTurn) return;
    if (card.rank === 8) {
      setPickingEight(card.id);
      return;
    }
    if (!isPlayable(card, state.discardTop, state.activeSuit)) return;
    (dispatch as (a: CrazyEightsAction) => void)({ type: "play", cardId: card.id });
  };

  const handleSuitPick = (suit: Suit): void => {
    if (!pickingEight) return;
    (dispatch as (a: CrazyEightsAction) => void)({
      type: "play",
      cardId: pickingEight,
      chosenSuit: suit,
    });
    setPickingEight(null);
  };

  const activeSuitColor = isRed(state.activeSuit) ? "red" : "black";

  let statusText: string;
  if (state.winner !== null) {
    statusText =
      state.winner === 0
        ? "You won!"
        : `Bot ${state.winner} won`;
  } else if (state.turn === 0) {
    statusText = state.pendingDraw ? "You drew — play or pass" : "Your turn";
  } else {
    statusText = `Bot ${state.turn} thinking…`;
  }

  return (
    <div className="ce-root">
      {/* Status */}
      <div className="ce-status">
        {statusText} &nbsp;·&nbsp; active suit:{" "}
        <span className={`ce-active-suit ${activeSuitColor}`}>{state.activeSuit}</span>
      </div>

      {/* Bot seats */}
      <div className="ce-peers">
        {state.hands.slice(1).map((h, i) => (
          <div className="ce-peer" key={i}>
            <CardBack />
            <span className="ce-peer-count">
              Bot {i + 1}: {h.length} card{h.length === 1 ? "" : "s"}
            </span>
          </div>
        ))}
      </div>

      {/* Center: discard + actions */}
      <div className="ce-center">
        <div className="ce-discard-wrap">
          <span className="ce-suit-label">
            {state.discardTop.rank === 8 ? `→ ${state.activeSuit}` : ""}
          </span>
          <CardFace card={state.discardTop} />
        </div>

        <div className="ce-actions">
          <button
            className="ce-btn"
            onClick={() => (dispatch as (a: CrazyEightsAction) => void)({ type: "draw" })}
            disabled={!isMyTurn || state.pendingDraw}
          >
            Draw
          </button>
          <button
            className="ce-btn"
            onClick={() => (dispatch as (a: CrazyEightsAction) => void)({ type: "pass" })}
            disabled={!canPass}
          >
            Pass
          </button>
        </div>
      </div>

      {/* Human hand */}
      <div className="ce-hand" data-testid="ce-hand">
        {myHand.map((card) => {
          const legal = isPlayable(card, state.discardTop, state.activeSuit);
          return (
            <button
              key={card.id}
              className={`ce-hand-btn ${legal ? "legal" : "illegal"}`}
              onClick={() => handleCardClick(card)}
              disabled={!isMyTurn}
              data-testid={`hand-card-${card.id}`}
              title={legal ? undefined : "Cannot play"}
            >
              <CardFace card={card} />
            </button>
          );
        })}
      </div>

      {/* Suit picker modal for 8s */}
      {pickingEight && (
        <div className="ce-overlay" role="dialog" aria-label="choose suit">
          <div className="ce-modal">
            <h3>Declare a suit</h3>
            <div className="ce-suit-btns">
              {SUITS.map((suit) => (
                <button
                  key={suit}
                  className={`ce-suit-btn ${isRed(suit) ? (suit === "♥" ? "hearts" : "diamonds") : suit === "♠" ? "spades" : "clubs"}`}
                  onClick={() => handleSuitPick(suit)}
                >
                  {suit}
                </button>
              ))}
            </div>
            <button
              className="ce-btn"
              style={{ width: "auto", padding: "0 1rem" }}
              onClick={() => setPickingEight(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* End-of-game results */}
      {state.winner !== null && state.finalPenalties && (
        <div className="ce-result">
          <h3>{state.winner === 0 ? "You won! 🎉" : `Bot ${state.winner} wins`}</h3>
          <table>
            <tbody>
              {state.finalPenalties.map((pen, i) => (
                <tr key={i}>
                  <td>{i === 0 ? "You" : `Bot ${i}`}</td>
                  <td>{pen === 0 && state.winner === i ? "Winner!" : `${pen} pts`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
