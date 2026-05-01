import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { AddictionSolitaireState, AddictionSolitaireAction, AddictionSolitaireSettings } from "./state.js";
import "./Game.css";

export function AddictionSolitaireGame(
  { state, dispatch, onGameOver }: GameProps<AddictionSolitaireState, AddictionSolitaireSettings>,
): JSX.Element {
  const [src, setSrc] = useState<{ r: number; c: number } | null>(null);
  if (state.won) onGameOver(state.score);

  const click = useCallback((r: number, c: number) => {
    const cell = state.grid[r]?.[c];
    if (!cell) return;
    if (!src) {
      if (cell.card) setSrc({ r, c });
      return;
    }
    if (cell.card) {
      // re-pick
      setSrc({ r, c });
      return;
    }
    // try move
    dispatch({ type: "move", fromR: src.r, fromC: src.c, toR: r, toC: c } as AddictionSolitaireAction);
    setSrc(null);
  }, [state.grid, src, dispatch]);

  return (
    <div className="addiction-solitaire-root">
      <div className="addiction-solitaire-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Redeals: {state.redealsRemaining}</span>
        <button
          className="addiction-solitaire-auto"
          type="button"
          onClick={() => dispatch({ type: "redeal" } as AddictionSolitaireAction)}
          disabled={state.redealsRemaining <= 0}
        >Redeal</button>
      </div>
      <div className="addiction-solitaire-grid">
        {state.grid.map((row, r) => (
          <div key={r} className="addiction-solitaire-row">
            {row.map((cell, c) => {
              const sel = src && src.r === r && src.c === c;
              return (
                <div
                  key={c}
                  className={"addiction-solitaire-cell" + (sel ? " selected" : "")}
                  onClick={() => click(r, c)}
                >
                  {cell.card ? <CardView card={cell.card} /> : <div className="addiction-solitaire-gap" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
