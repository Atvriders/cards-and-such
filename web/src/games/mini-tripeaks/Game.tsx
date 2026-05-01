import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { MiniTripeaksState, MiniTripeaksAction, MiniTripeaksSettings } from "./state.js";
import "./Game.css";

export function MiniTripeaksGame(
  { state, dispatch, onGameOver }: GameProps<MiniTripeaksState, MiniTripeaksSettings>,
): JSX.Element {
  const play = useCallback(
    (col: number, idx: number) =>
      dispatch({ type: "play", col, idx } as MiniTripeaksAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);
  return (
    <div className="mini-tripeaks-root">
      <div className="mini-tripeaks-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {state.stock.length}</span>
        <button
          className="mini-tripeaks-auto"
          type="button"
          onClick={() => dispatch({ type: "draw" } as MiniTripeaksAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="mini-tripeaks-auto"
          type="button"
          onClick={() => dispatch({ type: "recycle" } as MiniTripeaksAction)}
          disabled={state.stock.length > 0}
        >Recycle</button>
      </div>
      <div className="mini-tripeaks-board">
        {state.columns.map((col, ci) => (
          <div key={ci} className="mini-tripeaks-col">
            {col.map((card, ri) => (
              <div key={ri} className="mini-tripeaks-cell" onClick={() => play(ci, ri)}>
                {!state.removed[ci]?.[ri] && <CardView card={card} />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mini-tripeaks-waste">
        {state.waste.length > 0 && (
          <CardView card={state.waste[state.waste.length - 1]!} />
        )}
      </div>
    </div>
  );
}
