import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FoxGeeseState, FoxGeeseSettings, FoxGeeseAction } from "./state.js";
import { isTerminal, isValid, foxMoves, BOARD_SIZE } from "./state.js";
import "./Game.css";

export function FoxAndGeese({
  state,
  dispatch,
  onGameOver,
}: GameProps<FoxGeeseState, FoxGeeseSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const CELL = 70;

  // Compute valid targets for fox
  const selected = state.selected;
  let validTargets = new Set<string>();
  if (selected && state.turn === "fox" && state.winner === null) {
    const moves = foxMoves(state.grid, selected);
    for (const m of moves) {
      validTargets.add(`${m.to[0]},${m.to[1]}`);
    }
  }

  function handleCellClick(r: number, c: number) {
    if (state.winner !== null || state.turn !== "fox") return;
    const key = `${r},${c}`;
    if (validTargets.has(key)) {
      dispatch({ type: "move", row: r, col: c } satisfies FoxGeeseAction);
    } else if (state.grid[r]?.[c] === "fox") {
      dispatch({ type: "select", row: r, col: c } satisfies FoxGeeseAction);
    }
  }

  let statusText = "";
  let statusClass = "";
  const geeseCount = state.grid.flat().filter((c) => c === "goose").length;

  if (state.winner === "fox") { statusText = "Fox wins!"; statusClass = "win"; }
  else if (state.winner === "geese") { statusText = "Geese win! Fox is trapped."; statusClass = "loss"; }
  else if (state.turn === "geese") { statusText = "Geese moving..."; }
  else if (selected) { statusText = "Click a highlighted cell to move the fox."; }
  else { statusText = "Click the fox to select it."; }

  return (
    <div className="foxgeese-game">
      <div className="foxgeese-info">
        <span>Geese remaining: {geeseCount}</span>
      </div>
      <div className={`foxgeese-status ${statusClass}`}>{statusText}</div>
      <div
        className="foxgeese-board"
        style={{ width: CELL * BOARD_SIZE, height: CELL * BOARD_SIZE }}
      >
        {Array.from({ length: BOARD_SIZE }, (_, r) =>
          Array.from({ length: BOARD_SIZE }, (_, c) => {
            if (!isValid(r, c)) {
              return (
                <div
                  key={`${r},${c}`}
                  className="foxgeese-cell invalid"
                  style={{ left: c * CELL, top: r * CELL, width: CELL, height: CELL }}
                />
              );
            }
            const piece = state.grid[r]?.[c];
            const key = `${r},${c}`;
            const isSelected = selected && selected[0] === r && selected[1] === c;
            const isTarget = validTargets.has(key);
            let cellClass = "foxgeese-cell";
            if (isSelected) cellClass += " selected";
            else if (isTarget) cellClass += " target";

            return (
              <div
                key={key}
                className={cellClass}
                style={{ left: c * CELL, top: r * CELL, width: CELL, height: CELL }}
                onClick={() => handleCellClick(r, c)}
              >
                {piece === "fox" && <span className="foxgeese-piece fox">🦊</span>}
                {piece === "goose" && <span className="foxgeese-piece goose">🪿</span>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
