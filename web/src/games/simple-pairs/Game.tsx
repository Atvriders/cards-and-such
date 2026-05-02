import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { SimplePairsState, SimplePairsAction, SimplePairsSettings } from "./state.js";
import "./Game.css";

export function SimplePairsGame(
  { state, dispatch, onGameOver }: GameProps<SimplePairsState, SimplePairsSettings>,
): JSX.Element {
  if (state.won) onGameOver(state.score);
  return (
    <div className="simple-pairs-root">
      <div className="simple-pairs-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
      </div>
      <div className="simple-pairs-grid">
        {state.grid.map((row, r) => (
          <div key={r} className="simple-pairs-row">
            {row.map((cell, c) => {
              const sel = state.selected && state.selected.r === r && state.selected.c === c;
              return (
                <div
                  key={c}
                  className={"simple-pairs-cell" + (sel ? " selected" : "")}
                  data-testid={`hint-target-simple-pairs-${r}-${c}`}
                  onClick={() => dispatch({ type: "select", r, c } as SimplePairsAction)}
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
