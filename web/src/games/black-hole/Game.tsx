import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { BlackHoleState, BlackHoleAction, BlackHoleSettings } from "./state.js";
import "./Game.css";

export function BlackHoleGame(
  { state, dispatch, onGameOver }: GameProps<BlackHoleState, BlackHoleSettings>,
): JSX.Element {
  const play = useCallback(
    (col: number, idx: number) =>
      dispatch({ type: "play", col, idx } as BlackHoleAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);
  return (
    <div className="black-hole-root">
      <div className="black-hole-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {state.stock.length}</span>
        <button
          className="black-hole-auto"
          type="button"
          data-testid="hint-target-black-hole-draw"
          onClick={() => dispatch({ type: "draw" } as BlackHoleAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="black-hole-auto"
          type="button"
          data-testid="hint-target-black-hole-recycle"
          onClick={() => dispatch({ type: "recycle" } as BlackHoleAction)}
          disabled={state.stock.length > 0}
        >Recycle</button>
      </div>
      <div className="black-hole-board">
        {state.columns.map((col, ci) => (
          <div key={ci} className="black-hole-col">
            {col.map((card, ri) => (
              <div key={ri} className="black-hole-cell" data-testid={`hint-target-black-hole-${ci}-${ri}`} onClick={() => play(ci, ri)}>
                {!state.removed[ci]?.[ri] && <CardView card={card} />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="black-hole-waste">
        {state.waste.length > 0 && (
          <CardView card={state.waste[state.waste.length - 1]!} />
        )}
      </div>
    </div>
  );
}
