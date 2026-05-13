import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { ApophisState, ApophisAction, ApophisSettings } from "./state.js";
import "./Game.css";

export function ApophisGame(
  { state, dispatch, onGameOver }: GameProps<ApophisState, ApophisSettings>,
): JSX.Element {
  const select = useCallback(
    (src: { kind: "pyramid"; row: number; col: number } | { kind: "waste" }) =>
      dispatch({ type: "select", source: src } as ApophisAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);

  return (
    <div className="apophis-root fade-in">
      <div className="apophis-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Redeals: {state.redealsRemaining}</span>
        <button
          className="apophis-auto"
          type="button"
          data-testid="hint-target-apophis-draw"
          onClick={() => dispatch({ type: "draw" } as ApophisAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="apophis-auto"
          type="button"
          data-testid="hint-target-apophis-redeal"
          onClick={() => dispatch({ type: "redeal" } as ApophisAction)}
          disabled={state.stock.length > 0 || state.redealsRemaining <= 0}
        >Redeal</button>
      </div>
      <div className="apophis-pyramid">
        {state.pyramid.map((row, r) => (
          <div key={r} className="apophis-row">
            {row.map((cell, c) => (
              <div key={c} className="apophis-cell">
                {cell && !cell.removed && (
                  <div data-testid={`hint-target-apophis-pyramid-${r}-${c}`} onClick={() => select({ kind: "pyramid", row: r, col: c })}>
                    <CardView card={cell.card} />
                  </div>
                )}
                {(!cell || cell.removed) && <div className="apophis-gap" />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="apophis-bottom">
        <div className="apophis-stock-pile" data-testid="hint-target-apophis-stock">
          <div>Stock: {state.stock.length}</div>
        </div>
        <div className="apophis-waste-pile">
          {state.waste.length > 0 && (
            <div data-testid="hint-target-apophis-waste" onClick={() => select({ kind: "waste" })}>
              <CardView card={state.waste[state.waste.length - 1]!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
