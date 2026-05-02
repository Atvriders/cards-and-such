import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { GapsTwoDeckState, GapsTwoDeckAction, GapsTwoDeckSettings } from "./state.js";
import "./Game.css";

export function GapsTwoDeckGame(
  { state, dispatch, onGameOver }: GameProps<GapsTwoDeckState, GapsTwoDeckSettings>,
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
    dispatch({ type: "move", fromR: src.r, fromC: src.c, toR: r, toC: c } as GapsTwoDeckAction);
    setSrc(null);
  }, [state.grid, src, dispatch]);

  return (
    <div className="gaps-two-deck-root">
      <div className="gaps-two-deck-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Redeals: {state.redealsRemaining}</span>
        <button
          className="gaps-two-deck-auto"
          type="button"
          data-testid="hint-target-gaps-two-deck-redeal"
          onClick={() => dispatch({ type: "redeal" } as GapsTwoDeckAction)}
          disabled={state.redealsRemaining <= 0}
        >Redeal</button>
      </div>
      <div className="gaps-two-deck-grid">
        {state.grid.map((row, r) => (
          <div key={r} className="gaps-two-deck-row">
            {row.map((cell, c) => {
              const sel = src && src.r === r && src.c === c;
              return (
                <div
                  key={c}
                  className={"gaps-two-deck-cell" + (sel ? " selected" : "")}
                  data-testid={`hint-target-gaps-two-deck-${r}-${c}`}
                  onClick={() => click(r, c)}
                >
                  {cell.card ? <CardView card={cell.card} /> : <div className="gaps-two-deck-gap" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
