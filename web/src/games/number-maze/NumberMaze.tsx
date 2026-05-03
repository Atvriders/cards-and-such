import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NumberMazeState, NumberMazeSettings } from "./state.js";
import { isTerminal, getLegalMoves } from "./state.js";
import "./NumberMaze.css";

export function NumberMaze({
  state,
  dispatch,
  onGameOver,
}: GameProps<NumberMazeState, NumberMazeSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const legalDirs = getLegalMoves(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, row, col } = state;

  function wasVisited(r: number, c: number): boolean {
    return state.history.slice(0, -1).some(([hr, hc]) => hr === r && hc === c);
  }

  return (
    <div className="nm-game">
      <div className="nm-title">Number Maze</div>

      <div className="nm-info">
        <span>{puzzle.name} puzzle</span>
        <span>Turns: {state.turnsUsed} / {puzzle.maxTurns}</span>
      </div>

      <div className="nm-grid" style={{ gridTemplateColumns: `repeat(${puzzle.cols}, 52px)` }}>
        {Array.from({ length: puzzle.rows }, (_, r) =>
          Array.from({ length: puzzle.cols }, (_, c) => {
            const val = puzzle.grid[r]![c]!;
            const isCurrent = r === row && c === col;
            const isExit = val === 0;
            const visited = wasVisited(r, c);
            const isStart = r === puzzle.startRow && c === puzzle.startCol && state.turnsUsed === 0;
            return (
              <div
                key={`${r}-${c}`}
                className={[
                  "nm-cell",
                  isCurrent ? "current" : "",
                  isExit ? "exit" : "",
                  visited ? "visited" : "",
                  isStart ? "start" : "",
                ].filter(Boolean).join(" ")}
              >
                {isExit ? "EXIT" : val}
              </div>
            );
          })
        )}
      </div>

      {!state.solved && !state.failed && (
        <>
          <div className="nm-instruction">
            Move <strong>{puzzle.grid[row]?.[col] ?? 0}</strong> step{(puzzle.grid[row]?.[col] ?? 0) !== 1 ? "s" : ""} in a direction
          </div>
          <div className="nm-arrow-pad">
            <button data-testid="hint-target-number-maze-action"
              className="nm-arrow up"
              disabled={!legalDirs.includes("up")}
              onClick={() => dispatch({ type: "move", dir: "up" })}
            >▲</button>
            <button
              className="nm-arrow left"
              disabled={!legalDirs.includes("left")}
              onClick={() => dispatch({ type: "move", dir: "left" })}
            >◀</button>
            <button
              className="nm-arrow right"
              disabled={!legalDirs.includes("right")}
              onClick={() => dispatch({ type: "move", dir: "right" })}
            >▶</button>
            <button
              className="nm-arrow down"
              disabled={!legalDirs.includes("down")}
              onClick={() => dispatch({ type: "move", dir: "down" })}
            >▼</button>
          </div>
        </>
      )}

      {(state.solved || state.failed) && (
        <div className={`nm-game-over ${state.solved ? "win" : "lose"}`}>
          {state.solved ? `Solved in ${state.turnsUsed} turns!` : "Out of turns!"}<br />
          <span className="nm-final">Score: {terminal?.score ?? 0}</span>
        </div>
      )}
    </div>
  );
}
