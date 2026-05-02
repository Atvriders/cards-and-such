import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { GizaPyramidState, GizaPyramidAction, GizaPyramidSettings } from "./state.js";
import "./Game.css";

export function GizaPyramidGame(
  { state, dispatch, onGameOver }: GameProps<GizaPyramidState, GizaPyramidSettings>,
): JSX.Element {
  const select = useCallback(
    (src: { kind: "pyramid"; row: number; col: number } | { kind: "waste" }) =>
      dispatch({ type: "select", source: src } as GizaPyramidAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);

  return (
    <div className="giza-pyramid-root">
      <div className="giza-pyramid-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Redeals: {state.redealsRemaining}</span>
        <button
          className="giza-pyramid-auto"
          type="button"
          data-testid="hint-target-giza-pyramid-draw"
          onClick={() => dispatch({ type: "draw" } as GizaPyramidAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="giza-pyramid-auto"
          type="button"
          data-testid="hint-target-giza-pyramid-redeal"
          onClick={() => dispatch({ type: "redeal" } as GizaPyramidAction)}
          disabled={state.stock.length > 0 || state.redealsRemaining <= 0}
        >Redeal</button>
      </div>
      <div className="giza-pyramid-pyramid">
        {state.pyramid.map((row, r) => (
          <div key={r} className="giza-pyramid-row">
            {row.map((cell, c) => (
              <div key={c} className="giza-pyramid-cell">
                {cell && !cell.removed && (
                  <div data-testid={`hint-target-giza-pyramid-pyramid-${r}-${c}`} onClick={() => select({ kind: "pyramid", row: r, col: c })}>
                    <CardView card={cell.card} />
                  </div>
                )}
                {(!cell || cell.removed) && <div className="giza-pyramid-gap" />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="giza-pyramid-bottom">
        <div className="giza-pyramid-stock-pile" data-testid="hint-target-giza-pyramid-stock">
          <div>Stock: {state.stock.length}</div>
        </div>
        <div className="giza-pyramid-waste-pile">
          {state.waste.length > 0 && (
            <div data-testid="hint-target-giza-pyramid-waste" onClick={() => select({ kind: "waste" })}>
              <CardView card={state.waste[state.waste.length - 1]!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
