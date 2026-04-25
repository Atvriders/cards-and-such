import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuadrilleState, QuadrilleAction, QuadrilleSettings } from "./state.js";
import { isRed, rankLabel } from "../../engines/deck/index.js";
import "./Quadrille.css";

export function Quadrille({
  state,
  dispatch,
  onGameOver,
}: GameProps<QuadrilleState, QuadrilleSettings>): JSX.Element {
  const handleDraw = useCallback(() => {
    if (state.stock.length > 0) {
      dispatch({ type: "draw" } as QuadrilleAction);
    } else {
      dispatch({ type: "recycle" } as QuadrilleAction);
    }
  }, [state.stock.length, dispatch]);

  if (state.won) onGameOver(state.score);

  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1] : null;

  return (
    <div className="quadrille">
      <div className="quadrille-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}/52</span>
        <span>Stock: {state.stock.length}</span>
        <button
          className="recycle-btn"
          onClick={() => dispatch({ type: "recycle" } as QuadrilleAction)}
          disabled={state.stock.length > 0 || state.recyclesLeft <= 0}
        >
          Recycle ({state.recyclesLeft})
        </button>
      </div>

      <div className="quadrille-main">
        {/* Stock & Waste */}
        <div className="quadrille-stock-area">
          <div
            className={`quadrille-card ${state.stock.length === 0 ? "empty" : "stock"}`}
            onClick={state.stock.length > 0 ? handleDraw : undefined}
          >
            {state.stock.length > 0 ? `${state.stock.length}` : ""}
          </div>
          <div
            className={`quadrille-card ${!wasteTop ? "empty" : isRed(wasteTop.suit) ? "red" : ""}`}
          >
            {wasteTop ? `${rankLabel(wasteTop.rank)}${wasteTop.suit}` : "waste"}
          </div>
        </div>

        {/* 4 suits × [down foundation | 6-center | up foundation] */}
        <div className="quadrille-foundations-grid">
          {state.upFoundations.map((uf, si) => {
            const df = state.downFoundations[si]!;
            const red = isRed(uf.suit);
            const upTop = uf.cards[uf.cards.length - 1];
            const downTop = df.cards[df.cards.length - 1];

            return (
              <>
                {/* Down foundation */}
                <button
                  key={`down-${si}`}
                  className={`quadrille-foundation-btn ${red ? "red" : ""}`}
                  onClick={() => dispatch({ type: "play-waste-down", suitIndex: si } as QuadrilleAction)}
                >
                  <span className="top-card">
                    {downTop ? `${rankLabel(downTop.rank)}` : `5${uf.suit}`}
                  </span>
                  <span>{df.cards.length > 0 ? `${df.cards.length}/5` : "▼"}</span>
                </button>

                {/* 6 center */}
                <div key={`six-${si}`} className={`quadrille-six ${red ? "red" : ""}`}>
                  6{uf.suit}
                </div>

                {/* Up foundation */}
                <button
                  key={`up-${si}`}
                  className={`quadrille-foundation-btn ${red ? "red" : ""}`}
                  onClick={() => dispatch({ type: "play-waste-up", suitIndex: si } as QuadrilleAction)}
                >
                  <span className="top-card">
                    {upTop ? `${rankLabel(upTop.rank)}` : `6${uf.suit}`}
                  </span>
                  <span>{uf.cards.length > 1 ? `${uf.cards.length - 1}/7` : "▲"}</span>
                </button>
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
}
