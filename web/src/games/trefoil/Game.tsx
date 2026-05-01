import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { TrefoilState, TrefoilAction, TrefoilSettings } from "./state.js";
import "./Game.css";

export function TrefoilGame(
  { state, dispatch, onGameOver }: GameProps<TrefoilState, TrefoilSettings>,
): JSX.Element {
  if (state.won) onGameOver(state.score);
  return (
    <div className="trefoil-root">
      <div className="trefoil-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
      </div>
      <div className="trefoil-grid">
        {state.grid.map((row, r) => (
          <div key={r} className="trefoil-row">
            {row.map((cell, c) => {
              const sel = state.selected && state.selected.r === r && state.selected.c === c;
              return (
                <div
                  key={c}
                  className={"trefoil-cell" + (sel ? " selected" : "")}
                  onClick={() => dispatch({ type: "select", r, c } as TrefoilAction)}
                >
                  {cell.card && <CardView card={cell.card} />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
