import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { TutTombState, TutTombAction, TutTombSettings } from "./state.js";
import "./Game.css";

export function TutTombGame(
  { state, dispatch, onGameOver }: GameProps<TutTombState, TutTombSettings>,
): JSX.Element {
  const select = useCallback(
    (src: { kind: "pyramid"; row: number; col: number } | { kind: "waste" }) =>
      dispatch({ type: "select", source: src } as TutTombAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);

  return (
    <div className="tut-tomb-root">
      <div className="tut-tomb-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Redeals: {state.redealsRemaining}</span>
        <button
          className="tut-tomb-auto"
          type="button"
          data-testid="hint-target-tut-tomb-draw"
          onClick={() => dispatch({ type: "draw" } as TutTombAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="tut-tomb-auto"
          type="button"
          data-testid="hint-target-tut-tomb-redeal"
          onClick={() => dispatch({ type: "redeal" } as TutTombAction)}
          disabled={state.stock.length > 0 || state.redealsRemaining <= 0}
        >Redeal</button>
      </div>
      <div className="tut-tomb-pyramid">
        {state.pyramid.map((row, r) => (
          <div key={r} className="tut-tomb-row">
            {row.map((cell, c) => (
              <div key={c} className="tut-tomb-cell">
                {cell && !cell.removed && (
                  <div data-testid={`hint-target-tut-tomb-pyramid-${r}-${c}`} onClick={() => select({ kind: "pyramid", row: r, col: c })}>
                    <CardView card={cell.card} />
                  </div>
                )}
                {(!cell || cell.removed) && <div className="tut-tomb-gap" />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="tut-tomb-bottom">
        <div className="tut-tomb-stock-pile" data-testid="hint-target-tut-tomb-stock">
          <div>Stock: {state.stock.length}</div>
        </div>
        <div className="tut-tomb-waste-pile">
          {state.waste.length > 0 && (
            <div data-testid="hint-target-tut-tomb-waste" onClick={() => select({ kind: "waste" })}>
              <CardView card={state.waste[state.waste.length - 1]!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
