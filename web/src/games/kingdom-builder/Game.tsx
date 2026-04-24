import { useState, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingdomBuilderState, KingdomBuilderAction, TileType } from "./state.js";
import { isTerminal, GRID_SIZE, TILE_EMOJI, TILE_LABELS, TOTAL_TILES } from "./state.js";
import "./Game.css";

export function KingdomBuilder({ state, dispatch, onGameOver }: GameProps<KingdomBuilderState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const [selectedTile, setSelectedTile] = useState<TileType | null>(null);
  const d = (a: KingdomBuilderAction) => dispatch(a);

  function handleCellClick(idx: number) {
    if (!selectedTile || state.grid[idx]?.tile !== "empty") return;
    d({ type: "placeTile", cellIndex: idx, tile: selectedTile });
    setSelectedTile(null);
  }

  return (
    <div className="kb-wrap">
      <div className="kb-header">
        <span className="kb-title">🏰 Kingdom Builder</span>
        <span className="kb-placed">Tiles: {state.tilesPlaced}/{TOTAL_TILES}</span>
        <span className="kb-score">Score: {state.score}</span>
        {state.lastScoreGain > 0 && <span className="kb-gain">+{state.lastScoreGain}</span>}
      </div>

      <div className="kb-hand">
        <span className="kb-hand-label">Hand:</span>
        {state.hand.map((tile, i) => (
          <button key={i}
            className={`kb-tile-btn ${selectedTile === tile ? "kb-selected" : ""}`}
            onClick={() => setSelectedTile(selectedTile === tile ? null : tile)}>
            {TILE_EMOJI[tile]} {TILE_LABELS[tile]}
          </button>
        ))}
        <button className="kb-discard-btn" onClick={() => d({ type: "discardAndDraw" })}>🔄 Swap</button>
      </div>

      {selectedTile && <div className="kb-hint">Click an empty cell to place {TILE_EMOJI[selectedTile]} {TILE_LABELS[selectedTile]}</div>}

      <div className="kb-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
        {state.grid.map((cell, i) => (
          <div key={i}
            className={`kb-cell ${cell.tile !== "empty" ? `kb-cell-${cell.tile}` : ""} ${selectedTile && cell.tile === "empty" ? "kb-cell-hover" : ""}`}
            onClick={() => handleCellClick(i)}>
            {cell.tile !== "empty" ? TILE_EMOJI[cell.tile] : ""}
          </div>
        ))}
      </div>

      {state.phase === "done" && (
        <div className="kb-done">
          <div>Final Score: <strong>{state.score}</strong></div>
          <div>{state.score >= 150 ? "🏆 Master Builder!" : state.score >= 80 ? "👍 Solid Kingdom!" : "🏗️ Keep building!"}</div>
        </div>
      )}
    </div>
  );
}
