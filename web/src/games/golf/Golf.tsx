import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GolfState, GolfAction, GolfSettings } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Golf.css";

export function Golf({
  state,
  dispatch,
  onGameOver,
}: GameProps<GolfState, GolfSettings>): JSX.Element {
  const handleColClick = useCallback(
    (colIndex: number) => {
      dispatch({ type: "move-to-waste", colIndex } as GolfAction);
    },
    [dispatch],
  );

  const handleDraw = useCallback(() => {
    dispatch({ type: "draw" } as GolfAction);
  }, [dispatch]);

  if (state.won) onGameOver(state.score);

  const wasteTop = state.waste[state.waste.length - 1];
  const tableauTotal = state.tableau.reduce((s, c) => s + c.length, 0);

  return (
    <div className="golf">
      <div className="golf-info">
        <span>Score: {state.score}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Stock left: {state.stock.length}</span>
        <span>Cards remaining: {tableauTotal}</span>
      </div>

      <div className="golf-top-row">
        <div className="golf-stock-area">
          <span>Stock</span>
          {state.stock.length > 0 ? (
            <Card faceDown onClick={handleDraw} />
          ) : (
            <div className="golf-pile-placeholder">Empty</div>
          )}
          <button className="golf-stock-btn" data-testid="hint-target-golf-draw" onClick={handleDraw} disabled={state.stock.length === 0}>
            Draw
          </button>
        </div>

        <div className="golf-waste-area">
          <span>Waste (play on this)</span>
          {wasteTop ? (
            <Card card={wasteTop} />
          ) : (
            <div className="golf-pile-placeholder">Empty</div>
          )}
        </div>
      </div>

      <div className="golf-tableau-row">
        {state.tableau.map((col, colIndex) => (
          <div
            key={colIndex}
            className="golf-col"
            data-testid={`hint-target-golf-col-${colIndex}`}
            onClick={() => handleColClick(colIndex)}
            title="Click top card to play it on the waste"
          >
            {col.length === 0 ? (
              <div className="golf-pile-placeholder">Empty</div>
            ) : (
              col.map((card, i) => (
                <Card key={card.id} card={card} className={i === col.length - 1 ? "clickable" : ""} />
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
