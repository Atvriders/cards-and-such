import { useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DominosaPuzzleState, DominosaPuzzleSettings } from "./state.js";
import { isTerminal, ROWS, COLS } from "./state.js";
import "./Dominosa.css";

function cellKey(r: number, c: number): string { return `${r},${c}`; }

export function Dominosa({ state, dispatch }: GameProps<DominosaPuzzleState, DominosaPuzzleSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [firstSel, setFirstSel] = useState<string | null>(null);

  const claimedCells = new Set(state.claims.flatMap((c) => [c.cells[0], c.cells[1]]));

  function handleClick(r: number, c: number) {
    if (state.over) return;
    const key = cellKey(r, c);

    if (firstSel === null) {
      setFirstSel(key);
      return;
    }

    if (firstSel === key) {
      setFirstSel(null);
      return;
    }

    // Try to claim pair
    dispatch({ type: "claim", cells: [firstSel, key] as [string, string] });
    setFirstSel(null);
  }

  function handleRightClick(e: React.MouseEvent, r: number, c: number) {
    e.preventDefault();
    // Unclaim if already claimed
    const key = cellKey(r, c);
    const claim = state.claims.find((cl) => cl.cells[0] === key || cl.cells[1] === key);
    if (claim) {
      dispatch({ type: "unclaim", cells: claim.cells });
    }
  }

  return (
    <div className="dominosa-game">
      <div className="dominosa-header">
        Dominoes placed: {state.claims.length} / 28
      </div>

      <div
        className="dominosa-board"
        style={{ gridTemplateColumns: `repeat(${COLS}, 48px)` }}
      >
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const key = cellKey(r, c);
            const isClaimed = claimedCells.has(key);
            const isSelected = firstSel === key;
            return (
              <div
                key={key}
                className={`dominosa-cell${isSelected ? " dominosa-cell--selected" : ""}${isClaimed ? " dominosa-cell--claimed" : ""}`}
                onClick={() => handleClick(r, c)}
                onContextMenu={(e) => handleRightClick(e, r, c)}
              >
                {state.grid[r]![c]}
              </div>
            );
          })
        )}
      </div>

      <div className="dominosa-hint">
        Click two adjacent cells to place a domino. Right-click to remove.
      </div>

      {terminal && (
        <div className="dominosa-overlay">
          <h2>{state.won ? "Puzzle Solved!" : "Game Over"}</h2>
          <p>Score: {terminal.score}</p>
        </div>
      )}
    </div>
  );
}
