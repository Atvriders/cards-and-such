import React, { useCallback, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RoyalCotillionState, RoyalCotillionAction, RoyalCotillionSettings } from "./state.js";
import { isRed, rankLabel } from "../../engines/deck/index.js";
import "./RoyalCotillion.css";

const ODD_SEQ_LABELS = ["A", "3", "5", "7", "9", "J", "K"];
const EVEN_SEQ_LABELS = ["2", "4", "6", "8", "10", "Q"];

type SelectedSource = { type: "waste" } | { type: "reserve"; reserveIndex: number } | null;

export function RoyalCotillion({
  state,
  dispatch,
  onGameOver,
}: GameProps<RoyalCotillionState, RoyalCotillionSettings>): JSX.Element {
  const [selectedSource, setSelectedSource] = useState<SelectedSource>(null);

  const handleStockClick = useCallback(() => {
    if (state.stock.length > 0) {
      dispatch({ type: "draw" } as RoyalCotillionAction);
    }
    setSelectedSource(null);
  }, [state.stock.length, dispatch]);

  const handleWasteClick = useCallback(() => {
    setSelectedSource({ type: "waste" });
  }, []);

  const handleReserveClick = useCallback((ri: number) => {
    setSelectedSource({ type: "reserve", reserveIndex: ri });
  }, []);

  const handleOddFoundationClick = useCallback(
    (fi: number) => {
      if (!selectedSource) return;
      if (selectedSource.type === "waste") {
        dispatch({ type: "play-waste-odd", foundationIndex: fi } as RoyalCotillionAction);
      } else if (selectedSource.type === "reserve") {
        dispatch({ type: "play-reserve-odd", reserveIndex: selectedSource.reserveIndex, foundationIndex: fi } as RoyalCotillionAction);
      }
      setSelectedSource(null);
    },
    [selectedSource, dispatch],
  );

  const handleEvenFoundationClick = useCallback(
    (fi: number) => {
      if (!selectedSource) return;
      if (selectedSource.type === "waste") {
        dispatch({ type: "play-waste-even", foundationIndex: fi } as RoyalCotillionAction);
      } else if (selectedSource.type === "reserve") {
        dispatch({ type: "play-reserve-even", reserveIndex: selectedSource.reserveIndex, foundationIndex: fi } as RoyalCotillionAction);
      }
      setSelectedSource(null);
    },
    [selectedSource, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1] : null;

  return (
    <div className="royal-cotillion">
      <div className="royal-cotillion-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}/104</span>
        <span>Stock: {state.stock.length}</span>
        <button
          className="recycle-btn"
          onClick={() => dispatch({ type: "recycle" } as RoyalCotillionAction)}
          disabled={state.stock.length > 0 || state.recyclesLeft <= 0}
        >
          Recycle ({state.recyclesLeft})
        </button>
        {selectedSource && <span style={{ color: "#aa8" }}>Now click a foundation</span>}
      </div>

      <div className="royal-cotillion-main">
        {/* Stock & Waste */}
        <div className="rc-column">
          <div className="rc-label">Stock</div>
          <div
            className={`rc-card ${state.stock.length === 0 ? "empty" : "stock-card"}`}
            onClick={handleStockClick}
          >
            {state.stock.length > 0 ? state.stock.length : ""}
          </div>
          <div className="rc-label">Waste</div>
          <div
            className={`rc-card ${!wasteTop ? "empty" : isRed(wasteTop.suit) ? "red" : ""}`}
            onClick={wasteTop ? handleWasteClick : undefined}
            style={selectedSource?.type === "waste" ? { borderColor: "#ff0" } : {}}
          >
            {wasteTop ? `${rankLabel(wasteTop.rank)}${wasteTop.suit}` : ""}
          </div>
        </div>

        {/* Reserve */}
        <div className="rc-column">
          <div className="rc-label">Reserve</div>
          <div className="rc-reserve-grid">
            {state.reserve.map((pile, ri) => {
              const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
              const isSelected = selectedSource?.type === "reserve" && selectedSource.reserveIndex === ri;
              return (
                <div
                  key={ri}
                  className={`rc-card ${!topCard ? "empty" : isRed(topCard.suit) ? "red" : ""}`}
                  onClick={topCard ? () => handleReserveClick(ri) : undefined}
                  style={isSelected ? { borderColor: "#ff0" } : {}}
                >
                  {topCard ? `${rankLabel(topCard.rank)}${topCard.suit}` : ""}
                  {pile.length > 1 ? <span style={{ fontSize: 10 }}>+{pile.length - 1}</span> : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Foundations */}
        <div className="rc-foundations-section">
          <div>
            <div className="rc-section-label">Odd (A,3,5,7,9,J,K)</div>
            <div className="rc-foundation-row">
              {state.oddFoundations.map((f, fi) => {
                const topCard = f.cards[f.cards.length - 1];
                return (
                  <button
                    key={fi}
                    className={`rc-foundation-btn ${isRed(f.suit) ? "red" : ""}`}
                    onClick={() => handleOddFoundationClick(fi)}
                  >
                    <span className="top">{topCard ? `${rankLabel(topCard.rank)}${f.suit}` : `A${f.suit}`}</span>
                    <span>{f.cards.length}/{ODD_SEQ_LABELS.length}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="rc-section-label">Even (2,4,6,8,10,Q)</div>
            <div className="rc-foundation-row">
              {state.evenFoundations.map((f, fi) => {
                const topCard = f.cards[f.cards.length - 1];
                return (
                  <button
                    key={fi}
                    className={`rc-foundation-btn ${isRed(f.suit) ? "red" : ""}`}
                    onClick={() => handleEvenFoundationClick(fi)}
                  >
                    <span className="top">{topCard ? `${rankLabel(topCard.rank)}${f.suit}` : `2${f.suit}`}</span>
                    <span>{f.cards.length}/{EVEN_SEQ_LABELS.length}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
