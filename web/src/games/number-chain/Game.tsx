import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NumberChainState, NumberChainSettings, NumberChainAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function NumberChainGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<NumberChainState, NumberChainSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleClick = useCallback(
    (index: number) => {
      if (terminal) return;
      dispatch({ type: "extend", index } as NumberChainAction);
    },
    [dispatch, terminal],
  );

  const handleReset = useCallback(() => {
    dispatch({ type: "reset" } as NumberChainAction);
  }, [dispatch]);

  const { size, grid, path } = state;
  const head = path.length > 0 ? path[path.length - 1] : -1;

  return (
    <div className="number-chain">
      <div className="number-chain-info">
        <span>Grid: {size}×{size}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Path: {path.length}</span>
      </div>
      <div className={`number-chain-status${state.won ? " win" : ""}`}>
        {state.won ? "Chain complete! You win!" : "Connect numbers 1 → N in order"}
      </div>

      <div
        className="number-chain-grid"
        style={{ gridTemplateColumns: `repeat(${size}, 44px)` }}
      >
        {Array.from({ length: size * size }, (_, i) => {
          const isEndpoint = grid[i]! > 0;
          const inPath = path.includes(i);
          const isHead = i === head;
          let cls = "number-chain-cell";
          if (isEndpoint) cls += " endpoint";
          if (inPath && !isEndpoint) cls += " path";
          if (isHead) cls += " path-head";
          return (
            <div key={i} className={cls} onClick={() => handleClick(i)}>
              {isEndpoint ? grid[i] : inPath ? "•" : ""}
            </div>
          );
        })}
      </div>

      <div className="number-chain-controls">
        <button className="number-chain-btn" onClick={handleReset}>Reset Path</button>
      </div>

      <p className="number-chain-hint">
        Click 1 to start, then trace a path to reach each number in order. Click an adjacent cell to move back.
      </p>
    </div>
  );
}
