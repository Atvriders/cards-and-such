import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FourLeafCloverState, FourLeafCloverAction } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

const noSettings = {} as const;
type NoSettings = typeof noSettings;

const SUIT_LABELS = ["♠ Spades", "♥ Hearts", "♦ Diamonds", "♣ Clubs"];

export function FourLeafCloverGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<FourLeafCloverState, NoSettings>): JSX.Element {
  if (state.won) onGameOver(Math.max(0, 500 - state.movesMade));

  return (
    <div className="four-leaf-clover">
      <div className="flc-info">
        <span>Moves: {state.movesMade}</span>
      </div>

      <div className="flc-section">Foundations</div>
      <div className="flc-row">
        {state.foundations.map((f, i) => {
          const top = f.length > 0 ? f[f.length - 1]! : null;
          return (
            <div key={i} className="flc-pile-group">
              {top ? <Card card={top} /> : <div className="flc-placeholder">A</div>}
              <div className="flc-label">{f.length}/13</div>
            </div>
          );
        })}
      </div>

      <div className="flc-section">Reserve (park top-of-leaf here)</div>
      <div className="flc-row">
        {state.reserve.map((card, i) => (
          <div key={i} className="flc-pile-group">
            {card ? (
              <Card card={card} />
            ) : (
              <div className="flc-placeholder">Empty</div>
            )}
            {card && (
              <button
                className="flc-btn"
                onClick={() => dispatch({ type: "reserve-to-foundation", reserveIdx: i } as FourLeafCloverAction)}
              >
                → Found
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flc-section">Leaves (one per suit, shuffled order — send top card to foundation or reserve)</div>
      <div className="flc-row">
        {state.leaves.map((leaf, leafIdx) => {
          const top = leaf.length > 0 ? leaf[leaf.length - 1]! : null;
          const emptyReserveIdx = state.reserve.findIndex(c => c === null);
          return (
            <div key={leafIdx} className="flc-pile-group">
              <div className="flc-label">{SUIT_LABELS[leafIdx]} ({leaf.length})</div>
              {top ? <Card card={top} /> : <div className="flc-placeholder">Done</div>}
              <button
                className="flc-btn"
                disabled={!top}
                onClick={() => dispatch({ type: "leaf-to-foundation", leafIdx } as FourLeafCloverAction)}
              >
                → Found
              </button>
              <button
                className="flc-btn"
                disabled={!top || emptyReserveIdx === -1}
                onClick={() => {
                  if (emptyReserveIdx !== -1)
                    dispatch({ type: "leaf-to-reserve", leafIdx, reserveIdx: emptyReserveIdx } as FourLeafCloverAction);
                }}
              >
                → Reserve
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
