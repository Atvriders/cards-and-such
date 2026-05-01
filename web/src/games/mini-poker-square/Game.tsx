import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { MiniPokerSquareState, MiniPokerSquareAction, MiniPokerSquareSettings } from "./state.js";
import "./Game.css";

export function MiniPokerSquareGame(
  { state, dispatch, onGameOver }: GameProps<MiniPokerSquareState, MiniPokerSquareSettings>,
): JSX.Element {
  if (state.won) onGameOver(state.score);
  return (
    <div className="mini-poker-square-root">
      <div className="mini-poker-square-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
      </div>
      <div className="mini-poker-square-grid">
        {state.grid.map((row, r) => (
          <div key={r} className="mini-poker-square-row">
            {row.map((cell, c) => {
              const sel = state.selected && state.selected.r === r && state.selected.c === c;
              return (
                <div
                  key={c}
                  className={"mini-poker-square-cell" + (sel ? " selected" : "")}
                  onClick={() => dispatch({ type: "select", r, c } as MiniPokerSquareAction)}
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
