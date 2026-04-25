import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MirrorMazeState, MirrorMazeSettings, MirrorMazeAction, MirrorType } from "./state.js";
import { isTerminal, traceLaser } from "./state.js";
import "./MirrorMaze.css";

const DIR_ARROW: Record<string, string> = { N: "↑", E: "→", S: "↓", W: "←" };

export function MirrorMaze({
  state,
  dispatch,
  onGameOver,
}: GameProps<MirrorMazeState, MirrorMazeSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const laserPath = traceLaser(state);
  const litSet = new Set(laserPath.map(p => `${p.col},${p.row}`));

  function handleCellClick(col: number, row: number) {
    if (state.won) return;
    const hasPlaced = state.placedMirrors.some(m => m.col === col && m.row === row);
    if (hasPlaced) {
      dispatch({ type: "remove", col, row } as MirrorMazeAction);
    } else {
      dispatch({ type: "place", col, row } as MirrorMazeAction);
    }
  }

  // Count mirrors used
  const usedSlash = state.placedMirrors.filter(m => m.type === "/").length;
  const usedBackslash = state.placedMirrors.filter(m => m.type === "\\").length;
  const totalSlash = state.availableMirrors.filter(m => m === "/").length;
  const totalBackslash = state.availableMirrors.filter(m => m === "\\").length;

  return (
    <div className="mirror-maze">
      <div className="mirror-maze-info">
        <span>Moves: {state.moves}</span>
        <span>Route the laser to the target</span>
      </div>

      <div className={`mirror-maze-status${state.won ? " win" : ""}`}>
        {state.won ? "Target hit! Puzzle solved!" : "Place mirrors to redirect the laser beam"}
      </div>

      {(totalSlash > 0 || totalBackslash > 0) && (
        <div className="mirror-toolbar">
          <span>Select mirror:</span>
          {totalSlash > 0 && (
            <button
              className={`mirror-tool-btn${state.selectedMirrorType === "/" ? " active" : ""}`}
              onClick={() => dispatch({ type: "selectMirror", mirrorType: "/" as MirrorType } as MirrorMazeAction)}
            >
              / ({usedSlash}/{totalSlash})
            </button>
          )}
          {totalBackslash > 0 && (
            <button
              className={`mirror-tool-btn${state.selectedMirrorType === "\\" ? " active" : ""}`}
              onClick={() => dispatch({ type: "selectMirror", mirrorType: "\\" as MirrorType } as MirrorMazeAction)}
            >
              \ ({usedBackslash}/{totalBackslash})
            </button>
          )}
        </div>
      )}

      <div
        className="mirror-grid"
        style={{ gridTemplateColumns: `repeat(${state.cols}, 56px)` }}
      >
        {Array.from({ length: state.rows }, (_, row) =>
          Array.from({ length: state.cols }, (_, col) => {
            const isSource = col === state.sourceCol && row === state.sourceRow;
            const isTarget = col === state.targetCol && row === state.targetRow;
            const isLit = litSet.has(`${col},${row}`);
            const fixedM = state.fixedMirrors.find(m => m.col === col && m.row === row);
            const placedM = state.placedMirrors.find(m => m.col === col && m.row === row);

            return (
              <div
                key={`${row}-${col}`}
                className={`mirror-cell
                  ${isSource ? "source" : ""}
                  ${isTarget ? "target" : ""}
                  ${isLit && !isSource ? "lit" : ""}
                  ${fixedM ? "fixed-mirror" : ""}
                  ${placedM ? "placed-mirror" : ""}
                `}
                onClick={() => handleCellClick(col, row)}
              >
                {isSource ? DIR_ARROW[state.sourceDir] : ""}
                {isTarget ? "★" : ""}
                {fixedM ? fixedM.type : ""}
                {placedM && !fixedM ? placedM.type : ""}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
