import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PuzzleBoxState, PuzzleBoxSettings, PuzzleBoxAction } from "./state.js";
import { isTerminal, TILE_THEMES } from "./state.js";
import "./Game.css";

export function PuzzleBox({
  state,
  dispatch,
  onGameOver,
}: GameProps<PuzzleBoxState, PuzzleBoxSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const theme = state.settings.theme;
  const themeData = TILE_THEMES[theme]!;

  function renderTileContent(tileVal: number): JSX.Element {
    if (tileVal === 0) return <></>;
    const label = themeData[tileVal] ?? String(tileVal);
    if (theme === "colors") {
      return <div className="pb-tile-color" style={{ background: label }} />;
    }
    return <span className="pb-tile-label">{label}</span>;
  }

  return (
    <div className="pb-game fade-in">
      <div className="pb-title">Puzzle Box</div>
      <div className="pb-subtitle">3×3 Sliding Puzzle — {theme}</div>
      <div className="pb-stats">Moves: {state.movesMade}</div>

      <div className="pb-board">
        {state.tiles.map((tile, idx) => {
          const isEmpty = tile === 0;
          return (
            <div
              key={idx}
              className={`pb-tile ${isEmpty ? "empty" : "filled"} ${state.won ? "won" : ""}`}
              onClick={() => !isEmpty && dispatch({ type: "slide", index: idx } as PuzzleBoxAction)}
            >
              {renderTileContent(tile)}
            </div>
          );
        })}
      </div>

      {state.won && (
        <div className="pb-victory">
          <div className="pb-victory-text">Solved in {state.movesMade} moves!</div>
          <div className="pb-score pulse">Score: {terminal?.score}</div>
          <button data-testid="hint-target-puzzle-box-action"
            className="pb-restart-btn"
            onClick={() => dispatch({ type: "restart" } as PuzzleBoxAction)}
          >
            New Puzzle
          </button>
        </div>
      )}

      {!state.won && (
        <div className="pb-hint">Click a tile adjacent to the blank to slide it</div>
      )}
    </div>
  );
}
