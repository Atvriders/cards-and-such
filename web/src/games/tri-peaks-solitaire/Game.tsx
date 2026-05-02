import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { TriPeaksSolitaireState, TriPeaksSolitaireAction, TriPeaksSolitaireSettings } from "./state.js";
import "./Game.css";

export function TriPeaksSolitaireGame(
  { state, dispatch, onGameOver }: GameProps<TriPeaksSolitaireState, TriPeaksSolitaireSettings>,
): JSX.Element {
  const play = useCallback(
    (col: number, idx: number) =>
      dispatch({ type: "play", col, idx } as TriPeaksSolitaireAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);
  return (
    <div className="tri-peaks-solitaire-root">
      <div className="tri-peaks-solitaire-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {state.stock.length}</span>
        <button
          className="tri-peaks-solitaire-auto"
          type="button"
          data-testid="hint-target-tri-peaks-solitaire-draw"
          onClick={() => dispatch({ type: "draw" } as TriPeaksSolitaireAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="tri-peaks-solitaire-auto"
          type="button"
          data-testid="hint-target-tri-peaks-solitaire-recycle"
          onClick={() => dispatch({ type: "recycle" } as TriPeaksSolitaireAction)}
          disabled={state.stock.length > 0}
        >Recycle</button>
      </div>
      <div className="tri-peaks-solitaire-board">
        {state.columns.map((col, ci) => (
          <div key={ci} className="tri-peaks-solitaire-col">
            {col.map((card, ri) => (
              <div key={ri} className="tri-peaks-solitaire-cell" data-testid={`hint-target-tri-peaks-solitaire-${ci}-${ri}`} onClick={() => play(ci, ri)}>
                {!state.removed[ci]?.[ri] && <CardView card={card} />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="tri-peaks-solitaire-waste">
        {state.waste.length > 0 && (
          <CardView card={state.waste[state.waste.length - 1]!} />
        )}
      </div>
    </div>
  );
}
