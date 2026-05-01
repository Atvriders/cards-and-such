import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrazyEightsState, CrazyEightsAction, CrazyEightsSettings } from "./state.js";
import type { Card as CardType, Suit } from "../../engines/deck/index.js";
import { isRed } from "../../engines/deck/index.js";
import { Card } from "../../engines/deck/Card.js";
import "./CrazyEights.css";

type Props = GameProps<CrazyEightsState, CrazyEightsSettings>;

const SUITS: readonly Suit[] = ["♠", "♥", "♦", "♣"];

function isPlayable(card: CardType, top: CardType, activeSuit: Suit): boolean {
  if (card.rank === 8) return true;
  return card.suit === activeSuit || card.rank === top.rank;
}

export function CrazyEights({ state, dispatch, onGameOver }: Props): JSX.Element {
  const [pickingEight, setPickingEight] = useState<string | null>(null);

  useEffect(() => {
    if (state.winner !== null) {
      const myPenalty = state.finalPenalties?.[0] ?? 0;
      onGameOver(state.winner === 0 ? 200 : Math.max(0, 200 - myPenalty));
    }
  }, [state.winner, state.finalPenalties, onGameOver]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (state.turn !== 0 || state.winner !== null) return;
      if ((e.key === "d" || e.key === "D") && !state.pendingDraw) {
        e.preventDefault(); (dispatch as (a: CrazyEightsAction) => void)({ type: "draw" });
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault(); (dispatch as (a: CrazyEightsAction) => void)({ type: "pass" });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, state.turn, state.winner, state.pendingDraw]);

  const myHand = state.hands[0] ?? [];
  const isMyTurn = state.turn === 0 && state.winner === null;
  const canPass = isMyTurn && state.pendingDraw && !myHand.some((c) => isPlayable(c, state.discardTop, state.activeSuit));

  const handleCardClick = (card: CardType): void => {
    if (!isMyTurn) return;
    if (card.rank === 8) { setPickingEight(card.id); return; }
    if (!isPlayable(card, state.discardTop, state.activeSuit)) return;
    (dispatch as (a: CrazyEightsAction) => void)({ type: "play", cardId: card.id });
  };

  const handleSuitPick = (suit: Suit): void => {
    if (!pickingEight) return;
    (dispatch as (a: CrazyEightsAction) => void)({ type: "play", cardId: pickingEight, chosenSuit: suit });
    setPickingEight(null);
  };

  let statusText: string;
  if (state.winner !== null) statusText = state.winner === 0 ? "You won!" : `Bot ${state.winner} won`;
  else if (state.turn === 0) statusText = state.pendingDraw ? "You drew — play or pass" : "Your turn";
  else statusText = `Bot ${state.turn} thinking…`;

  return (
    <div className="crazy8-wrap">
      <div className="crazy8-hud">
        <div className="crazy8-stat">{statusText}</div>
        <div className="crazy8-stat">Active suit
          <span className={`crazy8-suit ${isRed(state.activeSuit) ? "red" : "black"}`}> {state.activeSuit}</span>
        </div>
        <div className="crazy8-stat">Stock <b>{state.stock.length}</b></div>
      </div>

      <div className="crazy8-bots">
        {state.hands.slice(1).map((h, i) => (
          <div className="crazy8-bot" key={i}>
            <div className="crazy8-bot-cards">
              {Array.from({ length: Math.min(h.length, 7) }).map((_, j) => (
                <div key={j} className="crazy8-card-tight"><Card faceDown /></div>
              ))}
            </div>
            <div className="crazy8-bot-label">Bot {i + 1} · {h.length}</div>
          </div>
        ))}
      </div>

      <div className="crazy8-center">
        <div className="crazy8-discard">
          <div className="crazy8-discard-label">Discard</div>
          <Card card={state.discardTop} />
          {state.discardTop.rank === 8 && (
            <div className={`crazy8-suit-tag ${isRed(state.activeSuit) ? "red" : "black"}`}>{state.activeSuit}</div>
          )}
        </div>
        <div className="crazy8-actions">
          <button className="crazy8-btn primary" aria-label="Draw card (D)" onClick={() => (dispatch as (a: CrazyEightsAction) => void)({ type: "draw" })} disabled={!isMyTurn || state.pendingDraw}>Draw</button>
          <button className="crazy8-btn alt" aria-label="Pass turn (P)" onClick={() => (dispatch as (a: CrazyEightsAction) => void)({ type: "pass" })} disabled={!canPass}>Pass</button>
        </div>
      </div>

      <div className="crazy8-hand">
        <div className="crazy8-hand-label">Your hand</div>
        <div className="crazy8-hand-row">
          {myHand.map((card, idx) => {
            const legal = isPlayable(card, state.discardTop, state.activeSuit);
            return (
              <div
                key={card.id}
                className={`crazy8-card-slot ${legal ? "legal" : "illegal"}`}
                role="button"
                tabIndex={isMyTurn ? 0 : -1}
                aria-label={`Card ${idx + 1}${legal ? "" : ", not playable"}`}
                onClick={() => isMyTurn && handleCardClick(card)}
                onKeyDown={(e) => { if (isMyTurn && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); handleCardClick(card); } }}
              >
                <Card card={card} />
              </div>
            );
          })}
        </div>
      </div>

      {pickingEight && (
        <div className="crazy8-overlay">
          <div className="crazy8-modal">
            <h3>Declare a suit</h3>
            <div className="crazy8-suit-row">
              {SUITS.map((suit) => (
                <button key={suit} className={`crazy8-suit-btn ${isRed(suit) ? "red" : "black"}`} onClick={() => handleSuitPick(suit)}>{suit}</button>
              ))}
            </div>
            <button className="crazy8-btn alt" onClick={() => setPickingEight(null)}>Cancel</button>
          </div>
        </div>
      )}

      {state.winner !== null && state.finalPenalties && (
        <div className={`crazy8-result ${state.winner === 0 ? "win" : "loss"}`}>
          <h3>{state.winner === 0 ? "Victory!" : `Bot ${state.winner} wins`}</h3>
          <table>
            <tbody>
              {state.finalPenalties.map((pen, i) => (
                <tr key={i}>
                  <td>{i === 0 ? "You" : `Bot ${i}`}</td>
                  <td>{pen === 0 && state.winner === i ? "Winner" : `${pen} pts`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
