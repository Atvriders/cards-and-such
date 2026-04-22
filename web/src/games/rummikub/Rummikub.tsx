import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RummikubState, RummikubSettings, Tile } from "./state.js";
import { reducer, isTerminal } from "./state.js";
import "./Rummikub.css";

function TileView({ tile, selected, onClick, className }: { tile: Tile; selected?: boolean; onClick?: () => void; className?: string }) {
  return (
    <div
      className={`rummikub-tile ${tile.color} ${selected ? "selected" : ""} ${className ?? ""}`}
      onClick={onClick}
    >
      {tile.color === "joker" ? "★" : tile.num}
    </div>
  );
}

export function Rummikub({ state, dispatch, onGameOver }: GameProps<RummikubState, RummikubSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const statusClass = state.winner === "player" ? "win" : state.winner === "bot" ? "loss" : "";

  const sortedHand = [...state.hand].sort((a, b) => {
    if (a.color !== b.color) return a.color.localeCompare(b.color);
    return a.num - b.num;
  });

  return (
    <div className="rummikub">
      <div className="rummikub-info">
        <span>Hand: {state.hand.length} tiles</span>
        <span>Pool: {state.pool.length}</span>
        {state.botHands.map((bh, i) => (
          <span key={i}>Bot {i + 1}: {bh.length} tiles</span>
        ))}
      </div>

      <div className={`rummikub-status ${statusClass}`}>{state.message}</div>

      <div className="rummikub-hand-label">Table ({state.table.length} melds):</div>
      <div className="rummikub-table">
        {state.table.length === 0 && <span style={{ color: "#aaa", padding: "8px" }}>No melds yet</span>}
        {state.table.map((meld, mi) => (
          <div key={mi} className="rummikub-meld">
            {meld.map((tile) => (
              <TileView key={tile.id} tile={tile} className="table-tile" />
            ))}
          </div>
        ))}
      </div>

      <div className="rummikub-hand-label">
        Your hand ({state.hand.length}):
        {state.selectedTileIds.length > 0 && ` — ${state.selectedTileIds.length} selected`}
      </div>
      <div className="rummikub-hand">
        {sortedHand.map((tile) => (
          <TileView
            key={tile.id}
            tile={tile}
            selected={state.selectedTileIds.includes(tile.id)}
            onClick={() => !state.gameOver && state.turn === 0 && dispatch({ type: "toggle-tile", id: tile.id })}
          />
        ))}
      </div>

      {!state.gameOver && state.turn === 0 && (
        <div className="rummikub-actions">
          <button
            className="rummikub-btn primary"
            disabled={state.selectedTileIds.length < 3}
            onClick={() => dispatch({ type: "meld" })}
          >
            Meld Selected ({state.selectedTileIds.length})
          </button>
          <button
            className="rummikub-btn secondary"
            disabled={state.pool.length === 0}
            onClick={() => dispatch({ type: "draw" })}
          >
            Draw Tile
          </button>
          <button
            className="rummikub-btn neutral"
            onClick={() => dispatch({ type: "end-turn" })}
          >
            End Turn
          </button>
        </div>
      )}

      {state.gameOver && (
        <button className="rummikub-restart" onClick={() => dispatch({ type: "restart" })}>
          Play Again
        </button>
      )}
    </div>
  );
}
