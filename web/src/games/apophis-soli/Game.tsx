import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { ApophisSoliState, ApophisSoliAction, ApophisSoliSettings } from "./state.js";
import "./Game.css";

export function ApophisSoliGame(
  { state, dispatch, onGameOver }: GameProps<ApophisSoliState, ApophisSoliSettings>,
): JSX.Element {
  const select = useCallback(
    (src: { kind: "pyramid"; row: number; col: number } | { kind: "waste" }) =>
      dispatch({ type: "select", source: src } as ApophisSoliAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);

  return (
    <div className="apophis-soli-root">
      <div className="apophis-soli-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Redeals: {state.redealsRemaining}</span>
        <button
          className="apophis-soli-auto"
          type="button"
          data-testid="hint-target-apophis-soli-draw"
          onClick={() => dispatch({ type: "draw" } as ApophisSoliAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="apophis-soli-auto"
          type="button"
          data-testid="hint-target-apophis-soli-redeal"
          onClick={() => dispatch({ type: "redeal" } as ApophisSoliAction)}
          disabled={state.stock.length > 0 || state.redealsRemaining <= 0}
        >Redeal</button>
      </div>
      <div className="apophis-soli-pyramid">
        {state.pyramid.map((row, r) => (
          <div key={r} className="apophis-soli-row">
            {row.map((cell, c) => (
              <div key={c} className="apophis-soli-cell">
                {cell && !cell.removed && (
                  <div data-testid={`hint-target-apophis-soli-pyramid-${r}-${c}`} onClick={() => select({ kind: "pyramid", row: r, col: c })}>
                    <CardView card={cell.card} />
                  </div>
                )}
                {(!cell || cell.removed) && <div className="apophis-soli-gap" />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="apophis-soli-bottom">
        <div className="apophis-soli-stock-pile" data-testid="hint-target-apophis-soli-stock">
          <div>Stock: {state.stock.length}</div>
        </div>
        <div className="apophis-soli-waste-pile">
          {state.waste.length > 0 && (
            <div data-testid="hint-target-apophis-soli-waste" onClick={() => select({ kind: "waste" })}>
              <CardView card={state.waste[state.waste.length - 1]!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
