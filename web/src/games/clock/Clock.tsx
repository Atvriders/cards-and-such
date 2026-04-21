import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ClockState, ClockAction, ClockSettings } from "./state.js";
import { isRed, rankLabel } from "../../engines/deck/index.js";
import "./Clock.css";

/** Clock positions around the face: 0=1 o'clock (Ace), 11=12 o'clock (Queen), 12=center (King). */
function pilePosition(index: number): { left: number; top: number } {
  if (index === 12) return { left: 148, top: 135 }; // center
  // Clock goes 1..12, starting at 1 o'clock (top-right), clockwise
  const angle = (index * 30 - 60) * (Math.PI / 180); // 1 o'clock is at -60 deg from 12
  const r = 130;
  const cx = 170;
  const cy = 160;
  return {
    left: Math.round(cx + r * Math.cos(angle)) - 22,
    top: Math.round(cy + r * Math.sin(angle)) - 35,
  };
}

const RANK_LABELS_CLOCK = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export function Clock({
  state,
  dispatch,
  onGameOver,
}: GameProps<ClockState, ClockSettings>): JSX.Element {
  const handleFlip = useCallback(() => {
    dispatch({ type: "flip" } as ClockAction);
  }, [dispatch]);

  if (state.won) onGameOver(state.score);
  if (state.gameOver) onGameOver(0);

  const currentPile = state.piles[state.currentPileIndex];
  const hasFaceDown = currentPile ? currentPile.faceUpCount < currentPile.cards.length : false;

  return (
    <div className="clock">
      <div className="clock-info">
        <span>Flips: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        {state.won && <span className="clock-result win">You Win!</span>}
        {state.gameOver && <span className="clock-result lose">Game Over — 4th King revealed</span>}
      </div>

      <div className="clock-face">
        {state.piles.map((pile, pileIdx) => {
          const pos = pilePosition(pileIdx);
          const isCurrent = pileIdx === state.currentPileIndex;
          const faceUpStart = pile.cards.length - pile.faceUpCount;
          const topCard = pile.cards.length > 0 ? pile.cards[pile.cards.length - 1] : null;
          const topIsFaceUp = topCard ? pile.faceUpCount > 0 : false;
          const faceDownCount = pile.cards.length - pile.faceUpCount;

          return (
            <div
              key={pileIdx}
              className={`clock-position${isCurrent ? " current-position" : ""}`}
              style={{ left: pos.left, top: pos.top, width: 46 }}
            >
              <div className="clock-position-label">{RANK_LABELS_CLOCK[pileIdx]}</div>
              {topCard && topIsFaceUp ? (
                <div className={`clock-card ${isCurrent ? "current-pile" : ""} ${isRed(topCard.suit) ? "face-up-red" : "face-up-black"}`}>
                  {rankLabel(topCard.rank)}{topCard.suit}
                </div>
              ) : topCard ? (
                <div className={`clock-card face-down-card ${isCurrent ? "current-pile" : ""}`}>?</div>
              ) : (
                <div className="clock-card" style={{ opacity: 0.2 }}>✓</div>
              )}
              <div className="clock-pile-count">
                {pile.faceUpCount}↑ / {faceDownCount}↓
              </div>
              {void faceUpStart}
            </div>
          );
        })}
      </div>

      <button
        className="clock-flip-btn"
        onClick={handleFlip}
        disabled={!hasFaceDown || state.won || state.gameOver}
      >
        Flip Card
      </button>
    </div>
  );
}
