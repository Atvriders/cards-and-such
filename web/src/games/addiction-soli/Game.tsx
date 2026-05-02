import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { AddictionSoliState, AddictionSoliAction, AddictionSoliSettings } from "./state.js";
import "./Game.css";

export function AddictionSoliGame(
  { state, dispatch, onGameOver }: GameProps<AddictionSoliState, AddictionSoliSettings>,
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
    dispatch({ type: "move", fromR: src.r, fromC: src.c, toR: r, toC: c } as AddictionSoliAction);
    setSrc(null);
  }, [state.grid, src, dispatch]);

  return (
    <div className="addiction-soli-root">
      <div className="addiction-soli-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Redeals: {state.redealsRemaining}</span>
        <button
          className="addiction-soli-auto"
          type="button"
          data-testid="hint-target-addiction-soli-redeal"
          onClick={() => dispatch({ type: "redeal" } as AddictionSoliAction)}
          disabled={state.redealsRemaining <= 0}
        >Redeal</button>
      </div>
      <div className="addiction-soli-grid">
        {state.grid.map((row, r) => (
          <div key={r} className="addiction-soli-row">
            {row.map((cell, c) => {
              const sel = src && src.r === r && src.c === c;
              return (
                <div
                  key={c}
                  className={"addiction-soli-cell" + (sel ? " selected" : "")}
                  data-testid={`hint-target-addiction-soli-${r}-${c}`}
                  onClick={() => click(r, c)}
                >
                  {cell.card ? <CardView card={cell.card} /> : <div className="addiction-soli-gap" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
