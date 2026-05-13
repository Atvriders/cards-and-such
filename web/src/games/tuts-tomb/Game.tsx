import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { TutsTombState, TutsTombAction, TutsTombSettings } from "./state.js";
import "./Game.css";

export function TutsTombGame(
  { state, dispatch, onGameOver }: GameProps<TutsTombState, TutsTombSettings>,
): JSX.Element {
  const select = useCallback(
    (src: { kind: "pyramid"; row: number; col: number } | { kind: "waste" }) =>
      dispatch({ type: "select", source: src } as TutsTombAction),
    [dispatch],
  );
  if (state.won || state.lost) onGameOver(state.score);

  return (
    <div className="tuts-tomb-root fade-in">
      <div className="tuts-tomb-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Redeals: {state.redealsRemaining}</span>
        <button
          className="tuts-tomb-auto"
          type="button"
          data-testid="hint-target-tuts-tomb-draw"
          onClick={() => dispatch({ type: "draw" } as TutsTombAction)}
          disabled={state.stock.length === 0}
        >Draw</button>
        <button
          className="tuts-tomb-auto"
          type="button"
          data-testid="hint-target-tuts-tomb-redeal"
          onClick={() => dispatch({ type: "redeal" } as TutsTombAction)}
          disabled={state.stock.length > 0 || state.redealsRemaining <= 0}
        >Redeal</button>
      </div>
      <div className="tuts-tomb-pyramid">
        {state.pyramid.map((row, r) => (
          <div key={r} className="tuts-tomb-row">
            {row.map((cell, c) => (
              <div key={c} className="tuts-tomb-cell">
                {cell && !cell.removed && (
                  <div data-testid={`hint-target-tuts-tomb-pyramid-${r}-${c}`} onClick={() => select({ kind: "pyramid", row: r, col: c })}>
                    <CardView card={cell.card} />
                  </div>
                )}
                {(!cell || cell.removed) && <div className="tuts-tomb-gap" />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="tuts-tomb-bottom">
        <div className="tuts-tomb-stock-pile" data-testid="hint-target-tuts-tomb-stock">
          <div>Stock: {state.stock.length}</div>
        </div>
        <div className="tuts-tomb-waste-pile">
          {state.waste.length > 0 && (
            <div data-testid="hint-target-tuts-tomb-waste" onClick={() => select({ kind: "waste" })}>
              <CardView card={state.waste[state.waste.length - 1]!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
