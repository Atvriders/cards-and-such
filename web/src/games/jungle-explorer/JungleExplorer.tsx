import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { JungleExplorerState, JungleExplorerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./JungleExplorer.css";

const CELL_ICONS: Record<string, string> = {
  empty: "",
  treasure: "T",
  trap: "X",
  camp: "C",
  beast: "B",
  river: "~",
};

export function JungleExplorer({ state, dispatch, onGameOver }: GameProps<JungleExplorerState, JungleExplorerSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="jungle-explorer">
      <div className="je-header">Jungle Explorer</div>
      <div className="je-hud">
        <span>HP: {state.hp}</span>
        <span>Treasure: {state.treasure}/{state.totalTreasure}</span>
        <span>Moves: {state.moves}/{state.maxMoves}</span>
      </div>

      <div className="je-grid" style={{ gridTemplateColumns: `repeat(${state.gridSize}, 1fr)` }}>
        {state.grid.map((cell, i) => {
          const isPlayer = i === state.playerPos;
          const cls = isPlayer ? "je-cell je-player" :
            !cell.revealed ? "je-cell je-hidden" :
            `je-cell je-${cell.type}`;
          return (
            <div key={i} className={cls}>
              {isPlayer ? "P" : cell.revealed ? (CELL_ICONS[cell.type] ?? "") : "?"}
            </div>
          );
        })}
      </div>

      {state.phase === "playing" && (
        <div className="je-controls">
          <button onClick={() => dispatch({ type: "move", dir: "up" })}>Up</button>
          <div className="je-lr">
            <button onClick={() => dispatch({ type: "move", dir: "left" })}>Left</button>
            <button onClick={() => dispatch({ type: "move", dir: "right" })}>Right</button>
          </div>
          <button onClick={() => dispatch({ type: "move", dir: "down" })}>Down</button>
        </div>
      )}

      <div className="je-log">
        {state.log.map((line, i) => <p key={i}>{line}</p>)}
      </div>

      {state.phase === "gameover" && (
        <div className="je-gameover">
          <div>{state.treasure >= state.totalTreasure ? "All treasure found!" : state.hp <= 0 ? "You perished." : "Out of moves!"}</div>
          <div>Score: {state.score}</div>
          <button onClick={() => dispatch({ type: "restart" })}>Play Again</button>
        </div>
      )}
    </div>
  );
}
