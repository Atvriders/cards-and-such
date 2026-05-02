import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { PharaohsPyramidState, PharaohsPyramidAction, PharaohsPyramidSettings } from "./state.js";
import "./Game.css";

export function PharaohsPyramidGame(
  { state, dispatch, onGameOver }: GameProps<PharaohsPyramidState, PharaohsPyramidSettings>,
): JSX.Element {
  const select = useCallback(
    (src: { kind: "pyramid"; row: number; col: number } | { kind: "waste" }) =>
      dispatch({ type: "select", source: src } as PharaohsPyramidAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);

  return (
    <div className="pharaohs-pyramid-root">
      <div className="pharaohs-pyramid-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Redeals: {state.redealsRemaining}</span>
        <button
          className="pharaohs-pyramid-auto"
          type="button"
          data-testid="hint-target-pharaohs-pyramid-draw"
          onClick={() => dispatch({ type: "draw" } as PharaohsPyramidAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="pharaohs-pyramid-auto"
          type="button"
          data-testid="hint-target-pharaohs-pyramid-redeal"
          onClick={() => dispatch({ type: "redeal" } as PharaohsPyramidAction)}
          disabled={state.stock.length > 0 || state.redealsRemaining <= 0}
        >Redeal</button>
      </div>
      <div className="pharaohs-pyramid-pyramid">
        {state.pyramid.map((row, r) => (
          <div key={r} className="pharaohs-pyramid-row">
            {row.map((cell, c) => (
              <div key={c} className="pharaohs-pyramid-cell">
                {cell && !cell.removed && (
                  <div data-testid={`hint-target-pharaohs-pyramid-pyramid-${r}-${c}`} onClick={() => select({ kind: "pyramid", row: r, col: c })}>
                    <CardView card={cell.card} />
                  </div>
                )}
                {(!cell || cell.removed) && <div className="pharaohs-pyramid-gap" />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="pharaohs-pyramid-bottom">
        <div className="pharaohs-pyramid-stock-pile" data-testid="hint-target-pharaohs-pyramid-stock">
          <div>Stock: {state.stock.length}</div>
        </div>
        <div className="pharaohs-pyramid-waste-pile">
          {state.waste.length > 0 && (
            <div data-testid="hint-target-pharaohs-pyramid-waste" onClick={() => select({ kind: "waste" })}>
              <CardView card={state.waste[state.waste.length - 1]!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
