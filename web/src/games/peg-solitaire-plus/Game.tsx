import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PegSolitairePlusState, PegSolitairePlusSettings, PegSolitairePlusAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function PegSolitairePlusGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<PegSolitairePlusState, PegSolitairePlusSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleClick = useCallback(
    (index: number) => {
      if (terminal) return;
      if (state.selected === null) {
        dispatch({ type: "select", index } as PegSolitairePlusAction);
      } else {
        dispatch({ type: "move", index } as PegSolitairePlusAction);
      }
    },
    [dispatch, terminal, state.selected],
  );

  const { board, boardSize, selected } = state;

  return (
    <div className="peg-sol-plus">
      <div className="peg-sol-plus-info">
        <span>Pegs left: {state.pegsLeft}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Variant: {state.settings.variant}</span>
      </div>
      <div className={`peg-sol-plus-status${state.won ? " win" : state.stuck ? " stuck" : ""}`}>
        {state.won ? "Perfect! One peg remaining!" : state.stuck ? `Stuck with ${state.pegsLeft} pegs` : selected !== null ? "Click destination hole" : "Click a peg to select it"}
      </div>

      <div
        className="peg-sol-plus-grid"
        style={{ gridTemplateColumns: `repeat(${boardSize}, 36px)` }}
      >
        {Array.from({ length: boardSize * boardSize }, (_, i) => {
          const v = board[i]!;
          if (v === 0) return <div key={i} className="peg-sol-plus-cell invalid" />;
          const cls = `peg-sol-plus-cell ${v === 1 ? "peg" : "hole"}${selected === i ? " selected" : ""}`;
          return (
            <div key={i} className={cls} onClick={() => handleClick(i)} />
          );
        })}
      </div>

      <p className="peg-sol-plus-hint">
        Click a peg to select, then click a hole 2 steps away to jump. Eliminate pegs to leave just one.
      </p>
    </div>
  );
}
