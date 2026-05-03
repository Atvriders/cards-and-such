import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KonaneState, KonaneSettings, KonaneAction } from "./state.js";
import { isTerminal, jumpTargets, SIZE } from "./state.js";
import { Board } from "../../engines/grid/Board.js";
import type { Coord } from "../../engines/grid/index.js";
import "./Game.css";

export function Konane({
  state,
  dispatch,
  onGameOver,
}: GameProps<KonaneState, KonaneSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, turn, selected, jumpDir, winner, grid } = state;
  const isMyTurn = turn === 0 && winner === null;

  // Compute valid jump targets for selected piece
  let validJumps = new Set<string>();
  if (isMyTurn && selected && phase === "play") {
    for (const { to } of jumpTargets(grid, selected, 0, jumpDir ?? null)) {
      validJumps.add(`${to.row},${to.col}`);
    }
  }

  // Opening: which cells can be removed
  let removable = new Set<string>();
  if (phase === "remove-black") {
    [[3,3],[3,4],[4,3],[4,4]].forEach(([r,c]) => { if (grid.get({ row: r!, col: c! }) === 0) removable.add(`${r},${c}`); });
  } else if (phase === "remove-white") {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid.get({ row: r, col: c }) !== 1) continue;
        const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
        for (const [dr, dc] of dirs) {
          const nr = r + (dr ?? 0); const nc = c + (dc ?? 0);
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && grid.get({ row: nr, col: nc }) === null) {
            removable.add(`${r},${c}`);
          }
        }
      }
    }
  }

  let statusText = "";
  let statusClass = "";
  if (winner === 0) { statusText = "You win! White has no moves."; statusClass = "win"; }
  else if (winner === 1) { statusText = "Bot wins! You have no moves."; statusClass = "loss"; }
  else if (phase === "remove-black") statusText = "Opening: remove one of your central Black stones.";
  else if (phase === "remove-white") statusText = "Opening: bot removes an adjacent White stone.";
  else if (!isMyTurn) statusText = "Bot thinking... (White)";
  else if (jumpDir !== null) statusText = "Continue jumping in the same direction, or End Turn.";
  else if (selected) statusText = "Click a highlighted square to jump.";
  else statusText = "Your turn — select a Black stone to jump with.";

  function handleClick(c: Coord) {
    const key = `${c.row},${c.col}`;
    if (phase === "remove-black" || phase === "remove-white") {
      if (removable.has(key)) dispatch({ type: "remove", at: c } satisfies KonaneAction);
      return;
    }
    if (!isMyTurn) return;
    if (validJumps.has(key)) {
      dispatch({ type: "jump", to: c } satisfies KonaneAction);
    } else if (grid.get(c) === 0 && jumpDir === null) {
      dispatch({ type: "select", at: c } satisfies KonaneAction);
    }
  }

  function renderCell(c: Coord, value: typeof grid extends import("../../engines/grid/index.js").Grid<infer T> ? T : never): React.ReactNode {
    const key = `${c.row},${c.col}`;
    const isSelected = selected && selected.row === c.row && selected.col === c.col;
    const isJump = validJumps.has(key);
    const isRemovable = removable.has(key);

    if (value === 0) return <div className={`konane-piece black${isSelected ? " selected" : ""}${isRemovable ? " removable" : ""}`}>●</div>;
    if (value === 1) return <div className={`konane-piece white${isRemovable ? " removable" : ""}`}>●</div>;
    if (isJump) return <div className="konane-target">○</div>;
    return null;
  }

  return (
    <div className="konane-game">
      <div className={`konane-status ${statusClass}`}>{statusText}</div>
      <div className="konane-counts">
        Black (you): {Array.from(grid.coords()).filter(c => grid.get(c) === 0).length} |
        White (bot): {Array.from(grid.coords()).filter(c => grid.get(c) === 1).length}
      </div>
      <div className="konane-board-wrap">
        <Board
          grid={grid}
          cellSize={52}
          renderCell={renderCell}
          onCellClick={handleClick}
        />
      </div>
      {jumpDir !== null && isMyTurn && (
        <button data-testid="hint-target-konane-action" className="konane-end-btn" onClick={() => dispatch({ type: "end-chain" } satisfies KonaneAction)}>
          End Turn
        </button>
      )}
    </div>
  );
}
