import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { PyramidSolitaireClassicState, PyramidSolitaireClassicAction, PyramidSolitaireClassicSettings } from "./state.js";
import "./Game.css";

export function PyramidSolitaireClassicGame(
  { state, dispatch, onGameOver }: GameProps<PyramidSolitaireClassicState, PyramidSolitaireClassicSettings>,
): JSX.Element {
  const select = useCallback(
    (src: { kind: "pyramid"; row: number; col: number } | { kind: "waste" }) =>
      dispatch({ type: "select", source: src } as PyramidSolitaireClassicAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);

  return (
    <div className="pyramid-solitaire-classic-root">
      <div className="pyramid-solitaire-classic-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Redeals: {state.redealsRemaining}</span>
        <button
          className="pyramid-solitaire-classic-auto"
          type="button"
          onClick={() => dispatch({ type: "draw" } as PyramidSolitaireClassicAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="pyramid-solitaire-classic-auto"
          type="button"
          onClick={() => dispatch({ type: "redeal" } as PyramidSolitaireClassicAction)}
          disabled={state.stock.length > 0 || state.redealsRemaining <= 0}
        >Redeal</button>
      </div>
      <div className="pyramid-solitaire-classic-pyramid">
        {state.pyramid.map((row, r) => (
          <div key={r} className="pyramid-solitaire-classic-row">
            {row.map((cell, c) => (
              <div key={c} className="pyramid-solitaire-classic-cell">
                {cell && !cell.removed && (
                  <div onClick={() => select({ kind: "pyramid", row: r, col: c })}>
                    <CardView card={cell.card} />
                  </div>
                )}
                {(!cell || cell.removed) && <div className="pyramid-solitaire-classic-gap" />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="pyramid-solitaire-classic-bottom">
        <div className="pyramid-solitaire-classic-stock-pile">
          <div>Stock: {state.stock.length}</div>
        </div>
        <div className="pyramid-solitaire-classic-waste-pile">
          {state.waste.length > 0 && (
            <div onClick={() => select({ kind: "waste" })}>
              <CardView card={state.waste[state.waste.length - 1]!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
