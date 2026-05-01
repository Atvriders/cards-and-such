import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { TriPeaksContinuousState, TriPeaksContinuousAction, TriPeaksContinuousSettings } from "./state.js";
import "./Game.css";

export function TriPeaksContinuousGame(
  { state, dispatch, onGameOver }: GameProps<TriPeaksContinuousState, TriPeaksContinuousSettings>,
): JSX.Element {
  const play = useCallback(
    (col: number, idx: number) =>
      dispatch({ type: "play", col, idx } as TriPeaksContinuousAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);
  return (
    <div className="tri-peaks-continuous-root">
      <div className="tri-peaks-continuous-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {state.stock.length}</span>
        <button
          className="tri-peaks-continuous-auto"
          type="button"
          onClick={() => dispatch({ type: "draw" } as TriPeaksContinuousAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="tri-peaks-continuous-auto"
          type="button"
          onClick={() => dispatch({ type: "recycle" } as TriPeaksContinuousAction)}
          disabled={state.stock.length > 0}
        >Recycle</button>
      </div>
      <div className="tri-peaks-continuous-board">
        {state.columns.map((col, ci) => (
          <div key={ci} className="tri-peaks-continuous-col">
            {col.map((card, ri) => (
              <div key={ri} className="tri-peaks-continuous-cell" onClick={() => play(ci, ri)}>
                {!state.removed[ci]?.[ri] && <CardView card={card} />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="tri-peaks-continuous-waste">
        {state.waste.length > 0 && (
          <CardView card={state.waste[state.waste.length - 1]!} />
        )}
      </div>
    </div>
  );
}
