import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BridgeState, BridgeAction, CellType } from "./state.js";
import { isTerminal, COLS, ROWS } from "./state.js";
import "./Game.css";

const CELL_ICONS: Record<CellType, string> = {
  empty: "",
  blocked: "🪨",
  start: "A",
  end: "B",
  plank: "🪵",
};

export function BridgeBuilderPuzzle({
  state,
  dispatch,
  onGameOver,
}: GameProps<BridgeState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: BridgeAction) => dispatch(a);

  return (
    <div className="bridge-wrap fade-in">
      <div className="bridge-header">
        <span className="bridge-title">Bridge Builder</span>
        <span className="bridge-info">Planks: {state.planksLeft} | Moves: {state.moves}</span>
      </div>

      <div className="bridge-grid" style={{ gridTemplateColumns: `repeat(${COLS}, 44px)` }}>
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const cell = state.grid[r]![c]!;
            return (
              <div
                key={`${r}-${c}`}
                className={`bridge-cell ${cell}`}
                onClick={() => d({ type: "placeOrRemove", row: r, col: c })}
              >
                {CELL_ICONS[cell]}
              </div>
            );
          })
        )}
      </div>

      <div className="bridge-controls">
        <button data-testid="hint-target-bridge-builder-puzzle-action" className="bridge-btn" onClick={() => d({ type: "reset" })}>New Puzzle</button>
      </div>

      {state.phase === "won" && (
        <div className="bridge-status won">
          Bridge Complete! Score: {terminal?.score ?? 0}
        </div>
      )}
      {state.phase === "lost" && (
        <div className="bridge-status lost">
          Out of planks! Try again.
        </div>
      )}

      <div style={{ fontSize: "0.8rem", color: "#888", textAlign: "center" }}>
        Click empty cells to place planks. Click planks to remove. Connect A to B.
      </div>
    </div>
  );
}
