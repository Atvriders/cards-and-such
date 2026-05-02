import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { GolfParState, GolfParAction, GolfParSettings } from "./state.js";
import "./Game.css";

export function GolfParGame(
  { state, dispatch, onGameOver }: GameProps<GolfParState, GolfParSettings>,
): JSX.Element {
  const play = useCallback(
    (col: number, idx: number) =>
      dispatch({ type: "play", col, idx } as GolfParAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);
  return (
    <div className="golf-par-root">
      <div className="golf-par-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {state.stock.length}</span>
        <button
          className="golf-par-auto"
          type="button"
          data-testid="hint-target-golf-par-draw"
          onClick={() => dispatch({ type: "draw" } as GolfParAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="golf-par-auto"
          type="button"
          data-testid="hint-target-golf-par-recycle"
          onClick={() => dispatch({ type: "recycle" } as GolfParAction)}
          disabled={state.stock.length > 0}
        >Recycle</button>
      </div>
      <div className="golf-par-board">
        {state.columns.map((col, ci) => (
          <div key={ci} className="golf-par-col">
            {col.map((card, ri) => (
              <div key={ri} className="golf-par-cell" data-testid={`hint-target-golf-par-${ci}-${ri}`} onClick={() => play(ci, ri)}>
                {!state.removed[ci]?.[ri] && <CardView card={card} />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="golf-par-waste">
        {state.waste.length > 0 && (
          <CardView card={state.waste[state.waste.length - 1]!} />
        )}
      </div>
    </div>
  );
}
