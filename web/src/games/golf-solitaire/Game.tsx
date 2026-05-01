import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { GolfSolitaireState, GolfSolitaireAction, GolfSolitaireSettings } from "./state.js";
import "./Game.css";

export function GolfSolitaireGame(
  { state, dispatch, onGameOver }: GameProps<GolfSolitaireState, GolfSolitaireSettings>,
): JSX.Element {
  const play = useCallback(
    (col: number, idx: number) =>
      dispatch({ type: "play", col, idx } as GolfSolitaireAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);
  return (
    <div className="golf-solitaire-root">
      <div className="golf-solitaire-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {state.stock.length}</span>
        <button
          className="golf-solitaire-auto"
          type="button"
          onClick={() => dispatch({ type: "draw" } as GolfSolitaireAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="golf-solitaire-auto"
          type="button"
          onClick={() => dispatch({ type: "recycle" } as GolfSolitaireAction)}
          disabled={state.stock.length > 0}
        >Recycle</button>
      </div>
      <div className="golf-solitaire-board">
        {state.columns.map((col, ci) => (
          <div key={ci} className="golf-solitaire-col">
            {col.map((card, ri) => (
              <div key={ri} className="golf-solitaire-cell" onClick={() => play(ci, ri)}>
                {!state.removed[ci]?.[ri] && <CardView card={card} />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="golf-solitaire-waste">
        {state.waste.length > 0 && (
          <CardView card={state.waste[state.waste.length - 1]!} />
        )}
      </div>
    </div>
  );
}
