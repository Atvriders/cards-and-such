import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OsmosisState, OsmosisAction, OsmosisSettings } from "./state.js";
import { isRed, rankLabel } from "../../engines/deck/index.js";
import "./Osmosis.css";

export function Osmosis({
  state,
  dispatch,
  onGameOver,
}: GameProps<OsmosisState, OsmosisSettings>): JSX.Element {
  const handleDraw = useCallback(() => {
    dispatch({ type: "draw" } as OsmosisAction);
  }, [dispatch]);

  const handleRecycle = useCallback(() => {
    dispatch({ type: "recycle" } as OsmosisAction);
  }, [dispatch]);

  const handleFoundationClick = useCallback(
    (fi: number) => {
      // Try waste first
      if (state.waste.length > 0) {
        dispatch({ type: "move-waste-to-foundation", foundationIndex: fi } as OsmosisAction);
      }
    },
    [state.waste, dispatch],
  );

  const handleReserveClick = useCallback(
    (ri: number) => {
      // Try each foundation
      for (let fi = 0; fi < 4; fi++) {
        dispatch({ type: "move-reserve-to-foundation", reserveIndex: ri, foundationIndex: fi } as OsmosisAction);
      }
    },
    [dispatch],
  );

  if (state.won) onGameOver(state.score);

  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1] : null;

  return (
    <div className="osmosis">
      <div className="osmosis-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}/52</span>
        <span>Recycles: {state.recyclesLeft}</span>
      </div>

      <div className="osmosis-main">
        <div className="osmosis-left">
          <div className="osmosis-stock-row">
            {/* Stock */}
            <div
              className={`osmosis-card ${state.stock.length === 0 ? "empty" : "stock-card"}`}
              onClick={state.stock.length > 0 ? handleDraw : undefined}
            >
              {state.stock.length > 0 ? `${state.stock.length}` : ""}
            </div>
            {/* Waste */}
            <div
              className={`osmosis-card ${!wasteTop ? "empty" : (isRed(wasteTop.suit) ? "red" : "")}`}
            >
              {wasteTop ? `${rankLabel(wasteTop.rank)}${wasteTop.suit}` : ""}
            </div>
            <button
              className="recycle-btn"
              onClick={handleRecycle}
              disabled={state.stock.length > 0 || state.recyclesLeft <= 0}
            >
              Recycle ({state.recyclesLeft})
            </button>
          </div>

          <div className="osmosis-reserve">
            {state.reserve.map((pile, ri) => {
              const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
              return (
                <div
                  key={ri}
                  className={`osmosis-card ${!topCard ? "empty" : topCard && isRed(topCard.suit) ? "red" : ""}`}
                  onClick={topCard ? () => handleReserveClick(ri) : undefined}
                >
                  {topCard ? `${rankLabel(topCard.rank)}${topCard.suit}` : ""}
                  {pile.length > 1 ? <span style={{ fontSize: 10 }}> +{pile.length - 1}</span> : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="osmosis-foundations">
          {state.foundations.map((f, fi) => (
            <div key={fi} className="osmosis-foundation-row">
              <span className={`foundation-suit-label ${isRed(f.suit) ? "red" : ""}`}>{f.suit}</span>
              <div
                className="osmosis-foundation-drop"
                onClick={() => handleFoundationClick(fi)}
              >
                {f.cards.length === 0 ? "drop" : `${f.cards.length}`}
              </div>
              <div className="osmosis-foundation-cards">
                {f.cards.map((c) => (
                  <div key={c.id} className={`osmosis-mini-card ${isRed(c.suit) ? "red" : ""}`}>
                    {rankLabel(c.rank)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
