import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TTState, TTSettings, TrackTile } from "./state.js";
import type { TTAction } from "./state.js";
import { isTerminal, ALL_TILES, computeRowCounts, computeColCounts } from "./state.js";
import "./TrainTracks.css";

const TILE_ICON: Record<TrackTile, string> = {
  H:  "━",
  V:  "┃",
  NE: "┗",
  NW: "┛",
  SE: "┏",
  SW: "┓",
};

export function TrainTracks({ state, dispatch, onGameOver }: GameProps<TTState, TTSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, tiles, selectedTile, won } = state;
  const { size, rowClues, colClues } = puzzle;
  const rowCounts = computeRowCounts(size, tiles);
  const colCounts = computeColCounts(size, tiles);

  function handleClick(idx: number): void {
    if (won) return;
    if (puzzle.revealed[idx] !== undefined) return;
    dispatch({ type: "placeTile", idx } satisfies TTAction);
  }

  function handleRightClick(e: React.MouseEvent, idx: number): void {
    e.preventDefault();
    if (won) return;
    dispatch({ type: "clearTile", idx } satisfies TTAction);
  }

  return (
    <div className="tt">
      <div className="tt-title">Train Tracks</div>
      <div className={`tt-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Lay track tiles so row/col counts match and the path is continuous. Moves: ${state.moves}`}
      </div>

      <div>
        <div className="tt-col-clues">
          {colClues.map((clue, c) => (
            <div key={c} className="tt-col-clue" style={{ color: colCounts[c] === clue ? "#27ae60" : "#555" }}>
              {clue}
            </div>
          ))}
        </div>
        <div className="tt-row-area">
          <div className="tt-row-clues">
            {rowClues.map((clue, r) => (
              <div key={r} className="tt-row-clue" style={{ color: rowCounts[r] === clue ? "#27ae60" : "#555" }}>
                {clue}
              </div>
            ))}
          </div>
          <div className="tt-grid" style={{ gridTemplateColumns: `repeat(${size}, 44px)` }}>
            {Array.from({ length: size * size }, (_, idx) => {
              const tile = tiles[idx];
              const isRevealed = puzzle.revealed[idx] !== undefined;
              const isPlaced = !isRevealed && tile !== undefined;
              const isCorrect = isPlaced && tile === puzzle.solution[idx];
              const cls = [
                "tt-cell",
                isRevealed ? "revealed" : isCorrect ? "correct" : isPlaced ? "placed" : "",
              ].filter(Boolean).join(" ");
              const display = tile !== null && tile !== undefined ? TILE_ICON[tile as TrackTile] : "";
              return (
                <div
                  key={idx}
                  className={cls}
                  onClick={() => handleClick(idx)}
                  onContextMenu={e => handleRightClick(e, idx)}
                >
                  {display}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="tt-toolbar">
        {ALL_TILES.map(t => (
          <button
            key={t}
            className={selectedTile === t ? "active" : ""}
            title={t}
            onClick={() => dispatch({ type: "selectTile", tile: t } satisfies TTAction)}
          >
            {TILE_ICON[t]}
          </button>
        ))}
        <button className="tt-clear-btn" onClick={() => dispatch({ type: "clearTile", idx: -1 })}>✕ Clear</button>
      </div>

      <div className="tt-btns">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
