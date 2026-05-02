import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { PyramidNoRedealState, PyramidNoRedealAction, PyramidNoRedealSettings } from "./state.js";
import "./Game.css";

export function PyramidNoRedealGame(
  { state, dispatch, onGameOver }: GameProps<PyramidNoRedealState, PyramidNoRedealSettings>,
): JSX.Element {
  const select = useCallback(
    (src: { kind: "pyramid"; row: number; col: number } | { kind: "waste" }) =>
      dispatch({ type: "select", source: src } as PyramidNoRedealAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);

  return (
    <div className="pyramid-no-redeal-root">
      <div className="pyramid-no-redeal-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Redeals: {state.redealsRemaining}</span>
        <button
          className="pyramid-no-redeal-auto"
          type="button"
          data-testid="hint-target-pyramid-no-redeal-draw"
          onClick={() => dispatch({ type: "draw" } as PyramidNoRedealAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="pyramid-no-redeal-auto"
          type="button"
          data-testid="hint-target-pyramid-no-redeal-redeal"
          onClick={() => dispatch({ type: "redeal" } as PyramidNoRedealAction)}
          disabled={state.stock.length > 0 || state.redealsRemaining <= 0}
        >Redeal</button>
      </div>
      <div className="pyramid-no-redeal-pyramid">
        {state.pyramid.map((row, r) => (
          <div key={r} className="pyramid-no-redeal-row">
            {row.map((cell, c) => (
              <div key={c} className="pyramid-no-redeal-cell">
                {cell && !cell.removed && (
                  <div data-testid={`hint-target-pyramid-no-redeal-pyramid-${r}-${c}`} onClick={() => select({ kind: "pyramid", row: r, col: c })}>
                    <CardView card={cell.card} />
                  </div>
                )}
                {(!cell || cell.removed) && <div className="pyramid-no-redeal-gap" />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="pyramid-no-redeal-bottom">
        <div className="pyramid-no-redeal-stock-pile" data-testid="hint-target-pyramid-no-redeal-stock">
          <div>Stock: {state.stock.length}</div>
        </div>
        <div className="pyramid-no-redeal-waste-pile">
          {state.waste.length > 0 && (
            <div data-testid="hint-target-pyramid-no-redeal-waste" onClick={() => select({ kind: "waste" })}>
              <CardView card={state.waste[state.waste.length - 1]!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
