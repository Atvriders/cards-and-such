import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { GolfParVariantState, GolfParVariantAction, GolfParVariantSettings } from "./state.js";
import "./Game.css";

export function GolfParVariantGame(
  { state, dispatch, onGameOver }: GameProps<GolfParVariantState, GolfParVariantSettings>,
): JSX.Element {
  const play = useCallback(
    (col: number, idx: number) =>
      dispatch({ type: "play", col, idx } as GolfParVariantAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);
  return (
    <div className="golf-par-variant-root">
      <div className="golf-par-variant-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {state.stock.length}</span>
        <button
          className="golf-par-variant-auto"
          type="button"
          data-testid="hint-target-golf-par-variant-draw"
          onClick={() => dispatch({ type: "draw" } as GolfParVariantAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="golf-par-variant-auto"
          type="button"
          data-testid="hint-target-golf-par-variant-recycle"
          onClick={() => dispatch({ type: "recycle" } as GolfParVariantAction)}
          disabled={state.stock.length > 0}
        >Recycle</button>
      </div>
      <div className="golf-par-variant-board">
        {state.columns.map((col, ci) => (
          <div key={ci} className="golf-par-variant-col">
            {col.map((card, ri) => (
              <div key={ri} className="golf-par-variant-cell" data-testid={`hint-target-golf-par-variant-${ci}-${ri}`} onClick={() => play(ci, ri)}>
                {!state.removed[ci]?.[ri] && <CardView card={card} />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="golf-par-variant-waste">
        {state.waste.length > 0 && (
          <CardView card={state.waste[state.waste.length - 1]!} />
        )}
      </div>
    </div>
  );
}
