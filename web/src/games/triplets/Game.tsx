import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TripletsState, TripletsAction } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

const noSettings = {} as const;
type NoSettings = typeof noSettings;

export function TripletsGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<TripletsState, NoSettings>): JSX.Element {
  if (state.won) onGameOver(Math.max(0, 500 - state.movesMade));

  const handlePileClick = (pileIdx: number) => {
    if (state.selected.includes(pileIdx)) {
      dispatch({ type: "deselect", pileIdx } as TripletsAction);
    } else {
      dispatch({ type: "select", pileIdx } as TripletsAction);
    }
  };

  return (
    <div className="triplets fade-in">
      <div className="tri-info">
        <span>Moves: {state.movesMade}</span>
        <span>Removed groups: {state.removed}</span>
        <span>Stock: {state.stock.length}</span>
        <span>Selected: {state.selected.length}/3</span>
      </div>
      <div className="tri-info">
        <span style={{ color: "#aaa", fontSize: "13px" }}>Select 3 piles whose top cards sum to 15 (face cards = 10, Ace = 1)</span>
      </div>

      <div className="tri-grid">
        {state.piles.map((pile, pileIdx) => {
          const top = pile.length > 0 ? pile[pile.length - 1]! : null;
          const isSelected = state.selected.includes(pileIdx);
          return (
            <div key={pileIdx} className="tri-pile">
              <div className="tri-label">Pile {pileIdx + 1} ({pile.length})</div>
              {top ? (
                <div
                  className={`tri-card-wrap ${isSelected ? "tri-selected" : ""}`}
                  data-testid={`hint-target-triplets-${pileIdx}`}
                  onClick={() => handlePileClick(pileIdx)}
                >
                  <Card card={top} />
                </div>
              ) : (
                <div className="tri-placeholder">Empty</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="tri-info">
        <button
          className="tri-btn"
          disabled={state.selected.length !== 3}
          onClick={() => dispatch({ type: "remove-triplet" } as TripletsAction)}
        >
          Remove Triplet (sum = 15)
        </button>
        <button
          className="tri-btn"
          disabled={state.stock.length === 0}
          onClick={() => dispatch({ type: "deal" } as TripletsAction)}
        >
          Deal ({state.stock.length} left)
        </button>
      </div>
    </div>
  );
}
