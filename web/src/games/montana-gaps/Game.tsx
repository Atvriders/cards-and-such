import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { MontanaGapsState, MontanaGapsAction, MontanaGapsSettings } from "./state.js";
import "./Game.css";

export function MontanaGapsGame(
  { state, dispatch, onGameOver }: GameProps<MontanaGapsState, MontanaGapsSettings>,
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
    dispatch({ type: "move", fromR: src.r, fromC: src.c, toR: r, toC: c } as MontanaGapsAction);
    setSrc(null);
  }, [state.grid, src, dispatch]);

  return (
    <div className="montana-gaps-root">
      <div className="montana-gaps-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Redeals: {state.redealsRemaining}</span>
        <button
          className="montana-gaps-auto"
          type="button"
          data-testid="hint-target-montana-gaps-redeal"
          onClick={() => dispatch({ type: "redeal" } as MontanaGapsAction)}
          disabled={state.redealsRemaining <= 0}
        >Redeal</button>
      </div>
      <div className="montana-gaps-grid">
        {state.grid.map((row, r) => (
          <div key={r} className="montana-gaps-row">
            {row.map((cell, c) => {
              const sel = src && src.r === r && src.c === c;
              return (
                <div
                  key={c}
                  className={"montana-gaps-cell" + (sel ? " selected" : "")}
                  data-testid={`hint-target-montana-gaps-${r}-${c}`}
                  onClick={() => click(r, c)}
                >
                  {cell.card ? <CardView card={cell.card} /> : <div className="montana-gaps-gap" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
